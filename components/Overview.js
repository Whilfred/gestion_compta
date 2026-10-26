"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { PERIODS, STATUS } from '../lib/constants'
import { useFmt } from '../lib/privacy'
import { day, dayLong, dec, delta, pct, ratio, weekday } from '../lib/format'

const VS = { today: 'vs hier', yesterday: 'vs avant-hier', '7d': 'vs 7 jours précédents', '30d': 'vs 30 jours précédents', month: 'vs période précédente', custom: 'vs période précédente', all: '' }

const label = (d) => {
  const p = d.period
  if (p === 'all') return 'Depuis le début · toutes les ventes livrées'
  if (p === 'today' || p === 'yesterday') return dayLong(d.from)
  return `Du ${day(d.from)} au ${day(d.to)}`
}

export default function Overview() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('all')
  const [range, setRange] = useState({ from: '', to: '' })
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [on, setOn] = useState(false)
  const maxDay = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    let alive = true
    let qs = `period=${period}`
    if (period === 'custom') { if (!range.from || !range.to) return; qs = `from=${range.from}&to=${range.to}` }
    setErr('')
    api(`/api/dashboard?${qs}`)
      .then((x) => { if (alive) { setD(x); setOn(false); setTimeout(() => alive && setOn(true), 50) } })
      .catch((e) => alive && setErr(e.message))
    return () => { alive = false }
  }, [period, range])

  const first = (user?.name || '').split(' ')[0]

  return (
    <>
      <div className="title">
        <div>
          <h2>Bonjour {first}{d?.shop.name ? ` · ${d.shop.name}` : ''}</h2>
          <p>{d ? label(d) : ' '}</p>
        </div>
        <div className="filters" style={{ marginBottom: 0 }}>
          <div className="seg" role="tablist" aria-label="Période">
            <button role="tab" aria-selected={period === 'all'} onClick={() => setPeriod('all')}>Total</button>
            {PERIODS.map(([k, name]) => (
              <button key={k} role="tab" aria-selected={period === k} onClick={() => setPeriod(k)}>{name}</button>
            ))}
            <button role="tab" aria-selected={period === 'custom'} onClick={() => setPeriod('custom')}>Dates…</button>
          </div>
          {period === 'custom' && (
            <div className="dates">
              <input type="date" max={maxDay} value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} aria-label="Du" />
              <span className="mute">au</span>
              <input type="date" max={maxDay} value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} aria-label="Au" />
            </div>
          )}
        </div>
      </div>

      {err && <div className="err">{err}</div>}
      {!d ? (!err && <p className="mute">{period === 'custom' && !(range.from && range.to) ? 'Choisissez les deux dates.' : 'Chargement…'}</p>) : <Content d={d} on={on} />}
    </>
  )
}

function Delta({ cur, prev, good = 'up', vs }) {
  const { hidden } = useFmt()
  const v = delta(cur, prev)
  if (v === null || hidden) return null
  const better = good === 'up' ? v > 0 : v < 0
  const cls = v === 0 ? '' : better ? 'up' : 'down'
  return <span className={`chip ${cls}`} title={vs}>{v > 0 ? '▲' : v < 0 ? '▼' : '='} {Math.abs(v)} % <span style={{ fontWeight: 500, opacity: .8 }}>{vs}</span></span>
}

