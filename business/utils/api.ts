function normalizeApiOrigin(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return trimmed.replace(/\/$/, '').replace(/\/api$/, '')
}

/**
 * Backend API base URL (standalone Nitro service on Railway or localhost:3001).
 * When empty, requests use same-origin `/api/*` (dev proxy or production server proxy).
 *
 * In the browser we default to relative `/api` so a stale build-time
 * NUXT_PUBLIC_API_URL (e.g. old Railway domain) cannot break production.
 * Set NUXT_PUBLIC_API_DIRECT=true only if you intentionally call the API host from the client.
 */
export function getApiBaseUrl(): string {
  const config = useRuntimeConfig()
  const configured = normalizeApiOrigin((config.public.apiUrl as string) || '')
  const useDirectFromClient = Boolean(config.public.apiDirect)

  if (import.meta.client && !useDirectFromClient) {
    return ''
  }

  if (configured) return configured

  // SSR / server: fall back to private proxy target (runtime API_URL on Railway).
  if (import.meta.server) {
    return normalizeApiOrigin((config.apiProxyOrigin as string) || '')
  }

  return ''
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  let normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Safety: ensure callers don't accidentally hit Nuxt routes like
  // "/waitlist/send-otp" instead of the Nitro backend API "/api/waitlist/send-otp".
  // (Some builds/environments may produce relative paths that bypass the "/api" prefix.)
  if (
    normalizedPath.startsWith('/waitlist/') ||
    normalizedPath.startsWith('/partner/') ||
    normalizedPath.startsWith('/admin/')
  ) {
    normalizedPath = `/api${normalizedPath}`
  }

  if (!base) return normalizedPath
  return `${base}${normalizedPath}`
}

export function apiFetch<T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) {
  return $fetch<T>(apiUrl(path), options)
}
