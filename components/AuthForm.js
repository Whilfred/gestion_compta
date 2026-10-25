"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { login, register, useAuth } from '../lib/auth'

export default function AuthForm({ mode }) {
  const router = useRouter()
  const signup = mode === 'inscription'
  const { ready, user } = useAuth()
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Déjà connecté : direction le dashboard
  useEffect(() => { if (ready && user) router.replace('/dashboard') }, [ready, user, router])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const f = new FormData(e.currentTarget)
    const email = f.get('email'), password = f.get('password')
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')
    if (signup && password !== f.get('confirm')) return setError('Les deux mots de passe ne sont pas identiques.')
    setLoading(true)
    const res = signup ? await register({ name: f.get('name'), email, password }) : await login({ email, password })
    setLoading(false)
    if (res.error) return setError(res.error)
    router.push('/dashboard')
  }

  return (
    <section className="first">
      <form className="auth glass" onSubmit={submit}>
        <h2>{signup ? 'Créer mon espace' : 'Se connecter'}</h2>
        <p>{signup ? 'Gratuit, en moins d’une minute.' : 'Retrouvez vos parcours et votre progression.'}</p>
        {signup && <input name="name" type="text" placeholder="Nom complet" required autoComplete="name" />}
        <input name="email" type="email" placeholder="Adresse e-mail" required autoComplete="email" />
        <div className="pw">
          <input name="password" type={show ? 'text' : 'password'} placeholder="Mot de passe (8 caractères minimum)" required autoComplete={signup ? 'new-password' : 'current-password'} />
          <button type="button" onClick={() => setShow(!show)} aria-pressed={show}>{show ? 'Masquer' : 'Afficher'}</button>
        </div>
        {signup && <input name="confirm" type={show ? 'text' : 'password'} placeholder="Confirmer le mot de passe" required autoComplete="new-password" />}
        {error && <div className="err" role="alert">{error}</div>}
        <button className="btn btn-blue" type="submit" disabled={loading}>
          {loading ? 'Veuillez patienter…' : signup ? 'S’inscrire' : 'Se connecter'}
        </button>
        <small>{signup
          ? <>Déjà inscrit ? <Link href="/connexion">Se connecter</Link></>
          : <>Pas encore de compte ? <Link href="/inscription">S’inscrire</Link></>}</small>
      </form>
    </section>
  )
}
