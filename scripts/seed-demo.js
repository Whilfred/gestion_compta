// Données de démonstration : node scripts/seed-demo.js [email] [mot_de_passe]
// Nécessite DATABASE_URL dans l'environnement (ex. : export DATABASE_URL=postgresql://...)
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const email = (process.argv[2] || 'demo@compta-ecom.test').toLowerCase()
const password = process.argv[3] || 'demo12345'
const raw = process.env.DATABASE_URL || ''
const local = /localhost|127\.0\.0\.1/.test(raw)
const pool = new Pool({
  connectionString: raw.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, ''),
  ssl: local ? false : { rejectUnauthorized: false },
})

// Générateur pseudo-aléatoire déterministe
let seed = 42
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (a) => a[Math.floor(rnd() * a.length)]
const iso = (back) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - back); return d.toISOString().slice(0, 10) }

;(async () => {
  const hash = await bcrypt.hash(password, 10)
  const u = await pool.query(
    `INSERT INTO users (full_name, email, password_hash) VALUES ('Compte Démo', $1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = $2 RETURNING id`, [email, hash])
  const uid = u.rows[0].id
  await pool.query('DELETE FROM sales WHERE user_id = $1', [uid])
  await pool.query('DELETE FROM ad_spends WHERE user_id = $1', [uid])
  await pool.query('DELETE FROM expenses WHERE user_id = $1', [uid])
  await pool.query('DELETE FROM products WHERE user_id = $1', [uid])
  await pool.query(`INSERT INTO shops (user_id, name, goal_monthly_xof) VALUES ($1, 'Boutique Démo', 3000000)
                    ON CONFLICT (user_id) DO UPDATE SET name = 'Boutique Démo', goal_monthly_xof = 3000000`, [uid])

  const catalog = [
    ['Robe wax taille M', 'ROBE-M', 6000, 15000, 40],
    ['Sac à main cuir', 'SAC-01', 9000, 22000, 25],
    ['Montre connectée', 'MONT-01', 12000, 28000, 3],
    ['Écouteurs Bluetooth', 'ECOU-01', 4500, 12000, 60],
    ['Parfum 50 ml', 'PARF-50', 7000, 18000, 0],
  ]
  const prods = []
  for (const [name, sku, cost, price, stock] of catalog) {
    const r = await pool.query('INSERT INTO products (user_id, name, sku, cost_xof, price_xof, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [uid, name, sku, cost, price, stock])
    prods.push({ id: r.rows[0].id, name, cost, price })
  }

  const sources = ['Facebook', 'Facebook', 'TikTok', 'WhatsApp', 'WhatsApp', 'WhatsApp', 'Instagram', 'Boutique', 'Bouche-à-oreille']
  const platforms = ['Facebook', 'TikTok', 'Instagram']
  for (let back = 34; back >= 0; back--) {
    const date = iso(back)
    const n = 4 + Math.floor(rnd() * 9) + (back < 7 ? 2 : 0)
    for (let i = 0; i < n; i++) {
      const p = pick(prods), qty = rnd() < 0.2 ? 2 : 1
      const r = rnd()
      const status = back === 0 && r < 0.3 ? 'en_attente' : r > 0.95 ? 'retour' : 'livree'
      await pool.query(
        `INSERT INTO sales (user_id, product_id, product_name, quantity, unit_price_xof, unit_cost_xof, source, status, sold_on)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [uid, p.id, p.name, qty, p.price, p.cost, pick(sources), status, date])
    }
    for (const pf of platforms) {
      if (rnd() < 0.8) await pool.query('INSERT INTO ad_spends (user_id, platform, amount_xof, leads, spent_on) VALUES ($1,$2,$3,$4,$5)',
        [uid, pf, 3000 + Math.floor(rnd() * 12) * 1000, 5 + Math.floor(rnd() * 25), date])
    }
    if (rnd() < 0.7) await pool.query('INSERT INTO expenses (user_id, category, label, amount_xof, spent_on) VALUES ($1,$2,$3,$4,$5)',
      [uid, 'Livraison', 'Livreur moto', 2000 + Math.floor(rnd() * 8) * 500, date])
    if (back % 30 === 5) await pool.query('INSERT INTO expenses (user_id, category, label, amount_xof, spent_on) VALUES ($1,$2,$3,$4,$5)',
      [uid, 'Loyer', 'Local', 75000, date])
  }
  console.log(`Démo prête : ${email} / ${password}`)
  await pool.end()
})().catch((e) => { console.error(e); process.exit(1) })
