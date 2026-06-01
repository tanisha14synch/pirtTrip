export default defineEventHandler(async (event) => {
  deleteCookie(event, 'admin_2fa_verified', { path: '/' })
  return { success: true }
})
