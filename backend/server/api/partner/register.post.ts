import { partnerRegistrationSchema } from '~/lib/validation'
import { normalizePhone } from '~/lib/phone'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const parsed = partnerRegistrationSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid input',
    })
  }

  const phone = normalizePhone(parsed.data.phone)
  const userPhone = user.phone ? normalizePhone(user.phone) : null

  if (userPhone && userPhone !== phone) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Phone number does not match verified session',
    })
  }

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('partner_leads')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This phone number is already registered',
    })
  }

  const { data: lead, error: leadError } = await admin
    .from('partner_leads')
    .insert({
      auth_user_id: user.id,
      first_name: parsed.data.firstName.trim(),
      last_name: parsed.data.lastName.trim(),
      phone,
      email: parsed.data.email?.trim() || null,
      otp_verified: true,
      source_page: 'become-a-partner',
      status: 'NEW',
    })
    .select()
    .single()

  if (leadError) {
    throw createError({
      statusCode: 500,
      statusMessage: leadError.message,
    })
  }

  await admin.from('otp_logs').insert({
    phone,
    auth_user_id: user.id,
    verified_at: new Date().toISOString(),
    is_verified: true,
  })

  await admin.from('lead_activity_logs').insert({
    lead_id: lead.id,
    action: 'LEAD_CREATED',
    old_value: null,
    new_value: 'NEW',
    admin_id: null,
  })

  return { success: true, lead }
})
