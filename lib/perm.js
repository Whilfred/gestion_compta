// Côté serveur : droits d'accès par rubrique
import { NextResponse } from 'next/server'
import { getUser } from './session'
import { SECTIONS, can } from './constants'

// Vérifie la connexion + le droit sur une rubrique. Renvoie { me } ou { res } (réponse d'erreur).
export async function need(section, level = 'view') {
  const me = await getUser()
  if (!me) return { res: NextResponse.json({ error: 'Non connecté.' }, { status: 401 }) }
  if (section && !can(me.perms, section, level)) {
    return { res: NextResponse.json({ error: level === 'edit' ? 'Vous n’avez pas le droit de modifier cette rubrique.' : 'Accès refusé à cette rubrique.' }, { status: 403 }) }
  }
  return { me }
}

// Réservé au propriétaire du compte (réglages, utilisateurs, sauvegarde)
export async function ownerOnly() {
  const me = await getUser()
  if (!me) return { res: NextResponse.json({ error: 'Non connecté.' }, { status: 401 }) }
  if (!me.isOwner) return { res: NextResponse.json({ error: 'Réservé au propriétaire du compte.' }, { status: 403 }) }
  return { me }
}

// Nettoie des droits reçus du client
export function cleanPerms(p = {}) {
  const out = {}
  for (const k of Object.keys(SECTIONS)) out[k] = ['none', 'view', 'edit'].includes(p?.[k]) ? p[k] : 'none'
  out.delete = p?.delete === true
  return out
}
