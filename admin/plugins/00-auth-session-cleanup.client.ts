export default defineNuxtPlugin({
  name: 'auth-session-cleanup',
  enforce: 'pre',
  setup() {
    if (import.meta.server) return

    const { $supabase } = useNuxtApp()
    if (!$supabase?.auth) return

    $supabase.auth.getSession().catch(async () => {
      await $supabase.auth.signOut().catch(() => {})
    })
  },
})
