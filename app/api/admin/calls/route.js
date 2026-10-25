import { NextResponse } from 'next/server'
import { query } from '../../../../lib/db'
import { adminOr403 } from '../../../../lib/admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/calls?from=2026-10-01&to=2026-11-01  (tous les étudiants)
export async function GET(req) {
  const { res } = await adminOr403()
  if (res) return res
  const sp = new URL(req.url).searchParams
  const from = new Date(sp.get('from')), to = new Date(sp.get('to'))
  if (isNaN(from) || isNaN(to)) return NextResponse.json({ error: 'Période invalide.' }, { status: 400 })
  try {
    const { rows } = await query(
      `SELECT c.id, c.user_id, u.full_name AS student, c.scheduled_at, c.duration_minutes AS duration,
              c.topic, c.meeting_url, c.status, c.notes
         FROM calls c JOIN users u ON u.id = c.user_id
        WHERE c.scheduled_at >= $1 AND c.scheduled_at < $2
        ORDER BY c.scheduled_at`, [from.toISOString(), to.toISOString()])
    return NextResponse.json({ calls: rows })
  } catch (e) {
    console.error('[admin/calls]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
