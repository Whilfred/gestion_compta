import { NextResponse } from 'next/server'
import { query } from '../../../../../../lib/db'
import { adminOr403, isUuid } from '../../../../../../lib/admin'

export const dynamic = 'force-dynamic'

const int = (v, max = 2e9) => { const n = Number(v); return Number.isInteger(n) && n > 0 && n < max ? n : null }
const str = (v, n) => String(v ?? '').trim().slice(0, n) || null
const date = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? v : null)
const ts = (v) => { const d = new Date(v); return isNaN(d) ? null : d.toISOString() }
const bad = (error) => NextResponse.json({ error }, { status: 400 })

const TABLES = { revenus: 'student_revenues', depenses: 'ad_spends', calls: 'calls' }
const STATUS = ['prevu', 'fait', 'annule', 'absent']

async function guard(params) {
  const { res } = await adminOr403()
  if (res) return { res }
  if (!isUuid(params.id) || !TABLES[params.kind]) return { res: NextResponse.json({ error: 'Introuvable.' }, { status: 404 }) }
  return {}
}

// Ajouter un revenu, une dépense pub ou un call
export async function POST(req, { params }) {
  const g = await guard(params)
  if (g.res) return g.res
  let b
  try { b = await req.json() } catch { b = {} }
  const { id, kind } = params
  try {
    if (kind === 'revenus') {
      const amount = int(b.amount_xof)
      if (!amount) return bad('Montant invalide.')
      await query('INSERT INTO student_revenues (user_id, amount_xof, source, note, earned_on) VALUES ($1,$2,$3,$4,COALESCE($5, CURRENT_DATE))',
        [id, amount, str(b.source, 100), str(b.note, 500), date(b.earned_on)])
    } else if (kind === 'depenses') {
      const amount = int(b.amount_xof)
      if (!amount) return bad('Montant invalide.')
      await query('INSERT INTO ad_spends (user_id, amount_xof, platform, note, spent_on) VALUES ($1,$2,$3,$4,COALESCE($5, CURRENT_DATE))',
        [id, amount, str(b.platform, 50), str(b.note, 500), date(b.spent_on)])
    } else {
      const when = ts(b.scheduled_at)
      if (!when) return bad('Date du call invalide.')
      await query('INSERT INTO calls (user_id, scheduled_at, duration_minutes, topic, meeting_url, notes) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, when, int(b.duration_minutes, 600) || 30, str(b.topic, 200), str(b.meeting_url, 500), str(b.notes, 2000)])
    }
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.error('[admin POST]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// Supprimer : ?id=123
export async function DELETE(req, { params }) {
  const g = await guard(params)
  if (g.res) return g.res
  const rid = int(new URL(req.url).searchParams.get('id'))
  if (!rid) return bad('Identifiant invalide.')
  try {
    await query(`DELETE FROM ${TABLES[params.kind]} WHERE id = $1 AND user_id = $2`, [rid, params.id])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin DELETE]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// Changer le statut d'un call : { id, status, notes? }
export async function PATCH(req, { params }) {
  const g = await guard(params)
  if (g.res) return g.res
  if (params.kind !== 'calls') return bad('Non supporté.')
  let b
  try { b = await req.json() } catch { b = {} }
  const rid = int(b.id)
  if (!rid || !STATUS.includes(b.status)) return bad('Données invalides.')
  try {
    await query('UPDATE calls SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 AND user_id = $4',
      [b.status, b.notes === undefined ? null : str(b.notes, 2000), rid, params.id])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin PATCH]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
