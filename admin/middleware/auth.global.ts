export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = useAdminAuth()

  try {
    await auth.initSession()
  } catch {
    auth.clearSession()
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
