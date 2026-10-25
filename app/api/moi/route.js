import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { getUser } from '../../../lib/session'

export const dynamic = 'force-dynamic'

const s = (v, n) => String(v ?? '').trim().slice(0, n) || null
const sum = (rows, f = 'amount') => rows.reduce((t, r) => t + (r[f] || 0), 0)

// Mon espace : toutes mes données (saisies, calls, profil, progression) + totaux calculés.
export async function GET() {
  const me = await getUser()
  if (!me) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
  const id = me.id
  try {
    const [p, rev, ads, exp, calls, enr, prog] = await Promise.all([
      query(`SELECT niche, product, price_xof AS price, goal_xof AS goal, channel, sales_url AS url, status, notes
               FROM student_profiles WHERE user_id = $1`, [id]),
      query(`SELECT id, amount_xof AS amount, source, units, note, to_char(earned_on, 'YYYY-MM-DD') AS date
               FROM student_revenues WHERE user_id = $1 ORDER BY earned_on DESC, id DESC`, [id]),
      query(`SELECT id, amount_xof AS amount, platform, leads, note, to_char(spent_on, 'YYYY-MM-DD') AS date
               FROM ad_spends WHERE user_id = $1 ORDER BY spent_on DESC, id DESC`, [id]),
      query(`SELECT id, amount_xof AS amount, label, note, to_char(spent_on, 'YYYY-MM-DD') AS date
               FROM student_expenses WHERE user_id = $1 ORDER BY spent_on DESC, id DESC`, [id]),
      query(`SELECT id, scheduled_at, duration_minutes AS duration, topic, meeting_url, status, notes
               FROM calls WHERE user_id = $1 ORDER BY scheduled_at DESC`, [id]),
      query(`SELECT f.title, e.status, e.enrolled_at FROM enrollments e
               JOIN formations f ON f.id = e.formation_id WHERE e.user_id = $1 ORDER BY e.enrolled_at DESC`, [id]),
      query(`SELECT (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND completed)::int AS done,
                    (SELECT COUNT(*) FROM lessons)::int AS total`, [id]),
    ])

    const byMonth = {}
    const add = (rows, key, f = 'amount') => rows.forEach((r) => {
      const m = r.date.slice(0, 7)
      ;(byMonth[m] ||= { month: m, revenue: 0, ads: 0, expenses: 0, units: 0 })[key] += r[f] || 0
    })
    add(rev.rows, 'revenue'); add(rev.rows, 'units', 'units'); add(ads.rows, 'ads'); add(exp.rows, 'expenses')
    const months = Object.values(byMonth)
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((m) => ({ ...m, profit: m.revenue - m.ads - m.expenses }))

    const revenue = sum(rev.rows), adSpend = sum(ads.rows), expenses = sum(exp.rows)
    return NextResponse.json({
      me: { name: me.name, email: me.email },
      profile: p.rows[0] || { niche: '', product: '', price: 0, goal: 0, channel: '', url: '', status: 'actif', notes: '' },
      revenues: rev.rows,
      ads: ads.rows,
      expenses: exp.rows,
      calls: calls.rows,
      months,
      enrollments: enr.rows,
      progress: prog.rows[0],
      totals: {
        revenue, ads: adSpend, expenses,
        profit: revenue - adSpend - expenses,
        units: sum(rev.rows, 'units'),
        leads: sum(ads.rows, 'leads'),
      },
    })
  } catch (e) {
    console.error('[moi]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// Mon profil : niche, produit, prix, objectif, canal, page de vente.
// Le statut et les notes de suivi restent gérés par l'équipe.
export async function PUT(req) {
  const me = await getUser()
  if (!me) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
  let b
  try { b = await req.json() } catch { b = {} }
  const num = (v) => Math.max(0, Math.min(2e9, parseInt(v, 10) || 0))
  const url = String(b.url ?? '').trim()
  if (url && !/^https?:\/\/\S+$/i.test(url)) return NextResponse.json({ error: 'Le lien de la page de vente doit commencer par http:// ou https://.' }, { status: 400 })
  try {
    await query(
      `INSERT INTO student_profiles (user_id, niche, product, price_xof, goal_xof, channel, sales_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET niche = $2, product = $3, price_xof = $4, goal_xof = $5, channel = $6, sales_url = $7, updated_at = NOW()`,
      [me.id, s(b.niche, 120), s(b.product, 200), num(b.price), num(b.goal), s(b.channel, 60), url ? url.slice(0, 500) : null]
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[moi PUT]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
