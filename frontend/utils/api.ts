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
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!base) return normalizedPath
  return `${base}${normalizedPath}`
}

export function apiFetch<T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) {
  return $fetch<T>(apiUrl(path), options)
}
