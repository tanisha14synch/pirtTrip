import { partnerRegistrationSchema } from '~/utils/validation'
import { normalizePhone } from '~/utils/phone'
import { proxyApiToBackend, shouldHandleWithLocalSupabase } from '../../utils/api-proxy'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { insertPartnerLead } from '../../utils/partner-lead-insert'
import { logPartnerRegistrationSideEffects } from '../../utils/partner-registration-logs'

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

  const { data: lead, error: leadError } = await insertPartnerLead(admin, {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    businessName: parsed.data.businessName,
    phone,
    email,
    whatsappOptIn: parsed.data.whatsappOptIn,
  })

  if (leadError || !lead) {
    const msg = leadError?.message ?? 'Failed to save registration'
    const hint = msg.toLowerCase().includes('business_name')
      ? ' Run supabase/QUICK_FIX_partner_business_name.sql in Supabase SQL Editor.'
      : ''
    throw createError({
      statusCode: 500,
      statusMessage: `${msg}${hint}`,
      message: `${msg}${hint}`,
    })
  }

  await logPartnerRegistrationSideEffects(admin, lead.id, phone)

  return { success: true, lead }
})
