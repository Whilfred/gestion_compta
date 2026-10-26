import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { need } from '../../../lib/perm'
import { CANCELED } from '../../../lib/constants'
import { addDays, customRange, range, today } from '../../../lib/dates'

export const dynamic = 'force-dynamic'

const PERIODS = ['all', 'today', 'yesterday', '7d', '30d', 'month']
const X = CANCELED.map((s) => `'${s}'`).join(',')
const n = (v) => Number(v) || 0
const emptyTotals = () => ({ orders: 0, units: 0, revenue: 0, cogs: 0, pending: 0, pendingOrders: 0, status: { en_attente: 0, en_cours: 0, livree: 0, non_livree: 0, retour: 0 }, returns: 0, returnsAmount: 0, ads: 0, adsFree: 0, leads: 0, expenses: 0, expensesFree: 0, gross: 0, net: 0 })

async function totals(uid, from, to) {
  const [s, a, e] = await Promise.all([
    query(
      `SELECT COUNT(*) FILTER (WHERE status = 'livree')::int AS orders,
              COALESCE(SUM(quantity) FILTER (WHERE status = 'livree'), 0)::int AS units,
              COALESCE(SUM(quantity * unit_price_xof) FILTER (WHERE status = 'livree'), 0)::bigint AS revenue,
              COALESCE(SUM(quantity * unit_cost_xof)  FILTER (WHERE status = 'livree'), 0)::bigint AS cogs,
              COALESCE(SUM(quantity * unit_price_xof) FILTER (WHERE status IN ('en_attente','en_cours')), 0)::bigint AS pending,
              COUNT(*) FILTER (WHERE status IN ('en_attente','en_cours'))::int AS pending_orders,
              COUNT(*) FILTER (WHERE status = 'en_attente')::int AS st_attente,
              COUNT(*) FILTER (WHERE status = 'en_cours')::int AS st_cours,
              COUNT(*) FILTER (WHERE status = 'livree')::int AS st_livree,
              COUNT(*) FILTER (WHERE status = 'non_livree')::int AS st_non_livree,
              COUNT(*) FILTER (WHERE status = 'retour')::int AS returns,
              COALESCE(SUM(quantity * unit_price_xof) FILTER (WHERE status IN (${X})), 0)::bigint AS returns_amount
         FROM sales WHERE user_id = $1 AND sold_on BETWEEN $2 AND $3`, [uid, from, to]),
    query(`SELECT COALESCE(SUM(amount_xof), 0)::bigint AS ads,
                  COALESCE(SUM(amount_xof) FILTER (WHERE product_id IS NULL), 0)::bigint AS ads_free,
                  COALESCE(SUM(leads), 0)::int AS leads
             FROM ad_spends WHERE user_id = $1 AND spent_on BETWEEN $2 AND $3`, [uid, from, to]),
    query(`SELECT COALESCE(SUM(amount_xof), 0)::bigint AS expenses,
                  COALESCE(SUM(amount_xof) FILTER (WHERE product_id IS NULL), 0)::bigint AS expenses_free
             FROM expenses WHERE user_id = $1 AND spent_on BETWEEN $2 AND $3`, [uid, from, to]),
  ])
  const r = s.rows[0]
  const t = {
    orders: r.orders, units: r.units, revenue: n(r.revenue), cogs: n(r.cogs),
    pending: n(r.pending), pendingOrders: r.pending_orders,
    status: { en_attente: r.st_attente, en_cours: r.st_cours, livree: r.st_livree, non_livree: r.st_non_livree, retour: r.returns },
    returns: r.returns + r.st_non_livree, returnsAmount: n(r.returns_amount),
    ads: n(a.rows[0].ads), adsFree: n(a.rows[0].ads_free), leads: a.rows[0].leads,
    expenses: n(e.rows[0].expenses), expensesFree: n(e.rows[0].expenses_free),
  }
  t.gross = t.revenue - t.cogs
  t.net = t.gross - t.ads - t.expenses
  return t
}

