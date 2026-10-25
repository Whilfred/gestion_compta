"use client"
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import { day, pct, roi, xof } from '../../lib/format'
import Calendar, { CallItem, key } from './Calendar'

const STATUS = { actif: 'Actif', pause: 'En pause', termine: 'Terminé', abandon: 'Abandon' }

export default function MonEspace() {
  const router = useRouter()
  const { ready, user } = useAuth()
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [month, setMonth] = useState(() => new Date())
  const [sel, setSel] = useState(() => key(new Date()))

  const load = useCallback(() => api('/api/moi').then(setD).catch((e) => setErr(e.message)), [])
  useEffect(() => { if (ready && !user) router.replace('/connexion') }, [ready, user, router])
  useEffect(() => { if (ready && user) load() }, [ready, user, load])

  const saveProfile = (e) => {
    e.preventDefault()
    setErr(''); setOk('')
    const b = Object.fromEntries(new FormData(e.currentTarget))
    api('/api/moi', 'PUT', b).then(() => { setOk('Profil enregistré.'); load() }).catch((x) => setErr(x.message))
  }

  if (!ready || !user) return null
  if (err && !d) return <section className="esp"><div className="err">{err}</div></section>
  if (!d) return <section className="esp"><p className="esp-mute">Chargement…</p></section>

  const { profile: p, totals: t, progress: pg } = d
  const first = user.name.split(' ')[0]
  const rr = roi(t.profit, t.spend)
  const goalPct = pct(t.revenue, p.goal)
  const calls = d.calls
  const dayCalls = calls.filter((c) => key(c.scheduled_at) === sel)
  const done = calls.filter((c) => c.status === 'fait').length
  const upcoming = calls.filter((c) => c.status === 'prevu' && new Date(c.scheduled_at) >= new Date()).length
  const nextCall = calls.filter((c) => c.status === 'prevu' && new Date(c.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0]

  return (
    <section className="esp">
      <div className="esp-title">
        <div>
          <h2>Bonjour {first}, bienvenue dans votre espace</h2>
          <p className="esp-mute">Vos revenus, vos dépenses pub, votre rentabilité et vos calls, à jour en temps réel.</p>
        </div>
        <span className={`esp-pill ${p.status}`}>{STATUS[p.status]}</span>
      </div>
      {err && <div className="err">{err}</div>}
      {ok && <div className="esp-ok">{ok}</div>}

      <div className="esp-kpis">
        <Kpi label="Total généré" value={xof(t.revenue)} sub={goalPct === null ? 'Définissez votre objectif' : `${goalPct} % de l’objectif`} />
        <Kpi label="Dépenses pub" value={xof(t.spend)} />
        <Kpi label="Bénéfice net" value={xof(t.profit)} tone={t.profit < 0 ? 'neg' : 'pos'} />
        <Kpi label="ROI" value={rr === null ? '—' : `${rr} %`} tone={rr !== null && rr < 0 ? 'neg' : 'pos'} sub={t.spend > 0 ? `${(t.revenue / t.spend).toFixed(2)} FCFA gagnés / FCFA pub` : undefined} />
        <Kpi label="Calls" value={`${done} fait${done > 1 ? 's' : ''}`} sub={`${upcoming} à venir`} />
        <Kpi label="Progression" value={pg.total > 0 ? `${pct(pg.done, pg.total)} %` : '—'} sub={`${pg.done} / ${pg.total} leçons`} />
      </div>

      <div className="esp-grid2">
        <form className="glass esp-card esp-form" onSubmit={saveProfile}>
          <h3>Mon profil</h3>
          <input name="niche" placeholder="Niche (ex. cosmétique, coaching…)" defaultValue={p.niche || ''} />
          <input name="product" placeholder="Produit / offre" defaultValue={p.product || ''} />
          <input name="goal" type="number" min="0" placeholder="Mon objectif de revenus (FCFA)" defaultValue={p.goal || ''} />
          <button className="btn btn-blue" type="submit">Enregistrer</button>
          {p.notes && (
            <div>
              <h3 style={{ marginTop: 6 }}>Notes de mon coach</h3>
              <p className="esp-mute" style={{ whiteSpace: 'pre-wrap' }}>{p.notes}</p>
            </div>
          )}
        </form>

        <div className="glass esp-card">
          <h3>Ma rentabilité par mois</h3>
          {d.months.length === 0 ? <p className="esp-mute">Aucune donnée pour le moment.</p> : (
            <table className="esp-table">
              <thead><tr><th>Mois</th><th className="r">Généré</th><th className="r">Pub</th><th className="r">Bénéfice</th><th className="r">ROI</th></tr></thead>
              <tbody>
                {d.months.map((m) => {
                  const r = roi(m.profit, m.spend)
                  return (
                    <tr key={m.month}>
                      <td>{new Date(m.month + '-01T12:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</td>
                      <td className="r">{xof(m.revenue)}</td><td className="r">{xof(m.spend)}</td>
                      <td className={`r ${m.profit < 0 ? 'neg' : 'pos'}`}>{xof(m.profit)}</td>
                      <td className="r">{r === null ? '—' : `${r} %`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {d.enrollments.length > 0 && (
            <>
              <h3 style={{ marginTop: 22 }}>Mes formations</h3>
              <ul className="esp-list">
                {d.enrollments.map((e, i) => <li key={i} className="esp-row"><span>{e.title}</span><small>{e.status} · {day(e.enrolled_at)}</small></li>)}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="esp-grid2">
        <div className="glass esp-card">
          <h3>Mes revenus ({d.revenues.length})</h3>
          <Rows rows={d.revenues} label={(r) => r.source || 'Revenu'} empty="Aucun revenu enregistré pour le moment." />
        </div>
        <div className="glass esp-card">
          <h3>Mes dépenses pub ({d.spends.length})</h3>
          <Rows rows={d.spends} label={(r) => r.platform || 'Pub'} empty="Aucune dépense pub enregistrée pour le moment." />
        </div>
      </div>

      <h3 className="esp-h">Mon calendrier de calls</h3>
      <div className="esp-grid2">
        <Calendar calls={calls} month={month} onMonth={setMonth} selected={sel} onSelect={setSel} />
        <div className="esp-col">
          <div className="glass esp-card">
            <h3>{new Date(sel + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            {dayCalls.length === 0 ? <p className="esp-mute">Aucun call ce jour-là.</p> : (
              <ul className="esp-list">{dayCalls.map((c) => <CallItem key={c.id} c={c} />)}</ul>
            )}
          </div>
          <div className="glass esp-card">
            <h3>Prochain call</h3>
            {nextCall ? (
              <ul className="esp-list"><CallItem c={nextCall} /></ul>
            ) : <p className="esp-mute">Aucun call programmé pour le moment. Votre coach vous contactera pour en planifier un.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

function Kpi({ label, value, sub, tone }) {
  return (
    <div className="glass esp-kpi">
      <span>{label}</span>
      <b className={tone || ''}>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}

function Rows({ rows, label, empty }) {
  if (rows.length === 0) return <p className="esp-mute">{empty}</p>
  return (
    <ul className="esp-list">
      {rows.map((r) => (
        <li key={r.id} className="esp-row">
          <div><b>{xof(r.amount)}</b><small>{label(r)} · {day(r.date)}{r.note ? ` · ${r.note}` : ''}</small></div>
        </li>
      ))}
    </ul>
  )
}
