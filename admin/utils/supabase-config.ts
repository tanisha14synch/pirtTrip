export const DEFAULT_PROD_SUPABASE_URL = 'https://fvkwophzzyaukacuiszv.supabase.co'

export type SupabasePublicConfig = {
  supabaseUrl: string
  supabaseAnonKey: string
}

export function resolveSupabasePublicConfig(): SupabasePublicConfig {
  const url = (
    process.env.NUXT_PUBLIC_SUPABASE_URL
    || process.env.SUPABASE_URL
    || DEFAULT_PROD_SUPABASE_URL
  ).trim().replace(/\/$/, '')

  const anonKey = (
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY
    || ''
  ).trim()

  return { supabaseUrl: url, supabaseAnonKey: anonKey }
}

export function isSupabaseConfigured(config: SupabasePublicConfig): boolean {
  return Boolean(
    config.supabaseUrl
    && config.supabaseAnonKey
    && !config.supabaseUrl.includes('placeholder')
    && config.supabaseAnonKey !== 'placeholder',
  )
}
