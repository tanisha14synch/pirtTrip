import type { SupabaseClientOptions } from '@supabase/supabase-js'
import ws from 'ws'

function serverSupabaseRealtimeOptions(): Pick<SupabaseClientOptions, 'realtime'> | undefined {
  const major = Number(process.versions.node?.split('.')[0] ?? 0)
  if (!Number.isFinite(major) || major >= 22) {
    return undefined
  }
  return { realtime: { transport: ws } }
}

export function serverSupabaseClientOptions(
  overrides?: SupabaseClientOptions,
): SupabaseClientOptions {
  return {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...serverSupabaseRealtimeOptions(),
    ...overrides,
  }
}
