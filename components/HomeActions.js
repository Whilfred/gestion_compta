"use client"
import Link from 'next/link'
import { useAuth } from '../lib/auth'

export default function HomeActions({ big }) {
  const { ready, user } = useAuth()
  if (!ready) return <span style={{ minHeight: 44, display: 'inline-block' }} />
  if (user) return <Link className="btn btn-blue" href="/dashboard">Ouvrir mon tableau de bord</Link>
  return (
    <>
      {!big && <Link className="btn btn-line" href="/connexion">Se connecter</Link>}
      <Link className="btn btn-blue" href="/inscription">Créer mon espace</Link>
    </>
  )
}
