/**
 * Backend API base URL (standalone Nitro service on Railway or localhost:3001).
 * When empty in dev, Nuxt proxies /api → backend (see nuxt.config nitro.devProxy).
 */
export function getApiBaseUrl(): string {
  const config = useRuntimeConfig()
  return (config.public.apiUrl as string)?.replace(/\/$/, '') || ''
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
