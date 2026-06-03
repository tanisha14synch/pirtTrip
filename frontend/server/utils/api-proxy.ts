import type { H3Event } from 'h3'
import { proxyRequest } from 'h3'
import { hasSupabaseServerConfig } from './supabase-config'

export function resolveApiOrigin(): string {
  const config = useRuntimeConfig()
  const isProd = process.env.NODE_ENV === 'production'
  return (
    process.env.API_URL
    || process.env.NUXT_API_PROXY_ORIGIN
    || (config.apiProxyOrigin as string)
    || (!isProd ? 'http://127.0.0.1:3001' : '')
  )
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/, '')
}

export function shouldHandleWithLocalSupabase(): boolean {
  return hasSupabaseServerConfig()
}

export async function proxyApiToBackend(event: H3Event) {
  const origin = resolveApiOrigin()
  if (!origin) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'API is not configured. Set API_URL on the frontend service, or set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to handle forms on this service.',
    })
  }
  return proxyRequest(event, `${origin}${event.path}`)
}
