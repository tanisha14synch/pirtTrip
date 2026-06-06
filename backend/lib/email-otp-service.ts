import type { OtpPurpose } from './otp'
import {
  generateOtpCode,
  getOtpLimits,
  getOtpTtlSeconds,
  getResendCooldownSeconds,
  OTP_LIMITS,
  verifyOtpHash,
} from './otp'
import { buildOtpEmailContent, sendTransactionalEmail } from './mailer'
import { buildPartnerOtpSmsMessage, hasSmsProvider, partnerOtpDeliveryErrorMessage, sendTransactionalSms } from './sms'
import { maskOtpForAudit, maskPhoneForAudit, partnerOtpAudit } from './partner-otp-audit'
import {
  buildChallengePayload,
  createChallengeToken,
  getChallengeForVerification,
  markChallengeAttempt,
  markChallengeVerified,
  parseChallengeToken,
  deleteOtpChallenge,
  upsertOtpChallenge,
  validateResendForEmail,
} from './otp-challenge-token'

const PURPOSE_LABELS: Record<OtpPurpose, string> = {
  waitlist: 'waitlist registration',
  admin_login: 'admin sign-in',
  partner_registration: 'partner registration',
}

function otpLog(event: string, payload: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: 'otp',
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  )
}

export async function createAndSendOtp(options: {
  email: string
  purpose: OtpPurpose
  challengeToken?: string | null
  metadata?: Record<string, unknown>
  deliveryEmail?: string
  buildMailContent?: (code: string) => { subject: string; html: string; text: string }
  smsDelivery?: {
    phone: string
    buildMessage?: (code: string) => string
  }
  /** Partner OTP: SMS must succeed before a challenge is created; never use console fallback. */
  strictSmsDelivery?: boolean
}) {
  const email = options.email.trim().toLowerCase()
  const deliveryEmail = (options.deliveryEmail || email).trim().toLowerCase()
  const useSms = Boolean(options.smsDelivery)
  const strictSms = Boolean(options.strictSmsDelivery && useSms)

  const resendCheck = await validateResendForEmail({
    email,
    purpose: options.purpose,
    existingToken: options.challengeToken,
  })
  if (!resendCheck.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: resendCheck.reason || 'Resend not allowed yet.',
      data: { code: 'OTP_RATE_LIMITED', waitSeconds: resendCheck.waitSeconds },
    })
  }

  const resendCount = resendCheck.resendCount + (resendCheck.challenge ? 1 : 0)
  const code = generateOtpCode()
  const mail = options.buildMailContent
    ? options.buildMailContent(code)
    : buildOtpEmailContent(code, PURPOSE_LABELS[options.purpose])
  const smsMessage = options.smsDelivery
    ? (options.smsDelivery.buildMessage?.(code) ?? buildPartnerOtpSmsMessage(code))
    : ''

  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV !== 'production'
  const hasMailProvider =
    Boolean(config.resendApiKey) || Boolean(config.smtpHost && config.smtpUser && config.smtpPass)
  const smsReady = useSms ? hasSmsProvider() : false
  const smsConsoleFallback = !strictSms && useSms && !smsReady
  const emailConsoleFallback = !strictSms && !useSms && isDev && (
    process.env.OTP_DEBUG === 'true' || !hasMailProvider
  )
  const showDevCode = smsConsoleFallback || emailConsoleFallback

  if (strictSms) {
    if (!smsReady) {
      partnerOtpAudit('send.sms_provider_missing', {
        purpose: options.purpose,
        phone: maskPhoneForAudit(options.smsDelivery!.phone),
      })
      throw createError({
        statusCode: 502,
        statusMessage: partnerOtpDeliveryErrorMessage(),
        data: { code: 'OTP_SMS_PROVIDER_MISSING' },
      })
    }

    const smsPhone = options.smsDelivery!.phone
    if (!smsMessage.includes(code)) {
      partnerOtpAudit('send.message_code_mismatch', {
        purpose: options.purpose,
        phone: maskPhoneForAudit(smsPhone),
        otp: maskOtpForAudit(code),
      })
      throw createError({
        statusCode: 500,
        statusMessage: partnerOtpDeliveryErrorMessage(),
        data: { code: 'OTP_MESSAGE_BUILD_FAILED' },
      })
    }

    partnerOtpAudit('send.start', {
      purpose: options.purpose,
      phone: maskPhoneForAudit(smsPhone),
      otp: maskOtpForAudit(code),
      challengeEmail: email,
    })

    let challenge
    try {
      challenge = await upsertOtpChallenge({
        challengeId: resendCheck.challenge?.id || null,
        email,
        purpose: options.purpose,
        code,
        resendCount,
        metadata: options.metadata,
      })
    } catch (dbError: unknown) {
      partnerOtpAudit('send.db_save_failed', {
        purpose: options.purpose,
        phone: maskPhoneForAudit(smsPhone),
        otp: maskOtpForAudit(code),
        error: dbError instanceof Error ? dbError.message : 'unknown',
      })
      throw dbError
    }

    partnerOtpAudit('send.db_saved', {
      purpose: options.purpose,
      phone: maskPhoneForAudit(smsPhone),
      otp: maskOtpForAudit(code),
      challengeId: challenge.id,
      expiresAt: challenge.expires_at,
    })

    const startedAt = Date.now()
    try {
      const smsResult = await sendTransactionalSms({
        to: smsPhone,
        message: smsMessage,
      })

      partnerOtpAudit('send.sms_success', {
        purpose: options.purpose,
        phone: maskPhoneForAudit(smsPhone),
        otp: maskOtpForAudit(code),
        challengeId: challenge.id,
        provider: smsResult.provider,
        providerCode: smsResult.responseCode,
        msgId: smsResult.msgId,
        smsNumber: smsResult.numberSent,
        latencyMs: Date.now() - startedAt,
      })
    } catch (deliveryError: unknown) {
      await deleteOtpChallenge(challenge.id).catch(() => {})
      partnerOtpAudit('send.sms_failed', {
        purpose: options.purpose,
        phone: maskPhoneForAudit(smsPhone),
        otp: maskOtpForAudit(code),
        challengeId: challenge.id,
        error: deliveryError instanceof Error ? deliveryError.message : 'unknown',
        latencyMs: Date.now() - startedAt,
      })
      throw deliveryError
    }

    const challengeToken = createChallengeToken(
      buildChallengePayload({
        id: challenge.id,
        email,
        purpose: options.purpose,
        expiresAt: challenge.expires_at,
      }),
    )

    partnerOtpAudit('send.complete', {
      purpose: options.purpose,
      phone: maskPhoneForAudit(smsPhone),
      challengeId: challenge.id,
      otpStored: true,
      smsDelivered: true,
    })

    return {
      challengeToken,
      expiresInSeconds: getOtpTtlSeconds(options.purpose),
      resendCooldownSeconds: getResendCooldownSeconds(options.purpose),
      smsDelivered: true as const,
      challengeId: challenge.id,
    }
  }

  const challenge = await upsertOtpChallenge({
    challengeId: resendCheck.challenge?.id || null,
    email,
    purpose: options.purpose,
    code,
    resendCount,
    metadata: options.metadata,
  })
  const payload = buildChallengePayload({
    id: challenge.id,
    email,
    purpose: options.purpose,
    expiresAt: challenge.expires_at,
  })
  const challengeToken = createChallengeToken(payload)

  // Without AquaSMS credentials, log OTP to server console and continue verification.
  if (showDevCode) {
    otpLog('send.dev_fallback', {
      purpose: options.purpose,
      channel: useSms ? 'sms' : 'email',
      targetHint: useSms
        ? `${options.smsDelivery!.phone.slice(0, 4)}***`
        : `${email.slice(0, 2)}***`,
      challengeId: challenge.id,
    })
    const devTarget = useSms ? options.smsDelivery!.phone : email
    console.info(`[OTP] ${options.purpose} code for ${devTarget}: ${code}`)
    return {
      challengeToken,
      expiresInSeconds: getOtpTtlSeconds(options.purpose),
      resendCooldownSeconds: getResendCooldownSeconds(options.purpose),
      debugCode: code,
    }
  }

  try {
    const startedAt = Date.now()
    if (useSms) {
      await sendTransactionalSms({
        to: options.smsDelivery!.phone,
        message: smsMessage,
      })
    } else {
      await sendTransactionalEmail({
        to: deliveryEmail,
        ...mail,
      })
    }
    otpLog('send.success', {
      purpose: options.purpose,
      channel: useSms ? 'sms' : 'email',
      challengeId: challenge.id,
      latencyMs: Date.now() - startedAt,
    })
  } catch (deliveryError) {
    if (smsConsoleFallback || emailConsoleFallback) {
      const devTarget = useSms ? options.smsDelivery!.phone : email
      console.warn(`[OTP] Delivery failed for ${devTarget}. Console code: ${code}`)
      otpLog('send.provider_failed_dev_mode', {
        purpose: options.purpose,
        channel: useSms ? 'sms' : 'email',
        challengeId: challenge.id,
        message: (deliveryError as Error)?.message || 'unknown',
      })
    } else {
      await deleteOtpChallenge(challenge.id).catch(() => {})
      otpLog('send.provider_failed', {
        purpose: options.purpose,
        channel: useSms ? 'sms' : 'email',
        challengeId: challenge.id,
        message: (deliveryError as Error)?.message || 'unknown',
      })
      throw deliveryError
    }
  }

  return {
    challengeToken,
    expiresInSeconds: getOtpTtlSeconds(options.purpose),
    resendCooldownSeconds: getResendCooldownSeconds(options.purpose),
    ...(showDevCode ? { debugCode: code } : {}),
  }
}

