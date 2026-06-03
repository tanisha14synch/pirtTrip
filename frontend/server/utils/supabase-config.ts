/**
 * Resolve Supabase credentials at request time (Railway injects env at runtime, not always at Nuxt build).
 */
export function resolveSupabaseUrl(): string {
  const config = useRuntimeConfig()
  return (
    process.env.SUPABASE_URL
    || process.env.NUXT_PUBLIC_SUPABASE_URL
    || (config.public.supabaseUrl as string)
    || ''
  ).trim()
}

export function resolveSupabaseServiceKey(): string {
  const config = useRuntimeConfig()
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SERVICE_ROLE_KEY
    || (config.supabaseServiceRoleKey as string)
    || ''
  ).trim()
}

export function hasSupabaseServerConfig(): boolean {
  return Boolean(resolveSupabaseUrl() && resolveSupabaseServiceKey())
}

export function getSupabaseConfigStatus(): {
  ok: boolean
  supabaseUrl: boolean
  serviceRoleKey: boolean
} {
  const url = resolveSupabaseUrl()
  const key = resolveSupabaseServiceKey()
  return {
    ok: Boolean(url && key),
    supabaseUrl: Boolean(url),
    serviceRoleKey: Boolean(key),
  }
}
