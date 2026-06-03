import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseAdmin(): SupabaseClient {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const serviceKey = config.supabaseServiceRoleKey as string

  if (!url || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Supabase service role is not configured. Set SUPABASE_URL, NUXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY on the frontend Railway service (server-only, not NUXT_PUBLIC).',
    })
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
