import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SupabasePublicConfig } from '~/utils/supabase-config'
import { isSupabaseConfigured } from '~/utils/supabase-config'

async function loadSupabaseConfig(): Promise<SupabasePublicConfig> {
  try {
    return await $fetch<SupabasePublicConfig>('/api/public-config')
  } catch {
    const runtime = useRuntimeConfig()
    return {
      supabaseUrl: (runtime.public.supabaseUrl as string)?.trim() || '',
      supabaseAnonKey: (runtime.public.supabaseAnonKey as string)?.trim() || '',
    }
  }
}

export default defineNuxtPlugin(async () => {
  const config = await loadSupabaseConfig()

  if (!isSupabaseConfigured(config)) {
    console.error(
      '[admin] Supabase not configured. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY on Railway.',
    )
  }

  const supabase: SupabaseClient = createClient(
    config.supabaseUrl || 'https://placeholder.supabase.co',
    config.supabaseAnonKey || 'placeholder',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  )

  return { provide: { supabase, supabaseConfig: config } }
})
