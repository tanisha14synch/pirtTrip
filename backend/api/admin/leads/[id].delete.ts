export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminWith2fa(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Lead id required' })
  }

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('partner_leads')
    .select('id, first_name, last_name')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  await admin.from('lead_activity_logs').insert({
    lead_id: id,
    action: 'LEAD_DELETED',
    old_value: `${existing.first_name} ${existing.last_name}`,
    new_value: null,
    admin_id: adminUser.id,
  })

  const { error } = await admin.from('partner_leads').delete().eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