export async function GET(req) {
  const g = await need('dashboard', 'view')
  if (g.res) return g.res
  const uid = g.me.ownerId
  const sp = new URL(req.url).searchParams
  const p = sp.get('period')
  let period, r
  if (sp.get('from') && sp.get('to')) {
    r = customRange(sp.get('from'), sp.get('to'))
    if (!r) return NextResponse.json({ error: 'Dates invalides.' }, { status: 400 })
    period = 'custom'
  } else {
    period = PERIODS.includes(p) ? p : 'all'
    if (period === 'all') { const t = today(); r = { today: t, from: '2020-01-01', to: t, prevFrom: '2019-12-31', prevTo: '2019-12-31', len: 0 } }
    else r = range(period)
  }
  const monthFrom = r.today.slice(0, 8) + '01'

  try {
    const [cur, prev, monthT, sales, adsBy, expBy, expGroups, sources, platforms, recent, daily, adsDaily, expDaily, shop, lowStock] = await Promise.all([
      totals(uid, r.from, r.to),
      period === 'all' ? Promise.resolve(emptyTotals()) : totals(uid, r.prevFrom, r.prevTo),
      totals(uid, monthFrom, r.today),
      query(
        `SELECT product_id, MAX(product_name) AS name, SUM(quantity)::int AS units, COUNT(*)::int AS orders,
                SUM(quantity * unit_price_xof)::bigint AS revenue, SUM(quantity * unit_cost_xof)::bigint AS cogs
           FROM sales WHERE user_id = $1 AND sold_on BETWEEN $2 AND $3 AND status = 'livree'
          GROUP BY product_id, CASE WHEN product_id IS NULL THEN product_name END`, [uid, r.from, r.to]),
      query(`SELECT a.product_id, p.name, SUM(a.amount_xof)::bigint AS v FROM ad_spends a JOIN products p ON p.id = a.product_id
              WHERE a.user_id = $1 AND a.spent_on BETWEEN $2 AND $3 GROUP BY 1, 2`, [uid, r.from, r.to]),
      query(`SELECT e.product_id, p.name, SUM(e.amount_xof)::bigint AS v FROM expenses e JOIN products p ON p.id = e.product_id
              WHERE e.user_id = $1 AND e.spent_on BETWEEN $2 AND $3 GROUP BY 1, 2`, [uid, r.from, r.to]),
      query(`SELECT COALESCE(e.category, 'Autre') AS category, e.label, p.name AS product, SUM(e.amount_xof)::bigint AS v, COUNT(*)::int AS cnt
               FROM expenses e LEFT JOIN products p ON p.id = e.product_id
              WHERE e.user_id = $1 AND e.spent_on BETWEEN $2 AND $3 GROUP BY 1, 2, 3 ORDER BY v DESC LIMIT 15`, [uid, r.from, r.to]),
      query(
        `SELECT COALESCE(source, 'Autre') AS name, COUNT(*)::int AS orders, SUM(quantity)::int AS units,
                SUM(quantity * unit_price_xof)::bigint AS revenue
           FROM sales WHERE user_id = $1 AND sold_on BETWEEN $2 AND $3 AND status = 'livree'
          GROUP BY 1 ORDER BY revenue DESC`, [uid, r.from, r.to]),
      query(
        `SELECT COALESCE(platform, 'Autre') AS name, SUM(amount_xof)::bigint AS spend, SUM(leads)::int AS leads
           FROM ad_spends WHERE user_id = $1 AND spent_on BETWEEN $2 AND $3 GROUP BY 1`, [uid, r.from, r.to]),
      query(
        `SELECT id, product_name AS product, quantity AS qty, quantity * unit_price_xof AS amount, source, customer, status,
                to_char(sold_on, 'YYYY-MM-DD') AS date, to_char(created_at AT TIME ZONE 'UTC', 'HH24:MI') AS time
           FROM sales WHERE user_id = $1 AND sold_on BETWEEN $2 AND $3
          ORDER BY sold_on DESC, id DESC LIMIT 8`, [uid, r.from, r.to]),
      query(
        `SELECT to_char(sold_on, 'YYYY-MM-DD') AS d,
                COUNT(*) FILTER (WHERE status = 'livree')::int AS orders,
                COALESCE(SUM(quantity) FILTER (WHERE status = 'livree'), 0)::int AS units,
                COALESCE(SUM(quantity * unit_price_xof) FILTER (WHERE status = 'livree'), 0)::bigint AS revenue,
                COALESCE(SUM(quantity * unit_cost_xof)  FILTER (WHERE status = 'livree'), 0)::bigint AS cogs
           FROM sales WHERE user_id = $1 AND sold_on BETWEEN $2 AND $3 GROUP BY 1`, [uid, addDays(r.today, -13), r.today]),
      query(`SELECT to_char(spent_on, 'YYYY-MM-DD') AS d, SUM(amount_xof)::bigint AS v
               FROM ad_spends WHERE user_id = $1 AND spent_on BETWEEN $2 AND $3 GROUP BY 1`, [uid, addDays(r.today, -13), r.today]),
      query(`SELECT to_char(spent_on, 'YYYY-MM-DD') AS d, SUM(amount_xof)::bigint AS v
               FROM expenses WHERE user_id = $1 AND spent_on BETWEEN $2 AND $3 GROUP BY 1`, [uid, addDays(r.today, -13), r.today]),
      query('SELECT name, goal_monthly_xof AS goal, goal_profit_monthly_xof AS goal_profit FROM shops WHERE user_id = $1', [uid]),
      query(`SELECT id, name, stock FROM products
              WHERE user_id = $1 AND is_active AND stock <= COALESCE((SELECT low_stock_threshold FROM shops WHERE user_id = $1), 3)
              ORDER BY stock, name LIMIT 8`, [uid]),
    ])

    const map = new Map()
    const row = (key, name, pid) => { if (!map.has(key)) map.set(key, { id: pid, name, units: 0, orders: 0, revenue: 0, cogs: 0, ads: 0, charges: 0 }); return map.get(key) }
    for (const s of sales.rows) {
      const o = row(s.product_id ? `p${s.product_id}` : `n${s.name}`, s.name, s.product_id)
      o.units += s.units; o.orders += s.orders; o.revenue += n(s.revenue); o.cogs += n(s.cogs)
    }
    for (const a of adsBy.rows) row(`p${a.product_id}`, a.name, a.product_id).ads += n(a.v)
    for (const e of expBy.rows) row(`p${e.product_id}`, e.name, e.product_id).charges += n(e.v)
    const products = [...map.values()]
      .map((o) => ({ ...o, profit: o.revenue - o.cogs, net: o.revenue - o.cogs - o.ads - o.charges }))
      .sort((a, b) => b.revenue - a.revenue || b.net - a.net)

    const channels = new Map()
    for (const s of sources.rows) channels.set(s.name.toLowerCase(), { name: s.name, orders: s.orders, units: s.units, revenue: n(s.revenue), spend: 0, leads: 0 })
    for (const a of platforms.rows) {
      const k = a.name.toLowerCase()
      const c = channels.get(k) || { name: a.name, orders: 0, units: 0, revenue: 0, spend: 0, leads: 0 }
      c.spend += n(a.spend); c.leads += a.leads
      channels.set(k, c)
    }

    const idx = (rows) => Object.fromEntries(rows.map((x) => [x.d, x]))
    const S = idx(daily.rows), A = idx(adsDaily.rows), E = idx(expDaily.rows)
    const series = []
    for (let i = 13; i >= 0; i--) {
      const d = addDays(r.today, -i)
      const revenue = n(S[d]?.revenue), cogs = n(S[d]?.cogs)
      const ads = n(A[d]?.v), expenses = n(E[d]?.v)
      series.push({ date: d, orders: S[d]?.orders || 0, units: S[d]?.units || 0, revenue, ads, expenses, net: revenue - cogs - ads - expenses })
    }

    return NextResponse.json({
      period, from: r.from, to: r.to, prevFrom: r.prevFrom, prevTo: r.prevTo, today: r.today,
      shop: {
        name: shop.rows[0]?.name || '', goal: shop.rows[0]?.goal || 0, goalProfit: shop.rows[0]?.goal_profit || 0,
        monthRevenue: monthT.revenue, monthNet: monthT.net,
      },
      totals: cur,
      prev,
      products,
      independent: { ads: cur.adsFree, charges: cur.expensesFree, total: cur.adsFree + cur.expensesFree },
      expenseGroups: expGroups.rows.map((x) => ({ category: x.category, label: x.label, product: x.product, amount: n(x.v), count: x.cnt })),
      channels: [...channels.values()].sort((a, b) => b.revenue - a.revenue || b.spend - a.spend),
      recent: recent.rows,
      series,
      lowStock: lowStock.rows,
    })
  } catch (e) {
    console.error('[dashboard]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
