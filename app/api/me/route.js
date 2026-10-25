import { NextResponse } from 'next/server'
import { getUser } from '../../../lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const u = await getUser()
    return NextResponse.json({ user: u ? { name: u.name, email: u.email, role: u.role } : null })
  } catch (e) {
    console.error('[me]', e)
    return NextResponse.json({ user: null })
  }
}
