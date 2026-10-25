import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { need } from '../../../lib/perm'
import { CANCELED } from '../../../lib/constants'
import { customRange, range } from '../../../lib/dates'

export const dynamic = 'force-dynamic'
const X = CANCELED.map((s) => `'${s}'`).join(',')
const STATUSES = ['en_attente', 'en_cours', 'livree', 'non_livree', 'retour']

// Clients regroupés par numéro de téléphone (à défaut : par nom). Récurrent = au moins 2 commandes.
// ?filter=all|recurrent|new  &q=texte  &status=…  &product_id=12  &period=… ou &from=&to=
export async function GET(req) {
  const g = await need('clients', 'view')
  if (g.res) return g.res
  const sp = new URL(req.url).searchParams
  let from = null, to = null
  if (sp.get('from') && sp.get('to')) {
    const r = customRange(sp.get('from'), sp.get('to'))
    if (!r) return NextResponse.json({ error: 'Dates invalides.' }, { status: 400 })
    ;({ from, to } = r)
  } else if (sp.get('period') && sp.get('period') !== 'all') ({ from, to } = range(sp.get('period')))

  const vals = [g.me.ownerId, from, to]
  const where = [`user_id = $1`, `($2::date IS NULL OR sold_on BETWEEN $2 AND $3)`,
    `COALESCE(NULLIF(TRIM(customer_phone), ''), NULLIF(TRIM(customer), '')) IS NOT NULL`]
  if (STATUSES.includes(sp.get('status'))) { vals.push(sp.get('status')); where.push(`status = $${vals.length}`) }
  const pid = Number(sp.get('product_id'))
  if (Number.isInteger(pid) && pid > 0) { vals.push(pid); where.push(`product_id = $${vals.length}`) }
  const text = String(sp.get('q') || '').trim().slice(0, 80).replace(/[%_]/g, '')
  if (text) { vals.push(`%${text}%`); where.push(`(customer ILIKE $${vals.length} OR customer_phone ILIKE $${vals.length})`) }

  try {
    const { rows } = await query(
      `SELECT COALESCE(NULLIF(TRIM(customer_phone), ''), NULLIF(TRIM(customer), '')) AS k,
              MAX(NULLIF(TRIM(customer_phone), '')) AS phone,
              (ARRAY_AGG(NULLIF(TRIM(customer), '') ORDER BY sold_on DESC, id DESC) FILTER (WHERE NULLIF(TRIM(customer), '') IS NOT NULL))[1] AS name,
              COUNT(*)::int AS orders, SUM(quantity)::int AS units,
              COALESCE(SUM(quantity * unit_price_xof) FILTER (WHERE status NOT IN (${X})), 0)::bigint AS total,
              COUNT(*) FILTER (WHERE status = 'livree')::int AS delivered,
              COUNT(*) FILTER (WHERE status IN ('en_attente', 'en_cours'))::int AS ongoing,
              COUNT(*) FILTER (WHERE status IN (${X}))::int AS failed,
              to_char(MIN(sold_on), 'YYYY-MM-DD') AS first_date, to_char(MAX(sold_on), 'YYYY-MM-DD') AS last_date,
              (ARRAY_AGG(DISTINCT product_name))[1:3] AS products
         FROM sales WHERE ${where.join(' AND ')} GROUP BY 1 ORDER BY MAX(sold_on) DESC, 1 LIMIT 2000`, vals)
    let list = rows.map((x) => ({ ...x, total: Number(x.total), recurrent: x.orders >= 2 }))
    const summary = { clients: list.length, recurrent: list.filter((c) => c.recurrent).length, revenue: list.reduce((a, c) => a + c.total, 0) }
    const f = sp.get('filter')
    if (f === 'recurrent') list = list.filter((c) => c.recurrent)
    else if (f === 'new') list = list.filter((c) => !c.recurrent)
    return NextResponse.json({ rows: list, summary })
  } catch (e) {
    console.error('[clients]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
