import { NextResponse } from 'next/server'
import { pool, query } from '../../../lib/db'
import { ownerOnly } from '../../../lib/perm'
import { STATUS } from '../../../lib/constants'

export const dynamic = 'force-dynamic'
const bad = (error, status = 400) => NextResponse.json({ error }, { status })

// Sauvegarde : télécharge toutes les données de la boutique en JSON (sans mots de passe)
export async function GET() {
  const g = await ownerOnly()
  if (g.res) return g.res
  const uid = g.me.id
  try {
    const [shop, products, sales, ads, exp] = await Promise.all([
      query('SELECT name, goal_monthly_xof, goal_profit_monthly_xof, theme, accent, density, font_size, low_stock_threshold, hide_figures, payment_methods FROM shops WHERE user_id = $1', [uid]),
      query('SELECT id, name, sku, cost_xof, price_xof, stock, is_active FROM products WHERE user_id = $1 ORDER BY id', [uid]),
      query(`SELECT product_id, product_name, quantity, unit_price_xof, unit_cost_xof, source, customer, customer_phone, payment_method, status, note,
                    to_char(sold_on, 'YYYY-MM-DD') AS sold_on FROM sales WHERE user_id = $1 ORDER BY id`, [uid]),
      query(`SELECT product_id, platform, amount_xof, leads, note, to_char(spent_on, 'YYYY-MM-DD') AS spent_on FROM ad_spends WHERE user_id = $1 ORDER BY id`, [uid]),
      query(`SELECT product_id, category, label, amount_xof, note, to_char(spent_on, 'YYYY-MM-DD') AS spent_on FROM expenses WHERE user_id = $1 ORDER BY id`, [uid]),
    ])
    const body = { app: 'compta-ecom', version: 2, exported_at: new Date().toISOString(), shop: shop.rows[0] || null,
      products: products.rows, sales: sales.rows, ad_spends: ads.rows, expenses: exp.rows }
    return new NextResponse(JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="sauvegarde-compta-${new Date().toISOString().slice(0, 10)}.json"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    console.error('[backup GET]', e)
    return bad('Erreur serveur.', 500)
  }
}

const S = (v, n) => (v == null || v === '' ? null : String(v).slice(0, n))
const I = (v, d = 0) => { const x = Number(v); return Number.isInteger(x) && x >= 0 && x <= 2e9 ? x : d }
const D = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null)

// Restauration : REMPLACE produits, ventes, pub et charges par ceux du fichier (réglages de la boutique inclus)
export async function POST(req) {
  const g = await ownerOnly()
  if (g.res) return g.res
  let b
  try { b = await req.json() } catch { return bad('Fichier illisible.') }
  if (b?.app !== 'compta-ecom' || !Array.isArray(b.products) || !Array.isArray(b.sales) || !Array.isArray(b.ad_spends) || !Array.isArray(b.expenses)) {
    return bad('Ce fichier n’est pas une sauvegarde Compta Ecom.')
  }
  if (b.products.length + b.sales.length + b.ad_spends.length + b.expenses.length > 100000) return bad('Fichier trop volumineux.')
  const uid = g.me.id
  const c = await pool.connect()
  try {
    await c.query('BEGIN')
    await c.query('DELETE FROM notifications WHERE user_id = $1', [uid])
    await c.query('DELETE FROM sales WHERE user_id = $1', [uid])
    await c.query('DELETE FROM ad_spends WHERE user_id = $1', [uid])
    await c.query('DELETE FROM expenses WHERE user_id = $1', [uid])
    await c.query('DELETE FROM products WHERE user_id = $1', [uid])

    const ids = new Map()   // ancien id produit → nouvel id
    for (const p of b.products) {
      if (!S(p.name, 150)) continue
      const r = await c.query('INSERT INTO products (user_id, name, sku, cost_xof, price_xof, stock, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [uid, S(p.name, 150), S(p.sku, 50), I(p.cost_xof), I(p.price_xof), I(p.stock), p.is_active !== false])
      ids.set(p.id, r.rows[0].id)
    }
    for (const s of b.sales) {
      if (!S(s.product_name, 150) || !D(s.sold_on)) continue
      await c.query(
        `INSERT INTO sales (user_id, product_id, product_name, quantity, unit_price_xof, unit_cost_xof, source, customer, customer_phone, payment_method, status, note, sold_on)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [uid, ids.get(s.product_id) ?? null, S(s.product_name, 150), Math.max(1, I(s.quantity, 1)), I(s.unit_price_xof), I(s.unit_cost_xof), S(s.source, 60), S(s.customer, 120),
         S(s.customer_phone, 30), S(s.payment_method, 60), STATUS[s.status] ? s.status : 'livree', S(s.note, 500), D(s.sold_on)])
    }
    for (const a of b.ad_spends) {
      if (!D(a.spent_on) || !I(a.amount_xof)) continue
      await c.query('INSERT INTO ad_spends (user_id, product_id, platform, amount_xof, leads, note, spent_on) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [uid, ids.get(a.product_id) ?? null, S(a.platform, 60), I(a.amount_xof), I(a.leads), S(a.note, 500), D(a.spent_on)])
    }
    for (const e of b.expenses) {
      if (!D(e.spent_on) || !I(e.amount_xof)) continue
      await c.query('INSERT INTO expenses (user_id, product_id, category, label, amount_xof, note, spent_on) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [uid, ids.get(e.product_id) ?? null, S(e.category, 60), S(e.label, 150), I(e.amount_xof), S(e.note, 500), D(e.spent_on)])
    }
    const sh = b.shop
    if (sh && typeof sh === 'object') {
      await c.query(
        `INSERT INTO shops (user_id, name, goal_monthly_xof, goal_profit_monthly_xof, low_stock_threshold, payment_methods)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (user_id) DO UPDATE SET name=$2, goal_monthly_xof=$3, goal_profit_monthly_xof=$4, low_stock_threshold=$5, payment_methods=$6, updated_at=NOW()`,
        [uid, S(sh.name, 120), I(sh.goal_monthly_xof), I(sh.goal_profit_monthly_xof), I(sh.low_stock_threshold, 3),
         JSON.stringify(Array.isArray(sh.payment_methods) ? sh.payment_methods.slice(0, 20).map((x) => String(x).slice(0, 40)) : [])])
    }
    // Alertes de stock recalculées
    await c.query(
      `INSERT INTO notifications (user_id, kind, product_id, message)
       SELECT $1, 'stock', id, CASE WHEN stock <= 0 THEN 'Rupture de stock : « ' || name || ' »'
              ELSE 'Stock bas : « ' || name || ' » (' || stock || ' restant' || CASE WHEN stock > 1 THEN 's' ELSE '' END || ')' END
         FROM products WHERE user_id = $1 AND is_active AND stock <= COALESCE((SELECT low_stock_threshold FROM shops WHERE user_id = $1), 3)
       ON CONFLICT (user_id, product_id, kind) WHERE NOT is_read DO NOTHING`, [uid])
    await c.query('COMMIT')
    return NextResponse.json({ ok: true, products: ids.size, sales: b.sales.length, ads: b.ad_spends.length, expenses: b.expenses.length })
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {})
    console.error('[backup POST]', e)
    return bad('La restauration a échoué : rien n’a été modifié.', 500)
  } finally {
    c.release()
  }
}
