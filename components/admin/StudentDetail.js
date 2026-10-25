"use client"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { day, pct, roi, xof } from '../../lib/format'
import Calendar, { CallItem, key } from './Calendar'
import { Kpi, STATUS } from './StudentsList'

export default function StudentDetail() {
  const { id } = useParams()
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [month, setMonth] = useState(() => new Date())
  const [sel, setSel] = useState(() => key(new Date()))

  const load = useCallback(() => api(`/api/admin/etudiants/${id}`).then(setD).catch((e) => setErr(e.message)), [id])
  useEffect(() => { load() }, [load])

  const run = async (fn) => { setErr(''); setOk(''); try { await fn(); await load() } catch (e) { setErr(e.message) } }
  const add = (kind, e) => {
    e.preventDefault()
    const f = e.currentTarget
    const b = Object.fromEntries(new FormData(f))
    if (kind === 'calls') b.scheduled_at = new Date(b.scheduled_at).toISOString()
    run(async () => { await api(`/api/admin/etudiants/${id}/${kind}`, 'POST', b); f.reset() })
  }
  const del = (kind, rid) => confirm('Supprimer cette ligne ?') && run(() => api(`/api/admin/etudiants/${id}/${kind}?id=${rid}`, 'DELETE'))
  const setStatus = (c, status) => run(() => api(`/api/admin/etudiants/${id}/calls`, 'PATCH', { id: c.id, status }))
  const saveProfile = (e) => {
    e.preventDefault()
    const b = Object.fromEntries(new FormData(e.currentTarget))
    run(async () => { await api(`/api/admin/etudiants/${id}`, 'PUT', b); setOk('Profil enregistré.') })
  }

  if (err && !d) return <div className="err">{err}</div>
  if (!d) return <p className="adm-mute">Chargement…</p>

  const { student: s, profile: p, totals: t, progress: pg } = d
  const rr = roi(t.profit, t.spend)
  const goalPct = pct(t.revenue, p.goal)
  const calls = d.calls
  const dayCalls = calls.filter((c) => key(c.scheduled_at) === sel)
  const done = calls.filter((c) => c.status === 'fait').length
  const upcoming = calls.filter((c) => c.status === 'prevu' && new Date(c.scheduled_at) >= new Date()).length

  return (
    <>
      <Link href="/admin" className="adm-back">← Tous les étudiants</Link>
      <div className="adm-title">
        <div>
          <h2>{s.name}</h2>
          <p className="adm-mute">{s.email}{s.phone ? ` · ${s.phone}` : ''} · inscrit le {day(s.created_at)}</p>
        </div>
        <span className={`adm-pill ${p.status}`}>{STATUS[p.status]}</span>
      </div>
      {err && <div className="err">{err}</div>}
      {ok && <div className="adm-ok">{ok}</div>}

      <div className="adm-kpis">
        <Kpi label="Total généré" value={xof(t.revenue)} sub={goalPct === null ? 'Pas d’objectif défini' : `${goalPct} % de l’objectif`} />
        <Kpi label="Dépenses pub" value={xof(t.spend)} />
        <Kpi label="Bénéfice net" value={xof(t.profit)} tone={t.profit < 0 ? 'neg' : 'pos'} />
        <Kpi label="ROI" value={rr === null ? '—' : `${rr} %`} tone={rr !== null && rr < 0 ? 'neg' : 'pos'} sub={t.spend > 0 ? `${(t.revenue / t.spend).toFixed(2)} FCFA gagnés / FCFA pub` : undefined} />
        <Kpi label="Calls" value={`${done} fait${done > 1 ? 's' : ''}`} sub={`${upcoming} à venir`} />
        <Kpi label="Progression" value={pg.total > 0 ? `${pct(pg.done, pg.total)} %` : '—'} sub={`${pg.done} / ${pg.total} leçons`} />
      </div>

      <div className="adm-grid2">
        <form className="glass adm-card adm-form" onSubmit={saveProfile}>
          <h3>Profil de l’étudiant</h3>
          <input name="niche" placeholder="Niche (ex. cosmétique, coaching…)" defaultValue={p.niche || ''} />
          <input name="product" placeholder="Produit / offre" defaultValue={p.product || ''} />
          <input name="goal" type="number" min="0" placeholder="Objectif de revenus (FCFA)" defaultValue={p.goal || ''} />
          <select name="status" defaultValue={p.status}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <textarea name="notes" placeholder="Notes de suivi (blocages, points à travailler…)" defaultValue={p.notes || ''} />
          <button className="btn btn-blue" type="submit">Enregistrer</button>
        </form>

        <div className="glass adm-card">
          <h3>Rentabilité par mois</h3>
          {d.months.length === 0 ? <p className="adm-mute">Aucune donnée pour le moment.</p> : (
            <table className="adm-table">
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
              <h3 style={{ marginTop: 22 }}>Formations suivies</h3>
              <ul className="adm-list">
                {d.enrollments.map((e, i) => <li key={i} className="adm-row"><span>{e.title}</span><small>{e.status} · {day(e.enrolled_at)}</small></li>)}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="adm-grid2">
        <div className="adm-col">
          <form className="glass adm-card adm-form" onSubmit={(e) => add('revenus', e)}>
            <h3>Ajouter un revenu</h3>
            <input name="amount_xof" type="number" min="1" placeholder="Montant (FCFA)" required />
            <input name="source" placeholder="Source (vente ebook, formation, client…)" />
            <input name="earned_on" type="date" defaultValue={key(new Date())} />
            <input name="note" placeholder="Note (facultatif)" />
            <button className="btn btn-blue" type="submit">Ajouter</button>
          </form>
          <div className="glass adm-card">
            <h3>Revenus ({d.revenues.length})</h3>
            <Rows rows={d.revenues} label={(r) => r.source || 'Revenu'} onDel={(r) => del('revenus', r.id)} />
          </div>
        </div>
        <div className="adm-col">
          <form className="glass adm-card adm-form" onSubmit={(e) => add('depenses', e)}>
            <h3>Ajouter une dépense pub</h3>
            <input name="amount_xof" type="number" min="1" placeholder="Montant (FCFA)" required />
            <select name="platform" defaultValue="Facebook / Instagram">
              {['Facebook / Instagram', 'TikTok', 'Google', 'YouTube', 'WhatsApp', 'Autre'].map((x) => <option key={x}>{x}</option>)}
            </select>
            <input name="spent_on" type="date" defaultValue={key(new Date())} />
            <input name="note" placeholder="Note (campagne, objectif…)" />
            <button className="btn btn-blue" type="submit">Ajouter</button>
          </form>
          <div className="glass adm-card">
            <h3>Dépenses pub ({d.spends.length})</h3>
            <Rows rows={d.spends} label={(r) => r.platform || 'Pub'} onDel={(r) => del('depenses', r.id)} />
          </div>
        </div>
      </div>

      <h3 className="adm-h">Calendrier des calls</h3>
      <div className="adm-grid2">
        <Calendar calls={calls} month={month} onMonth={setMonth} selected={sel} onSelect={setSel} />
        <div className="adm-col">
          <div className="glass adm-card">
            <h3>{new Date(sel + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            {dayCalls.length === 0 ? <p className="adm-mute">Aucun call ce jour-là.</p> : (
              <ul className="adm-list">{dayCalls.map((c) => <CallItem key={c.id} c={c} onStatus={setStatus} onDelete={(x) => del('calls', x.id)} />)}</ul>
            )}
          </div>
          <form className="glass adm-card adm-form" onSubmit={(e) => add('calls', e)}>
            <h3>Programmer un call</h3>
            <input name="scheduled_at" type="datetime-local" required defaultValue={`${sel}T10:00`} key={sel} />
            <input name="duration_minutes" type="number" min="5" max="600" defaultValue="30" placeholder="Durée (min)" />
            <input name="topic" placeholder="Sujet du call" />
            <input name="meeting_url" placeholder="Lien Meet / Zoom / WhatsApp" />
            <button className="btn btn-blue" type="submit">Programmer</button>
          </form>
        </div>
      </div>
    </>
  )
}

function Rows({ rows, label, onDel }) {
  if (rows.length === 0) return <p className="adm-mute">Rien pour le moment.</p>
  return (
    <ul className="adm-list">
      {rows.map((r) => (
        <li key={r.id} className="adm-row">
          <div><b>{xof(r.amount)}</b><small>{label(r)} · {day(r.date)}{r.note ? ` · ${r.note}` : ''}</small></div>
          <button className="adm-x" onClick={() => onDel(r)} aria-label="Supprimer">✕</button>
        </li>
      ))}
    </ul>
  )
}
