import { mainSiteHomeHref, resolveMainSiteUrl } from '~/utils/main-site-url'

export function useMainSite() {
  const config = useRuntimeConfig()
  const { isBusinessSite } = useSiteVariant()

  const mainSiteOrigin = computed(() =>
    resolveMainSiteUrl(config.public.mainSiteUrl as string, import.meta.dev),
  )

  const homeHref = computed(() =>
    mainSiteHomeHref(
      config.public.mainSiteUrl as string,
      import.meta.dev,
      isBusinessSite.value,
    ),
  )

  const homeIsExternal = computed(() => homeHref.value.startsWith('http'))

  return { mainSiteOrigin, homeHref, homeIsExternal }
}
