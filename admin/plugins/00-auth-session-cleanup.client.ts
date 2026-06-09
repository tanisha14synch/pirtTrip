import { clearAdminSession, loadAdminSession } from '~/utils/admin-session'

export default defineNuxtPlugin({
  name: 'auth-session-cleanup',
  enforce: 'pre',
  setup() {
    if (import.meta.server) return

    const stored = loadAdminSession()
    if (!stored?.accessToken || !stored?.user?.id) {
      clearAdminSession()
    }
  },
})
