#!/usr/bin/env node
/** @deprecated Use: npm run db:migrate (runs backend/scripts) */
import { spawn } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const script = resolve(dirname(fileURLToPath(import.meta.url)), '../backend/scripts/run-supabase-migrations.mjs')
const child = spawn(process.execPath, [script], { stdio: 'inherit' })
child.on('exit', (code) => process.exit(code ?? 1))
