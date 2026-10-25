"use client"
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import Calendar, { CallItem, key } from './Calendar'

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date())
  const [sel, setSel] = useState(() => key(new Date()))
  const [calls, setCalls] = useState([])
  const [students, setStudents] = useState([])
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    const from = new Date(month.getFullYear(), month.getMonth(), -7)
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 8)
    api(`/api/admin/calls?from=${from.toISOString()}&to=${to.toISOString()}`).then((d) => setCalls(d.calls)).catch((e) => setErr(e.message))
  }, [month])

  useEffect(() => { load() }, [load])
  useEffect(() => { api('/api/admin/etudiants').then((d) => setStudents(d.students)).catch(() => {}) }, [])

  const add = async (e) => {
    e.preventDefault()
    const f = e.currentTarget
    const b = Object.fromEntries(new FormData(f))
    setErr('')
    try {
      await api(`/api/admin/etudiants/${b.student}/calls`, 'POST', {
        scheduled_at: new Date(b.scheduled_at).toISOString(), duration_minutes: b.duration_minutes, topic: b.topic, meeting_url: b.meeting_url,
      })
      f.reset()
      load()
    } catch (x) { setErr(x.message) }
  }
  const setStatus = (c, status) => api(`/api/admin/etudiants/${c.user_id}/calls`, 'PATCH', { id: c.id, status }).then(load).catch((x) => setErr(x.message))
  const del = (c) => confirm('Supprimer ce call ?') && api(`/api/admin/etudiants/${c.user_id}/calls?id=${c.id}`, 'DELETE').then(load).catch((x) => setErr(x.message))

  const dayCalls = calls.filter((c) => key(c.scheduled_at) === sel)

  return (
    <>
      {err && <div className="err">{err}</div>}
      <div className="adm-grid2">
        <Calendar calls={calls} month={month} onMonth={setMonth} selected={sel} onSelect={setSel} />
        <div className="adm-col">
          <div className="glass adm-card">
            <h3>{new Date(sel + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            {dayCalls.length === 0 ? <p className="adm-mute">Aucun call ce jour-là.</p> : (
              <ul className="adm-list">{dayCalls.map((c) => <CallItem key={c.id} c={c} showStudent onStatus={setStatus} onDelete={del} />)}</ul>
            )}
          </div>
          <form className="glass adm-card adm-form" onSubmit={add}>
            <h3>Programmer un call</h3>
            <select name="student" required defaultValue="">
              <option value="" disabled>Choisir un étudiant…</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
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
