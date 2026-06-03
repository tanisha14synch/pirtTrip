export type SiteVariant = 'main' | 'business'

export function parsePartnerHosts(raw: string | string[] | undefined): string[] {
  if (Array.isArray(raw)) {
    return raw.map(h => h.trim().toLowerCase()).filter(Boolean)
  }
  if (!raw?.trim()) return []
  return raw.split(',').map(h => h.trim().toLowerCase()).filter(Boolean)
}

export function isPartnerHost(host: string, partnerHosts: string[]): boolean {
  const h = host.toLowerCase().split(':')[0]
  if (!h) return false
  return partnerHosts.some((ph) => h === ph || h.endsWith(`.${ph}`))
}

export function isForcedBusinessVariant(variant: string | undefined): boolean {
  return variant === 'business'
}
