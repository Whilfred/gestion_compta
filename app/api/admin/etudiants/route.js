import { NextResponse } from 'next/server'
import { query } from '../../../../lib/db'
import { adminOr403 } from '../../../../lib/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { res } = await adminOr403()
  if (res) return res
  try {
    const { rows } = await query(`
      SELECT u.id, u.full_name AS name, u.email, u.phone, u.is_active, u.created_at,
             p.niche, p.product, COALESCE(p.goal_xof, 0) AS goal,
             COALESCE(p.status, 'actif') AS status,
             COALESCE(r.total, 0)::bigint AS revenue,
             COALESCE(a.total, 0)::bigint AS spend,
             COALESCE(x.total, 0)::bigint AS expenses,
             COALESCE(r.units, 0)::int AS units,
             (COALESCE(r.total, 0) - COALESCE(a.total, 0) - COALESCE(x.total, 0))::bigint AS profit,
             nc.next_call,
             COALESCE(nc.upcoming, 0)::int AS upcoming,
             COALESCE(c.done, 0)::int AS calls_done,
             COALESCE(lp.done, 0)::int AS lessons_done,
             (SELECT COUNT(*) FROM lessons)::int AS lessons_total
        FROM users u
        LEFT JOIN student_profiles p ON p.user_id = u.id
        LEFT JOIN (SELECT user_id, SUM(amount_xof) total, SUM(units) units FROM student_revenues GROUP BY user_id) r ON r.user_id = u.id
        LEFT JOIN (SELECT user_id, SUM(amount_xof) total FROM ad_spends GROUP BY user_id) a ON a.user_id = u.id
        LEFT JOIN (SELECT user_id, SUM(amount_xof) total FROM student_expenses GROUP BY user_id) x ON x.user_id = u.id
        LEFT JOIN (SELECT user_id, MIN(scheduled_at) next_call, COUNT(*) upcoming FROM calls
                    WHERE status = 'prevu' AND scheduled_at >= NOW() GROUP BY user_id) nc ON nc.user_id = u.id
        LEFT JOIN (SELECT user_id, COUNT(*) done FROM calls WHERE status = 'fait' GROUP BY user_id) c ON c.user_id = u.id
        LEFT JOIN (SELECT user_id, COUNT(*) done FROM lesson_progress WHERE completed GROUP BY user_id) lp ON lp.user_id = u.id
       WHERE u.role = 'student'
       ORDER BY u.created_at DESC`)
    const students = rows.map((r) => ({ ...r, revenue: Number(r.revenue), spend: Number(r.spend), expenses: Number(r.expenses), profit: Number(r.profit) }))
    return NextResponse.json({ students })
  } catch (e) {
    console.error('[admin/etudiants]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
