import type { OtpPurpose } from './otp'
import {
  generateOtpCode,
  getOtpTtlSeconds,
  OTP_LIMITS,
  verifyOtpHash,
} from './otp'
import { buildOtpEmailContent, sendTransactionalEmail } from './mailer'
import { buildPartnerOtpSmsMessage, hasSmsProvider, sendTransactionalSms } from './sms'
import {
  buildChallengePayload,
  createChallengeToken,
  getChallengeForVerification,
  markChallengeAttempt,
  markChallengeVerified,
  parseChallengeToken,
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
}) {
  const email = options.email.trim().toLowerCase()
  const deliveryEmail = (options.deliveryEmail || email).trim().toLowerCase()
  const useSms = Boolean(options.smsDelivery)

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
  const smsConsoleFallback = useSms && !smsReady
  const emailConsoleFallback = !useSms && isDev && (
    process.env.OTP_DEBUG === 'true' || !hasMailProvider
  )
  const showDevCode = smsConsoleFallback || emailConsoleFallback

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
      expiresInSeconds: getOtpTtlSeconds(),
      resendCooldownSeconds: Math.ceil(OTP_LIMITS.RESEND_COOLDOWN_MS / 1000),
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
    expiresInSeconds: getOtpTtlSeconds(),
    resendCooldownSeconds: Math.ceil(OTP_LIMITS.RESEND_COOLDOWN_MS / 1000),
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
