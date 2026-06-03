import type { H3Event } from 'h3'
import { getRequestHeader, getRequestHost, getRequestURL } from 'h3'

/** Best-effort hostname (Cloudflare / Railway proxies). */
export function getRequestHostname(event: H3Event): string {
  const candidates = [
    getRequestHeader(event, 'x-forwarded-host'),
    getRequestHeader(event, 'x-original-host'),
    getRequestHost(event, { xForwardedHost: true }),
    getRequestURL(event).hostname,
    getRequestHeader(event, 'host'),
  ]

  for (const raw of candidates) {
    if (!raw?.trim()) continue
    const host = raw.split(',')[0].trim().toLowerCase().split(':')[0]
    if (host) return host
  }

  return ''
}
