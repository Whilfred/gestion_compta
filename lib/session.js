// Côté serveur uniquement (routes /app/api/*)
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { query } from './db'

export const COOKIE = 'ws_session'
const DAYS = 30

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

// Crée une session en base + pose le cookie (httpOnly)
export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000)
  await query(
    'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, sha256(token), expires]
  )
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  })
}

// Renvoie { id, name, email, role } ou null
export async function getUser() {
  const token = cookies().get(COOKIE)?.value
  if (!token) return null
  const { rows } = await query(
    `SELECT u.id, u.full_name AS name, u.email, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.is_active`,
    [sha256(token)]
  )
  return rows[0] || null
}

// Supprime la session en base + le cookie
export async function destroySession() {
  const token = cookies().get(COOKIE)?.value
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)])
  cookies().delete(COOKIE)
}
