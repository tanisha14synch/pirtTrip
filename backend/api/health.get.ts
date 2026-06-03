export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const hasSupabase = Boolean(
    config.public.supabaseUrl && config.supabaseServiceRoleKey,
  )

  return {
    ok: true,
    service: 'pirt-trip-api',
    timestamp: new Date().toISOString(),
    supabase: hasSupabase
      ? 'configured'
      : 'missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
  }
})
