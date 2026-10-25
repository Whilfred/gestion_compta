"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout, useAuth } from '../lib/auth'

const LINKS = [
  ['/accueil', 'Accueil'], ['/parcours', 'Parcours'], ['/formations', 'Formations'],
  ['/suivi', 'Suivi'], ['/tarifs', 'Tarifs'], ['/a-propos', 'À propos'],
]

export default function Header() {
  const path = usePathname()
  const router = useRouter()
  const { ready, user } = useAuth()
  return (
    <header className="top">
      <Link className="logo" href="/accueil" aria-label="The Winner School, accueil">
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" stroke="#fff" strokeWidth="2.5" /><path d="M12 24c4 5 14 5 17-2M28 16c-4-5-14-5-17 2" stroke="#3d8bff" strokeWidth="3.5" strokeLinecap="round" /></svg>
        The Winner School
      </Link>
      <nav aria-label="Navigation principale">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className={path === href || (href === '/formations' && path.startsWith('/formations')) ? 'on' : ''}>{label}</Link>
        ))}
      </nav>
      <div className="acts">
        {ready && user ? (
          <>
                      {user.role === 'admin' && <Link className="lang" href="/admin">Admin</Link>}
            <Link className="lang" href="/dashboard">Mon espace</Link>
            <button className="try" onClick={async () => { await logout(); router.push("/accueil") }}>Se déconnecter</button>
          </>
        ) : (
          <>
            <Link className="lang" href="/connexion">Se connecter</Link>
            <Link className="try" href="/inscription">S’inscrire</Link>
          </>
        )}
      </div>
    </header>
  )
}
