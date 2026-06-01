import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

export function getSupabaseAdmin(): SupabaseClient {
  const config = useRuntimeConfig()
  const serviceKey = config.supabaseServiceRoleKey

  if (!config.public.supabaseUrl || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase service role is not configured',
    })
  }

  return createClient(config.public.supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function getSupabaseAnon(): SupabaseClient {
  const config = useRuntimeConfig()

  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured',
    })
  }

  return createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
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

export async function requireAdmin(event: H3Event): Promise<User> {
  const user = await getUserFromEvent(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  return user
}

const TWO_FA_MAX_AGE_MS = 12 * 60 * 60 * 1000

export function isAdmin2faVerified(event: H3Event, user: User): boolean {
  if (getCookie(event, 'admin_2fa_verified') === '1') {
    return true
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
