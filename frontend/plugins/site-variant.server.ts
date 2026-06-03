import { getPartnerHosts } from '~/utils/partner-hosts'
import { getRequestHostname } from '~/utils/request-host'
import { isForcedBusinessVariant, isPartnerHost } from '~/utils/site-variant'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const event = useRequestEvent()
  const partnerHosts = getPartnerHosts(config.public.partnerHosts as string | string[])

  let isBusiness = isForcedBusinessVariant(config.public.siteVariant as string)

  if (!isBusiness && event) {
    if (event.context.isPartnerHost) {
      isBusiness = true
    }
    else {
      const hostname = getRequestHostname(event)
      isBusiness = isPartnerHost(hostname, partnerHosts)
    }
  }

  nuxtApp.payload.siteVariant = { isBusiness }
})
