import { partnerRegistrationSchema } from '~/utils/validation'
import { normalizePhone } from '~/utils/phone'
import { proxyApiToBackend, shouldHandleWithLocalSupabase } from '../../utils/api-proxy'
import { getSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
  if (!shouldHandleWithLocalSupabase()) {
    return proxyApiToBackend(event)
  }

  const body = await readBody(event)
  const parsed = partnerRegistrationSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid input',
    })
  }

  let phone: string
  try {
    phone = normalizePhone(parsed.data.phone)
  }
  catch (e: unknown) {
    throw createError({
      statusCode: 400,
      statusMessage: e instanceof Error ? e.message : 'Invalid phone number',
    })
  }

  const email = parsed.data.email?.trim().toLowerCase() || null
  const notes = parsed.data.whatsappOptIn ? 'WhatsApp updates: opted in' : null
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
    const msg = leadError.message.includes('partner_leads')
      ? 'Partner table missing: run supabase/migrations/20250601000001_initial_schema.sql in Supabase SQL Editor.'
      : leadError.message
    throw createError({ statusCode: 500, statusMessage: msg })
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
