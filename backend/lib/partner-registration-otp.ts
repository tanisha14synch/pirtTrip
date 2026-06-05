import { createAndSendOtp } from '~/lib/email-otp-service'
import { partnerOtpChallengeEmail } from '~/lib/partner-otp'
import {
  buildPartnerRegistrationThankYouMessage,
  hasSmsProvider,
  maskPhoneForDisplay,
  sendTransactionalSms,
} from '~/lib/sms'
import { normalizePhone } from '~/lib/phone'
import { getSupabaseAdmin } from '~/lib/supabase'
import type { z } from 'zod'
import type { partnerRegistrationSchema } from '~/lib/validation'

type PartnerRegistrationInput = z.infer<typeof partnerRegistrationSchema>

export async function assertPartnerPhoneAvailable(phone: string) {
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
      data: { code: 'PHONE_ALREADY_REGISTERED' },
    })
  }
}

export async function logPartnerOtpSent(phone: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin.from('otp_logs').insert({
    phone,
    otp_sent_at: new Date().toISOString(),
    verified_at: null,
    attempts: 0,
    is_verified: false,
  })

  if (error) {
    console.warn('[partner/send-otp] otp_logs insert failed:', error.message)
  }
}

export async function markPartnerPhoneVerified(phone: string) {
  const admin = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { data: latest } = await admin
    .from('otp_logs')
    .select('id')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latest?.id) {
    const { error } = await admin
      .from('otp_logs')
      .update({
        verified_at: now,
        is_verified: true,
      })
      .eq('id', latest.id)

    if (error) {
      console.warn('[partner/verify-otp] otp_logs update failed:', error.message)
    }
    return
  }

  const { error } = await admin.from('otp_logs').insert({
    phone,
    otp_sent_at: now,
    verified_at: now,
    is_verified: true,
    attempts: 0,
  })

  if (error) {
    console.warn('[partner/verify-otp] otp_logs insert failed:', error.message)
  }
}

export async function sendPartnerRegistrationThankYouSms(phone: string) {
  if (!hasSmsProvider()) {
    console.info(`[partner/register] thank-you SMS skipped (no AquaSMS config) for ${phone}`)
    return
  }

  try {
    await sendTransactionalSms({
      to: phone,
      message: buildPartnerRegistrationThankYouMessage(),
    })
  } catch (error: unknown) {
    console.warn(
      '[partner/register] thank-you SMS failed:',
      error instanceof Error ? error.message : error,
    )
  }
}

export async function sendPartnerRegistrationOtp(options: {
  data: PartnerRegistrationInput
  challengeToken?: string | null
}) {
  const phone = normalizePhone(options.data.phone)
  await assertPartnerPhoneAvailable(phone)

  const challengeEmail = partnerOtpChallengeEmail(phone)
  const firstName = options.data.firstName.trim()
  const lastName = options.data.lastName.trim()
  const businessName = options.data.businessName.trim()

  const result = await createAndSendOtp({
    email: challengeEmail,
    purpose: 'partner_registration',
    challengeToken: options.challengeToken,
    metadata: {
      firstName,
      lastName,
      businessName,
      phone,
      whatsappOptIn: options.data.whatsappOptIn ?? false,
    },
    smsDelivery: {
      phone,
    },
  })

  await logPartnerOtpSent(phone)

  return {
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
    phoneMasked: maskPhoneForDisplay(phone),
    ...('debugCode' in result ? { debugCode: result.debugCode } : {}),
  }
}
