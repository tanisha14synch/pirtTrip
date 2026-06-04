import { partnerRegistrationSchema } from '~/lib/validation'
import { normalizePhone } from '~/lib/phone'
import { getSupabaseAdmin } from '~/lib/supabase'
import { insertPartnerLead } from '~/lib/partner-lead-insert'
import { logPartnerRegistrationSideEffects } from '~/lib/partner-registration-logs'

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

  const email = parsed.data.email?.trim().toLowerCase() || null

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
    throw createError({
      statusCode: 500,
      statusMessage: msg,
      message: msg,
    })
  }

  await logPartnerRegistrationSideEffects(admin, lead.id, phone)

  return { success: true, lead }
})
