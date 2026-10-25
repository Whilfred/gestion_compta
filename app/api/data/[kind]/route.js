import { NextResponse } from 'next/server'
import { pool, query } from '../../../../lib/db'
import { getUser } from '../../../../lib/session'
import { can, CANCELED } from '../../../../lib/constants'
import { customRange, range } from '../../../../lib/dates'

export const dynamic = 'force-dynamic'

const KINDS = ['ventes', 'produits', 'publicite', 'charges']
const STATUSES = ['en_attente', 'en_cours', 'livree', 'non_livree', 'retour']
const OUT = (s) => !CANCELED.includes(s)            // la vente sort du stock et compte dans le CA
const CANCELED_SQL = CANCELED.map((s) => `'${s}'`).join(',')

class Bad extends Error {}
const str = (v, n) => String(v ?? '').trim().slice(0, n) || null
const bad = (error, status = 400) => NextResponse.json({ error }, { status })
const pos = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 && n <= 2e9 ? n : null }
const nat = (v) => { if (v === '' || v == null) return 0; const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= 2e9 ? n : null }
const date = (v) => {
  if (v === '' || v == null) return { ok: true, value: null }
  const d = new Date(`${v}T12:00:00Z`)
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v)) && !isNaN(d) && d.getUTCFullYear() >= 2020 && d.getTime() <= Date.now() + 36 * 3600 * 1000
    ? { ok: true, value: v } : { ok: false }
}

// Vérifie connexion + droit. Les employés lisent/écrivent dans les données de leur patron (ownerId).
async function guard(params, level, req) {
  const me = await getUser()
  if (!me) return { res: bad('Non connecté.', 401) }
  if (!KINDS.includes(params.kind)) return { res: bad('Introuvable.', 404) }
  // Liste « légère » des produits (pour les menus déroulants) : autorisée dès qu'on a accès aux ventes, pub ou charges
  const lite = params.kind === 'produits' && level === 'view' && new URL(req.url).searchParams.get('lite') === '1'
  const ok = lite ? ['produits', 'ventes', 'publicite', 'charges'].some((s) => can(me.perms, s)) : can(me.perms, params.kind, level)
  if (!ok) return { res: bad(level === 'edit' ? 'Vous n’avez pas le droit de modifier cette rubrique.' : 'Accès refusé à cette rubrique.', 403) }
  if (level === 'delete' && me.perms.delete !== true) return { res: bad('Suppression non autorisée pour votre compte.', 403) }
  return { me, lite }
}

async function tx(fn) {
  const c = await pool.connect()
  try {
    await c.query('BEGIN')
    const r = await fn(c)
    await c.query('COMMIT')
    return r
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {})
    throw e
  } finally { c.release() }
}

// ---------- Alerte de stock : crée / met à jour / efface la notification du produit ----------
async function checkStock(c, uid, pid) {
  const { rows } = await c.query(
    `SELECT p.name, p.stock, p.is_active, COALESCE((SELECT low_stock_threshold FROM shops WHERE user_id = $1), 3) AS th
       FROM products p WHERE p.id = $2 AND p.user_id = $1`, [uid, pid])
  const p = rows[0]
  if (!p) return
  if (p.is_active && p.stock <= p.th) {
    const msg = p.stock <= 0 ? `Rupture de stock : « ${p.name} »` : `Stock bas : « ${p.name} » (${p.stock} restant${p.stock > 1 ? 's' : ''})`
    await c.query(
      `INSERT INTO notifications (user_id, kind, product_id, message) VALUES ($1, 'stock', $2, $3)
       ON CONFLICT (user_id, product_id, kind) WHERE NOT is_read DO UPDATE SET message = EXCLUDED.message, created_at = NOW()`,
      [uid, pid, msg])
  } else {
    await c.query(`DELETE FROM notifications WHERE user_id = $1 AND product_id = $2 AND kind = 'stock' AND NOT is_read`, [uid, pid])
  }
}

// ---------- Stock : on rend l'ancienne quantité, puis on retire la nouvelle (refus si insuffisant) ----------
async function applyStock(c, uid, old, nw) {
  if (old?.product_id && OUT(old.status)) await c.query('UPDATE products SET stock = stock + $1 WHERE id = $2 AND user_id = $3', [old.quantity, old.product_id, uid])
  if (nw?.product_id && OUT(nw.status)) {
    const { rows } = await c.query('SELECT name, stock FROM products WHERE id = $1 AND user_id = $2 FOR UPDATE', [nw.product_id, uid])
    const p = rows[0]
    if (!p) throw new Bad('Produit introuvable.')
    if (p.stock < nw.quantity) {
      const left = Math.max(p.stock, 0)
      throw new Bad(`Stock insuffisant pour « ${p.name} » : ${left} disponible${left > 1 ? 's' : ''}, ${nw.quantity} demandé${nw.quantity > 1 ? 's' : ''}.`)
    }
    await c.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [nw.quantity, nw.product_id])
  }
  for (const pid of new Set([old?.product_id, nw?.product_id].filter(Boolean))) await checkStock(c, uid, pid)
}

