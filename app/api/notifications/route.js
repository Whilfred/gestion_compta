import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { need } from '../../../lib/perm'

export const dynamic = 'force-dynamic'

// Alertes (stock bas / rupture) du compte. Tout utilisateur connecté les voit.
export async function GET() {
  const g = await need()
  if (g.res) return g.res
  try {
    const { rows } = await query(
      `SELECT id, kind, product_id, message, is_read AS read, created_at FROM notifications
        WHERE user_id = $1 ORDER BY is_read, created_at DESC LIMIT 20`, [g.me.ownerId])
    return NextResponse.json({ rows, unread: rows.filter((x) => !x.read).length })
  } catch (e) {
    console.error('[notifications]', e)
    return NextResponse.json({ rows: [], unread: 0 })
  }
}

// { all: true } ou ?id=12 → marque comme lu
export async function POST(req) {
  const g = await need()
  if (g.res) return g.res
  let b
  try { b = await req.json() } catch { b = {} }
  const id = Number(new URL(req.url).searchParams.get('id'))
  try {
    if (b.all) await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [g.me.ownerId])
    else if (Number.isInteger(id) && id > 0) await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, g.me.ownerId])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[notifications POST]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
