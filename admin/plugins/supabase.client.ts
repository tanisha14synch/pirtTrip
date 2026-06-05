import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl?.trim()
  const anonKey = config.public.supabaseAnonKey?.trim()

  if (!url || !anonKey) {
    console.warn('[admin] NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_ANON_KEY missing in admin/.env')
  }

  const supabase = createClient(
    url || 'https://placeholder.supabase.co',
    anonKey || 'placeholder',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  )
  return { provide: { supabase } }
})
