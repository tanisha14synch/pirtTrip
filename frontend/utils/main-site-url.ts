import { DEV_FRONTEND_URL } from '../constants/dev-ports'

export const DEFAULT_DEV_MAIN_SITE_URL = DEV_FRONTEND_URL
export const DEFAULT_PROD_MAIN_SITE_URL = 'https://pirttrip.com'

export function normalizeMainSiteUrl(url: string | undefined): string {
  return (url || '').trim().replace(/\/$/, '')
}

export function resolveMainSiteUrl(
  mainSiteUrl: string | undefined,
  isDev: boolean,
): string {
  const fromEnv = normalizeMainSiteUrl(mainSiteUrl)
  if (fromEnv) return fromEnv
  return isDev ? DEFAULT_DEV_MAIN_SITE_URL : DEFAULT_PROD_MAIN_SITE_URL
}

export function mainSiteHomeHref(
  mainSiteUrl: string | undefined,
  isDev: boolean,
  onPartnerHost: boolean,
): string {
  if (!onPartnerHost) return '/'
  return `${resolveMainSiteUrl(mainSiteUrl, isDev)}/`
}
