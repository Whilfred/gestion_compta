// Côté serveur : vérifie que l'utilisateur est admin
import { NextResponse } from 'next/server'
import { getUser } from './session'

export async function adminOr403() {
  const user = await getUser()
  if (!user) return { res: NextResponse.json({ error: 'Non connecté.' }, { status: 401 }) }
  if (user.role !== 'admin') return { res: NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 }) }
  return { user }
}

export const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s))
