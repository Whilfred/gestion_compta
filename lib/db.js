// À placer dans /lib/db.js
import { Pool } from 'pg'

const globalForPg = globalThis

const raw = process.env.DATABASE_URL || ''
const isLocal = /localhost|127\.0\.0\.1/.test(raw)

const connectionString = raw.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '')

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  })

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool

export const query = (text, params) => pool.query(text, params)
