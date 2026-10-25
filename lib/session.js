// Côté serveur uniquement (routes /app/api/*)
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { query } from './db'

export const COOKIE = 'ec_session'
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

// Renvoie l'utilisateur ou null.
//  ownerId : compte dont on lit les données (le commerçant lui-même, ou son patron si c'est un employé)
//  perms   : droits par rubrique (le propriétaire a tout)
export async function getUser() {
  const token = cookies().get(COOKIE)?.value
  if (!token) return null
  const { rows } = await query(
    `SELECT u.id, u.full_name AS name, u.email, u.role, u.owner_id, u.permissions
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.is_active`,
    [sha256(token)]
  )
  const u = rows[0]
  if (!u) return null
  const isOwner = !u.owner_id
  const all = { dashboard: 'edit', ventes: 'edit', produits: 'edit', clients: 'edit', publicite: 'edit', charges: 'edit', delete: true }
  return {
    id: u.id, name: u.name, email: u.email, role: u.role,
    isOwner, ownerId: u.owner_id || u.id,
    perms: isOwner ? all : { ...u.permissions },
  }
}

// Supprime la session en base + le cookie
export async function destroySession() {
  const token = cookies().get(COOKIE)?.value
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)])
  cookies().delete(COOKIE)
}
