export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized
}
