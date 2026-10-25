"use client"
import { useState } from 'react'
import Calendar, { CallItem, key } from './Calendar'
import { useEspace } from './EspaceShell'

export default function CallsView() {
  const { d } = useEspace()
  const [month, setMonth] = useState(() => new Date())
  const [sel, setSel] = useState(() => key(new Date()))

  const calls = d.calls
  const now = new Date()
  const dayCalls = calls.filter((c) => key(c.scheduled_at) === sel)
  const upcoming = calls.filter((c) => c.status === 'prevu' && new Date(c.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  const done = calls.filter((c) => c.status === 'fait').length

  return (
    <>
      <div className="esp-title">
        <div>
          <h2>Mes calls</h2>
          <p className="esp-mute esp-intro">Vos rendez-vous de suivi avec l’équipe. Ils sont programmés par votre coach.</p>
        </div>
        <div className="esp-total">
          <span className="esp-label">Calls</span>
          <b>{upcoming.length} à venir</b>
          <small>{done} déjà fait{done > 1 ? 's' : ''}</small>
        </div>
      </div>

      <div className="esp-grid2">
        <Calendar calls={calls} month={month} onMonth={setMonth} selected={sel} onSelect={setSel} />
        <div className="esp-col">
          <div className="glass esp-card">
            <h3 className="esp-cap">{new Date(sel + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            {dayCalls.length === 0 ? <p className="esp-mute">Aucun call ce jour-là.</p> : (
              <ul className="esp-list">{dayCalls.map((c) => <CallItem key={c.id} c={c} />)}</ul>
            )}
          </div>
          <div className="glass esp-card">
            <h3>À venir</h3>
            {upcoming.length === 0 ? <p className="esp-mute">Aucun call programmé. Votre coach en planifiera un avec vous.</p> : (
              <ul className="esp-list">{upcoming.slice(0, 5).map((c) => <CallItem key={c.id} c={c} />)}</ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
