import { NextResponse } from 'next/server'
import { query } from '../../../../lib/db'
import { getUser } from '../../../../lib/session'

export const dynamic = 'force-dynamic'

// Ce que l'étudiant peut saisir lui-même : ses ventes, ses dépenses pub, ses autres charges.
const TABLES = { revenus: 'student_revenues', depenses: 'ad_spends', charges: 'student_expenses' }

const str = (v, n) => String(v ?? '').trim().slice(0, n) || null
const bad = (error) => NextResponse.json({ error }, { status: 400 })
// Entier > 0 (montants)
const pos = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 && n <= 2e9 ? n : null }
// Entier >= 0, vide = 0 (quantités)
const nat = (v) => { if (v === '' || v == null) return 0; const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= 1e7 ? n : null }
// Date AAAA-MM-JJ valide, entre 2020 et demain ; vide = aujourd'hui (côté SQL)
const date = (v) => {
  if (v === '' || v == null) return { ok: true, value: null }
  const d = new Date(`${v}T12:00:00Z`)
  const max = Date.now() + 36 * 3600 * 1000
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v)) && !isNaN(d) && d.getUTCFullYear() >= 2020 && d.getTime() <= max
    ? { ok: true, value: v } : { ok: false }
}

async function guard(params) {
  const me = await getUser()
  if (!me) return { res: NextResponse.json({ error: 'Non connecté.' }, { status: 401 }) }
  if (!TABLES[params.kind]) return { res: NextResponse.json({ error: 'Introuvable.' }, { status: 404 }) }
  return { me }
}

// Ajouter une saisie
export async function POST(req, { params }) {
  const g = await guard(params)
  if (g.res) return g.res
  let b
  try { b = await req.json() } catch { b = {} }
  const amount = pos(b.amount_xof)
  if (!amount) return bad('Montant invalide.')
  const when = date(b.date)
  if (!when.ok) return bad('Date invalide (pas dans le futur).')
  try {
    if (params.kind === 'revenus') {
      const units = nat(b.units)
      if (units === null) return bad('Nombre de ventes invalide.')
      await query('INSERT INTO student_revenues (user_id, amount_xof, source, units, note, earned_on) VALUES ($1,$2,$3,$4,$5,COALESCE($6::date, CURRENT_DATE))',
        [g.me.id, amount, str(b.source, 100), units, str(b.note, 500), when.value])
    } else if (params.kind === 'depenses') {
      const leads = nat(b.leads)
      if (leads === null) return bad('Nombre de prospects invalide.')
      await query('INSERT INTO ad_spends (user_id, amount_xof, platform, leads, note, spent_on) VALUES ($1,$2,$3,$4,$5,COALESCE($6::date, CURRENT_DATE))',
        [g.me.id, amount, str(b.platform, 50), leads, str(b.note, 500), when.value])
    } else {
      await query('INSERT INTO student_expenses (user_id, amount_xof, label, note, spent_on) VALUES ($1,$2,$3,$4,COALESCE($5::date, CURRENT_DATE))',
        [g.me.id, amount, str(b.label, 100), str(b.note, 500), when.value])
    }
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.error('[moi POST]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// Supprimer l'une de MES saisies : ?id=123
export async function DELETE(req, { params }) {
  const g = await guard(params)
  if (g.res) return g.res
  const rid = pos(new URL(req.url).searchParams.get('id'))
  if (!rid) return bad('Identifiant invalide.')
  try {
    await query(`DELETE FROM ${TABLES[params.kind]} WHERE id = $1 AND user_id = $2`, [rid, g.me.id])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[moi DELETE]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
