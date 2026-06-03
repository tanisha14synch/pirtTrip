import { getRequestHost, getRequestURL } from 'h3'
import { isPartnerHost, parsePartnerHosts } from '~/utils/site-variant'
import { resolvePartnerSiteUrlFromEvent } from '~/utils/partner-site-url'

const PARTNER_ALIASES = ['/business', '/become-a-partner', '/how-it-works']

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const partnerHosts = parsePartnerHosts(config.public.partnerHosts as string | string[])
  const host = getRequestHost(event, { xForwardedHost: true })
  const onPartnerHost = isPartnerHost(host, partnerHosts)

  event.context.isPartnerHost = onPartnerHost

  const path = getRequestURL(event).pathname

  if (onPartnerHost) {
    if (PARTNER_ALIASES.includes(path)) {
      return sendRedirect(event, '/', 301)
    }
    return
  }

  if (!PARTNER_ALIASES.includes(path)) return

  const partnerOrigin = resolvePartnerSiteUrlFromEvent(
    config.public.partnerSiteUrl as string,
    event,
  )
  if (!partnerOrigin) return

  return sendRedirect(event, `${partnerOrigin}/`, 301)
})
