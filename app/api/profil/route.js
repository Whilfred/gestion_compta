import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { loadSettings } from '../../../lib/shop'
import { getUser } from '../../../lib/session'
import { ownerOnly } from '../../../lib/perm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const me = await getUser()
  if (!me) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })
  const s = await loadSettings(me.ownerId)
  if (!me.isOwner && me.perms.dashboard === 'none') { delete s.goal; delete s.goalProfit }
  return NextResponse.json({ ...s, owner: me.name, email: me.email })
}

// Envoyer seulement les champs à changer
export async function PUT(req) {
  const g = await ownerOnly()
  if (g.res) return g.res
  let b
  try { b = await req.json() } catch { b = {} }
  const cur = await loadSettings(g.me.id)
  const int = (v, max) => Math.max(0, Math.min(max, parseInt(v, 10) || 0))
  const pick = (v, list, d) => (list.includes(v) ? v : d)
  const n = { ...cur }
  if (b.name !== undefined) n.name = String(b.name ?? '').trim().slice(0, 120) || null
  if (b.goal !== undefined) n.goal = int(b.goal, 2e9)
  if (b.goalProfit !== undefined) n.goalProfit = int(b.goalProfit, 2e9)
  if (b.threshold !== undefined) n.threshold = int(b.threshold, 100000)
  if (b.theme !== undefined) n.theme = pick(b.theme, ['dark', 'light'], 'dark')
  if (b.density !== undefined) n.density = pick(b.density, ['normal', 'compact'], 'normal')
  if (b.fontSize !== undefined) n.fontSize = pick(b.fontSize, ['small', 'normal', 'large'], 'normal')
  if (b.accent !== undefined) n.accent = /^#[0-9a-f]{6}$/i.test(String(b.accent)) ? String(b.accent).toLowerCase() : cur.accent
  if (b.hideFigures !== undefined) n.hideFigures = !!b.hideFigures
  if (b.paymentMethods !== undefined) {
    const list = Array.isArray(b.paymentMethods) ? b.paymentMethods : []
    n.paymentMethods = [...new Set(list.map((x) => String(x).trim().slice(0, 40)).filter(Boolean))].slice(0, 20)
  }
  try {
    await query(
      `INSERT INTO shops (user_id, name, goal_monthly_xof, goal_profit_monthly_xof, theme, accent, density, font_size, low_stock_threshold, hide_figures, payment_methods, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
       ON CONFLICT (user_id) DO UPDATE SET name=$2, goal_monthly_xof=$3, goal_profit_monthly_xof=$4, theme=$5, accent=$6, density=$7,
         font_size=$8, low_stock_threshold=$9, hide_figures=$10, payment_methods=$11, updated_at=NOW()`,
      [g.me.id, n.name, n.goal, n.goalProfit, n.theme, n.accent, n.density, n.fontSize, n.threshold, n.hideFigures, JSON.stringify(n.paymentMethods)])
    // Nouveau seuil : on recalcule les alertes de stock
    if (b.threshold !== undefined) {
      await query(`DELETE FROM notifications WHERE user_id = $1 AND kind = 'stock' AND NOT is_read`, [g.me.id])
      await query(
        `INSERT INTO notifications (user_id, kind, product_id, message)
         SELECT $1, 'stock', id, CASE WHEN stock <= 0 THEN 'Rupture de stock : « ' || name || ' »'
                ELSE 'Stock bas : « ' || name || ' » (' || stock || ' restant' || CASE WHEN stock > 1 THEN 's' ELSE '' END || ')' END
           FROM products WHERE user_id = $1 AND is_active AND stock <= $2
         ON CONFLICT (user_id, product_id, kind) WHERE NOT is_read DO NOTHING`, [g.me.id, n.threshold])
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[profil PUT]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
