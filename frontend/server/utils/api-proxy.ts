import type { H3Event } from 'h3'
import { getQuery, getRequestHeaders, readBody, setResponseStatus } from 'h3'
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

/** Partner OTP is always handled by the backend (AquaSMS + hashed OTP storage). */
export function shouldHandlePartnerOtpLocally(): boolean {
  return false
}

function buildProxyUrl(event: H3Event, origin: string): string {
  const path = event.path || '/'
  const query = getQuery(event)
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      value.forEach((entry) => search.append(key, String(entry)))
    } else {
      search.append(key, String(value))
    }
  }

  const qs = search.toString()
  return `${origin}${path}${qs ? `?${qs}` : ''}`
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

  const target = buildProxyUrl(event, origin)
  const method = event.method || 'GET'
  const headers = getRequestHeaders(event)
  const forwardHeaders: Record<string, string> = {
    accept: headers.accept || 'application/json',
  }

  if (headers['content-type']) {
    forwardHeaders['content-type'] = headers['content-type']
  }

  const hasBody = !['GET', 'HEAD'].includes(method)
  const body = hasBody ? await readBody(event) : undefined

  try {
    const response = await $fetch.raw(target, {
      method,
      headers: forwardHeaders,
      body,
      timeout: 30_000,
    })

    setResponseStatus(event, response.status)
    return response._data
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      status?: number
      statusMessage?: string
      message?: string
      data?: { statusMessage?: string; message?: string; code?: string }
      cause?: { code?: string }
    }

    const code = err.cause?.code
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
      throw createError({
        statusCode: 503,
        statusMessage: 'Backend API is not reachable. Ensure the API server is running on port 3001.',
        data: { code: 'API_PROXY_UNREACHABLE' },
      })
    }

    throw createError({
      statusCode: err.statusCode || err.status || 502,
      statusMessage:
        err.data?.statusMessage
        || err.statusMessage
        || err.data?.message
        || err.message
        || 'Backend API request failed',
      data: err.data,
    })
  }
}
