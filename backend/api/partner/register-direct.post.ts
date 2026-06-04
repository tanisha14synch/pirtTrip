import { partnerRegistrationSchema } from '~/lib/validation'
import { normalizePhone } from '~/lib/phone'
import { getSupabaseAdmin } from '~/lib/supabase'

/** Temporary: register partner without OTP (re-enable OTP flow when email is configured). */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = partnerRegistrationSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid input',
    })
  }

  const email = parsed.data.email?.trim().toLowerCase() || null
  const businessName = parsed.data.businessName.trim()
  const notes = parsed.data.whatsappOptIn ? 'WhatsApp updates: opted in' : null
  const phone = normalizePhone(parsed.data.phone)
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
      first_name: parsed.data.firstName.trim(),
      last_name: parsed.data.lastName.trim(),
      business_name: businessName,
      phone,
      email,
      notes,
      otp_verified: false,
      source_page: 'become-a-partner',
      status: 'NEW',
    })
    .select()
    .single()

  if (leadError) {
    throw createError({ statusCode: 500, statusMessage: leadError.message })
  }

  await admin.from('otp_logs').insert({
    phone,
    verified_at: null,
    is_verified: false,
  }).catch(() => {})

  await admin.from('lead_activity_logs').insert({
    lead_id: lead.id,
    action: 'LEAD_CREATED',
    old_value: null,
    new_value: 'NEW',
    admin_id: null,
  }).catch(() => {})

  return { success: true, lead }
})
