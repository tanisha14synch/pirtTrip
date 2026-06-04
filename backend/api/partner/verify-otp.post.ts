import { z } from 'zod'
import { verifyEmailOtp } from '~/lib/email-otp-service'
import { partnerRegistrationSchema } from '~/lib/validation'
import { normalizePhone } from '~/lib/phone'
import { insertPartnerLead } from '~/lib/partner-lead-insert'

const bodySchema = partnerRegistrationSchema.extend({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
  challengeToken: z.string().min(1, 'Verification session expired. Request a new code.'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid request',
    })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const phone = normalizePhone(parsed.data.phone)

  await verifyEmailOtp({
    email,
    purpose: 'partner_registration',
    code: parsed.data.code,
    challengeToken: parsed.data.challengeToken,
  })

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
    otpVerified: true,
  })

  if (leadError || !lead) {
    const msg = leadError?.message ?? 'Failed to save registration'
    throw createError({
      statusCode: 500,
      statusMessage: msg,
      message: msg,
    })
  }

  await admin.from('otp_logs').insert({
    phone,
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
