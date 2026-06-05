import { createAndSendOtp } from '~/lib/email-otp-service'
import { partnerOtpChallengeEmail, partnerOtpChallengeEmailVariants } from '~/lib/partner-otp'
import {
  buildPartnerRegistrationThankYouMessage,
  hasSmsProvider,
  maskPhoneForDisplay,
  sendTransactionalSms,
} from '~/lib/sms'
import { resetOtpSendRateLimit } from '~/lib/otp-ip-rate-limit'
import { normalizePhone } from '~/lib/phone'
import { getSupabaseAdmin } from '~/lib/supabase'
import type { H3Event } from 'h3'
import type { z } from 'zod'
import type { partnerRegistrationSchema } from '~/lib/validation'

type PartnerRegistrationInput = z.infer<typeof partnerRegistrationSchema>

export function phoneLookupVariants(phone: string): string[] {
  const digits = phone.replace(/\D/g, '')
  const local = digits.slice(-10)
  return [...new Set([
    phone,
    `+91${local}`,
    local,
    `91${local}`,
    `+91 ${local.slice(0, 5)} ${local.slice(5)}`,
  ].filter(Boolean))]
}

export async function findPartnerLeadByPhone(phone: string) {
  const admin = getSupabaseAdmin()
  const local = phone.replace(/\D/g, '').slice(-10)
  const variants = phoneLookupVariants(phone)

  const { data: exactMatches, error: exactError } = await admin
    .from('partner_leads')
    .select('id, phone')
    .in('phone', variants)
    .limit(5)

  if (exactError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify phone availability',
    })
  }

  const exact = (exactMatches ?? []).find(
    (row) => row.phone.replace(/\D/g, '').slice(-10) === local,
  )
  if (exact) return exact

  const { data: fuzzyMatches, error: fuzzyError } = await admin
    .from('partner_leads')
    .select('id, phone')
    .ilike('phone', `%${local}`)
    .limit(10)

  if (fuzzyError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify phone availability',
    })
  }

  return (fuzzyMatches ?? []).find(
    (row) => row.phone.replace(/\D/g, '').slice(-10) === local,
  ) ?? null
}

export async function assertPartnerPhoneAvailable(phone: string) {
  const existing = await findPartnerLeadByPhone(phone)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This phone number is already registered',
      data: { code: 'PHONE_ALREADY_REGISTERED' },
    })
  }
}

export async function clearStalePartnerOtpSessions(phone: string) {
  const admin = getSupabaseAdmin()
  const local = phone.replace(/\D/g, '').slice(-10)
  const challengeEmails = partnerOtpChallengeEmailVariants(phone)
  const phoneVariants = phoneLookupVariants(phone)

  const deletes: Promise<unknown>[] = []

  for (const email of challengeEmails) {
    deletes.push(
      admin
        .from('email_otp_challenges')
        .delete()
        .eq('email', email)
        .eq('purpose', 'partner_registration'),
    )
  }

  // Catch legacy rows where email used a different digit format.
  deletes.push(
    admin
      .from('email_otp_challenges')
      .delete()
      .eq('purpose', 'partner_registration')
      .ilike('email', `partner%${local}%challenge.pirttrip.local`),
  )

  for (const variant of phoneVariants) {
    deletes.push(admin.from('phone_otps').delete().eq('phone_number', variant))
    deletes.push(admin.from('otp_logs').delete().eq('phone', variant))
  }

  await Promise.all(deletes)
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

async function deliverPartnerRegistrationOtp(options: {
  data: PartnerRegistrationInput
  challengeToken?: string | null
}) {
  const phone = normalizePhone(options.data.phone)
  const challengeEmail = partnerOtpChallengeEmail(phone)
  const firstName = options.data.firstName.trim()
  const lastName = options.data.lastName.trim()
  const businessName = options.data.businessName.trim()

  return createAndSendOtp({
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
}

export async function sendPartnerRegistrationOtp(
  event: H3Event,
  options: {
    data: PartnerRegistrationInput
    challengeToken?: string | null
    isResend?: boolean
  },
) {
  const phone = normalizePhone(options.data.phone)
  await assertPartnerPhoneAvailable(phone)

  const isResend = Boolean(options.isResend && options.challengeToken)
  let deliveryOptions = { ...options }

  if (!isResend) {
    await clearStalePartnerOtpSessions(phone)
    resetOtpSendRateLimit(event, phone)
    deliveryOptions = { ...options, challengeToken: null, isResend: false }
  }

  let result
  try {
    result = await deliverPartnerRegistrationOtp(deliveryOptions)
  } catch (error: unknown) {
    const err = error as { statusCode?: number; data?: { code?: string } }
    const retriable = err.statusCode === 429
      || err.data?.code === 'OTP_RATE_LIMITED'

    if (retriable) {
      await clearStalePartnerOtpSessions(phone)
      resetOtpSendRateLimit(event, phone)
      result = await deliverPartnerRegistrationOtp({
        ...deliveryOptions,
        challengeToken: null,
      })
    } else {
      throw error
    }
  }

  await logPartnerOtpSent(phone)

  return {
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
    phoneMasked: maskPhoneForDisplay(phone),
    ...('debugCode' in result ? { debugCode: result.debugCode } : {}),
  }
}
