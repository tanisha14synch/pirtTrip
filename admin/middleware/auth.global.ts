export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = useAdminAuth()

  try {
    await auth.initSession()
  } catch {
    auth.accessToken.value = null
    auth.adminUser.value = null
  }

  const isLogin = to.path === '/login'

  if (isLogin) {
    if (auth.isAuthenticated.value) {
      return navigateTo('/vendors')
    }
    return
  }

  if (!auth.isAuthenticated.value) {
    return navigateTo('/login')
  }
})
