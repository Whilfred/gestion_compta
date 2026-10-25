"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { CANCELED, CATEGORIES, PERIODS, PLATFORMS, SOURCES, STATUS, can } from '../lib/constants'
import { day } from '../lib/format'
import { useFmt } from '../lib/privacy'

const TITLES = {
  ventes: ['Ventes', 'Enregistrez chaque vente : produit, quantité, prix, client et état de la livraison.'],
  produits: ['Produits', 'Catalogue, stock, et bénéfice net de chaque produit (pub et charges comprises).'],
  publicite: ['Publicité', 'L’argent dépensé en pub : pour un produit précis, ou pour toute la boutique.'],
  charges: ['Autres charges', 'Déplacement, livraison, emballage, loyer… liées à un produit ou indépendantes.'],
}
const FILTERS = [...PERIODS, ['all', 'Tout']]
const todayLocal = () => new Date().toLocaleDateString('en-CA')
const PRODUCT_FILTERS = { all: 'Tous', actif: 'Actifs', archive: 'Archivés', bas: 'Stock bas / rupture' }

function Field({ label, wide, children }) {
  return <label className={`field${wide ? ' wide' : ''}`}><span>{label}</span>{children}</label>
}

// Valeurs du formulaire quand on modifie une ligne existante
const toForm = (kind, r) => {
  if (kind === 'ventes') return { product_id: r.product_id ? String(r.product_id) : '', product: r.product, qty: r.qty, price: r.price, cost: r.cost, source: r.source || '', customer: r.customer || '', phone: r.phone || '', payment: r.payment || '', status: r.status, date: r.date, note: r.note || '' }
  if (kind === 'produits') return { name: r.name, sku: r.sku || '', cost: r.cost, price: r.price, stock: r.stock }
  if (kind === 'publicite') return { platform: r.platform || '', amount: r.amount, leads: r.leads || '', date: r.date, note: r.note || '', product_id: r.product_id ? String(r.product_id) : '' }
  return { category: r.category || '', label: r.label || '', amount: r.amount, date: r.date, note: r.note || '', product_id: r.product_id ? String(r.product_id) : '' }
}