function Content({ d, on }) {
  const { xof, num, cnt, hidden } = useFmt()
  const { totals: t, prev: pv, shop } = d
  const vs = VS[d.period]
  const empty = t.orders + t.pendingOrders + t.returns + t.ads + t.expenses === 0
  const nothingEver = empty && d.series.every((s) => s.orders === 0 && s.ads === 0 && s.expenses === 0)
  const roas = ratio(t.revenue, t.ads)
  const goalPct = pct(shop.monthRevenue, shop.goal)
  const profitPct = pct(Math.max(shop.monthNet, 0), shop.goalProfit)
  const st = t.status

  const indicators = [
    ['Panier moyen', ratio(t.revenue, t.orders), (v) => xof(v)],
    ['Gain par FCFA de pub (ROAS)', roas, (v) => `${dec(v)} FCFA`],
    ['Pub par commande', t.ads > 0 ? ratio(t.ads, t.orders) : null, (v) => xof(v)],
    ['Coût par prospect', t.ads > 0 ? ratio(t.ads, t.leads) : null, (v) => xof(v)],
    ['Prospects → commandes', t.leads > 0 ? (t.orders * 100) / t.leads : null, (v) => `${dec(v, 1)} %`],
    ['Marge brute', t.revenue > 0 ? (t.gross / t.revenue) * 100 : null, (v) => `${Math.round(v)} %`],
    ['Marge nette', t.revenue > 0 ? (t.net / t.revenue) * 100 : null, (v) => `${Math.round(v)} %`],
  ]

  const max = Math.max(1, ...d.series.flatMap((s) => [s.revenue, s.revenue - s.net]))
  const h = (v) => (on ? `${v > 0 ? Math.max((v / max) * 100, 3) : 0}%` : '0%')
  const lastDays = [...d.series].reverse().slice(0, 7)
  const prodMax = Math.max(1, ...d.products.map((p) => p.revenue))

  return (
    <>
      {nothingEver ? (
        <div className="card">
          <h3>Votre tableau de bord est vide pour l’instant</h3>
          <p className="mute" style={{ marginBottom: 16 }}>Ajoutez vos produits, puis enregistrez chaque vente et chaque dépense : le chiffre d’affaires, le bénéfice net et les graphiques se calculent tout seuls.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn btn-blue" href="/dashboard/produits">Ajouter un produit</Link>
            <Link className="btn btn-line" href="/dashboard/ventes">Enregistrer une vente</Link>
            <Link className="btn btn-line" href="/dashboard/publicite">Ajouter une dépense pub</Link>
          </div>
        </div>
      ) : (
        <div className="card hero-k">
          <div>
            <span className="lbl">Bénéfice net</span>
            <div className={`net ${t.net < 0 ? 'neg' : 'pos'}`}>{!hidden && t.net < 0 ? '−' : ''}{num(Math.abs(t.net))}<small>FCFA</small></div>
            <Delta cur={t.net} prev={pv.net} vs={vs} />
            <p className="mute" style={{ marginTop: 8, fontSize: '.85rem' }}>Chiffre d’affaires − coût des produits − publicité − charges (produits + indépendantes).</p>
          </div>
          <div>
            <span className="lbl">Objectifs du mois</span>
            {shop.goal > 0 || shop.goalProfit > 0 ? (
              <>
                {shop.goal > 0 && (
                  <>
                    <div className="track"><i style={{ width: on && !hidden ? `${Math.min(goalPct ?? 0, 100)}%` : 0 }} /></div>
                    <small className="mute">Chiffre d’affaires : {num(shop.monthRevenue)} sur {num(shop.goal)} FCFA{hidden ? '' : ` (${goalPct} %)`}</small>
                  </>
                )}
                {shop.goalProfit > 0 && (
                  <>
                    <div className="track"><i style={{ width: on && !hidden ? `${Math.min(profitPct ?? 0, 100)}%` : 0 }} /></div>
                    <small className="mute">Bénéfice net : {num(shop.monthNet)} sur {num(shop.goalProfit)} FCFA{hidden ? '' : ` (${profitPct} %)`}</small>
                  </>
                )}
              </>
            ) : (
              <p className="mute" style={{ marginTop: 6 }}>Définissez vos objectifs (chiffre d’affaires, bénéfice) pour suivre votre progression. <Link href="/dashboard/parametres" style={{ color: 'var(--blue)', fontWeight: 600 }}>Réglages</Link></p>
            )}
          </div>
        </div>
      )}

      <div className="kpis">
        <div className="kpi"><span>Chiffre d’affaires{d.period === 'all' ? ' total' : ''}</span><b>{xof(t.revenue)}</b><Delta cur={t.revenue} prev={pv.revenue} vs={vs} /><small>ventes livrées uniquement{t.pending > 0 ? ` · ${xof(t.pending)} en attente de livraison (non compté)` : ''}</small></div>
        <div className="kpi"><span>Ventes livrées</span><b>{cnt(t.orders)}</b><Delta cur={t.orders} prev={pv.orders} vs={vs} />{t.returns > 0 && <small>{cnt(t.returns)} retour{t.returns > 1 ? 's' : ''} / non livrée{t.returns > 1 ? 's' : ''} ({xof(t.returnsAmount)})</small>}</div>
        <div className="kpi"><span>Articles livrés</span><b>{cnt(t.units)}</b><Delta cur={t.units} prev={pv.units} vs={vs} /></div>
        <div className="kpi"><span>Dépenses totales</span><b>{xof(t.cogs + t.ads + t.expenses)}</b><small>produits {xof(t.cogs)} · pub {xof(t.ads)} · charges {xof(t.expenses)}</small></div>
        <div className="kpi"><span>Bénéfice brut</span><b>{xof(t.gross)}</b><small>avant pub et charges</small></div>
        <div className="kpi"><span>Livraisons</span><b>{cnt(st.livree)} livrée{st.livree > 1 ? 's' : ''}</b><small>{cnt(st.en_attente)} en attente · {cnt(st.en_cours)} en cours · {cnt(st.non_livree)} non livrée{st.non_livree > 1 ? 's' : ''} · {cnt(st.retour)} retour{st.retour > 1 ? 's' : ''}</small></div>
      </div>

      <div className="card">
        <h3>14 derniers jours <small>chiffre d’affaires et dépenses</small></h3>
        <div className="legend"><span><i className="i-rev" />Chiffre d’affaires</span><span><i className="i-cost" />Dépenses (produits + pub + charges)</span></div>
        <div className={`chart${hidden ? ' blur' : ''}`} role="img" aria-label="Chiffre d’affaires et dépenses des 14 derniers jours">
          {d.series.map((s, i) => (
            <div key={s.date} className={s.date === d.today ? 'today' : ''} title={hidden ? dayLong(s.date) : `${dayLong(s.date)} : ${xof(s.revenue)} de chiffre d’affaires, ${xof(s.revenue - s.net)} de dépenses, ${s.orders} vente${s.orders > 1 ? 's' : ''}`}>
              <div className="bars">
                <i className="b-rev" style={{ height: h(s.revenue) }} />
                <i className="b-cost" style={{ height: h(s.revenue - s.net) }} />
              </div>
              <small className={i % 2 === 1 || s.date === d.today ? 'show' : ''}>{s.date.slice(8)}/{s.date.slice(5, 7)}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Résultat par produit <small>{d.products.length ? `${cnt(d.products.reduce((a, p) => a + p.units, 0))} articles` : ''}</small></h3>
          {d.products.length === 0 && d.independent.total === 0 ? <p className="empty">Aucune activité sur cette période.</p> : (
            <div className="scroll">
              <table>
                <thead><tr><th>Produit</th><th className="r">Qté</th><th className="r">Chiffre d’aff.</th><th className="r">Achat</th><th className="r">Pub</th><th className="r">Charges</th><th className="r">Bénéfice net</th></tr></thead>
                <tbody>
                  {d.products.map((p) => (
                    <tr key={p.id ?? p.name}>
                      <td className="wrap"><b>{p.name}</b><div className="track" style={{ height: 4, margin: '6px 0 0', width: 110 }}><i style={{ width: hidden ? 0 : `${(p.revenue / prodMax) * 100}%` }} /></div></td>
                      <td className="r">{cnt(p.units)}</td>
                      <td className="r">{xof(p.revenue)}</td>
                      <td className="r">{xof(p.cogs)}</td>
                      <td className="r">{p.ads > 0 ? xof(p.ads) : '—'}</td>
                      <td className="r">{p.charges > 0 ? xof(p.charges) : '—'}</td>
                      <td className={`r ${p.net < 0 ? 'neg' : 'pos'}`}><b>{xof(p.net)}</b></td>
                    </tr>
                  ))}
                  {d.independent.total > 0 && (
                    <tr>
                      <td className="wrap"><b>Charges indépendantes</b><small style={{ display: 'block' }} className="mute">pub générale {xof(d.independent.ads)} · autres charges {xof(d.independent.charges)}</small></td>
                      <td className="r">—</td><td className="r">—</td><td className="r">—</td>
                      <td className="r">{d.independent.ads > 0 ? xof(d.independent.ads) : '—'}</td>
                      <td className="r">{d.independent.charges > 0 ? xof(d.independent.charges) : '—'}</td>
                      <td className="r neg"><b>{hidden ? xof(0) : xof(-d.independent.total)}</b></td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td><b>Total</b></td><td className="r">{cnt(t.units)}</td><td className="r"><b>{xof(t.revenue)}</b></td><td className="r">{xof(t.cogs)}</td>
                    <td className="r">{xof(t.ads)}</td><td className="r">{xof(t.expenses)}</td>
                    <td className={`r ${t.net < 0 ? 'neg' : 'pos'}`}><b>{xof(t.net)}</b></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>D’où viennent les ventes <small>canaux</small></h3>
          {d.channels.length === 0 ? <p className="empty">Aucune donnée sur cette période.</p> : (
            <div className="scroll">
              <table>
                <thead><tr><th>Canal</th><th className="r">Ventes</th><th className="r">Chiffre d’aff.</th><th className="r">Pub</th><th className="r">ROAS</th></tr></thead>
                <tbody>
                  {d.channels.map((c) => (
                    <tr key={c.name}>
                      <td><b>{c.name}</b></td>
                      <td className="r">{cnt(c.orders)}</td>
                      <td className="r">{xof(c.revenue)}</td>
                      <td className="r">{c.spend > 0 ? xof(c.spend) : '—'}</td>
                      <td className="r">{c.spend > 0 && !hidden ? dec(c.revenue / c.spend) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {d.expenseGroups.length > 0 && (
        <div className="card">
          <h3>Détail des dépenses <small>charges nommées</small></h3>
          <div className="scroll">
            <table>
              <thead><tr><th>Dépense</th><th>Catégorie</th><th>Produit</th><th className="r">Fois</th><th className="r">Montant</th></tr></thead>
              <tbody>
                {d.expenseGroups.map((g, i) => (
                  <tr key={i}><td className="wrap"><b>{g.label || g.category}</b></td><td>{g.category}</td><td>{g.product || <span className="mute">Indépendante</span>}</td><td className="r">{cnt(g.count)}</td><td className="r">{xof(g.amount)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <h3>Indicateurs</h3>
          <dl className="dl">
            {indicators.map(([name, v, fmt]) => <div key={name}><dt>{name}</dt><dd>{v === null ? '—' : hidden ? 'xxxx' : fmt(v)}</dd></div>)}
            <div><dt>Prospects générés (pub)</dt><dd>{t.leads ? num(t.leads) : '—'}</dd></div>
          </dl>
        </div>

        <div className="col">
          <div className="card">
            <h3>Dernières ventes <Link href="/dashboard/ventes" style={{ color: 'var(--blue)', fontSize: '.82rem', fontWeight: 600 }}>Tout voir</Link></h3>
            {d.recent.length === 0 ? <p className="empty">Aucune vente sur cette période.</p> : (
              <ul className="list">
                {d.recent.map((r) => (
                  <li key={r.id} className="row">
                    <div><b>{r.product}{r.qty > 1 ? ` × ${cnt(r.qty)}` : ''}</b><small>{r.source || 'Source non renseignée'} · {r.date === d.today ? r.time : day(r.date)}</small></div>
                    <div className="end"><b>{xof(r.amount)}</b>{r.status !== 'livree' && <span className={`tag ${r.status}`}>{STATUS[r.status]}</span>}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {d.lowStock.length > 0 && (
            <div className="card">
              <h3>Stock à surveiller</h3>
              {d.lowStock.map((p) => (
                <div key={p.id} className="alert"><span>{p.name}</span><b className={p.stock <= 0 ? 'neg' : ''}>{p.stock <= 0 ? 'Rupture' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}</b></div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Les 7 derniers jours</h3>
        <div className="scroll">
          <table>
            <thead><tr><th>Jour</th><th className="r">Ventes</th><th className="r">Articles</th><th className="r">Chiffre d’aff.</th><th className="r">Pub</th><th className="r">Charges</th><th className="r">Bénéfice net</th></tr></thead>
            <tbody>
              {lastDays.map((s) => (
                <tr key={s.date} className={s.date === d.today ? 'hl' : ''}>
                  <td className="cap">{weekday(s.date)} {day(s.date)}{s.date === d.today ? ' · aujourd’hui' : ''}</td>
                  <td className="r">{cnt(s.orders)}</td><td className="r">{cnt(s.units)}</td>
                  <td className="r">{xof(s.revenue)}</td><td className="r">{xof(s.ads)}</td><td className="r">{xof(s.expenses)}</td>
                  <td className={`r ${s.net < 0 ? 'neg' : 'pos'}`}><b>{xof(s.net)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
