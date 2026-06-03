import { getRequestHost } from 'h3'
import { isForcedBusinessVariant, isPartnerHost, parsePartnerHosts } from '~/utils/site-variant'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const event = useRequestEvent()
  const partnerHosts = parsePartnerHosts(config.public.partnerHosts as string | string[])

  let isBusiness = isForcedBusinessVariant(config.public.siteVariant as string)
  if (!isBusiness && event) {
    if (event.context.isPartnerHost) {
      isBusiness = true
    }
    else {
      const host = getRequestHost(event, { xForwardedHost: true })
      isBusiness = isPartnerHost(host, partnerHosts)
    }
  }

  nuxtApp.payload.siteVariant = { isBusiness }
})
