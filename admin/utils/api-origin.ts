export const DEFAULT_PROD_API_URL = 'https://api.pirttrip.com'
export const DEFAULT_DEV_API_URL = 'http://127.0.0.1:3001'

export function normalizeApiOrigin(raw: string): string {
  return raw.trim().replace(/\/$/, '').replace(/\/api$/, '')
}

/** True when URL points at this machine (dev-only; ignored in production). */
export function isLocalApiOrigin(raw: string): boolean {
  const normalized = normalizeApiOrigin(raw).toLowerCase()
  return normalized.includes('127.0.0.1') || normalized.includes('localhost')
}

type ResolveAdminApiOriginOptions = {
  /** Build-time value from nuxt runtimeConfig.apiProxyOrigin */
  bakedOrigin?: string
}

/**
 * Backend origin for admin /api proxy.
 * - Dev: uses API_URL from .env (default http://127.0.0.1:3001)
 * - Prod: uses API_URL only if it is not localhost; otherwise https://api.pirttrip.com
 */
export function resolveAdminApiOrigin(
  isProd = process.env.NODE_ENV === 'production',
  options: ResolveAdminApiOriginOptions = {},
): string {
  const candidates = [
    process.env.API_URL,
    process.env.NUXT_API_PROXY_ORIGIN,
    options.bakedOrigin,
  ].filter((value): value is string => Boolean(value?.trim()))

  for (const raw of candidates) {
    const normalized = normalizeApiOrigin(raw)
    if (!normalized) continue
    if (isProd && isLocalApiOrigin(normalized)) continue
    return normalized
  }

  return isProd ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL
}
