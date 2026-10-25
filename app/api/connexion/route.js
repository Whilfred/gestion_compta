import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { createSession } from '../../../lib/session'

export const dynamic = 'force-dynamic'

// Hash factice : évite de révéler (par le temps de réponse) si l'e-mail existe
const DUMMY = bcrypt.hashSync('dummy-password', 10)

export async function POST(req) {
  let body
  try { body = await req.json() } catch { body = {} }
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  try {
    const { rows } = await query(
      'SELECT id, full_name, email, password_hash, is_active FROM users WHERE email = $1',
      [email]
    )
    const u = rows[0]
    const ok = await bcrypt.compare(password, u ? u.password_hash : DUMMY)
    if (!u || !ok || !u.is_active) {
      return NextResponse.json({ error: 'E-mail ou mot de passe incorrect.' }, { status: 401 })
    }
    await createSession(u.id)
    return NextResponse.json({ user: { name: u.full_name, email: u.email } })
  } catch (e) {
    console.error('[connexion]', e)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez dans un instant.' }, { status: 500 })
  }
}
