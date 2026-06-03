import { getSupabaseConfigStatus } from '../utils/supabase-config'
import { resolveApiOrigin } from '../utils/api-proxy'

export default defineEventHandler(() => {
  const supabase = getSupabaseConfigStatus()
  const apiOrigin = resolveApiOrigin()

  return {
    ok: true,
    service: 'pirt-trip-web',
    timestamp: new Date().toISOString(),
    supabase: supabase.ok
      ? 'configured'
      : {
          supabaseUrl: supabase.supabaseUrl,
          serviceRoleKey: supabase.serviceRoleKey,
        },
    apiProxy: apiOrigin || 'not set (same-origin /api only)',
    forms: supabase.ok
      ? 'handled on frontend (waitlist + partner)'
      : apiOrigin
        ? 'proxied to backend'
        : 'misconfigured',
  }
})
