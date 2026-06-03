import { getPartnerHosts } from '~/utils/partner-hosts'
import {
  isForcedBusinessVariant,
  isPartnerHost,
} from '~/utils/site-variant'

export function useSiteVariant() {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  const partnerHosts = computed(() =>
    getPartnerHosts(config.public.partnerHosts as string | string[]),
  )

  function hostnameFromRequest(): string {
    if (!import.meta.server) return ''
    const event = useRequestEvent()
    if (event?.context?.requestHostname) {
      return String(event.context.requestHostname)
    }
    try {
      return useRequestURL().hostname
    }
    catch {
      return ''
    }
  }

  function resolveIsBusiness(): boolean {
    if (isForcedBusinessVariant(config.public.siteVariant as string)) return true

    if (import.meta.server) {
      const event = useRequestEvent()
      if (event?.context?.isPartnerHost) return true
      const host = hostnameFromRequest()
      if (host && isPartnerHost(host, partnerHosts.value)) return true
    }

    const fromPayload = nuxtApp.payload.siteVariant as { isBusiness?: boolean } | undefined
    if (typeof fromPayload?.isBusiness === 'boolean') return fromPayload.isBusiness

    if (import.meta.client) {
      return isPartnerHost(window.location.hostname, partnerHosts.value)
    }

    return false
  }

  const isBusinessSite = computed(() => resolveIsBusiness())
  const { partnerLandingUrl } = usePartnerSite()
  const partnerPagePath = computed(() =>
    isBusinessSite.value ? '/' : partnerLandingUrl.value,
  )

  return { isBusinessSite, partnerPagePath, partnerLandingUrl }
}
