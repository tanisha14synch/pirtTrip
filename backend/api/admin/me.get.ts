import {
  fetchAdminUserProfile,
  isAdmin2faVerified,
  requireAdmin,
} from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)

  if (!isAdmin2faVerified(event, user)) {
    return {
      needs2fa: true,
      email: user.email,
      user: null,
    }
  }

  const data = await fetchAdminUserProfile(user)

  if (!data) {
    throw createError({ statusCode: 403, statusMessage: 'Admin profile not found' })
  }

  return { needs2fa: false, user: data }
})
