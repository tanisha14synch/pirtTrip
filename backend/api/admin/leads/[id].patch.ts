import { logAdminAction } from '~/lib/admin-audit'
import { getSupabaseAdmin, requireAdminWith2fa } from '~/lib/supabase'
import { leadUpdateSchema, zodErrorMessage } from '~/lib/validation'

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminWith2fa(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Lead id required' })
  }

  const body = await readBody(event)
  const parsed = leadUpdateSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error, 'Invalid input'),
    })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.status !== undefined) updates.status = parsed.data.status
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No updates provided' })
  }

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('partner_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  const { data: lead, error } = await admin
    .from('partner_leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await admin.from('lead_activity_logs').insert({
      lead_id: id,
      action: 'STATUS_CHANGED',
      old_value: existing.status,
      new_value: parsed.data.status,
      admin_id: adminUser.id,
    })
  }

  if (parsed.data.notes !== undefined && parsed.data.notes !== existing.notes) {
    await admin.from('lead_activity_logs').insert({
      lead_id: id,
      action: 'NOTES_UPDATED',
      old_value: existing.notes,
      new_value: parsed.data.notes,
      admin_id: adminUser.id,
    })
  }

  await logAdminAction(event, {
    adminId: adminUser.id,
    action: 'VENDOR_UPDATED',
    resourceType: 'partner_lead',
    resourceId: id,
    metadata: { updates },
  })

  return { success: true, lead }
})
