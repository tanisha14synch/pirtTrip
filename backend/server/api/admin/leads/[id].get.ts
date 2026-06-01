export default defineEventHandler(async (event) => {
  await requireAdminWith2fa(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Lead id required' })
  }

  const admin = getSupabaseAdmin()

  const { data: lead, error } = await admin
    .from('partner_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  const { data: activity } = await admin
    .from('lead_activity_logs')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  const { data: otpLogs } = await admin
    .from('otp_logs')
    .select('*')
    .eq('phone', lead.phone)
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    lead,
    activity: activity ?? [],
    otpLogs: otpLogs ?? [],
  }
})
