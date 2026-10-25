"use client"
import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { ACCENTS, LEVELS, SECTIONS } from '../lib/constants'

const TABS = [['boutique', 'Boutique & objectifs'], ['apparence', 'Apparence'], ['paiements', 'Moyens de paiement'], ['users', 'Utilisateurs'], ['backup', 'Sauvegarde']]
const refresh = () => window.dispatchEvent(new Event('ec-auth'))   // recharge le thème / les réglages partout
const NEW_PERMS = { dashboard: 'none', ventes: 'edit', produits: 'view', clients: 'view', publicite: 'none', charges: 'none', delete: false }

function Seg({ value, options, onChange }) {
  return <div className="seg">{options.map(([k, n]) => <button type="button" key={k} aria-selected={value === k} onClick={() => onChange(k)}>{n}</button>)}</div>
}

// Tableau des droits : une ligne par rubrique
function PermGrid({ perms, onChange }) {
  return (
    <div className="perms">
      {Object.entries(SECTIONS).map(([k, name]) => (
        <label key={k} className="field"><span>{name}</span>
          <select value={perms[k] || 'none'} onChange={(e) => onChange({ ...perms, [k]: e.target.value })}>
            {Object.entries(LEVELS).map(([l, n]) => <option key={l} value={l}>{n}</option>)}
          </select>
        </label>
      ))}
      <label className="check"><input type="checkbox" checked={!!perms.delete} onChange={(e) => onChange({ ...perms, delete: e.target.checked })} /> Peut supprimer des lignes</label>
    </div>
  )
}

