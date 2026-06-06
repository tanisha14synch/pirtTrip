import { z } from 'zod'
import { verifyEmailOtp } from '~/lib/email-otp-service'
import {
  assertPartnerPhoneAvailable,
  markPartnerPhoneVerified,
  sendPartnerRegistrationThankYouSms,
} from '~/lib/partner-registration-otp'
import { partnerOtpChallengeEmail } from '~/lib/partner-otp'
import { maskPhoneForAudit, partnerOtpAudit } from '~/lib/partner-otp-audit'
import { partnerRegistrationSchema, zodErrorMessage } from '~/lib/validation'
import { normalizePhone } from '~/lib/phone'
import { insertPartnerLead } from '~/lib/partner-lead-insert'
import { getSupabaseAdmin } from '~/lib/supabase'

const bodySchema = partnerRegistrationSchema.extend({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
  challengeToken: z.string().min(1, 'Verification session expired. Request a new code.'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error),
      data: { code: 'INVALID_REQUEST' },
    })
  }

  const phone = normalizePhone(parsed.data.phone)
  const challengeEmail = partnerOtpChallengeEmail(phone)

  partnerOtpAudit('verify.start', {
    phone: maskPhoneForAudit(phone),
    inputPhone: maskPhoneForAudit(`+91${parsed.data.phone}`),
    challengeEmail,
  })

  try {
    await verifyEmailOtp({
      email: challengeEmail,
      purpose: 'partner_registration',
      code: parsed.data.code,
      challengeToken: parsed.data.challengeToken,
    })
    partnerOtpAudit('verify.otp_valid', {
      phone: maskPhoneForAudit(phone),
      challengeEmail,
    })
  } catch (error: unknown) {
    partnerOtpAudit('verify.otp_invalid', {
      phone: maskPhoneForAudit(phone),
      challengeEmail,
      error: error instanceof Error ? error.message : 'unknown',
    })
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 400,
      statusMessage: 'Verification failed. Please check the code and try again.',
      data: { code: 'OTP_VERIFY_FAILED' },
    })
  }

  await assertPartnerPhoneAvailable(phone)

  const admin = getSupabaseAdmin()
  const email = parsed.data.email?.trim().toLowerCase() || null

  const { data: lead, error: leadError } = await insertPartnerLead(admin, {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    businessName: parsed.data.businessName,
    phone,
    email,
    whatsappOptIn: parsed.data.whatsappOptIn,
    otpVerified: true,
  })

  if (leadError || !lead) {
    const msg = leadError?.message ?? 'Failed to save registration'
    const isDuplicatePhone = leadError?.code === '23505'
      || msg.toLowerCase().includes('unique')
      || msg.toLowerCase().includes('duplicate')

    throw createError({
      statusCode: isDuplicatePhone ? 409 : 500,
      statusMessage: isDuplicatePhone
        ? 'This phone number is already registered. Please contact support to register again.'
        : msg,
      message: msg,
      data: { code: isDuplicatePhone ? 'PHONE_ALREADY_REGISTERED' : 'REGISTRATION_SAVE_FAILED' },
    })
  }

  await markPartnerPhoneVerified(phone)
  await sendPartnerRegistrationThankYouSms(phone)

  partnerOtpAudit('verify.registration_complete', {
    phone: maskPhoneForAudit(phone),
    leadId: lead.id,
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
