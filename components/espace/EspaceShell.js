"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { pct } from '../../lib/format'

const Ctx = createContext(null)
export const useEspace = () => useContext(Ctx)

export const STATUS = { actif: 'Actif', pause: 'En pause', termine: 'Terminé', abandon: 'Abandon' }

const MENU = [
  ['/dashboard', 'Vue d’ensemble', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['/dashboard/ventes', 'Ventes', 'M3 17l6-6 4 4 8-8M15 7h6v6'],
  ['/dashboard/publicite', 'Publicité', 'M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6'],
  ['/dashboard/charges', 'Autres charges', 'M4 7h16v12H4zM4 7l2-3h12l2 3M15 13h3'],
  ['/dashboard/calls', 'Calls', 'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4'],
  ['/dashboard/profil', 'Mon profil', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'],
]

// Garde de connexion + chargement unique des données + menu à droite.
export default function EspaceShell({ children }) {
  const router = useRouter()
  const path = usePathname()
  const { ready, user } = useAuth()
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')

  const load = useCallback(() => api('/api/moi').then((x) => { setD(x); setErr('') }).catch((e) => setErr(e.message)), [])
  useEffect(() => { if (ready && !user) router.replace('/connexion') }, [ready, user, router])
  useEffect(() => { if (ready && user) load() }, [ready, user, load])

  if (!ready || !user) return null

  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const goalPct = d ? pct(d.totals.revenue, d.profile.goal) : null

  return (
    <Ctx.Provider value={{ d, load, user }}>
      <section className="esp">
        <main className="esp-main">
          {err && !d ? <div className="err">{err}</div> : !d ? <p className="esp-mute">Chargement…</p> : children}
        </main>

        <aside className="esp-rail">
          <div className="glass esp-id">
            <span className="esp-ava" aria-hidden="true">{initials}</span>
            <div>
              <b>{user.name}</b>
              {d && <span className={`esp-pill ${d.profile.status}`}>{STATUS[d.profile.status]}</span>}
            </div>
            {d && d.profile.goal > 0 && (
              <div className="esp-goal">
                <div className="esp-track"><i style={{ width: `${Math.min(goalPct ?? 0, 100)}%` }} /></div>
                <small>{goalPct} % de l’objectif de chiffre d’affaires</small>
              </div>
            )}
          </div>
          <nav className="glass esp-nav" aria-label="Mon espace">
            {MENU.map(([href, label, icon]) => {
              const on = href === '/dashboard' ? path === href : path.startsWith(href)
              return (
                <Link key={href} href={href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>
      </section>
    </Ctx.Provider>
  )
}
