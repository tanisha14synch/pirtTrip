export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized
}

/** Include admin_2fa_verified cookie on same-origin /api proxy requests. */
export const adminFetchOptions = { credentials: 'include' as const }
