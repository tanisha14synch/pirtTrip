import { createHmac, timingSafeEqual } from 'node:crypto'
import type { OtpPurpose } from './otp'
import { canResendOtp, hashOtpCode, OTP_LIMITS } from './otp'

export type OtpChallengePayload = {
  email: string
  purpose: OtpPurpose
  codeHash: string
  exp: number
  resendCount: number
  lastSentAt: number
  metadata?: Record<string, unknown>
}

const attemptCounts = new Map<string, number>()

function getSecret(): string {
  const config = useRuntimeConfig()
  const secret = config.otpSecret || config.supabaseServiceRoleKey
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OTP secret is not configured',
    })
  }
  return secret
}

function signPayload(encoded: string): string {
  return createHmac('sha256', getSecret()).update(encoded).digest('base64url')
}

export function createChallengeToken(payload: OtpChallengePayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${signPayload(encoded)}`
}

export function parseChallengeToken(token: string): OtpChallengePayload {
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid verification session' })
  }

  const expected = signPayload(encoded)
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new Error('bad sig')
    }
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid verification session' })
  }

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OtpChallengePayload

  if (!payload.email || !payload.purpose || !payload.codeHash || !payload.exp) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid verification session' })
  }

  return payload
}

export function getAttemptKey(email: string, purpose: OtpPurpose): string {
  return `${purpose}:${email.toLowerCase()}`
}

export function getAttemptCount(email: string, purpose: OtpPurpose): number {
  return attemptCounts.get(getAttemptKey(email, purpose)) ?? 0
}

export function incrementAttemptCount(email: string, purpose: OtpPurpose): number {
  const key = getAttemptKey(email, purpose)
  const next = (attemptCounts.get(key) ?? 0) + 1
  attemptCounts.set(key, next)
  return next
}

export function clearAttemptCount(email: string, purpose: OtpPurpose): void {
  attemptCounts.delete(getAttemptKey(email, purpose))
}

export function validateResendFromToken(existingToken?: string | null) {
  if (!existingToken) {
    return { allowed: true as const, resendCount: 0, waitSeconds: 0 }
  }

  const payload = parseChallengeToken(existingToken)
  const check = canResendOtp(new Date(payload.lastSentAt).toISOString(), payload.resendCount)

  return {
    ...check,
    resendCount: payload.resendCount,
  }
}

export function buildChallengePayload(options: {
  email: string
  purpose: OtpPurpose
  code: string
  resendCount: number
  metadata?: Record<string, unknown>
}): OtpChallengePayload {
  const email = options.email.trim().toLowerCase()
  const exp = Date.now() + OTP_LIMITS.OTP_TTL_MS

  return {
    email,
    purpose: options.purpose,
    codeHash: hashOtpCode(options.code, email, options.purpose),
    exp,
    resendCount: options.resendCount,
    lastSentAt: Date.now(),
    metadata: options.metadata,
  }
}
