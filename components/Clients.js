"use client"
import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { PERIODS, STATUS } from '../lib/constants'
import { day } from '../lib/format'
import { useFmt } from '../lib/privacy'

const FILTERS = [...PERIODS, ['all', 'Tout']]
const KINDS = { all: 'Tous les clients', recurrent: 'Clients récurrents (2 achats ou +)', new: 'Nouveaux clients (1 achat)' }

export default function Clients() {
  const { xof, cnt, hidden } = useFmt()
  const [d, setD] = useState(null)
  const [products, setProducts] = useState([])
  const [err, setErr] = useState('')
  const [period, setPeriod] = useState('all')
  const [range, setRange] = useState({ from: '', to: '' })
  const [kind, setKind] = useState('all')
  const [status, setStatus] = useState('')
  const [product, setProduct] = useState('')
  const [q, setQ] = useState('')
  const maxDay = new Date().toLocaleDateString('en-CA')

  const load = useCallback(() => {
    const p = new URLSearchParams({ filter: kind })
    if (period === 'custom') { if (!range.from || !range.to) return; p.set('from', range.from); p.set('to', range.to) } else p.set('period', period)
    if (status) p.set('status', status)
    if (product) p.set('product_id', product)
    if (q.trim()) p.set('q', q.trim())
    api(`/api/clients?${p}`).then((x) => { setErr(''); setD(x) }).catch((e) => setErr(e.message))
  }, [period, range, kind, status, product, q])
  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t) }, [load, q])
  useEffect(() => { api('/api/data/produits?lite=1').then((x) => setProducts(x.rows)).catch(() => {}) }, [])

  // Export CSV (ouvre dans Excel) : nom, téléphone, commandes, total, dernière commande
  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [['Nom', 'Téléphone', 'Commandes', 'Articles', 'Total FCFA', 'Première commande', 'Dernière commande', 'Récurrent'].map(esc).join(';')]
    for (const c of d.rows) lines.push([c.name, c.phone, c.orders, c.units, c.total, c.first_date, c.last_date, c.recurrent ? 'oui' : 'non'].map(esc).join(';'))
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
    a.download = 'clients.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <div className="title"><div><h2>Clients</h2><p style={{ textTransform: 'none' }}>Numéros de téléphone, clients récurrents et historique d’achats.</p></div>
        {d && d.rows.length > 0 && <button className="btn btn-line btn-sm" onClick={exportCsv}>Exporter en CSV</button>}
      </div>

      {err && <div className="err">{err}</div>}

      {d && (
        <div className="kpis">
          <div className="kpi"><span>Clients</span><b>{cnt(d.summary.clients)}</b></div>
          <div className="kpi"><span>Clients récurrents</span><b>{cnt(d.summary.recurrent)}</b><small>{d.summary.clients > 0 && !hidden ? `${Math.round((d.summary.recurrent / d.summary.clients) * 100)} % des clients` : ''}</small></div>
          <div className="kpi"><span>Chiffre d’affaires clients</span><b>{xof(d.summary.revenue)}</b></div>
        </div>
      )}

      <div className="card">
        <div className="filters">
          <div className="seg" role="tablist" aria-label="Période">
            {FILTERS.map(([k, name]) => <button key={k} role="tab" aria-selected={period === k} onClick={() => setPeriod(k)}>{name}</button>)}
            <button role="tab" aria-selected={period === 'custom'} onClick={() => setPeriod('custom')}>Dates…</button>
          </div>
          {period === 'custom' && (
            <div className="dates">
              <input type="date" max={maxDay} value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} aria-label="Du" />
              <span className="mute">au</span>
              <input type="date" max={maxDay} value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} aria-label="Au" />
            </div>
          )}
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type de client">{Object.entries(KINDS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Livraison"><option value="">Toutes les livraisons</option>{Object.entries(STATUS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
          <select value={product} onChange={(e) => setProduct(e.target.value)} aria-label="Produit acheté"><option value="">Tous les produits</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou numéro…" aria-label="Rechercher" />
        </div>

        {!d ? <p className="mute">Chargement…</p> : d.rows.length === 0 ? (
          <p className="empty">Aucun client pour ces filtres. Renseignez le téléphone du client quand vous enregistrez une vente.</p>
        ) : (
          <div className="scroll">
            <table>
              <thead><tr><th>Client</th><th>Téléphone</th><th className="r">Commandes</th><th className="r">Total acheté</th><th>Dernier achat</th><th>Produits</th><th>Livraisons</th></tr></thead>
              <tbody>
                {d.rows.map((c) => (
                  <tr key={c.k}>
                    <td className="wrap"><b>{c.name || '—'}</b> {c.recurrent && <span className="tag livree">Récurrent</span>}</td>
                    <td>{c.phone ? <a href={`tel:${c.phone.replace(/\s/g, '')}`} style={{ color: 'var(--blue)' }}>{c.phone}</a> : '—'}</td>
                    <td className="r">{cnt(c.orders)}</td>
                    <td className="r">{xof(c.total)}</td>
                    <td>{day(c.last_date)}</td>
                    <td className="wrap mute">{(c.products || []).join(', ')}</td>
                    <td className="mute">{cnt(c.delivered)} livrée{c.delivered > 1 ? 's' : ''}{c.ongoing > 0 ? ` · ${cnt(c.ongoing)} en cours` : ''}{c.failed > 0 ? ` · ${cnt(c.failed)} échec${c.failed > 1 ? 's' : ''}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
