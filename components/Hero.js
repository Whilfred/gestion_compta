"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Hero() {
  const router = useRouter()
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) sessionStorage.setItem('ws_goal', q.trim()) // affiché ensuite dans le dashboard
    router.push(user ? '/dashboard' : '/inscription')
  }
  return (
    <section className="hero">
      <h1>Apprenez. Progressez.<span>Atteignez vos objectifs.</span></h1>
      <form className="search" role="search" onSubmit={submit}>
        <span className="th" aria-hidden="true" /><span className="sep" aria-hidden="true" />
        <label htmlFor="q" hidden>Que souhaitez-vous apprendre ?</label>
        <input id="q" type="text" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Quel produit digital voulez-vous créer ou vendre ?" autoComplete="off" />
        <button className="go" type="submit">Commencer mon parcours
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </form>
    </section>
  )
}
