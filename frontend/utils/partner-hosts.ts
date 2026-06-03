import { parsePartnerHosts } from '~/utils/site-variant'

/** Always honored even if runtime config is empty. */
export const BUILTIN_PARTNER_HOSTS = [
  'business.pirttrip.com',
  'business.localhost',
] as const

export function getPartnerHosts(raw: string | string[] | undefined): string[] {
  const fromConfig = parsePartnerHosts(raw)
  return [...new Set([...BUILTIN_PARTNER_HOSTS, ...fromConfig])]
}
