"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../../lib/auth'

export default function AdminShell({ children }) {
  const router = useRouter()
  const path = usePathname()
  const { ready, user } = useAuth()
  useEffect(() => { if (ready && !user) router.replace('/connexion') }, [ready, user, router])

  if (!ready || !user) return null
  if (user.role !== 'admin') {
    return (
      <section className="adm">
        <div className="glass adm-card"><h2>Accès réservé</h2><p className="adm-mute">Cette page est réservée aux administrateurs.</p></div>
      </section>
    )
  }
  return (
    <section className="adm">
      <div className="adm-tabs">
        <Link href="/admin" className={path === '/admin' || path.startsWith('/admin/etudiants') ? 'on' : ''}>Étudiants</Link>
        <Link href="/admin/calendrier" className={path.startsWith('/admin/calendrier') ? 'on' : ''}>Calendrier des calls</Link>
      </div>
      {children}
    </section>
  )
}
