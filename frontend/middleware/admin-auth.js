export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = useAuth()
  await auth.initSession()

  if (to.path === '/admin/login') {
    if (auth.isAdmin.value) {
      return navigateTo('/admin')
    }
    if (auth.needsAdmin2fa.value) {
      return
    }
    return
  }

  if (!auth.isAuthenticated.value) {
    return navigateTo('/admin/login')
  }

  if (auth.needsAdmin2fa.value) {
    return navigateTo('/admin/login')
  }

  if (!auth.isAdmin.value) {
    await auth.signOut()
    return navigateTo('/admin/login')
  }
})
