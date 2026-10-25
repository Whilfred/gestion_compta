"use client"
import { useEffect, useState } from 'react'

// Les comptes et sessions sont maintenant en base PostgreSQL (routes /api/*).
// Même interface qu'avant : register, login, logout, useAuth.
const EVT = 'ws-auth'
const notify = () => window.dispatchEvent(new Event(EVT))

async function post(url, data) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { error: json.error || 'Une erreur est survenue.' }
    return { ok: true, user: json.user }
  } catch {
    return { error: 'Impossible de joindre le serveur.' }
  }
}

export async function register({ name, email, password }) {
  const res = await post('/api/inscription', { name, email, password })
  if (res.ok) notify()
  return res
}

export async function login({ email, password }) {
  const res = await post('/api/connexion', { email, password })
  if (res.ok) notify()
  return res
}

export async function logout() {
  await post('/api/deconnexion')
  notify()
}

// Renvoie { ready, user } — ready=false tant que le serveur n'a pas répondu
export function useAuth() {
  const [state, setState] = useState({ ready: false, user: null })
  useEffect(() => {
    let alive = true
    const sync = async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' })
        const json = await res.json()
        if (alive) setState({ ready: true, user: json.user || null })
      } catch {
        if (alive) setState({ ready: true, user: null })
      }
    }
    sync()
    window.addEventListener(EVT, sync)
    return () => { alive = false; window.removeEventListener(EVT, sync) }
  }, [])
  return state
}
