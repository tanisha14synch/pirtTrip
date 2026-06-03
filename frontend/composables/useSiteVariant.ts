import { getRequestHost } from 'h3'
import {
  isForcedBusinessVariant,
  isPartnerHost,
  parsePartnerHosts,
} from '~/utils/site-variant'

export function useSiteVariant() {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  const partnerHosts = computed(() =>
    parsePartnerHosts(config.public.partnerHosts as string | string[]),
  )

  function resolveFromRequest(): boolean {
    if (isForcedBusinessVariant(config.public.siteVariant as string)) return true
    if (!import.meta.server) return false
    const event = useRequestEvent()
    if (event?.context?.isPartnerHost) return true
    if (!event) return false
    const host = getRequestHost(event, { xForwardedHost: true })
    return isPartnerHost(host, partnerHosts.value)
  }

  function resolveFromClient(): boolean {
    if (isForcedBusinessVariant(config.public.siteVariant as string)) return true
    const fromPayload = nuxtApp.payload.siteVariant as { isBusiness?: boolean } | undefined
    if (typeof fromPayload?.isBusiness === 'boolean') return fromPayload.isBusiness
    if (!import.meta.client) return false
    return isPartnerHost(window.location.hostname, partnerHosts.value)
  }

  const isBusinessSite = computed(() =>
    import.meta.server ? resolveFromRequest() : resolveFromClient(),
  )

  const { partnerLandingUrl } = usePartnerSite()
  const partnerPagePath = computed(() =>
    isBusinessSite.value ? '/' : partnerLandingUrl.value,
  )

  return { isBusinessSite, partnerPagePath, partnerLandingUrl }
}