export async function verifyEmailOtp(options: {
  email: string
  purpose: OtpPurpose
  code: string
  challengeToken: string
}) {
  const email = options.email.trim().toLowerCase()
  const challenge = await getChallengeForVerification({
    challengeToken: options.challengeToken,
    email,
    purpose: options.purpose,
  })

  if (challenge.verified_at) {
    otpLog('verify.replay_attempt', {
      purpose: options.purpose,
      challengeId: challenge.id,
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'This code has already been used. Request a new code.',
      data: { code: 'OTP_ALREADY_USED' },
    })
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    otpLog('verify.expired', {
      purpose: options.purpose,
      challengeId: challenge.id,
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification code has expired. Please request a new code.',
      data: { code: 'OTP_EXPIRED' },
    })
  }

  if ((challenge.attempts ?? 0) >= (challenge.max_attempts ?? OTP_LIMITS.MAX_VERIFY_ATTEMPTS)) {
    otpLog('verify.locked_out', {
      purpose: options.purpose,
      challengeId: challenge.id,
      attempts: challenge.attempts,
    })
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many failed attempts. Please request a new code.',
      data: { code: 'OTP_TOO_MANY_ATTEMPTS' },
    })
  }

  const isValid = verifyOtpHash(options.code, email, options.purpose, challenge.code_hash)

  if (!isValid) {
    const nextAttempts = await markChallengeAttempt(challenge.id)
    const remaining = OTP_LIMITS.MAX_VERIFY_ATTEMPTS - nextAttempts
    otpLog('verify.invalid_code', {
      purpose: options.purpose,
      challengeId: challenge.id,
      attempts: nextAttempts,
      remainingAttempts: Math.max(remaining, 0),
    })
    throw createError({
      statusCode: 400,
      statusMessage:
        remaining > 0
          ? `Invalid code. ${remaining} attempt(s) remaining.`
          : 'Invalid code. Please request a new code.',
      data: { code: 'OTP_INVALID', remainingAttempts: Math.max(remaining, 0) },
    })
  }

  await markChallengeVerified(challenge.id)
  otpLog('verify.success', {
    purpose: options.purpose,
    challengeId: challenge.id,
  })
  return parseChallengeToken(options.challengeToken)
}
