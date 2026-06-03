import { partnerLandingHref, resolvePartnerSiteUrl } from '~/utils/partner-site-url'

export function usePartnerSite() {
  const config = useRuntimeConfig()

  const partnerSiteOrigin = computed(() =>
    resolvePartnerSiteUrl(config.public.partnerSiteUrl as string, import.meta.dev),
  )

  const partnerLandingUrl = computed(() =>
    partnerLandingHref(config.public.partnerSiteUrl as string, import.meta.dev),
  )

  return { partnerSiteOrigin, partnerLandingUrl }
}
