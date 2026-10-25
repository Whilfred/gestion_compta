"use client"
import { useState } from 'react'
import { api } from '../../lib/api'
import { day, xof } from '../../lib/format'
import { key } from './Calendar'
import { useEspace } from './EspaceShell'

const PLATFORMS = ['Facebook / Instagram', 'TikTok', 'Google', 'YouTube', 'WhatsApp', 'Autre']
const many = (k, one, more) => (k ? `${k} ${k > 1 ? more : one}` : '')

// Une page de saisie = une configuration. Les pages du dashboard passent seulement `name`.
const LEDGERS = {
  ventes: {
    kind: 'revenus', rows: 'revenues', title: 'Mes ventes',
    intro: 'Notez chaque vente ou chaque encaissement. Le chiffre d’affaires et le nombre de livres vendus alimentent votre tableau de bord.',
    form: 'Ajouter une vente', submit: 'Enregistrer la vente', added: 'Vente enregistrée.',
    empty: 'Aucune vente pour le moment. Ajoutez votre première vente ci-dessus.',
    total: (t) => ({ label: 'Chiffre d’affaires', value: xof(t.revenue), sub: `${t.units} livre${t.units > 1 ? 's' : ''} / produit${t.units > 1 ? 's' : ''} vendu${t.units > 1 ? 's' : ''}` }),
    fields: [
      { name: 'amount_xof', label: 'Montant encaissé (FCFA)', type: 'number', placeholder: 'Ex. 15000', required: true, min: 1 },
      { name: 'units', label: 'Livres ou produits vendus', type: 'number', placeholder: 'Ex. 3', min: 0 },
      { name: 'source', label: 'Produit ou source', placeholder: 'Ebook, coaching…' },
      { name: 'date', label: 'Date', type: 'date', today: true },
      { name: 'note', label: 'Note (facultatif)' },
    ],
    label: (r) => r.source || 'Vente', more: (r) => many(r.units, 'vendu', 'vendus'),
  },
  publicite: {
    kind: 'depenses', rows: 'ads', title: 'Ma publicité',
    intro: 'Notez ce que vous dépensez en publicité et les prospects obtenus. On en déduit votre coût par prospect et par vente.',
    form: 'Ajouter une dépense pub', submit: 'Enregistrer la dépense', added: 'Dépense enregistrée.',
    empty: 'Aucune dépense pub pour le moment.',
    total: (t) => ({ label: 'Dépenses publicitaires', value: xof(t.ads), sub: `${t.leads} prospect${t.leads > 1 ? 's' : ''} généré${t.leads > 1 ? 's' : ''}` }),
    fields: [
      { name: 'amount_xof', label: 'Montant dépensé (FCFA)', type: 'number', placeholder: 'Ex. 10000', required: true, min: 1 },
      { name: 'platform', label: 'Plateforme', select: PLATFORMS },
      { name: 'leads', label: 'Prospects obtenus (facultatif)', type: 'number', placeholder: 'Ex. 40', min: 0 },
      { name: 'date', label: 'Date', type: 'date', today: true },
      { name: 'note', label: 'Campagne (facultatif)' },
    ],
    label: (r) => r.platform || 'Publicité', more: (r) => many(r.leads, 'prospect', 'prospects'),
  },
  charges: {
    kind: 'charges', rows: 'expenses', title: 'Mes autres charges',
    intro: 'Outils, design, frais de paiement, production… tout ce qui n’est pas de la publicité mais réduit votre bénéfice.',
    form: 'Ajouter une charge', submit: 'Enregistrer la charge', added: 'Charge enregistrée.',
    empty: 'Aucune charge pour le moment.',
    total: (t) => ({ label: 'Autres charges', value: xof(t.expenses) }),
    fields: [
      { name: 'amount_xof', label: 'Montant (FCFA)', type: 'number', placeholder: 'Ex. 5000', required: true, min: 1 },
      { name: 'label', label: 'Libellé', placeholder: 'Outil, design, frais de paiement…' },
      { name: 'date', label: 'Date', type: 'date', today: true },
      { name: 'note', label: 'Note (facultatif)' },
    ],
    label: (r) => r.label || 'Charge', more: () => '',
  },
}

export default function Ledger({ name }) {
  const c = LEDGERS[name]
  const { d, load } = useEspace()
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)
  const today = key(new Date())
  const rows = d[c.rows]
  const total = c.total(d.totals)

  const submit = async (e) => {
    e.preventDefault()
    const f = e.currentTarget
    setErr(''); setOk(''); setBusy(true)
    try {
      await api(`/api/moi/${c.kind}`, 'POST', Object.fromEntries(new FormData(f)))
      f.reset()
      setOk(c.added)
      await load()
    } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  const del = async (r) => {
    if (!confirm('Supprimer cette ligne ?')) return
    setErr(''); setOk('')
    try { await api(`/api/moi/${c.kind}?id=${r.id}`, 'DELETE'); await load() } catch (x) { setErr(x.message) }
  }

  return (
    <>
      <div className="esp-title">
        <div>
          <h2>{c.title}</h2>
          <p className="esp-mute esp-intro">{c.intro}</p>
        </div>
        <div className="esp-total">
          <span className="esp-label">{total.label}</span>
          <b>{total.value}</b>
          {total.sub && <small>{total.sub}</small>}
        </div>
      </div>

      <form className="glass esp-card esp-form" onSubmit={submit}>
        <h3>{c.form}</h3>
        <div className="esp-fields">
          {c.fields.map((f) => (
            <label key={f.name}>{f.label}
              {f.select ? (
                <select name={f.name} defaultValue={f.select[0]}>
                  {f.select.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input name={f.name} type={f.type || 'text'} placeholder={f.placeholder} required={f.required}
                  min={f.min} inputMode={f.type === 'number' ? 'numeric' : undefined} step={f.type === 'number' ? 1 : undefined}
                  defaultValue={f.today ? today : undefined} max={f.today ? today : undefined} />
              )}
            </label>
          ))}
        </div>
        {err && <div className="err">{err}</div>}
        {ok && <div className="esp-ok" role="status">{ok}</div>}
        <button className="btn btn-blue" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : c.submit}</button>
      </form>

      <div className="glass esp-card">
        <h3>Historique ({rows.length})</h3>
        {rows.length === 0 ? <p className="esp-mute">{c.empty}</p> : (
          <ul className="esp-list tall">
            {rows.map((r) => (
              <li key={r.id} className="esp-row">
                <div>
                  <b>{xof(r.amount)}</b>
                  <small>{[c.label(r), c.more(r), day(r.date), r.note].filter(Boolean).join(' · ')}</small>
                </div>
                <button className="esp-x" onClick={() => del(r)} aria-label="Supprimer cette ligne">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
