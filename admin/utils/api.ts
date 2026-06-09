export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized
}

/** Include admin_2fa_verified cookie on same-origin /api proxy requests. */
export const adminFetchOptions = { credentials: 'include' as const }

/** Drop empty filter params so the proxy does not duplicate bare query keys. */
export function compactQuery<T extends Record<string, unknown>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>
}
