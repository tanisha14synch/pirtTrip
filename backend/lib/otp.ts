import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { getOtpSigningSecret } from './runtime-env'

const OTP_LENGTH = 6
const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes (default)
const RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds (default)
const ADMIN_OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes — matches AquaSMS template text
const ADMIN_RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds between resends on OTP step
const PARTNER_OTP_WINDOW_MS = 10 * 60 * 1000 // 10 minutes — expiry and resend use the same window
const MAX_RESENDS_PER_WINDOW = 5
const RESEND_WINDOW_MS = 15 * 60 * 1000
const MAX_VERIFY_ATTEMPTS = 5

export type OtpPurpose = 'waitlist' | 'admin_login' | 'partner_registration'

export type OtpPurposeLimits = {
  ttlMs: number
  resendCooldownMs: number
}

const OTP_LIMITS_BY_PURPOSE: Record<OtpPurpose, OtpPurposeLimits> = {
  waitlist: { ttlMs: OTP_TTL_MS, resendCooldownMs: RESEND_COOLDOWN_MS },
  admin_login: { ttlMs: ADMIN_OTP_TTL_MS, resendCooldownMs: ADMIN_RESEND_COOLDOWN_MS },
  partner_registration: {
    ttlMs: PARTNER_OTP_WINDOW_MS,
    resendCooldownMs: PARTNER_OTP_WINDOW_MS,
  },
}

export function getOtpLimits(purpose: OtpPurpose): OtpPurposeLimits {
  return OTP_LIMITS_BY_PURPOSE[purpose]
}

function getOtpSecret(): string {
  const secret = getOtpSigningSecret()
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'OTP secret is not configured. Set OTP_SECRET (or SUPABASE_SERVICE_ROLE_KEY) on the Railway backend service.',
      data: { code: 'OTP_SECRET_MISSING' },
    })
  }
  return secret
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, '0')
}

export function hashOtpCode(code: string, email: string, purpose: OtpPurpose): string {
  return createHmac('sha256', getOtpSecret())
    .update(`${purpose}:${email.toLowerCase()}:${code}`)
    .digest('hex')
}

export function verifyOtpHash(
  code: string,
  email: string,
  purpose: OtpPurpose,
  storedHash: string,
): boolean {
  const computed = hashOtpCode(code, email, purpose)
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash))
  } catch {
    return false
  }
}

export function getOtpExpiryDate(purpose?: OtpPurpose): Date {
  const ttlMs = purpose ? getOtpLimits(purpose).ttlMs : OTP_TTL_MS
  return new Date(Date.now() + ttlMs)
}

export function getOtpTtlSeconds(purpose?: OtpPurpose): number {
  const ttlMs = purpose ? getOtpLimits(purpose).ttlMs : OTP_TTL_MS
  return Math.floor(ttlMs / 1000)
}

export function getResendCooldownSeconds(purpose: OtpPurpose): number {
  return Math.ceil(getOtpLimits(purpose).resendCooldownMs / 1000)
}

export function canResendOtp(
  lastSentAt: string,
  resendCount: number,
  resendCooldownMs: number = RESEND_COOLDOWN_MS,
): {
  allowed: boolean
  waitSeconds: number
  reason?: string
} {
  const lastSent = new Date(lastSentAt).getTime()
  const elapsed = Date.now() - lastSent
  if (elapsed < resendCooldownMs) {
    const waitSeconds = Math.ceil((resendCooldownMs - elapsed) / 1000)
    const waitMinutes = Math.ceil(waitSeconds / 60)
    return {
      allowed: false,
      waitSeconds,
      reason: resendCooldownMs >= 60_000
        ? `Please wait ${waitMinutes} minute(s) before resending`
        : `Please wait ${waitSeconds} seconds before resending`,
    }
  }

  if (resendCount >= MAX_RESENDS_PER_WINDOW) {
    const windowStart = Date.now() - RESEND_WINDOW_MS
    if (lastSent > windowStart) {
      return {
        allowed: false,
        waitSeconds: 0,
        reason: 'Too many resend attempts. Please try again in 15 minutes.',
      }
    }
  }

  return { allowed: true, waitSeconds: 0 }
}

export function mapOtpError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('rate limit') || error.message.includes('Too many')) {
      return error.message
    }
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export const OTP_LIMITS = {
  OTP_LENGTH,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_VERIFY_ATTEMPTS,
  MAX_RESENDS_PER_WINDOW,
}
