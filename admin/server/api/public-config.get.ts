import { isSupabaseConfigured, resolveSupabasePublicConfig } from '~/utils/supabase-config'

export default defineEventHandler(() => {
  const config = resolveSupabasePublicConfig()
  if (!isSupabaseConfigured(config)) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Supabase is not configured on the admin service. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY on Railway.',
      data: { code: 'SUPABASE_NOT_CONFIGURED' },
    })
  }
  return config
})
