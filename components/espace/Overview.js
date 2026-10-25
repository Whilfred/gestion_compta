"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { day, dt, pct, roi, xof } from '../../lib/format'
import { useEspace } from './EspaceShell'

const n = (v) => xof(v).replace(' FCFA', '')
const monthName = (m, month) => new Date(m + '-01T12:00').toLocaleDateString('fr-FR', { month, year: month === 'long' ? 'numeric' : undefined })
const plural = (k, one, many) => `${k} ${k > 1 ? many : one}`

export default function Overview() {
  const { d, user } = useEspace()
  const { totals: t, profile: p, months, calls, progress: pg } = d
  const [on, setOn] = useState(false)
  useEffect(() => { const x = setTimeout(() => setOn(true), 60); return () => clearTimeout(x) }, [])

  const first = user.name.split(' ')[0]
  const empty = d.revenues.length + d.ads.length + d.expenses.length === 0
  const goalPct = pct(t.revenue, p.goal)
  const rr = roi(t.profit, t.ads)
  const per = (a, b) => (b > 0 ? a / b : null)

  const indicators = [
    ['Prix moyen par vente', per(t.revenue, t.units), (v) => xof(v)],
    ['Coût par vente (pub)', t.ads > 0 ? per(t.ads, t.units) : null, (v) => xof(v)],
    ['Coût par prospect', t.ads > 0 ? per(t.ads, t.leads) : null, (v) => xof(v)],
    ['Prospects devenus clients', per(t.units * 100, t.leads), (v) => `${v.toFixed(1).replace('.', ',')} %`],
    ['Marge nette', t.revenue > 0 ? (t.profit / t.revenue) * 100 : null, (v) => `${Math.round(v)} %`],
    ['Gain par FCFA de pub', per(t.revenue, t.ads), (v) => `${v.toFixed(2).replace('.', ',')} FCFA`],
  ]

  const last = months.slice(0, 6).reverse()
  const max = Math.max(1, ...last.flatMap((m) => [m.revenue, m.ads + m.expenses]))
  const h = (v) => (on ? `${Math.max((v / max) * 100, v > 0 ? 3 : 0)}%` : '0%')

  const now = new Date()
  const next = calls.filter((c) => c.status === 'prevu' && new Date(c.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0]

  const recent = [
    ...d.revenues.map((r) => ({ ...r, t: 'rev', tag: 'Vente', label: r.source || 'Vente', more: r.units ? plural(r.units, 'vendu', 'vendus') : '' })),
    ...d.ads.map((r) => ({ ...r, t: 'ads', tag: 'Pub', label: r.platform || 'Publicité', more: r.leads ? plural(r.leads, 'prospect', 'prospects') : '' })),
    ...d.expenses.map((r) => ({ ...r, t: 'exp', tag: 'Charge', label: r.label || 'Charge', more: '' })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 6)

  return (
    <>
      <div className="esp-title">
        <h2>Bonjour {first}</h2>
        <p className="esp-mute">Vos résultats, mis à jour à chaque saisie.</p>
      </div>

      {empty ? (
        <div className="glass esp-card esp-empty">
          <h3>Votre tableau de bord est vide pour l’instant</h3>
          <p className="esp-mute">Enregistrez vos ventes et vos dépenses : votre bénéfice net, votre rentabilité et vos graphiques se calculent tout seuls.</p>
          <div className="esp-actions">
            <Link className="btn btn-blue" href="/dashboard/ventes">Ajouter une vente</Link>
            <Link className="btn btn-glass" href="/dashboard/publicite">Ajouter une dépense pub</Link>
            <Link className="btn btn-glass" href="/dashboard/profil">Compléter mon profil</Link>
          </div>
        </div>
      ) : (
        <div className="glass esp-hero">
          <div className="esp-hero-top">
            <div>
              <span className="esp-label">Bénéfice net</span>
              <div className={`esp-net ${t.profit < 0 ? 'neg' : 'pos'}`}>{n(t.profit)}<small>FCFA</small></div>
              <p className="esp-mute">Chiffre d’affaires moins publicité et autres charges.</p>
            </div>
            {p.goal > 0 && (
              <div className="esp-hero-goal">
                <span className="esp-label">Objectif de chiffre d’affaires</span>
                <div className="esp-track lg"><i style={{ width: on ? `${Math.min(goalPct ?? 0, 100)}%` : 0 }} /></div>
                <small>{n(t.revenue)} sur {n(p.goal)} FCFA ({goalPct} %)</small>
              </div>
            )}
          </div>
          <div className="esp-metrics">
            <Metric dot="rev" label="Chiffre d’affaires" value={xof(t.revenue)} />
            <Metric dot="cost" label="Publicité" value={xof(t.ads)} />
            <Metric dot="cost2" label="Autres charges" value={xof(t.expenses)} />
            <Metric label="Livres vendus" value={t.units} sub={rr === null ? undefined : `ROI pub : ${rr} %`} />
          </div>
        </div>
      )}

      {months.length > 0 && (
        <div className="glass esp-card">
          <h3>Mois par mois</h3>
          <div className="esp-legend">
            <span><i className="rev" />Chiffre d’affaires</span>
            <span><i className="cost" />Dépenses (pub + charges)</span>
          </div>
          <div className="esp-chart">
            {last.map((m) => (
              <div key={m.month} className="esp-chart-col" title={`${monthName(m.month, 'long')} : ${xof(m.revenue)} de chiffre d’affaires, ${xof(m.ads + m.expenses)} de dépenses`}>
                <div className="esp-bars">
                  <i className="rev" style={{ height: h(m.revenue) }} />
                  <i className="cost" style={{ height: h(m.ads + m.expenses) }} />
                </div>
                <small>{monthName(m.month, 'short')}</small>
              </div>
            ))}
          </div>
          <div className="esp-scroll">
            <table className="esp-table">
              <thead><tr><th>Mois</th><th className="r">Chiffre d’affaires</th><th className="r">Pub</th><th className="r">Charges</th><th className="r">Bénéfice net</th><th className="r">Livres vendus</th></tr></thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.month}>
                    <td className="esp-cap">{monthName(m.month, 'long')}</td>
                    <td className="r">{xof(m.revenue)}</td><td className="r">{xof(m.ads)}</td><td className="r">{xof(m.expenses)}</td>
                    <td className={`r ${m.profit < 0 ? 'neg' : 'pos'}`}>{xof(m.profit)}</td>
                    <td className="r">{m.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="esp-grid2">
        <div className="glass esp-card">
          <h3>Indicateurs</h3>
          <dl className="esp-dl">
            {indicators.map(([label, v, fmt]) => (
              <div key={label}><dt>{label}</dt><dd>{v === null ? '—' : fmt(v)}</dd></div>
            ))}
            <div><dt>Prospects générés</dt><dd>{t.leads || '—'}</dd></div>
          </dl>
        </div>

        <div className="esp-col">
          <div className="glass esp-card">
            <h3>Prochain call</h3>
            {next ? (
              <>
                <b>{dt(next.scheduled_at)} · {next.duration} min</b>
                <p className="esp-mute">{next.topic || 'Call de suivi'}</p>
                {/^https?:\/\//.test(next.meeting_url || '') && <a className="esp-link" href={next.meeting_url} target="_blank" rel="noreferrer">Rejoindre la réunion</a>}
              </>
            ) : <p className="esp-mute">Aucun call programmé. Votre coach en planifiera un avec vous.</p>}
            <Link className="esp-link" href="/dashboard/calls">Voir mon calendrier</Link>
          </div>
          {pg.total > 0 && (
            <div className="glass esp-card">
              <h3>Formation</h3>
              <div className="esp-track lg"><i style={{ width: on ? `${pct(pg.done, pg.total)}%` : 0 }} /></div>
              <small>{pg.done} leçons terminées sur {pg.total} ({pct(pg.done, pg.total)} %)</small>
            </div>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="glass esp-card">
          <h3>Dernières saisies</h3>
          <ul className="esp-list">
            {recent.map((r) => (
              <li key={`${r.t}${r.id}`} className="esp-row">
                <div>
                  <b className={r.t === 'rev' ? 'pos' : ''}>{r.t === 'rev' ? '+' : '−'} {xof(r.amount)}</b>
                  <small>{r.label}{r.more ? ` · ${r.more}` : ''} · {day(r.date)}</small>
                </div>
                <span className={`esp-tag ${r.t}`}>{r.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function Metric({ label, value, sub, dot }) {
  return (
    <div className="esp-metric">
      <span>{dot && <i className={dot} />}{label}</span>
      <b>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}
