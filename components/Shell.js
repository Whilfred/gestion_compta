"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { logout, useAuth } from '../lib/auth'
import { can } from '../lib/constants'
import { PrivacyProvider, useFmt } from '../lib/privacy'
import Logo from './Logo'

// [lien, libellé, icône, rubrique]  — rubrique 'owner' = propriétaire seulement
const MENU = [
  ['/dashboard', 'Vue d’ensemble', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', 'dashboard'],
  ['/dashboard/ventes', 'Ventes', 'M3 17l6-6 4 4 8-8M15 7h6v6', 'ventes'],
  ['/dashboard/produits', 'Produits', 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8', 'produits'],
  ['/dashboard/clients', 'Clients', 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21a8 8 0 0 1 16 0', 'clients'],
  ['/dashboard/publicite', 'Publicité', 'M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6', 'publicite'],
  ['/dashboard/charges', 'Charges', 'M4 7h16v12H4zM4 7l2-3h12l2 3M15 13h3', 'charges'],
  ['/dashboard/parametres', 'Réglages', 'M4 7h9M17 7h3M4 17h3M11 17h9M15 4v6M9 14v6', 'owner'],
]

const allowed = (user, section) => (section === 'owner' ? user.isOwner : can(user.perms, section))
const sectionOf = (path) => MENU.filter(([h]) => (h === '/dashboard' ? path === h : path.startsWith(h))).sort((a, b) => b[0].length - a[0].length)[0]?.[3]

// Couleur d'accent : une teinte un peu plus foncée pour les dégradés
const darken = (hex) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.8).toString(16).padStart(2, '0')).join('')

function Bell({ user }) {
  const router = useRouter()
  const path = usePathname()
  const [d, setD] = useState({ rows: [], unread: 0 })
  const [open, setOpen] = useState(false)
  const seen = useRef(null)

  const load = useCallback(() => {
    api('/api/notifications').then((x) => {
      setD(x)
      const ids = new Set(x.rows.filter((r) => !r.read).map((r) => r.id))
      // Alerte du navigateur pour les nouvelles alertes (si l'utilisateur l'a autorisée)
      if (seen.current && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        x.rows.filter((r) => !r.read && !seen.current.has(r.id)).forEach((r) => new Notification('Compta Ecom', { body: r.message }))
      }
      seen.current = ids
    }).catch(() => {})
  }, [])
  useEffect(() => { load() }, [load, path])
  useEffect(() => { const t = setInterval(load, 60000); return () => clearInterval(t) }, [load])

  const read = async (id) => { await api(id ? `/api/notifications?id=${id}` : '/api/notifications', 'POST', id ? {} : { all: true }).catch(() => {}); load() }
  const canAsk = typeof Notification !== 'undefined' && Notification.permission === 'default'

  return (
    <div className="bell">
      <button className="icon-btn" aria-label={`Alertes (${d.unread})`} title="Alertes de stock" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0" /></svg>
        {d.unread > 0 && <i className="badge">{d.unread > 9 ? '9+' : d.unread}</i>}
      </button>
      {open && (
        <div className="pop" role="dialog" aria-label="Alertes">
          <div className="pop-h"><b>Alertes</b>{d.unread > 0 && <button className="btn btn-line btn-sm" onClick={() => read()}>Tout marquer comme lu</button>}</div>
          {d.rows.length === 0 ? <p className="empty">Aucune alerte. Tout va bien.</p> : (
            <ul className="list">
              {d.rows.map((r) => (
                <li key={r.id} className={`row ${r.read ? 'seen' : ''}`}>
                  <div><b>{r.message}</b><small>{new Date(r.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div>
                  <div className="end">
                    {can(user.perms, 'produits') && <button className="btn btn-line btn-sm" onClick={() => { read(r.id); setOpen(false); router.push('/dashboard/produits') }}>Réapprovisionner</button>}
                    {!r.read && <button className="x" aria-label="Marquer comme lu" onClick={() => read(r.id)}>✓</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {canAsk && <button className="btn btn-line btn-sm" style={{ marginTop: 10 }} onClick={() => Notification.requestPermission().then(load)}>Activer les alertes du navigateur</button>}
        </div>
      )}
    </div>
  )
}

function Frame({ user, children }) {
  const router = useRouter()
  const path = usePathname()
  const { hidden, toggle } = useFmt()

  // Réglages d'apparence de la boutique : clair/sombre, couleur, densité, taille du texte
  useEffect(() => {
    const s = user.settings || {}
    const root = document.documentElement
    root.dataset.theme = s.theme === 'light' ? 'light' : 'dark'
    root.dataset.density = s.density === 'compact' ? 'compact' : 'normal'
    if (/^#[0-9a-f]{6}$/i.test(s.accent || '')) { root.style.setProperty('--blue', s.accent); root.style.setProperty('--blue2', darken(s.accent)) }
    root.style.fontSize = { small: '14px', large: '18px' }[s.fontSize] || ''
    return () => {
      delete root.dataset.theme; delete root.dataset.density
      root.style.removeProperty('--blue'); root.style.removeProperty('--blue2'); root.style.fontSize = ''
    }
  }, [user.settings])

  // Rubrique interdite → on renvoie vers la première rubrique autorisée
  const sec = sectionOf(path)
  const forbidden = sec && !allowed(user, sec)
  useEffect(() => {
    if (forbidden) { const first = MENU.find(([, , , s]) => allowed(user, s)); router.replace(first ? first[0] : '/') }
  }, [forbidden, user, router])
  if (forbidden) return null

  const doLogout = async () => { await logout(); router.push('/') }

  return (
    <div className="shell">
      <aside className="side">
        <Logo href="/dashboard" />
        <nav aria-label="Navigation principale">
          {MENU.filter(([, , , s]) => allowed(user, s)).map(([href, label, icon]) => {
            const on = href === '/dashboard' ? path === href : path.startsWith(href)
            return (
              <Link key={href} href={href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="who">
          <b>{user.name}</b>
          <small>{user.email}{!user.isOwner && ' · employé'}</small>
          <button className="btn btn-line btn-sm" onClick={doLogout}>Se déconnecter</button>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <button className="icon-btn" onClick={toggle} aria-pressed={hidden} title={hidden ? 'Afficher les chiffres' : 'Masquer les chiffres'} aria-label={hidden ? 'Afficher les chiffres' : 'Masquer les chiffres'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {hidden ? <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3.2 3.8M6.5 7.5C4 9.2 2.5 12 2.5 12S6 18 12 18c1.4 0 2.6-.3 3.7-.8M9.9 9.9a3 3 0 0 0 4.2 4.2" /> : <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />}
            </svg>
          </button>
          <Bell user={user} />
          <button className="icon-btn only-mobile" onClick={doLogout} title="Se déconnecter" aria-label="Se déconnecter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" /></svg>
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}

export default function Shell({ children }) {
  const router = useRouter()
  const { ready, user } = useAuth()

  useEffect(() => { if (ready && !user) router.replace('/connexion') }, [ready, user, router])
  if (!ready || !user) return null

  return <PrivacyProvider initial={!!user.settings?.hideFigures}><Frame user={user}>{children}</Frame></PrivacyProvider>
}
