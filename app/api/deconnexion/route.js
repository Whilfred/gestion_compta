import { NextResponse } from 'next/server'
import { destroySession } from '../../../lib/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  try { await destroySession() } catch (e) { console.error('[deconnexion]', e) }
  return NextResponse.json({ ok: true })
}
