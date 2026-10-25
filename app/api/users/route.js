import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { cleanPerms, ownerOnly } from '../../../lib/perm'
import { isUuid } from '../../../lib/admin'

export const dynamic = 'force-dynamic'
const bad = (error, status = 400) => NextResponse.json({ error }, { status })

// Gestion des employés (réservé au propriétaire). Chaque employé voit les données du propriétaire,
// dans la limite des droits donnés rubrique par rubrique.
export async function GET() {
  const g = await ownerOnly()
  if (g.res) return g.res
  const { rows } = await query(
    `SELECT id, full_name AS name, email, phone, is_active AS active, permissions AS perms, created_at
       FROM users WHERE owner_id = $1 ORDER BY created_at`, [g.me.id])
  return NextResponse.json({ rows: rows.map((u) => ({ ...u, perms: cleanPerms(u.perms) })) })
}

export async function POST(req) {
  const g = await ownerOnly()
  if (g.res) return g.res
  let b
  try { b = await req.json() } catch { b = {} }
  const name = String(b.name || '').trim()
  const email = String(b.email || '').trim().toLowerCase()
  const password = String(b.password || '')
  if (!name || name.length > 120) return bad('Nom invalide.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return bad('Adresse e-mail invalide.')
  if (password.length < 8 || password.length > 72) return bad('Le mot de passe doit contenir entre 8 et 72 caractères.')
  try {
    const hash = await bcrypt.hash(password, 10)
    await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, owner_id, permissions)
       VALUES ($1, $2, $3, $4, 'staff', $5, $6)`,
      [name, email, String(b.phone || '').trim().slice(0, 30) || null, hash, g.me.id, JSON.stringify(cleanPerms(b.perms))])
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    if (e.code === '23505') return bad('Un compte existe déjà avec cet e-mail.', 409)
    console.error('[users POST]', e)
    return bad('Erreur serveur.', 500)
  }
}

// ?id=<uuid> — { name, active, perms, password } (champs facultatifs)
export async function PATCH(req) {
  const g = await ownerOnly()
  if (g.res) return g.res
  const id = new URL(req.url).searchParams.get('id')
  if (!isUuid(id)) return bad('Identifiant invalide.')
  let b
  try { b = await req.json() } catch { b = {} }
  const sets = [], vals = []
  const push = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`) }
  if (b.name !== undefined) { const v = String(b.name).trim(); if (!v || v.length > 120) return bad('Nom invalide.'); push('full_name', v) }
  if (b.active !== undefined) push('is_active', !!b.active)
  if (b.perms !== undefined) push('permissions', JSON.stringify(cleanPerms(b.perms)))
  if (b.password) {
    if (String(b.password).length < 8 || String(b.password).length > 72) return bad('Le mot de passe doit contenir entre 8 et 72 caractères.')
    push('password_hash', await bcrypt.hash(String(b.password), 10))
  }
  if (!sets.length) return bad('Rien à modifier.')
  vals.push(id, g.me.id)
  const r = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${vals.length - 1} AND owner_id = $${vals.length}`, vals)
  if (!r.rowCount) return bad('Utilisateur introuvable.', 404)
  // Désactivation ou nouveau mot de passe : on coupe ses sessions ouvertes
  if (b.active === false || b.password) await query('DELETE FROM sessions WHERE user_id = $1', [id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(req) {
  const g = await ownerOnly()
  if (g.res) return g.res
  const id = new URL(req.url).searchParams.get('id')
  if (!isUuid(id)) return bad('Identifiant invalide.')
  const r = await query('DELETE FROM users WHERE id = $1 AND owner_id = $2', [id, g.me.id])
  if (!r.rowCount) return bad('Utilisateur introuvable.', 404)
  return NextResponse.json({ ok: true })
}
