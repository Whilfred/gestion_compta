"use client"
import { dt, hm } from '../../lib/format'

const WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const CALL_STATUS = { prevu: 'Prévu', fait: 'Fait', annule: 'Annulé', absent: 'Absent' }

export const key = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

// Grille d'un mois (lundi en premier). calls : [{ id, scheduled_at, status, student? }]
export default function Calendar({ calls, month, onMonth, selected, onSelect }) {
  const y = month.getFullYear(), m = month.getMonth()
  const first = new Date(y, m, 1)
  const offset = (first.getDay() + 6) % 7
  const days = Array.from({ length: Math.ceil((offset + new Date(y, m + 1, 0).getDate()) / 7) * 7 }, (_, i) => new Date(y, m, 1 - offset + i))
  const byDay = {}
  calls.forEach((c) => { (byDay[key(c.scheduled_at)] ||= []).push(c) })
  const today = key(new Date())

  return (
    <div className="glass adm-card">
      <div className="adm-cal-head">
        <button className="adm-btn" onClick={() => onMonth(new Date(y, m - 1, 1))} aria-label="Mois précédent">‹</button>
        <h3>{month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
        <button className="adm-btn" onClick={() => onMonth(new Date(y, m + 1, 1))} aria-label="Mois suivant">›</button>
        <button className="adm-btn" onClick={() => { onMonth(new Date()); onSelect(key(new Date())) }}>Aujourd’hui</button>
      </div>
      <div className="adm-cal">
        {WEEK.map((w) => <div key={w} className="adm-cal-w">{w}</div>)}
        {days.map((d) => {
          const k = key(d), list = byDay[k] || []
          return (
            <button key={k} onClick={() => onSelect(k)}
              className={`adm-cal-d${d.getMonth() !== m ? ' out' : ''}${k === today ? ' today' : ''}${k === selected ? ' sel' : ''}`}>
              <span>{d.getDate()}</span>
              {list.slice(0, 3).map((c) => (
                <em key={c.id} className={c.status}>{hm(c.scheduled_at)}{c.student ? ` ${c.student.split(' ')[0]}` : ''}</em>
              ))}
              {list.length > 3 && <em className="more">+{list.length - 3}</em>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CallItem({ c, onStatus, onDelete, showStudent }) {
  return (
    <li className="adm-call">
      <div>
        <b>{dt(c.scheduled_at)} · {c.duration} min</b>
        <small>{showStudent && c.student ? `${c.student} — ` : ''}{c.topic || 'Call de suivi'}</small>
        {c.meeting_url && <a href={c.meeting_url} target="_blank" rel="noreferrer">Lien de la réunion</a>}
      </div>
      <div className="adm-call-act">
        <select value={c.status} onChange={(e) => onStatus(c, e.target.value)} className={`adm-pill ${c.status}`}>
          {Object.entries(CALL_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="adm-x" onClick={() => onDelete(c)} aria-label="Supprimer">✕</button>
      </div>
    </li>
  )
}
