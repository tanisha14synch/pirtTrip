import type { H3Event } from 'h3'
import { getQuery, getRequestHeaders, readBody, setResponseStatus } from 'h3'
import { normalizeApiOrigin, resolveAdminApiOrigin } from '~/utils/api-origin'

export function resolveApiOrigin(): string {
  const config = useRuntimeConfig()
  const isProd = process.env.NODE_ENV === 'production'
  const fromEnv = process.env.API_URL || process.env.NUXT_API_PROXY_ORIGIN || ''
  if (fromEnv.trim()) return normalizeApiOrigin(fromEnv)
  const bakedOrigin = (config.apiProxyOrigin as string)?.trim()
  if (bakedOrigin) return normalizeApiOrigin(bakedOrigin)
  return resolveAdminApiOrigin(isProd)
}

function buildProxyUrl(event: H3Event, origin: string): string {
  const path = event.path || '/'
  const query = getQuery(event)
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) value.forEach((v) => search.append(key, String(v)))
    else search.append(key, String(value))
  }
  const qs = search.toString()
  return `${origin}${path}${qs ? `?${qs}` : ''}`
}

export async function proxyApiToBackend(event: H3Event) {
  const origin = resolveApiOrigin()
  if (!origin) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API_URL is not configured on the admin service.',
    })
  }

  const target = buildProxyUrl(event, origin)
  const method = event.method || 'GET'
  const headers = getRequestHeaders(event)
  const forwardHeaders: Record<string, string> = {
    accept: headers.accept || 'application/json',
  }
  if (headers['content-type']) forwardHeaders['content-type'] = headers['content-type']
  if (headers.authorization) forwardHeaders.authorization = headers.authorization
  if (headers.cookie) forwardHeaders.cookie = headers.cookie

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
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      appendResponseHeader(event, 'set-cookie', setCookie)
    }
    return response._data
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      status?: number
      statusMessage?: string
      message?: string
      data?: {
        statusMessage?: string
        message?: string
        data?: Record<string, unknown>
        code?: string
        waitSeconds?: number
      }
    }
    const body = err.data
    const statusMessage =
      body?.statusMessage
      || body?.message
      || err.statusMessage
      || err.message
      || 'Backend API request failed'
    const payload = body?.data ?? (body?.code || body?.waitSeconds
      ? { code: body.code, waitSeconds: body.waitSeconds, ...body?.data }
      : body)
    throw createError({
      statusCode: err.statusCode || err.status || 502,
      statusMessage,
      data: payload,
    })
  }
}