export default function Entries({ kind }) {
  const { user } = useAuth()
  const { xof, num, cnt } = useFmt()
  const canEdit = can(user?.perms, kind, 'edit')
  const canDel = canEdit && user?.perms?.delete === true
  const payments = user?.settings?.paymentMethods || []

  const [rows, setRows] = useState(null)
  const [products, setProducts] = useState([])
  const [period, setPeriod] = useState(kind === 'produits' ? 'all' : '7d')
  const [range, setRange] = useState({ from: '', to: '' })
  const [fStatus, setFStatus] = useState('')
  const [fProduct, setFProduct] = useState('')
  const [fText, setFText] = useState('')
  const [fStock, setFStock] = useState('all')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)
  const [v, setV] = useState({})
  const [editing, setEditing] = useState(null)
  const [formKey, setFormKey] = useState(0)

  const load = useCallback(() => {
    if (kind === 'produits') { api('/api/data/produits').then((x) => setRows(x.rows)).catch((e) => setErr(e.message)); return }
    const p = new URLSearchParams()
    if (period === 'custom') { if (!range.from || !range.to) return; p.set('from', range.from); p.set('to', range.to) } else p.set('period', period)
    if (fStatus) p.set('status', fStatus)
    if (fProduct) p.set('product_id', fProduct)
    if (fText.trim()) p.set('q', fText.trim())
    api(`/api/data/${kind}?${p}`).then((x) => { setErr(''); setRows(x.rows) }).catch((e) => setErr(e.message))
  }, [kind, period, range, fStatus, fProduct, fText])
  useEffect(() => { const t = setTimeout(load, fText ? 300 : 0); return () => clearTimeout(t) }, [load, fText])

  const loadProducts = useCallback(() => {
    if (kind !== 'produits') api('/api/data/produits?lite=1').then((x) => setProducts(x.rows.filter((p) => p.active))).catch(() => {})
  }, [kind])
  useEffect(() => { loadProducts() }, [loadProducts])

  const set = (name) => (e) => setV((s) => ({ ...s, [name]: e.target.value }))
  const picked = useMemo(() => products.find((p) => String(p.id) === String(v.product_id)), [products, v.product_id])
  const status = v.status || 'livree'
  const overStock = !editing && kind === 'ventes' && picked && !CANCELED.includes(status) && Number(v.qty ?? 1) > picked.stock

  const pickProduct = (e) => {
    const p = products.find((x) => String(x.id) === e.target.value)
    setV((s) => ({ ...s, product_id: e.target.value, price: p ? String(p.price || '') : s.price }))
  }

  const reset = () => { setV({}); setEditing(null); setFormKey((k) => k + 1) }
  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setOk(''); setBusy(true)
    try {
      if (editing) await api(`/api/data/${kind}?id=${editing}`, 'PATCH', v)
      else await api(`/api/data/${kind}`, 'POST', v)
      setOk(editing ? 'Modification enregistrée.' : 'Enregistré.')
      reset(); load(); loadProducts()
      window.dispatchEvent(new Event('ec-alerts'))
    } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  const startEdit = (r) => { setErr(''); setOk(''); setEditing(r.id); setV(toForm(kind, r)); setFormKey((k) => k + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const act = async (fn) => { setErr(''); setOk(''); try { await fn(); load(); loadProducts() } catch (x) { setErr(x.message) } }
  const remove = (id, what) => { if (window.confirm(`Supprimer ${what} ?`)) act(() => api(`/api/data/${kind}?id=${id}`, 'DELETE')) }
  const patch = (id, body) => act(() => api(`/api/data/${kind}?id=${id}`, 'PATCH', body))

  const [title, sub] = TITLES[kind]
  const max = todayLocal()
  const shown = useMemo(() => {
    if (!rows || kind !== 'produits') return rows
    const q = fText.trim().toLowerCase()
    return rows.filter((p) => (!q || p.name.toLowerCase().includes(q)) &&
      (fStock === 'all' || (fStock === 'actif' && p.active) || (fStock === 'archive' && !p.active) || (fStock === 'bas' && p.active && p.stock <= p.threshold)))
  }, [rows, kind, fText, fStock])
  const total = rows && kind !== 'produits' ? rows.filter((r) => !CANCELED.includes(r.status)).reduce((a, r) => a + r.amount, 0) : 0
  const productSelect = (label, free) => (
    <Field label={label} wide>
      <select value={v.product_id || ''} onChange={set('product_id')}>
        <option value="">{free}</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </Field>
  )

  return (
    <>
      <div className="title"><div><h2>{title}</h2><p style={{ textTransform: 'none' }}>{sub}</p></div></div>

      {canEdit && (
        <form className="card form" onSubmit={submit} key={formKey}>
          {editing && <div className="full okmsg" style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>Vous modifiez une ligne existante.<button type="button" className="btn btn-line btn-sm" onClick={reset}>Annuler</button></div>}

          {kind === 'ventes' && (
            <>
              <Field label="Produit" wide>
                <select value={v.product_id || ''} onChange={pickProduct}>
                  <option value="">— Autre produit (saisie libre, sans stock) —</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.stock <= 0 ? ' (rupture)' : ` · stock ${p.stock}`}</option>)}
                </select>
              </Field>
              {!v.product_id && <Field label="Nom du produit" wide><input value={v.product || ''} onChange={set('product')} placeholder="Ex. Robe wax taille M" required maxLength={150} /></Field>}
              <Field label="Quantité"><input type="number" min="1" step="1" value={v.qty ?? 1} onChange={set('qty')} required /></Field>
              <Field label="Prix de vente unitaire (FCFA)"><input type="number" min="1" step="1" value={v.price ?? ''} onChange={set('price')} placeholder={picked ? String(picked.price) : '0'} required /></Field>
              {!v.product_id && <Field label="Prix d’achat unitaire (FCFA)"><input type="number" min="0" step="1" value={v.cost ?? ''} onChange={set('cost')} placeholder="Facultatif" /></Field>}
              <Field label="D’où vient la vente ?">
                <select value={v.source || ''} onChange={set('source')}><option value="">— Choisir —</option>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              <Field label="Nom du client"><input value={v.customer || ''} onChange={set('customer')} maxLength={120} placeholder="Facultatif" /></Field>
              <Field label="Téléphone du client"><input type="tel" value={v.phone || ''} onChange={set('phone')} maxLength={30} placeholder="Ex. 70 00 00 00" /></Field>
              <Field label="Moyen de paiement">
                <select value={v.payment || ''} onChange={set('payment')}><option value="">— Choisir —</option>{payments.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              <Field label="État de la livraison">
                <select value={status} onChange={set('status')}>{Object.entries(STATUS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
              </Field>
              <Field label="Date"><input type="date" max={max} value={v.date || ''} onChange={set('date')} /></Field>
              {picked && <div className="full mute" style={{ fontSize: '.85rem' }}>Stock disponible : <b className={picked.stock <= 0 ? 'neg' : ''}>{picked.stock}</b></div>}
              {overStock && <div className="full err">Stock insuffisant : il reste {Math.max(picked.stock, 0)} unité{picked.stock > 1 ? 's' : ''} de « {picked.name} ».</div>}
              <div className="actions">
                <button className="btn btn-blue" disabled={busy || overStock}>{busy ? '…' : editing ? 'Enregistrer les modifications' : 'Enregistrer la vente'}</button>
                {Number(v.price) > 0 && <span className="mute">Total : <b style={{ color: 'var(--text)' }}>{xof(Number(v.price) * (Number(v.qty ?? 1) || 0))}</b></span>}
              </div>
            </>
          )}

          {kind === 'produits' && (
            <>
              <Field label="Nom du produit" wide><input value={v.name || ''} onChange={set('name')} required maxLength={150} placeholder="Ex. Robe wax taille M" /></Field>
              <Field label="Référence (facultatif)"><input value={v.sku || ''} onChange={set('sku')} maxLength={50} /></Field>
              <Field label="Stock actuel"><input type="number" min="0" step="1" value={v.stock ?? ''} onChange={set('stock')} placeholder="0" /></Field>
              <Field label="Prix d’achat (FCFA)"><input type="number" min="0" step="1" value={v.cost ?? ''} onChange={set('cost')} required /></Field>
              <Field label="Prix de vente (FCFA)"><input type="number" min="0" step="1" value={v.price ?? ''} onChange={set('price')} required /></Field>
              <div className="actions"><button className="btn btn-blue" disabled={busy}>{busy ? '…' : editing ? 'Enregistrer les modifications' : 'Ajouter le produit'}</button></div>
            </>
          )}

          {kind === 'publicite' && (
            <>
              {productSelect('Produit promu', '— Toute la boutique (pub générale) —')}
              <Field label="Plateforme">
                <select value={v.platform || ''} onChange={set('platform')}><option value="">— Choisir —</option>{PLATFORMS.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              <Field label="Montant dépensé (FCFA)"><input type="number" min="1" step="1" value={v.amount ?? ''} onChange={set('amount')} required /></Field>
              <Field label="Prospects / messages générés"><input type="number" min="0" step="1" value={v.leads ?? ''} onChange={set('leads')} placeholder="0" /></Field>
              <Field label="Date"><input type="date" max={max} value={v.date || ''} onChange={set('date')} /></Field>
              <Field label="Note (campagne…)" wide><input value={v.note || ''} onChange={set('note')} maxLength={500} /></Field>
              <div className="actions"><button className="btn btn-blue" disabled={busy}>{busy ? '…' : editing ? 'Enregistrer les modifications' : 'Ajouter la dépense'}</button></div>
            </>
          )}

          {kind === 'charges' && (
            <>
              {productSelect('Produit concerné', '— Aucun : charge indépendante (loyer, salaires…) —')}
              <Field label="Nom de la dépense" wide><input value={v.label || ''} onChange={set('label')} required maxLength={150} placeholder="Ex. Déplacement à Bobo, cartons d’emballage" /></Field>
              <Field label="Catégorie">
                <select value={v.category || ''} onChange={set('category')}><option value="">— Choisir —</option>{CATEGORIES.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              <Field label="Montant (FCFA)"><input type="number" min="1" step="1" value={v.amount ?? ''} onChange={set('amount')} required /></Field>
              <Field label="Date"><input type="date" max={max} value={v.date || ''} onChange={set('date')} /></Field>
              <Field label="Note" wide><input value={v.note || ''} onChange={set('note')} maxLength={500} /></Field>
              <div className="actions"><button className="btn btn-blue" disabled={busy}>{busy ? '…' : editing ? 'Enregistrer les modifications' : 'Ajouter la charge'}</button></div>
            </>
          )}
        </form>
      )}

      {err && <div className="err" role="alert">{err}</div>}
      {ok && <div className="okmsg">{ok}</div>}

      <div className="card">
        {kind !== 'produits' ? (
          <>
            <div className="filters">
              <div className="seg" role="tablist" aria-label="Période">
                {FILTERS.map(([k, name]) => <button key={k} role="tab" aria-selected={period === k} onClick={() => setPeriod(k)}>{name}</button>)}
                <button role="tab" aria-selected={period === 'custom'} onClick={() => setPeriod('custom')}>Dates…</button>
              </div>
              {period === 'custom' && (
                <div className="dates">
                  <input type="date" max={max} value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} aria-label="Du" />
                  <span className="mute">au</span>
                  <input type="date" max={max} value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} aria-label="Au" />
                </div>
              )}
              {kind === 'ventes' && (
                <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label="État de la livraison">
                  <option value="">Toutes les livraisons</option>{Object.entries(STATUS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                </select>
              )}
              <select value={fProduct} onChange={(e) => setFProduct(e.target.value)} aria-label="Produit">
                <option value="">Tous les produits</option>
                {kind !== 'ventes' && <option value="none">Charges indépendantes</option>}
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {kind === 'ventes' && <input type="search" value={fText} onChange={(e) => setFText(e.target.value)} placeholder="Client, téléphone, produit…" aria-label="Rechercher" />}
            </div>
            {rows && (
              <div className="sum">
                <span><b>{cnt(rows.length)}</b> ligne{rows.length > 1 ? 's' : ''}</span>
                <span>Total : <b>{xof(total)}</b></span>
                {kind === 'ventes' && <span><b>{cnt(rows.filter((r) => !CANCELED.includes(r.status)).reduce((a, r) => a + r.qty, 0))}</b> articles</span>}
                {kind === 'publicite' && <span><b>{num(rows.reduce((a, r) => a + r.leads, 0))}</b> prospects</span>}
                {kind === 'charges' && <span>dont indépendantes : <b>{xof(rows.filter((r) => !r.product_id).reduce((a, r) => a + r.amount, 0))}</b></span>}
              </div>
            )}
          </>
        ) : (
          <div className="filters">
            <select value={fStock} onChange={(e) => setFStock(e.target.value)} aria-label="Filtrer">
              {Object.entries(PRODUCT_FILTERS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
            <input type="search" value={fText} onChange={(e) => setFText(e.target.value)} placeholder="Rechercher un produit…" aria-label="Rechercher" />
          </div>
        )}

        {!shown ? <p className="mute">Chargement…</p> : shown.length === 0 ? <p className="empty">Rien à afficher{kind !== 'produits' && period !== 'all' ? ' sur cette période' : ''} pour le moment.</p> : (
          <ul className="list">
            {kind === 'ventes' && shown.map((r) => (
              <li key={r.id} className="row">
                <div>
                  <b>{r.product}{r.qty > 1 ? ` × ${cnt(r.qty)}` : ''}</b>
                  <small>{r.source || 'Source non renseignée'}{r.customer ? ` · ${r.customer}` : ''}{r.phone ? ` · ${r.phone}` : ''}{r.payment ? ` · ${r.payment}` : ''} · {day(r.date)}</small>
                </div>
                <div className="end">
                  <b className={CANCELED.includes(r.status) ? 'mute' : ''} style={CANCELED.includes(r.status) ? { textDecoration: 'line-through' } : undefined}>{xof(r.amount)}</b>
                  {canEdit ? (
                    <select className="mini-sel" value={r.status} aria-label="Livraison" onChange={(e) => patch(r.id, { status: e.target.value })}>
                      {Object.entries(STATUS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                    </select>
                  ) : <span className={`tag ${r.status}`}>{STATUS[r.status]}</span>}
                  {canEdit && <button className="x" aria-label="Modifier" title="Modifier" onClick={() => startEdit(r)}>✎</button>}
                  {canDel && <button className="x" aria-label="Supprimer" onClick={() => remove(r.id, 'cette vente')}>×</button>}
                </div>
              </li>
            ))}

            {kind === 'publicite' && shown.map((r) => (
              <li key={r.id} className="row">
                <div><b>{xof(r.amount)}</b><small>{r.product ? `Produit : ${r.product}` : 'Pub générale'} · {r.platform || 'Plateforme non renseignée'} · {day(r.date)}{r.leads ? ` · ${num(r.leads)} prospect${r.leads > 1 ? 's' : ''}` : ''}{r.note ? ` · ${r.note}` : ''}</small></div>
                <div className="end">
                  {canEdit && <button className="x" aria-label="Modifier" title="Modifier" onClick={() => startEdit(r)}>✎</button>}
                  {canDel && <button className="x" aria-label="Supprimer" onClick={() => remove(r.id, 'cette dépense')}>×</button>}
                </div>
              </li>
            ))}

            {kind === 'charges' && shown.map((r) => (
              <li key={r.id} className="row">
                <div><b>{r.label || r.category || 'Charge'} · {xof(r.amount)}</b><small>{r.category || 'Autre'} · {r.product ? `Produit : ${r.product}` : 'Indépendante'} · {day(r.date)}{r.note ? ` · ${r.note}` : ''}</small></div>
                <div className="end">
                  {canEdit && <button className="x" aria-label="Modifier" title="Modifier" onClick={() => startEdit(r)}>✎</button>}
                  {canDel && <button className="x" aria-label="Supprimer" onClick={() => remove(r.id, 'cette charge')}>×</button>}
                </div>
              </li>
            ))}

            {kind === 'produits' && shown.map((p) => (
              <li key={p.id} className="row" style={p.active ? undefined : { opacity: .55 }}>
                <div>
                  <b>{p.name}{!p.active && ' (archivé)'} {p.active && p.stock <= p.threshold && <span className={`tag ${p.stock <= 0 ? 'retour' : 'en_attente'}`}>{p.stock <= 0 ? 'Rupture' : 'Stock bas'}</span>}</b>
                  <small>{p.sku ? `${p.sku} · ` : ''}achat {xof(p.cost)} · vente {xof(p.price)} · marge {xof(p.price - p.cost)} · {cnt(p.sold)} vendu{p.sold > 1 ? 's' : ''}</small>
                  <small>CA {xof(p.revenue)} · pub {xof(p.ads)} · charges {xof(p.charges)} · bénéfice net <b className={p.net < 0 ? 'neg' : 'pos'}>{xof(p.net)}</b></small>
                </div>
                <div className="end">
                  <div className="stock" title="Stock">
                    {canEdit && <button aria-label="Retirer 1" disabled={p.stock <= 0} onClick={() => patch(p.id, { stock: p.stock - 1 })}>−</button>}
                    <b className={p.stock <= 0 ? 'neg' : ''}>{p.stock}</b>
                    {canEdit && <button aria-label="Ajouter 1" onClick={() => patch(p.id, { stock: p.stock + 1 })}>+</button>}
                  </div>
                  {canEdit && <button className="x" aria-label="Modifier" title="Modifier" onClick={() => startEdit(p)}>✎</button>}
                  {canEdit && <button className="btn btn-line btn-sm" onClick={() => patch(p.id, { active: !p.active })}>{p.active ? 'Archiver' : 'Réactiver'}</button>}
                  {canDel && <button className="x" aria-label="Supprimer" onClick={() => remove(p.id, `le produit « ${p.name} » (les ventes passées sont conservées)`)}>×</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
