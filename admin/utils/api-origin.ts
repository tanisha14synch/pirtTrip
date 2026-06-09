export const DEFAULT_PROD_API_URL = 'https://api.pirttrip.com'
export const DEFAULT_DEV_API_URL = 'http://127.0.0.1:3001'

export function normalizeApiOrigin(raw: string): string {
  return raw.trim().replace(/\/$/, '').replace(/\/api$/, '')
}

/** Backend origin for admin server-side /api proxy. */
export function resolveAdminApiOrigin(isProd = process.env.NODE_ENV === 'production'): string {
  const fromEnv = process.env.API_URL || process.env.NUXT_API_PROXY_ORIGIN || ''
  if (fromEnv.trim()) return normalizeApiOrigin(fromEnv)
  if (!isProd) return DEFAULT_DEV_API_URL
  return DEFAULT_PROD_API_URL
}
