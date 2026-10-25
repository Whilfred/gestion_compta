const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
pool.query('SELECT slug, title FROM formations ORDER BY position')
  .then(r => { console.log(r.rows); pool.end() })
  .catch(e => { console.error(e.message); pool.end() })