function Users({ setErr, setOk }) {
  const [rows, setRows] = useState(null)
  const [f, setF] = useState({ name: '', email: '', password: '', perms: NEW_PERMS })
  const [open, setOpen] = useState(null)       // id de l'utilisateur dont on modifie les droits
  const [draft, setDraft] = useState({})
  const load = useCallback(() => api('/api/users').then((x) => setRows(x.rows)).catch((e) => setErr(e.message)), [setErr])
  useEffect(() => { load() }, [load])

  const run = async (fn, msg) => { setErr(''); setOk(''); try { await fn(); if (msg) setOk(msg); load() } catch (e) { setErr(e.message) } }
  const add = (e) => { e.preventDefault(); run(async () => { await api('/api/users', 'POST', f); setF({ name: '', email: '', password: '', perms: NEW_PERMS }) }, 'Utilisateur créé. Il peut se connecter avec son e-mail et ce mot de passe.') }

  return (
    <>
      <form className="card" onSubmit={add} style={{ display: 'grid', gap: 12 }}>
        <h3>Ajouter un utilisateur <small>employé, associé…</small></h3>
        <div className="form" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <label className="field"><span>Nom</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required maxLength={120} /></label>
          <label className="field"><span>E-mail</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></label>
          <label className="field"><span>Mot de passe (8 caractères min.)</span><input type="text" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required minLength={8} maxLength={72} autoComplete="off" /></label>
        </div>
        <PermGrid perms={f.perms} onChange={(perms) => setF({ ...f, perms })} />
        <button className="btn btn-blue" style={{ justifySelf: 'start' }}>Créer l’utilisateur</button>
      </form>

      <div className="card">
        <h3>Utilisateurs <small>{rows ? rows.length : ''}</small></h3>
        {!rows ? <p className="mute">Chargement…</p> : rows.length === 0 ? <p className="empty">Aucun utilisateur pour l’instant : vous seul avez accès.</p> : (
          <ul className="list">
            {rows.map((u) => (
              <li key={u.id} className="row" style={{ flexWrap: 'wrap', opacity: u.active ? 1 : .6 }}>
                <div><b>{u.name}{!u.active && ' (désactivé)'}</b><small>{u.email}</small></div>
                <div className="end" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-line btn-sm" onClick={() => { setOpen(open === u.id ? null : u.id); setDraft(u.perms) }}>Droits</button>
                  <button className="btn btn-line btn-sm" onClick={() => { const p = window.prompt('Nouveau mot de passe (8 caractères min.) :'); if (p) run(() => api(`/api/users?id=${u.id}`, 'PATCH', { password: p }), 'Mot de passe changé.') }}>Mot de passe</button>
                  <button className="btn btn-line btn-sm" onClick={() => run(() => api(`/api/users?id=${u.id}`, 'PATCH', { active: !u.active }))}>{u.active ? 'Désactiver' : 'Réactiver'}</button>
                  <button className="x" aria-label="Supprimer" onClick={() => window.confirm(`Supprimer ${u.name} ?`) && run(() => api(`/api/users?id=${u.id}`, 'DELETE'))}>×</button>
                </div>
                {open === u.id && (
                  <div style={{ flexBasis: '100%', display: 'grid', gap: 10 }}>
                    <PermGrid perms={draft} onChange={setDraft} />
                    <button className="btn btn-blue btn-sm" style={{ justifySelf: 'start' }} onClick={() => run(async () => { await api(`/api/users?id=${u.id}`, 'PATCH', { perms: draft }); setOpen(null) }, 'Droits enregistrés.')}>Enregistrer les droits</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function Backup({ setErr, setOk }) {
  const [busy, setBusy] = useState(false)
  const restore = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErr(''); setOk('')
    try {
      const data = JSON.parse(await file.text())
      if (data?.app !== 'compta-ecom') throw new Error('Ce fichier n’est pas une sauvegarde Compta Ecom.')
      const msg = `Restaurer cette sauvegarde (${data.products?.length || 0} produits, ${data.sales?.length || 0} ventes, ${data.ad_spends?.length || 0} pubs, ${data.expenses?.length || 0} charges) ?\n\nATTENTION : les données actuelles seront REMPLACÉES.`
      if (!window.confirm(msg)) return
      setBusy(true)
      await api('/api/backup', 'POST', data)
      setOk('Sauvegarde restaurée.')
      refresh()
    } catch (x) { setErr(x instanceof SyntaxError ? 'Fichier illisible.' : x.message) }
    setBusy(false)
  }
  return (
    <div className="card" style={{ display: 'grid', gap: 14, maxWidth: 620 }}>
      <h3>Sauvegarde des données</h3>
      <p className="mute">Téléchargez régulièrement une copie de vos produits, ventes, publicités, charges et réglages. Le fichier ne contient aucun mot de passe.</p>
      <a className="btn btn-blue" href="/api/backup" style={{ justifySelf: 'start' }}>Télécharger la sauvegarde</a>
      <hr style={{ border: 0, borderTop: '1px solid var(--line)' }} />
      <p className="mute">Restaurer une sauvegarde <b>remplace</b> toutes les données actuelles (les utilisateurs ne sont pas touchés).</p>
      <label className="btn btn-line" style={{ justifySelf: 'start', cursor: 'pointer' }}>{busy ? 'Restauration…' : 'Choisir un fichier de sauvegarde'}<input type="file" accept="application/json,.json" onChange={restore} hidden disabled={busy} /></label>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [tab, setTab] = useState('boutique')
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [color, setColor] = useState('#4c8dff')
  const [pay, setPay] = useState('')

  const loadShop = useCallback(() => api('/api/profil').then((x) => { setD(x); setColor(x.accent) }).catch((e) => setErr(e.message)), [])
  useEffect(() => { loadShop() }, [loadShop])

  const save = async (body, msg = 'Réglages enregistrés.') => {
    setErr(''); setOk('')
    try { await api('/api/profil', 'PUT', body); setOk(msg); await loadShop(); refresh() } catch (x) { setErr(x.message) }
  }
  const submitShop = (e) => {
    e.preventDefault()
    const f = e.currentTarget
    save({ name: f.name.value, goal: f.goal.value, goalProfit: f.goalProfit.value, threshold: f.threshold.value, hideFigures: f.hideFigures.checked })
  }

  if (user && !user.isOwner) return <p className="empty">Les réglages sont réservés au propriétaire du compte.</p>

  return (
    <>
      <div className="title"><div><h2>Réglages</h2><p style={{ textTransform: 'none' }}>Objectifs, apparence, paiements, utilisateurs et sauvegarde.</p></div></div>
      <div className="seg" role="tablist" aria-label="Réglages">
        {TABS.map(([k, n]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setErr(''); setOk('') }}>{n}</button>)}
      </div>
      {err && <div className="err" role="alert">{err}</div>}
      {ok && <div className="okmsg">{ok}</div>}

      {!d ? (!err && <p className="mute">Chargement…</p>) : (
        <>
          {tab === 'boutique' && (
            <form className="card" onSubmit={submitShop} style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label className="field"><span>Nom de la boutique</span><input name="name" defaultValue={d.name || ''} placeholder="Ex. Boutique Awa" maxLength={120} /></label>
              <label className="field"><span>Objectif de chiffre d’affaires par mois (FCFA)</span><input name="goal" type="number" min="0" defaultValue={d.goal || ''} placeholder="Ex. 3000000" /></label>
              <label className="field"><span>Objectif de bénéfice net par mois (FCFA)</span><input name="goalProfit" type="number" min="0" defaultValue={d.goalProfit || ''} placeholder="Ex. 800000" /></label>
              <label className="field"><span>Alerte de stock : prévenir quand il reste ce nombre d’unités (ou moins)</span><input name="threshold" type="number" min="0" defaultValue={d.threshold} /></label>
              <label className="check"><input name="hideFigures" type="checkbox" defaultChecked={d.hideFigures} /> Masquer les chiffres (xxxx) par défaut à l’ouverture</label>
              <button className="btn btn-blue" type="submit" style={{ alignSelf: 'flex-start' }}>Enregistrer</button>
            </form>
          )}

          {tab === 'apparence' && (
            <div className="card" style={{ maxWidth: 620, display: 'grid', gap: 18 }}>
              <div><span className="lbl">Mode</span><div style={{ marginTop: 8 }}><Seg value={d.theme} options={[['light', 'Clair'], ['dark', 'Sombre']]} onChange={(theme) => save({ theme })} /></div></div>
              <div>
                <span className="lbl">Couleur du site</span>
                <div className="swatches">
                  {ACCENTS.map((c) => <button key={c} type="button" className={d.accent === c ? 'on' : ''} style={{ background: c }} aria-label={`Couleur ${c}`} onClick={() => save({ accent: c })} />)}
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Couleur personnalisée" />
                  <button type="button" className="btn btn-line btn-sm" onClick={() => save({ accent: color })}>Appliquer</button>
                </div>
              </div>
              <div><span className="lbl">Densité</span><div style={{ marginTop: 8 }}><Seg value={d.density} options={[['normal', 'Aérée'], ['compact', 'Compacte']]} onChange={(density) => save({ density })} /></div></div>
              <div><span className="lbl">Taille du texte</span><div style={{ marginTop: 8 }}><Seg value={d.fontSize} options={[['small', 'Petite'], ['normal', 'Normale'], ['large', 'Grande']]} onChange={(fontSize) => save({ fontSize })} /></div></div>
            </div>
          )}

          {tab === 'paiements' && (
            <div className="card" style={{ maxWidth: 560, display: 'grid', gap: 14 }}>
              <h3>Moyens de paiement acceptés</h3>
              <div className="chips">
                {d.paymentMethods.map((m) => <span key={m} className="pill">{m}<button type="button" aria-label={`Retirer ${m}`} onClick={() => save({ paymentMethods: d.paymentMethods.filter((x) => x !== m) }, 'Moyen de paiement retiré.')}>×</button></span>)}
                {d.paymentMethods.length === 0 && <span className="mute">Aucun moyen de paiement.</span>}
              </div>
              <form style={{ display: 'flex', gap: 10 }} onSubmit={(e) => { e.preventDefault(); if (pay.trim()) { save({ paymentMethods: [...d.paymentMethods, pay.trim()] }, 'Moyen de paiement ajouté.'); setPay('') } }}>
                <input value={pay} onChange={(e) => setPay(e.target.value)} placeholder="Ex. Coris Money, Carte bancaire…" maxLength={40} />
                <button className="btn btn-blue">Ajouter</button>
              </form>
              <p className="mute" style={{ fontSize: '.85rem' }}>Ces choix apparaissent dans le formulaire de vente.</p>
            </div>
          )}

          {tab === 'users' && <Users setErr={setErr} setOk={setOk} />}
          {tab === 'backup' && <Backup setErr={setErr} setOk={setOk} />}
        </>
      )}
    </>
  )
}