// Produit rattaché à une pub / une charge (null = indépendante)
async function productRef(c, uid, v) {
  if (v === '' || v == null || v === 'none') return null
  const id = pos(v)
  if (!id) throw new Bad('Produit invalide.')
  const { rows } = await c.query('SELECT id FROM products WHERE id = $1 AND user_id = $2', [id, uid])
  if (!rows[0]) throw new Bad('Produit introuvable.')
  return id
}

function periodOf(sp) {
  const f = sp.get('from'), t = sp.get('to')
  if (f && t) { const r = customRange(f, t); if (!r) throw new Bad('Dates invalides.'); return { from: r.from, to: r.to } }
  const p = sp.get('period')
  if (p && p !== 'all') { const r = range(p); return { from: r.from, to: r.to } }
  return { from: null, to: null }
}

// ---------- Lecture ----------
// ?period=today|yesterday|7d|30d|month|all  ou  ?from=AAAA-MM-JJ&to=AAAA-MM-JJ
// ventes : &status=livree|en_cours|…  &product_id=12  &q=texte (client / téléphone)
// pub, charges : &product_id=12 ou product_id=none (charges indépendantes)
export async function GET(req, { params }) {
  const g = await guard(params, 'view', req)
  if (g.res) return g.res
  const sp = new URL(req.url).searchParams
  const uid = g.me.ownerId
  try {
    const { from, to } = periodOf(sp)
    const vals = [uid, from, to]
    const where = ['x.user_id = $1', '($2::date IS NULL OR x.@d BETWEEN $2 AND $3)']
    const add = (sql, v) => { vals.push(v); where.push(sql.replace(/\$n/g, `$${vals.length}`)) }
    const pid = sp.get('product_id')
    let q

    if (params.kind === 'produits') {
      if (g.lite) {
        const { rows } = await query('SELECT id, name, cost_xof AS cost, price_xof AS price, stock, is_active AS active FROM products WHERE user_id = $1 ORDER BY is_active DESC, name', [uid])
        return NextResponse.json({ rows })
      }
      const { rows } = await query(
        `SELECT p.id, p.name, p.sku, p.cost_xof AS cost, p.price_xof AS price, p.stock, p.is_active AS active,
                COALESCE((SELECT SUM(quantity) FROM sales s WHERE s.product_id = p.id AND s.status NOT IN (${CANCELED_SQL})), 0)::int AS sold,
                COALESCE((SELECT SUM(quantity * unit_price_xof) FROM sales s WHERE s.product_id = p.id AND s.status NOT IN (${CANCELED_SQL})), 0)::bigint AS revenue,
                COALESCE((SELECT SUM(quantity * (unit_price_xof - unit_cost_xof)) FROM sales s WHERE s.product_id = p.id AND s.status NOT IN (${CANCELED_SQL})), 0)::bigint AS margin,
                COALESCE((SELECT SUM(amount_xof) FROM ad_spends a WHERE a.product_id = p.id), 0)::bigint AS ads,
                COALESCE((SELECT SUM(amount_xof) FROM expenses e WHERE e.product_id = p.id), 0)::bigint AS charges,
                COALESCE((SELECT low_stock_threshold FROM shops WHERE user_id = $1), 3) AS threshold
           FROM products p WHERE p.user_id = $1 ORDER BY p.is_active DESC, p.name`, [uid])
      return NextResponse.json({
        rows: rows.map((r) => {
          const revenue = Number(r.revenue), ads = Number(r.ads), charges = Number(r.charges)
          return { ...r, revenue, margin: Number(r.margin), ads, charges, net: Number(r.margin) - ads - charges }
        }),
      })
    }

    if (params.kind === 'ventes') {
      if (STATUSES.includes(sp.get('status'))) add('x.status = $n', sp.get('status'))
      if (pid && pid !== 'none') add('x.product_id = $n', pos(pid) || 0)
      const text = str(sp.get('q'), 80)
      if (text) add(`(x.customer ILIKE $n OR x.customer_phone ILIKE $n OR x.product_name ILIKE $n)`, `%${text.replace(/[%_]/g, '')}%`)
      q = `SELECT x.id, x.product_id, x.product_name AS product, x.quantity AS qty, x.unit_price_xof AS price, x.unit_cost_xof AS cost,
                  x.quantity * x.unit_price_xof AS amount, x.source, x.customer, x.customer_phone AS phone, x.payment_method AS payment,
                  x.status, x.note, to_char(x.sold_on, 'YYYY-MM-DD') AS date, to_char(x.created_at AT TIME ZONE 'UTC', 'HH24:MI') AS time
             FROM sales x WHERE ${where.join(' AND ').replace('x.@d', 'x.sold_on')}
            ORDER BY x.sold_on DESC, x.id DESC LIMIT 1000`
    } else {
      if (pid === 'none') where.push('x.product_id IS NULL')
      else if (pid) add('x.product_id = $n', pos(pid) || 0)
      const cols = params.kind === 'publicite'
        ? `x.id, x.platform, x.amount_xof AS amount, x.leads, x.note, x.product_id, p.name AS product, to_char(x.spent_on, 'YYYY-MM-DD') AS date`
        : `x.id, x.category, x.label, x.amount_xof AS amount, x.note, x.product_id, p.name AS product, to_char(x.spent_on, 'YYYY-MM-DD') AS date`
      q = `SELECT ${cols} FROM ${params.kind === 'publicite' ? 'ad_spends' : 'expenses'} x LEFT JOIN products p ON p.id = x.product_id
            WHERE ${where.join(' AND ').replace('x.@d', 'x.spent_on')} ORDER BY x.spent_on DESC, x.id DESC LIMIT 1000`
    }
    const { rows } = await query(q, vals)
    return NextResponse.json({ rows })
  } catch (e) {
    if (e instanceof Bad) return bad(e.message)
    console.error('[data GET]', e)
    return bad('Erreur serveur.', 500)
  }
}

