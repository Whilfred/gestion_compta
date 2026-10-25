import { NextResponse } from 'next/server'
import { getUser } from '../../../lib/session'
import { loadSettings } from '../../../lib/shop'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const u = await getUser()
    if (!u) return NextResponse.json({ user: null })
    // Les réglages (thème, couleur, masquage…) sont ceux du propriétaire du compte
    const settings = await loadSettings(u.ownerId).catch(() => ({}))
    // Les objectifs ne sont visibles que par le propriétaire (ou un employé qui a accès à la vue d'ensemble)
    if (!u.isOwner && u.perms.dashboard === 'none') { delete settings.goal; delete settings.goalProfit }
    return NextResponse.json({ user: { name: u.name, email: u.email, role: u.role, isOwner: u.isOwner, perms: u.perms, settings } })
  } catch (e) {
    console.error('[me]', e)
    return NextResponse.json({ user: null })
  }
}
