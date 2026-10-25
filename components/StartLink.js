"use client"
import Link from 'next/link'
import { useAuth } from '../lib/auth'

// Bouton « Commencer » : connecté → /dashboard, sinon → /inscription
export default function StartLink({ className, children }) {
  const { user } = useAuth()
  return <Link className={className} href={user ? '/dashboard' : '/inscription'}>{children}</Link>
}