// ---------- Ajout ----------
export async function POST(req, { params }) {
  const g = await guard(params, 'edit', req)
  if (g.res) return g.res
  let b
  try { b = await req.json() } catch { b = {} }
  const uid = g.me.ownerId
  const when = date(b.date)
  if (!when.ok) return bad('Date invalide (pas dans le futur).')

  try {
    await tx(async (c) => {
      if (params.kind === 'produits') {
        const name = str(b.name, 150)
        const cost = nat(b.cost), price = nat(b.price)
        if (!name) throw new Bad('Nom du produit requis.')
        if (cost === null || price === null) throw new Bad('Prix invalide.')
        const stock = Number(b.stock || 0)
        if (!Number.isInteger(stock) || stock < 0 || stock > 1e7) throw new Bad('Stock invalide (entier positif).')
        const { rows } = await c.query('INSERT INTO products (user_id, name, sku, cost_xof, price_xof, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
          [uid, name, str(b.sku, 50), cost, price, stock])
        await checkStock(c, uid, rows[0].id)
      } else if (params.kind === 'ventes') {
        const qty = pos(b.qty ?? 1)
        if (!qty || qty > 1e6) throw new Bad('Quantité invalide.')
        const status = STATUSES.includes(b.status) ? b.status : 'livree'
        let name = str(b.product, 150), pid = null
        let price = b.price === '' || b.price == null ? null : nat(b.price)
        let cost = b.cost === '' || b.cost == null ? null : nat(b.cost)
        if (price === null && b.price !== '' && b.price != null) throw new Bad('Prix invalide.')
        if (cost === null && b.cost !== '' && b.cost != null) throw new Bad('Coût invalide.')
        if (b.product_id) {
          const { rows } = await c.query('SELECT id, name, cost_xof, price_xof FROM products WHERE id = $1 AND user_id = $2', [pos(b.product_id), uid])
          if (!rows[0]) throw new Bad('Produit introuvable.')
          pid = rows[0].id; name = rows[0].name
          if (price === null) price = rows[0].price_xof
          if (cost === null) cost = rows[0].cost_xof
        }
        if (!name) throw new Bad('Choisissez ou saisissez un produit.')
        if (price === null || price <= 0) throw new Bad('Prix de vente invalide.')
        await applyStock(c, uid, null, { product_id: pid, quantity: qty, status })   // refuse si stock insuffisant
        await c.query(
          `INSERT INTO sales (user_id, product_id, product_name, quantity, unit_price_xof, unit_cost_xof, source, customer, customer_phone, payment_method, status, note, sold_on)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13::date, (NOW() AT TIME ZONE 'UTC')::date))`,
          [uid, pid, name, qty, price, cost ?? 0, str(b.source, 60), str(b.customer, 120), str(b.phone, 30), str(b.payment, 60), status, str(b.note, 500), when.value])
      } else if (params.kind === 'publicite') {
        const amount = pos(b.amount), leads = nat(b.leads)
        if (!amount) throw new Bad('Montant invalide.')
        if (leads === null) throw new Bad('Nombre de prospects invalide.')
        const pid = await productRef(c, uid, b.product_id)
        await c.query(`INSERT INTO ad_spends (user_id, product_id, platform, amount_xof, leads, note, spent_on)
                       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::date, (NOW() AT TIME ZONE 'UTC')::date))`,
          [uid, pid, str(b.platform, 60), amount, leads, str(b.note, 500), when.value])
      } else {
        const amount = pos(b.amount)
        if (!amount) throw new Bad('Montant invalide.')
        if (!str(b.label, 150)) throw new Bad('Donnez un nom à la dépense (ex. Déplacement à Bobo).')
        const pid = await productRef(c, uid, b.product_id)
        await c.query(`INSERT INTO expenses (user_id, product_id, category, label, amount_xof, note, spent_on)
                       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::date, (NOW() AT TIME ZONE 'UTC')::date))`,
          [uid, pid, str(b.category, 60), str(b.label, 150), amount, str(b.note, 500), when.value])
      }
    })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    if (e instanceof Bad) return bad(e.message)
    console.error('[data POST]', e)
    return bad('Erreur serveur.', 500)
  }
}

