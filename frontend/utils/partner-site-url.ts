import type { H3Event } from 'h3'
import { getRequestHost, getRequestURL } from 'h3'

export const DEFAULT_DEV_PARTNER_SITE_URL = 'http://business.localhost:3000'

export function normalizePartnerSiteUrl(url: string | undefined): string {
  return (url || '').trim().replace(/\/$/, '')
}

/** Partner site origin (no trailing slash). */
export function resolvePartnerSiteUrl(
  partnerSiteUrl: string | undefined,
  isDev: boolean,
): string {
  const fromEnv = normalizePartnerSiteUrl(partnerSiteUrl)
  if (fromEnv) return fromEnv
  if (isDev) return DEFAULT_DEV_PARTNER_SITE_URL
  return ''
}

export function resolvePartnerSiteUrlFromEvent(
  partnerSiteUrl: string | undefined,
  event: H3Event,
): string {
  const fromEnv = normalizePartnerSiteUrl(partnerSiteUrl)
  if (fromEnv) return fromEnv

  const host = getRequestHost(event, { xForwardedHost: true }).toLowerCase().split(':')[0]
  if (host === 'localhost' || host === '127.0.0.1') {
    const url = getRequestURL(event)
    const port = url.port || '3000'
    return `${url.protocol}//business.localhost:${port}`
  }

  return ''
}

/** Full URL to the partner landing page (always `/` on the partner host). */
export function partnerLandingHref(
  partnerSiteUrl: string | undefined,
  isDev: boolean,
): string {
  const base = resolvePartnerSiteUrl(partnerSiteUrl, isDev)
  return base ? `${base}/` : '/business'
}
