"use client"
import { useState } from 'react'
import { api } from '../../lib/api'
import { day } from '../../lib/format'
import { STATUS, useEspace } from './EspaceShell'

export default function ProfileForm() {
  const { d, load, user } = useEspace()
  const p = d.profile
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setErr(''); setOk(''); setBusy(true)
    try {
      await api('/api/moi', 'PUT', Object.fromEntries(new FormData(e.currentTarget)))
      setOk('Profil enregistré.')
      await load()
    } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  return (
    <>
      <div className="esp-title">
        <div>
          <h2>Mon profil</h2>
          <p className="esp-mute esp-intro">Ces informations aident votre coach à suivre votre projet.</p>
        </div>
      </div>

      <form className="glass esp-card esp-form" onSubmit={save}>
        <h3>Mon projet</h3>
        <div className="esp-fields">
          <label>Niche<input name="niche" placeholder="Cosmétique, coaching, cuisine…" defaultValue={p.niche || ''} /></label>
          <label>Produit ou livre<input name="product" placeholder="Titre de votre produit" defaultValue={p.product || ''} /></label>
          <label>Prix de vente (FCFA)<input name="price" type="number" min="0" inputMode="numeric" defaultValue={p.price || ''} /></label>
          <label>Objectif de chiffre d’affaires (FCFA)<input name="goal" type="number" min="0" inputMode="numeric" defaultValue={p.goal || ''} /></label>
          <label>Canal principal<input name="channel" list="canaux" placeholder="Où vous vendez le plus" defaultValue={p.channel || ''} />
            <datalist id="canaux">{['Facebook / Instagram', 'TikTok', 'WhatsApp', 'YouTube', 'Google', 'Site web'].map((x) => <option key={x} value={x} />)}</datalist>
          </label>
          <label>Lien de la page de vente<input name="url" type="url" placeholder="https://…" defaultValue={p.url || ''} /></label>
        </div>
        {err && <div className="err">{err}</div>}
        {ok && <div className="esp-ok" role="status">{ok}</div>}
        <button className="btn btn-blue" type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer mon profil'}</button>
      </form>

      <div className="esp-grid2">
        <div className="glass esp-card">
          <h3>Mon compte</h3>
          <dl className="esp-dl">
            <div><dt>Nom</dt><dd>{user.name}</dd></div>
            <div><dt>E-mail</dt><dd>{user.email}</dd></div>
            <div><dt>Statut</dt><dd><span className={`esp-pill ${p.status}`}>{STATUS[p.status]}</span></dd></div>
          </dl>
        </div>
        <div className="glass esp-card">
          <h3>Mes formations</h3>
          {d.enrollments.length === 0 ? <p className="esp-mute">Aucune formation pour le moment.</p> : (
            <ul className="esp-list">
              {d.enrollments.map((e, i) => <li key={i} className="esp-row"><span>{e.title}</span><small>{day(e.enrolled_at)}</small></li>)}
            </ul>
          )}
        </div>
      </div>

      {p.notes && (
        <div className="glass esp-card">
          <h3>Notes de mon coach</h3>
          <p className="esp-mute esp-notes">{p.notes}</p>
        </div>
      )}
    </>
  )
}
