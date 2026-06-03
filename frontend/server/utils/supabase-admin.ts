import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  getSupabaseConfigStatus,
  resolveSupabaseServiceKey,
  resolveSupabaseUrl,
} from './supabase-config'

export function getSupabaseAdmin(): SupabaseClient {
  const url = resolveSupabaseUrl()
  const serviceKey = resolveSupabaseServiceKey()

  if (!url || !serviceKey) {
    const status = getSupabaseConfigStatus()
    const missing = [
      !status.supabaseUrl && 'SUPABASE_URL or NUXT_PUBLIC_SUPABASE_URL',
      !status.serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean).join(', ')

    throw createError({
      statusCode: 500,
      statusMessage: `Supabase is not configured (${missing}). Add these on the Railway frontend service Variables, then redeploy.`,
    })
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
