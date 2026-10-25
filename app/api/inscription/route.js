import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { createSession } from '../../../lib/session'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  let body
  try { body = await req.json() } catch { body = {} }
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!name || name.length > 120) return NextResponse.json({ error: 'Nom invalide.' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 })
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir entre 8 et 72 caractères.' }, { status: 400 })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name AS name, email, role`,
      [name, email, passwordHash]
    )
    await createSession(rows[0].id)
    return NextResponse.json({ user: { name: rows[0].name, email: rows[0].email } }, { status: 201 })
  } catch (e) {
    if (e.code === '23505') {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail. Connectez-vous.' }, { status: 409 })
    }
    console.error('[inscription]', e)
    return NextResponse.json({ error: 'Erreur serveur. Réessayez dans un instant.' }, { status: 500 })
  }
}
