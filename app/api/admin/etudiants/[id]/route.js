import { NextResponse } from 'next/server'
import { query } from '../../../../../lib/db'
import { adminOr403, isUuid } from '../../../../../lib/admin'

export const dynamic = 'force-dynamic'

export async function GET(_req, { params }) {
  const { res } = await adminOr403()
  if (res) return res
  const id = params.id
  if (!isUuid(id)) return NextResponse.json({ error: 'Étudiant introuvable.' }, { status: 404 })
  try {
    const [u, p, rev, ads, calls, months, enr, prog, xp] = await Promise.all([
      query('SELECT id, full_name AS name, email, phone, role, is_active, created_at FROM users WHERE id = $1', [id]),
      query('SELECT niche, product, goal_xof AS goal, status, notes FROM student_profiles WHERE user_id = $1', [id]),
      query(`SELECT id, amount_xof AS amount, source, note, to_char(earned_on, 'YYYY-MM-DD') AS date
               FROM student_revenues WHERE user_id = $1 ORDER BY earned_on DESC, id DESC`, [id]),
      query(`SELECT id, amount_xof AS amount, platform, note, to_char(spent_on, 'YYYY-MM-DD') AS date
               FROM ad_spends WHERE user_id = $1 ORDER BY spent_on DESC, id DESC`, [id]),
      query(`SELECT id, scheduled_at, duration_minutes AS duration, topic, meeting_url, status, notes
               FROM calls WHERE user_id = $1 ORDER BY scheduled_at DESC`, [id]),
      query(`SELECT to_char(d, 'YYYY-MM') AS month, SUM(rev)::bigint AS revenue, SUM(spend)::bigint AS spend, SUM(exp)::bigint AS expenses FROM (
               SELECT earned_on d, amount_xof rev, 0 spend, 0 exp FROM student_revenues WHERE user_id = $1
               UNION ALL
               SELECT spent_on, 0, amount_xof, 0 FROM ad_spends WHERE user_id = $1
               UNION ALL
               SELECT spent_on, 0, 0, amount_xof FROM student_expenses WHERE user_id = $1) t
              GROUP BY 1 ORDER BY 1 DESC`, [id]),
      query(`SELECT f.title, e.status, e.enrolled_at FROM enrollments e
               JOIN formations f ON f.id = e.formation_id WHERE e.user_id = $1 ORDER BY e.enrolled_at DESC`, [id]),
      query(`SELECT (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND completed)::int AS done,
                    (SELECT COUNT(*) FROM lessons)::int AS total`, [id]),
      query('SELECT COALESCE(SUM(amount_xof), 0)::bigint AS total FROM student_expenses WHERE user_id = $1', [id]),
    ])
    if (!u.rows[0]) return NextResponse.json({ error: 'Étudiant introuvable.' }, { status: 404 })
    const revenue = rev.rows.reduce((s, r) => s + r.amount, 0)
    const spend = ads.rows.reduce((s, r) => s + r.amount, 0)
    const expenses = Number(xp.rows[0].total)
    return NextResponse.json({
      student: u.rows[0],
      profile: p.rows[0] || { niche: '', product: '', goal: 0, status: 'actif', notes: '' },
      revenues: rev.rows,
      spends: ads.rows,
      calls: calls.rows,
      months: months.rows.map((m) => ({ month: m.month, revenue: Number(m.revenue), spend: Number(m.spend), expenses: Number(m.expenses), profit: Number(m.revenue) - Number(m.spend) - Number(m.expenses) })),
      enrollments: enr.rows,
      progress: prog.rows[0],
      totals: { revenue, spend, expenses, profit: revenue - spend - expenses },
    })
  } catch (e) {
    console.error('[admin/etudiant]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// Mise à jour du profil (niche, produit, objectif, statut, notes)
export async function PUT(req, { params }) {
  const { res } = await adminOr403()
  if (res) return res
  const id = params.id
  if (!isUuid(id)) return NextResponse.json({ error: 'Étudiant introuvable.' }, { status: 404 })
  let b
  try { b = await req.json() } catch { b = {} }
  const status = ['actif', 'pause', 'termine', 'abandon'].includes(b.status) ? b.status : 'actif'
  const goal = Math.max(0, Math.min(2e9, parseInt(b.goal, 10) || 0))
  const s = (v, n) => String(v ?? '').trim().slice(0, n) || null
  try {
    await query(
      `INSERT INTO student_profiles (user_id, niche, product, goal_xof, status, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET niche = $2, product = $3, goal_xof = $4, status = $5, notes = $6, updated_at = NOW()`,
      [id, s(b.niche, 120), s(b.product, 200), goal, status, s(b.notes, 5000)]
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin/etudiant PUT]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
