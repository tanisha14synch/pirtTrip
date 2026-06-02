import type { OtpPurpose } from './otp'
import {
  generateOtpCode,
  getOtpTtlSeconds,
  OTP_LIMITS,
  verifyOtpHash,
} from './otp'
import { buildOtpEmailContent, sendTransactionalEmail } from './mailer'
import {
  buildChallengePayload,
  clearAttemptCount,
  createChallengeToken,
  getAttemptCount,
  incrementAttemptCount,
  parseChallengeToken,
  validateResendFromToken,
} from './otp-challenge-token'

const PURPOSE_LABELS: Record<OtpPurpose, string> = {
  waitlist: 'waitlist registration',
  admin_login: 'admin sign-in',
  partner_registration: 'partner registration',
}

export async function createAndSendOtp(options: {
  email: string
  purpose: OtpPurpose
  challengeToken?: string | null
  metadata?: Record<string, unknown>
}) {
  const email = options.email.trim().toLowerCase()

  const resendCheck = validateResendFromToken(options.challengeToken)
  if (!resendCheck.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: resendCheck.reason || 'Resend not allowed yet',
      data: { waitSeconds: resendCheck.waitSeconds },
    })
  }

  const resendCount = resendCheck.resendCount + (options.challengeToken ? 1 : 0)
  const code = generateOtpCode()

  const payload = buildChallengePayload({
    email,
    purpose: options.purpose,
    code: code,
    resendCount,
    metadata: options.metadata,
  })

  const challengeToken = createChallengeToken(payload)
  const mail = buildOtpEmailContent(code, PURPOSE_LABELS[options.purpose])

  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV === 'development'
  const showDevCode = isDev && (process.env.OTP_DEBUG === 'true' || !config.resendApiKey)

  try {
    await sendTransactionalEmail({
      to: email,
      ...mail,
    })
  } catch (mailError) {
    if (showDevCode) {
      console.warn(`[OTP] Email delivery failed for ${email}. Dev code: ${code}`)
    } else {
      throw mailError
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
  const payload = parseChallengeToken(options.challengeToken)

  if (payload.email !== email || payload.purpose !== options.purpose) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification session does not match this email',
    })
  }

  if (payload.exp < Date.now()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification code has expired. Please request a new code.',
    })
  }

  const attempts = getAttemptCount(email, options.purpose)
  if (attempts >= OTP_LIMITS.MAX_VERIFY_ATTEMPTS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many failed attempts. Please request a new code.',
    })
  }

  const isValid = verifyOtpHash(options.code, email, options.purpose, payload.codeHash)

  if (!isValid) {
    const nextAttempts = incrementAttemptCount(email, options.purpose)
    const remaining = OTP_LIMITS.MAX_VERIFY_ATTEMPTS - nextAttempts
    throw createError({
      statusCode: 400,
      statusMessage:
        remaining > 0
          ? `Invalid code. ${remaining} attempt(s) remaining.`
          : 'Invalid code. Please request a new code.',
    })
  }

  clearAttemptCount(email, options.purpose)
  return payload
}
