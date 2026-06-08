#!/usr/bin/env node
/**
 * Run Supabase migrations via direct PostgreSQL connection.
 * Requires SUPABASE_DB_PASSWORD in backend/.env
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const backendRoot = resolve(__dirname, '..')
const repoRoot = resolve(backendRoot, '..')
const require = createRequire(resolve(backendRoot, 'package.json'))
const pg = require('pg')

function loadEnv() {
  for (const envPath of [
    resolve(backendRoot, '.env'),
  ]) {
    if (!existsSync(envPath)) continue
    const env = {}
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
    }
    return env
  }
  console.error('Missing backend/.env')
  process.exit(1)
}

const env = loadEnv()
const projectRef = env.SUPABASE_PROJECT_REF || process.env.SUPABASE_PROJECT_REF || 'fvkwophzzyaukacuiszv'
const password = env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD
const accessToken = env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN

async function runViaManagementApi(sql, fileLabel) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    },
  )
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.message || body.error || res.statusText)
  }
  console.log(`  ✓ ${fileLabel} (Management API)`)
}

if (!password && !accessToken) {
  console.error(`
ERROR: Need one of these in backend/.env:

  SUPABASE_DB_PASSWORD=your_database_password
  OR
  SUPABASE_ACCESS_TOKEN=your_personal_access_token
`)
  process.exit(1)
}

const encodedPassword = encodeURIComponent(password)

function getConnectionCandidates() {
  if (env.SUPABASE_DB_URL) return [env.SUPABASE_DB_URL]

  return [
    `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  ]
}

const migrationFiles = [
  'supabase/migrations/20250601000001_initial_schema.sql',
  'supabase/migrations/20250601000002_rls_policies.sql',
  'supabase/migrations/20250601000003_waitlist.sql',
  'supabase/migrations/20250601000004_email_otp.sql',
  'supabase/migrations/20250601000005_partner_business_name.sql',
  'supabase/migrations/20250601000006_phone_otps.sql',
  'supabase/migrations/20250601000007_admin_panel.sql',
]

async function verifyTables(client) {
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'partner_leads', 'otp_logs', 'admin_users', 'lead_activity_logs',
        'waitlist_subscribers', 'email_otp_challenges', 'phone_otps'
      )
    ORDER BY table_name
  `)
  console.log('\nTables:', rows.map((r) => r.table_name).join(', ') || '(none)')
}

async function main() {
  if (accessToken && !password) {
    console.log('Running migrations via Supabase Management API...')
    for (const file of migrationFiles) {
      const sql = readFileSync(resolve(backendRoot, file), 'utf8')
      console.log(`Running ${file}...`)
      await runViaManagementApi(sql, file)
    }
    console.log('\nDone.')
    return
  }

  const candidates = getConnectionCandidates()
  let client
  let lastError

  for (const connectionString of candidates) {
    const masked = connectionString.replace(encodedPassword, '***')
    try {
      client = new pg.Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
      })
      await client.connect()
      console.log(`Connected via ${masked.split('@')[1] || 'database'}`)
      break
    } catch (err) {
      lastError = err
      console.warn(`  ✗ Could not connect: ${masked.split('@')[1] || 'host'} — ${err.message}`)
      await client?.end().catch(() => {})
      client = undefined
    }
  }

  if (!client) {
    throw lastError || new Error('Could not connect to database')
  }

  try {
    for (const file of migrationFiles) {
      const path = resolve(backendRoot, file)
      const sql = readFileSync(path, 'utf8')
      console.log(`Running ${file}...`)
      await client.query(sql)
      console.log(`  ✓ ${file}`)
    }

    await verifyTables(client)
    console.log('\nDone.')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message)
  process.exit(1)
})
