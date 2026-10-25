"use client"
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { dt, day, pct, roi, xof } from '../../lib/format'

export const STATUS = { actif: 'Actif', pause: 'En pause', termine: 'Terminé', abandon: 'Abandon' }

const SORTS = {
  profit: ['Bénéfice (haut → bas)', (a, b) => b.profit - a.profit],
  revenue: ['Montant généré', (a, b) => b.revenue - a.revenue],
  spend: ['Dépenses pub', (a, b) => b.spend - a.spend],
  roi: ['Rentabilité (ROI)', (a, b) => (roi(b.profit, b.spend) ?? -1e9) - (roi(a.profit, a.spend) ?? -1e9)],
  recent: ['Plus récents', (a, b) => new Date(b.created_at) - new Date(a.created_at)],
  name: ['Nom (A → Z)', (a, b) => a.name.localeCompare(b.name)],
}

export default function StudentsList() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [st, setSt] = useState('tous')
  const [sort, setSort] = useState('profit')

  useEffect(() => { api('/api/admin/etudiants').then((d) => setRows(d.students)).catch((e) => setErr(e.message)) }, [])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (rows || [])
      .filter((r) => (st === 'tous' || r.status === st) &&
        (!s || [r.name, r.email, r.niche, r.product].some((v) => (v || '').toLowerCase().includes(s))))
      .sort(SORTS[sort][1])
  }, [rows, q, st, sort])

  const t = useMemo(() => {
    const all = rows || []
    const revenue = all.reduce((s, r) => s + r.revenue, 0)
    const spend = all.reduce((s, r) => s + r.spend, 0)
    return {
      n: all.length, active: all.filter((r) => r.status === 'actif').length, revenue, spend, profit: revenue - spend,
      roi: roi(revenue - spend, spend), calls: all.reduce((s, r) => s + r.upcoming, 0),
    }
  }, [rows])

  if (err) return <div className="err">{err}</div>
  if (!rows) return <p className="adm-mute">Chargement…</p>

  return (
    <>
      <div className="adm-kpis">
        <Kpi label="Étudiants" value={t.n} sub={`${t.active} actifs`} />
        <Kpi label="Total généré" value={xof(t.revenue)} />
        <Kpi label="Dépenses pub" value={xof(t.spend)} />
        <Kpi label="Bénéfice net" value={xof(t.profit)} tone={t.profit < 0 ? 'neg' : 'pos'} />
        <Kpi label="ROI global" value={t.roi === null ? '—' : `${t.roi} %`} tone={t.roi !== null && t.roi < 0 ? 'neg' : 'pos'} />
        <Kpi label="Calls à venir" value={t.calls} />
      </div>

      <div className="adm-bar">
        <input placeholder="Rechercher (nom, e-mail, niche, produit)…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
        </select>
      </div>

      <div className="glass adm-card adm-scroll">
        {list.length === 0 ? (
          <p className="adm-mute">{rows.length === 0 ? 'Aucun étudiant inscrit pour le moment.' : 'Aucun résultat.'}</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Étudiant</th><th>Statut</th><th className="r">Généré</th><th className="r">Pub</th>
                <th className="r">Bénéfice</th><th className="r">ROI</th><th className="r">Progression</th>
                <th>Prochain call</th><th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const rr = roi(r.profit, r.spend)
                const pr = pct(r.lessons_done, r.lessons_total)
                return (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/etudiants/${r.id}`} className="adm-name">{r.name}</Link>
                      <small>{r.email}{r.niche ? ` · ${r.niche}` : ''}</small>
                    </td>
                    <td><span className={`adm-pill ${r.status}`}>{STATUS[r.status]}</span></td>
                    <td className="r">{xof(r.revenue)}</td>
                    <td className="r">{xof(r.spend)}</td>
                    <td className={`r ${r.profit < 0 ? 'neg' : 'pos'}`}>{xof(r.profit)}</td>
                    <td className={`r ${rr !== null && rr < 0 ? 'neg' : ''}`}>{rr === null ? '—' : `${rr} %`}</td>
                    <td className="r">{pr === null ? '—' : `${pr} %`}</td>
                    <td>{r.next_call ? dt(r.next_call) : '—'}</td>
                    <td>{day(r.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export function Kpi({ label, value, sub, tone }) {
  return (
    <div className="glass adm-kpi">
      <span>{label}</span>
      <b className={tone || ''}>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}
