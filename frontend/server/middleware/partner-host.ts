import { getRequestURL } from 'h3'
import { getRequestURL } from 'h3'
import { getPartnerHosts } from '~/utils/partner-hosts'
import { getRequestHostname } from '~/utils/request-host'
import { isPartnerHost } from '~/utils/site-variant'
import { resolvePartnerSiteUrlFromEvent } from '~/utils/partner-site-url'

const PARTNER_ALIASES = ['/business', '/become-a-partner', '/how-it-works']

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const partnerHosts = getPartnerHosts(config.public.partnerHosts as string | string[])
  const hostname = getRequestHostname(event)
  const onPartnerHost = isPartnerHost(hostname, partnerHosts)

  event.context.isPartnerHost = onPartnerHost
  event.context.requestHostname = hostname

  const path = getRequestURL(event).pathname

  if (onPartnerHost) {
    setResponseHeader(event, 'Cache-Control', 'private, no-cache')
    setResponseHeader(event, 'Vary', 'Host')

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
