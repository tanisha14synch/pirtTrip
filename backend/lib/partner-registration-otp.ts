import { createAndSendOtp } from '~/lib/email-otp-service'
import { partnerOtpChallengeEmail, partnerOtpChallengeEmailVariants } from '~/lib/partner-otp'
import { maskPhoneForAudit, partnerOtpAudit } from '~/lib/partner-otp-audit'
import {
  formatMobileForAdminSms,
  getPartnerRegistrationAdminNotifyPhone,
} from '~/constants/partner-registration-notify'
import {
  buildPartnerRegistrationAdminNotificationMessage,
  buildPartnerRegistrationThankYouMessage,
  hasSmsProvider,
  maskPhoneForDisplay,
  sendTransactionalSms,
  type SmsSendResult,
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

function phoneLocalDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

function matchesPhoneLocal(storedPhone: string, local: string): boolean {
  return phoneLocalDigits(storedPhone) === local
}

export async function findAllPartnerLeadsByPhone(phone: string) {
  const admin = getSupabaseAdmin()
  const local = phoneLocalDigits(phone)
  const variants = phoneLookupVariants(phone)

  const { data: exactMatches, error: exactError } = await admin
    .from('partner_leads')
    .select('id, phone, auth_user_id')
    .in('phone', variants)
    .limit(10)

  if (exactError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify phone availability',
    })
  }

  const leads = (exactMatches ?? []).filter((row) => matchesPhoneLocal(row.phone, local))

  if (leads.length > 0) {
    return leads
  }

  const { data: fuzzyMatches, error: fuzzyError } = await admin
    .from('partner_leads')
    .select('id, phone, auth_user_id')
    .ilike('phone', `%${local}`)
    .limit(20)

  if (fuzzyError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify phone availability',
    })
  }

  return (fuzzyMatches ?? []).filter((row) => matchesPhoneLocal(row.phone, local))
}

export async function findPartnerLeadByPhone(phone: string) {
  const leads = await findAllPartnerLeadsByPhone(phone)
  return leads[0] ?? null
}

/** Remove all partner rows + linked auth users for a phone so the number can register again. */
export async function purgePartnerRegistrationForPhone(phone: string) {
  const admin = getSupabaseAdmin()
  const leads = await findAllPartnerLeadsByPhone(phone)

  for (const lead of leads) {
    if (lead.auth_user_id) {
      await admin.auth.admin.deleteUser(lead.auth_user_id).catch((err) => {
        console.warn('[partner/purge] auth user cleanup failed:', err.message)
      })
    }

    const { error } = await admin.from('partner_leads').delete().eq('id', lead.id)
    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to remove existing registration for this phone',
      })
    }
  }

  await clearStalePartnerOtpSessions(phone)
  return leads.length
}

export async function assertPartnerPhoneAvailable(phone: string) {
  const existing = await findPartnerLeadByPhone(phone)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This phone number is already registered. Please contact support to register again.',
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

function logPartnerRegistrationSms(event: string, payload: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: 'partner_register_sms',
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  )
}

async function sendPartnerRegistrationSmsSafe(options: {
  label: 'customer_thank_you' | 'admin_notify'
  to: string
  message: string
  leadId?: string
}): Promise<SmsSendResult | null> {
  logPartnerRegistrationSms('request', {
    label: options.label,
    toHint: maskPhoneForDisplay(options.to),
    messageLength: options.message.length,
    leadId: options.leadId,
  })

  try {
    const result = await sendTransactionalSms({
      to: options.to,
      message: options.message,
    })
    logPartnerRegistrationSms('success', {
      label: options.label,
      toHint: maskPhoneForDisplay(options.to),
      provider: result.provider,
      providerCode: result.responseCode,
      msgId: result.msgId,
      leadId: options.leadId,
    })
    return result
  } catch (error: unknown) {
    logPartnerRegistrationSms('failed', {
      label: options.label,
      toHint: maskPhoneForDisplay(options.to),
      leadId: options.leadId,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/** Customer thank-you + admin notification SMS after successful registration. */
export async function sendPartnerRegistrationCompletionSms(options: {
  phone: string
  firstName: string
  lastName: string
  leadId?: string
}) {
  if (!hasSmsProvider()) {
    logPartnerRegistrationSms('skipped', {
      reason: 'no_sms_provider',
      phoneHint: maskPhoneForDisplay(options.phone),
      leadId: options.leadId,
    })
    return
  }

  const adminPhone = getPartnerRegistrationAdminNotifyPhone()
  const mobileNumber = formatMobileForAdminSms(options.phone)

  await Promise.all([
    sendPartnerRegistrationSmsSafe({
      label: 'customer_thank_you',
      to: options.phone,
      message: buildPartnerRegistrationThankYouMessage(),
      leadId: options.leadId,
    }),
    sendPartnerRegistrationSmsSafe({
      label: 'admin_notify',
      to: adminPhone,
      message: buildPartnerRegistrationAdminNotificationMessage({
        firstName: options.firstName.trim(),
        lastName: options.lastName.trim(),
        mobileNumber,
      }),
      leadId: options.leadId,
    }),
  ])
}

async function deliverPartnerRegistrationOtp(options: {
  data: PartnerRegistrationInput
  challengeToken?: string | null
}) {
  const phone = normalizePhone(options.data.phone)
  const inputPhone = options.data.phone.replace(/\D/g, '').slice(-10)
  const normalizedLocal = phone.replace(/\D/g, '').slice(-10)

  if (inputPhone !== normalizedLocal) {
    partnerOtpAudit('send.phone_normalization_mismatch', {
      inputPhone: maskPhoneForAudit(`+91${inputPhone}`),
      normalizedPhone: maskPhoneForAudit(phone),
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid phone number',
      data: { code: 'INVALID_PHONE' },
    })
  }

  const challengeEmail = partnerOtpChallengeEmail(phone)
  const firstName = options.data.firstName.trim()
  const lastName = options.data.lastName.trim()
  const businessName = options.data.businessName.trim()

  partnerOtpAudit('send.deliver', {
    inputPhone: maskPhoneForAudit(`+91${inputPhone}`),
    normalizedPhone: maskPhoneForAudit(phone),
    challengeEmail,
  })

  return createAndSendOtp({
    email: challengeEmail,
    purpose: 'partner_registration',
    challengeToken: options.challengeToken,
    strictSmsDelivery: true,
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

  const readyForVerify = result.smsDelivered === true && Boolean(result.challengeToken)

  partnerOtpAudit('send.api_response', {
    phone: maskPhoneForAudit(phone),
    readyForVerify,
    challengeId: 'challengeId' in result ? result.challengeId : undefined,
  })

  return {
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
    phoneMasked: maskPhoneForDisplay(phone),
    readyForVerify,
  }
}
