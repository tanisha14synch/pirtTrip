/** Ensure partner host always uses upcoming layout on `/`. */
export default defineNuxtRouteMiddleware((to) => {
  const { isBusinessSite } = useSiteVariant()

  if (!isBusinessSite.value) return

  if (to.path === '/' || to.path === '') {
    setPageLayout('upcoming')
  }
})
