import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { buildPartnerLeadsCsv, fetchAllPartnerLeadsForExport, parseCsvPreview } from './partner-leads-csv'
import { getOtpSigningSecret } from './runtime-env'
import { getSupabaseAdmin } from './supabase'

export type CsvShareRow = {
  id: string
  token: string
  password_hash: string
  csv_content: string | null
  row_count: number
  label: string | null
  created_by: string | null
  expires_at: string | null
  view_count: number
  download_count: number
  revoked_at: string | null
  created_at: string
}

export type CsvShareAccessPayload = {
  shareId: string
  token: string
}

function getSecret(): string {
  const secret = getOtpSigningSecret()
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Share token secret is not configured',
      data: { code: 'SHARE_SECRET_MISSING' },
    })
  }
  return secret
}

export function generateShareToken(): string {
  return randomBytes(24).toString('base64url')
}

export function hashSharePassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifySharePassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const computed = scryptSync(password, salt, 64).toString('hex')
  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'))
  } catch {
    return false
  }
}

function signPayload(encoded: string): string {
  return createHmac('sha256', getSecret()).update(encoded).digest('base64url')
}

export function createCsvShareAccessToken(payload: CsvShareAccessPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${signPayload(encoded)}`
}

export function parseCsvShareAccessToken(token: string): CsvShareAccessPayload {
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid access session',
      data: { code: 'SHARE_ACCESS_INVALID' },
    })
  }

  const expected = signPayload(encoded)
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new Error('bad signature')
    }
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid access session',
      data: { code: 'SHARE_ACCESS_INVALID' },
    })
  }

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as CsvShareAccessPayload
  if (!payload.shareId || !payload.token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid access session',
      data: { code: 'SHARE_ACCESS_INVALID' },
    })
  }

  return payload
}

export function createCsvShareAccessPayload(share: Pick<CsvShareRow, 'id' | 'token'>): CsvShareAccessPayload {
  return {
    shareId: share.id,
    token: share.token,
  }
}

export async function fetchLiveShareExport(includePreview = false) {
  const leads = await fetchAllPartnerLeadsForExport()
  const { csv, rowCount } = buildPartnerLeadsCsv(leads)
  const preview = includePreview ? parseCsvPreview(csv) : null
  return { csv, rowCount, preview }
}

export async function getCsvShareByToken(token: string): Promise<CsvShareRow | null> {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('admin_csv_shares')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01' || error.message?.includes('admin_csv_shares')) {
      throw createError({
        statusCode: 503,
        statusMessage: 'CSV share is not available. Run database migrations.',
        data: { code: 'SHARE_TABLE_MISSING' },
      })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data as CsvShareRow | null
}

export function assertCsvShareActive(share: CsvShareRow) {
  if (share.revoked_at) {
    throw createError({
      statusCode: 410,
      statusMessage: 'This share link has been revoked.',
      data: { code: 'SHARE_REVOKED' },
    })
  }
}

export async function incrementCsvShareView(shareId: string) {
  const admin = getSupabaseAdmin()
  const { data } = await admin.from('admin_csv_shares').select('view_count').eq('id', shareId).single()
  await admin
    .from('admin_csv_shares')
    .update({ view_count: (data?.view_count ?? 0) + 1 })
    .eq('id', shareId)
}

export async function incrementCsvShareDownload(shareId: string) {
  const admin = getSupabaseAdmin()
  const { data } = await admin.from('admin_csv_shares').select('download_count').eq('id', shareId).single()
  await admin
    .from('admin_csv_shares')
    .update({ download_count: (data?.download_count ?? 0) + 1 })
    .eq('id', shareId)
}
