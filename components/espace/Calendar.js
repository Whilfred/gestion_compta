"use client"
import { dt, hm } from '../../lib/format'

const WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const CALL_STATUS = { prevu: 'Prévu', fait: 'Fait', annule: 'Annulé', absent: 'Absent' }

export const key = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

// Mon calendrier des calls (lecture seule — programmé par l'équipe). calls : [{ id, scheduled_at, status }]
export default function Calendar({ calls, month, onMonth, selected, onSelect }) {
  const y = month.getFullYear(), m = month.getMonth()
  const first = new Date(y, m, 1)
  const offset = (first.getDay() + 6) % 7
  const days = Array.from({ length: Math.ceil((offset + new Date(y, m + 1, 0).getDate()) / 7) * 7 }, (_, i) => new Date(y, m, 1 - offset + i))
  const byDay = {}
  calls.forEach((c) => { (byDay[key(c.scheduled_at)] ||= []).push(c) })
  const today = key(new Date())

  return (
    <div className="glass esp-card">
      <div className="esp-cal-head">
        <button className="esp-btn" onClick={() => onMonth(new Date(y, m - 1, 1))} aria-label="Mois précédent">‹</button>
        <h3>{month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
        <button className="esp-btn" onClick={() => onMonth(new Date(y, m + 1, 1))} aria-label="Mois suivant">›</button>
        <button className="esp-btn" onClick={() => { onMonth(new Date()); onSelect(key(new Date())) }}>Aujourd’hui</button>
      </div>
      <div className="esp-cal">
        {WEEK.map((w) => <div key={w} className="esp-cal-w">{w}</div>)}
        {days.map((d) => {
          const k = key(d), list = byDay[k] || []
          return (
            <button key={k} onClick={() => onSelect(k)}
              className={`esp-cal-d${d.getMonth() !== m ? ' out' : ''}${k === today ? ' today' : ''}${k === selected ? ' sel' : ''}`}>
              <span>{d.getDate()}</span>
              {list.slice(0, 3).map((c) => <em key={c.id} className={c.status}>{hm(c.scheduled_at)}</em>)}
              {list.length > 3 && <em className="more">+{list.length - 3}</em>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CallItem({ c }) {
  return (
    <li className="esp-call">
      <div>
        <b>{dt(c.scheduled_at)} · {c.duration} min</b>
        <small>{c.topic || 'Call de suivi'}</small>
        {c.meeting_url && <a href={c.meeting_url} target="_blank" rel="noreferrer">Lien de la réunion</a>}
      </div>
      <span className={`esp-pill ${c.status}`}>{CALL_STATUS[c.status]}</span>
    </li>
  )
}
