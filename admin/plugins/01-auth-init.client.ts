export default defineNuxtPlugin({
  name: 'auth-init',
  enforce: 'pre',
  async setup() {
    const auth = useAdminAuth()
    await auth.initSession()
  },
})
