import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import { serverSupabaseClientOptions } from './supabase-server-options'

function resolveBackendSupabaseUrl(): string {
  const config = useRuntimeConfig()
  return (
    process.env.SUPABASE_URL
    || process.env.NUXT_PUBLIC_SUPABASE_URL
    || config.public.supabaseUrl
    || ''
  ).trim()
}

function resolveBackendServiceKey(): string {
  const config = useRuntimeConfig()
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SERVICE_ROLE_KEY
    || config.supabaseServiceRoleKey
    || ''
  ).trim()
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = resolveBackendSupabaseUrl()
  const serviceKey = resolveBackendServiceKey()

  if (!url || !serviceKey) {
    const missing = [
      !url && 'SUPABASE_URL',
      !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean).join(', ')
    throw createError({
      statusCode: 500,
      statusMessage: `Supabase is not configured (${missing}). Set on Railway backend Variables and redeploy.`,
    })
  }

  return createClient(url, serviceKey, serverSupabaseClientOptions())
}

function resolveBackendAnonKey(): string {
  const config = useRuntimeConfig()
  return (
    process.env.SUPABASE_ANON_KEY
    || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    || config.public.supabaseAnonKey
    || ''
  ).trim()
}

export function getSupabaseAnon(): SupabaseClient {
  const url = resolveBackendSupabaseUrl()
  const anonKey = resolveBackendAnonKey()

  if (!url || !anonKey) {
    const missing = [
      !url && 'SUPABASE_URL',
      !anonKey && 'SUPABASE_ANON_KEY',
    ].filter(Boolean).join(', ')
    throw createError({
      statusCode: 500,
      statusMessage: `Supabase is not configured (${missing}). Set on Railway backend Variables and redeploy.`,
    })
  }

  return createClient(url, anonKey, serverSupabaseClientOptions())
}

export async function getUserFromEvent(event: H3Event): Promise<User | null> {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return null
  }

  const supabase = getSupabaseAnon()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return null
  }

  return data.user
}

type AdminProfileRow = {
  id: string
  full_name: string
  email: string
  role: string
  phone?: string | null
  created_at: string
}

function isMissingPhoneColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || Boolean(error.message?.includes('phone'))
}

export async function fetchAdminUserProfile(user: User): Promise<AdminProfileRow | null> {
  const admin = getSupabaseAdmin()
  const withPhone = 'id, full_name, email, role, phone, created_at'
  const base = 'id, full_name, email, role, created_at'

  async function byColumn(column: 'id' | 'email', value: string) {
    let result = await admin.from('admin_users').select(withPhone).eq(column, value).maybeSingle()
    if (isMissingPhoneColumn(result.error)) {
      result = await admin.from('admin_users').select(base).eq(column, value).maybeSingle()
    }
    return result
  }

  let result = await byColumn('id', user.id)
  if (!result.data && user.email) {
    result = await byColumn('email', user.email.toLowerCase())
  }

  if (result.error && !result.data) {
    return null
  }

  return result.data as AdminProfileRow | null
}

export async function requireAdmin(event: H3Event): Promise<User> {
  const user = await getUserFromEvent(event)

  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const admin = getSupabaseAdmin()
  let { data, error } = await admin
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!data && user.email) {
    const byEmail = await admin
      .from('admin_users')
      .select('id, role')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()
    data = byEmail.data
    error = byEmail.error
  }

  if (error || !data) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  return user
}

const TWO_FA_MAX_AGE_MS = 12 * 60 * 60 * 1000

export function isAdmin2faVerified(event: H3Event, user: User): boolean {
  const cookieValue = getCookie(event, 'admin_2fa_verified')
  if (cookieValue) {
    const [cookieUserId, cookieTs] = cookieValue.split(':')
    const issuedAt = Number(cookieTs)
    if (
      cookieUserId === user.id
      && Number.isFinite(issuedAt)
      && Date.now() - issuedAt >= 0
      && Date.now() - issuedAt < TWO_FA_MAX_AGE_MS
    ) {
      return true
    }
  }

  const verifiedAt = user.app_metadata?.email_2fa_verified_at
  if (typeof verifiedAt === 'string') {
    const age = Date.now() - new Date(verifiedAt).getTime()
    return age >= 0 && age < TWO_FA_MAX_AGE_MS
  }

  return false
}

export async function requireAdminWith2fa(event: H3Event): Promise<User> {
  const user = await requireAdmin(event)

  if (!isAdmin2faVerified(event, user)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'EMAIL_2FA_REQUIRED',
    })
  }

  return user
}

export async function requireAuth(event: H3Event): Promise<User> {
  const user = await getUserFromEvent(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return user
}
