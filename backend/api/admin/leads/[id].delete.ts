import { logAdminAction } from '~/lib/admin-audit'
import { clearStalePartnerOtpSessions } from '~/lib/partner-registration-otp'

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminWith2fa(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Lead id required' })
  }

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('partner_leads')
    .select('id, first_name, last_name, phone, business_name, auth_user_id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  const displayName = `${existing.first_name} ${existing.last_name}`.trim()

  await clearStalePartnerOtpSessions(existing.phone)

  const { error } = await admin.from('partner_leads').delete().eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logAdminAction(event, {
    adminId: adminUser.id,
    action: 'VENDOR_DELETED',
    resourceType: 'partner_lead',
    resourceId: id,
    metadata: {
      name: displayName,
      phone: existing.phone,
      business_name: existing.business_name,
    },
  })

  return {
    success: true,
    message: `${displayName} has been permanently deleted from the database.`,
  }
})
