export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)

  if (!isAdmin2faVerified(event, user)) {
    return {
      needs2fa: true,
      email: user.email,
      user: null,
    }
  }

  const admin = getSupabaseAdmin()

  const { data, error } = await admin
    .from('admin_users')
    .select('id, full_name, email, role, created_at')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 403, statusMessage: 'Admin profile not found' })
  }

  return { needs2fa: false, user: data }
})
