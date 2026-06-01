/**
 * API base URL for the standalone backend.
 * Leave empty in dev to use Nuxt proxy (/api → localhost:3001).
 */
export function apiUrl(path: string): string {
  const config = useRuntimeConfig()
  const base = (config.public.apiBase as string) || ''
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!base) return normalizedPath
  return `${base.replace(/\/$/, '')}${normalizedPath}`
}

export function apiFetch<T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) {
  return $fetch<T>(apiUrl(path), options)
}