// ---------- Modification : ?id=123 — tous les champs sont modifiables (envoyer seulement ceux qui changent) ----------
export async function PATCH(req, { params }) {
  const g = await guard(params, 'edit', req)
  if (g.res) return g.res
  const rid = pos(new URL(req.url).searchParams.get('id'))
  if (!rid) return bad('Identifiant invalide.')
  let b
  try { b = await req.json() } catch { b = {} }
  const uid = g.me.ownerId

  try {
    await tx(async (c) => {
      if (params.kind === 'ventes') {
        const { rows } = await c.query('SELECT * FROM sales WHERE id = $1 AND user_id = $2 FOR UPDATE', [rid, uid])
        const old = rows[0]
        if (!old) throw new Bad('Introuvable.')
        const n = { ...old }
        if (b.status !== undefined) { if (!STATUSES.includes(b.status)) throw new Bad('Statut invalide.'); n.status = b.status }
        if (b.qty !== undefined) { const q = pos(b.qty); if (!q || q > 1e6) throw new Bad('Quantité invalide.'); n.quantity = q }
        if (b.price !== undefined) { const v = nat(b.price); if (v === null || v <= 0) throw new Bad('Prix de vente invalide.'); n.unit_price_xof = v }
        if (b.cost !== undefined) { const v = nat(b.cost); if (v === null) throw new Bad('Coût invalide.'); n.unit_cost_xof = v }
        if (b.source !== undefined) n.source = str(b.source, 60)
        if (b.customer !== undefined) n.customer = str(b.customer, 120)
        if (b.phone !== undefined) n.customer_phone = str(b.phone, 30)
        if (b.payment !== undefined) n.payment_method = str(b.payment, 60)
        if (b.note !== undefined) n.note = str(b.note, 500)
        if (b.date !== undefined) { const w = date(b.date); if (!w.ok) throw new Bad('Date invalide (pas dans le futur).'); if (w.value) n.sold_on = w.value }
        if (b.product_id !== undefined) {
          if (b.product_id === '' || b.product_id === null) {
            n.product_id = null
            n.product_name = str(b.product, 150) || old.product_name
          } else {
            const { rows: pr } = await c.query('SELECT id, name FROM products WHERE id = $1 AND user_id = $2', [pos(b.product_id), uid])
            if (!pr[0]) throw new Bad('Produit introuvable.')
            n.product_id = pr[0].id; n.product_name = pr[0].name
          }
        } else if (b.product !== undefined && !old.product_id) {
          n.product_name = str(b.product, 150) || old.product_name
        }
        await applyStock(c, uid, old, n)
        await c.query(
          `UPDATE sales SET product_id=$1, product_name=$2, quantity=$3, unit_price_xof=$4, unit_cost_xof=$5, source=$6, customer=$7,
                  customer_phone=$8, payment_method=$9, status=$10, note=$11, sold_on=$12 WHERE id=$13`,
          [n.product_id, n.product_name, n.quantity, n.unit_price_xof, n.unit_cost_xof, n.source, n.customer, n.customer_phone, n.payment_method, n.status, n.note, n.sold_on, rid])
      } else {
        const sets = [], vals = []
        const push = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`) }
        const dt = b.date !== undefined ? date(b.date) : null
        if (dt && !dt.ok) throw new Bad('Date invalide (pas dans le futur).')
        let table, stockPid = null

        if (params.kind === 'produits') {
          table = 'products'
          if (b.name !== undefined) { const v = str(b.name, 150); if (!v) throw new Bad('Nom requis.'); push('name', v) }
          if (b.sku !== undefined) push('sku', str(b.sku, 50))
          if (b.cost !== undefined) { const v = nat(b.cost); if (v === null) throw new Bad('Prix d’achat invalide.'); push('cost_xof', v) }
          if (b.price !== undefined) { const v = nat(b.price); if (v === null) throw new Bad('Prix de vente invalide.'); push('price_xof', v) }
          if (b.stock !== undefined) { const v = Number(b.stock); if (!Number.isInteger(v) || v < 0 || v > 1e7) throw new Bad('Stock invalide (entier positif).'); push('stock', v) }
          if (b.active !== undefined) push('is_active', !!b.active)
          stockPid = rid
        } else if (params.kind === 'publicite') {
          table = 'ad_spends'
          if (b.platform !== undefined) push('platform', str(b.platform, 60))
          if (b.amount !== undefined) { const v = pos(b.amount); if (!v) throw new Bad('Montant invalide.'); push('amount_xof', v) }
          if (b.leads !== undefined) { const v = nat(b.leads); if (v === null) throw new Bad('Nombre de prospects invalide.'); push('leads', v) }
          if (b.note !== undefined) push('note', str(b.note, 500))
          if (b.product_id !== undefined) push('product_id', await productRef(c, uid, b.product_id))
          if (dt?.value) push('spent_on', dt.value)
        } else {
          table = 'expenses'
          if (b.category !== undefined) push('category', str(b.category, 60))
          if (b.label !== undefined) { const v = str(b.label, 150); if (!v) throw new Bad('Donnez un nom à la dépense.'); push('label', v) }
          if (b.amount !== undefined) { const v = pos(b.amount); if (!v) throw new Bad('Montant invalide.'); push('amount_xof', v) }
          if (b.note !== undefined) push('note', str(b.note, 500))
          if (b.product_id !== undefined) push('product_id', await productRef(c, uid, b.product_id))
          if (dt?.value) push('spent_on', dt.value)
        }
        if (!sets.length) throw new Bad('Rien à modifier.')
        vals.push(rid, uid)
        const r = await c.query(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${vals.length - 1} AND user_id = $${vals.length}`, vals)
        if (!r.rowCount) throw new Bad('Introuvable.')
        if (stockPid) await checkStock(c, uid, stockPid)
      }
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Bad) return bad(e.message)
    console.error('[data PATCH]', e)
    return bad('Erreur serveur.', 500)
  }
}

// ---------- Suppression : ?id=123 ----------
export async function DELETE(req, { params }) {
  const g = await guard(params, 'delete', req)
  if (g.res) return g.res
  const rid = pos(new URL(req.url).searchParams.get('id'))
  if (!rid) return bad('Identifiant invalide.')
  const uid = g.me.ownerId
  try {
    await tx(async (c) => {
      if (params.kind === 'ventes') {
        const { rows } = await c.query('DELETE FROM sales WHERE id = $1 AND user_id = $2 RETURNING product_id, quantity, status', [rid, uid])
        if (rows[0]) await applyStock(c, uid, rows[0], null)   // le produit retourne en stock
      } else if (params.kind === 'produits') {
        const { rows } = await c.query(
          `SELECT (SELECT COUNT(*) FROM ad_spends WHERE product_id = $1)::int AS ads, (SELECT COUNT(*) FROM expenses WHERE product_id = $1)::int AS exp`, [rid])
        if (rows[0].ads + rows[0].exp > 0) throw new Bad('Ce produit a des dépenses (pub / charges) associées : archivez-le plutôt, ou supprimez d’abord ces dépenses.')
        await c.query('DELETE FROM products WHERE id = $1 AND user_id = $2', [rid, uid])
      } else {
        const table = params.kind === 'publicite' ? 'ad_spends' : 'expenses'
        await c.query(`DELETE FROM ${table} WHERE id = $1 AND user_id = $2`, [rid, uid])
      }
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Bad) return bad(e.message)
    console.error('[data DELETE]', e)
    return bad('Erreur serveur.', 500)
  }
}
