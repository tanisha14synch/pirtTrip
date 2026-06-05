import { createHmac, timingSafeEqual } from 'node:crypto'
import type { OtpPurpose } from './otp'
import { canResendOtp, getOtpLimits, hashOtpCode, OTP_LIMITS } from './otp'
import { getSupabaseAdmin } from './supabase'
import { getOtpSigningSecret } from './runtime-env'

export type OtpChallengePayload = {
  id: string
  email: string
  purpose: OtpPurpose
  exp: number
}

function getSecret(): string {
  const secret = getOtpSigningSecret()
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

  if (!payload.id || !payload.email || !payload.purpose || !payload.exp) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid verification session' })
  }

  return payload
}

type OtpChallengeRow = {
  id: string
  email: string
  purpose: string
  code_hash: string
  expires_at: string
  attempts: number
  max_attempts: number
  resend_count: number
  last_sent_at: string
  verified_at: string | null
}

export async function getLatestActiveChallenge(email: string, purpose: OtpPurpose) {
  const admin = getSupabaseAdmin()
  const normalizedEmail = email.trim().toLowerCase()
  const { data, error } = await admin
    .from('email_otp_challenges')
    .select(
      'id,email,purpose,code_hash,expires_at,attempts,max_attempts,resend_count,last_sent_at,verified_at',
    )
    .eq('email', normalizedEmail)
    .eq('purpose', purpose)
    .is('verified_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load OTP challenge',
    })
  }

  return data as OtpChallengeRow | null
}

export async function validateResendForEmail(options: {
  email: string
  purpose: OtpPurpose
  existingToken?: string | null
}) {
  let challenge: OtpChallengeRow | null = null

  if (options.existingToken) {
    const tokenPayload = parseChallengeToken(options.existingToken)
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('email_otp_challenges')
      .select(
        'id,email,purpose,code_hash,expires_at,attempts,max_attempts,resend_count,last_sent_at,verified_at',
      )
      .eq('id', tokenPayload.id)
      .eq('email', tokenPayload.email)
      .eq('purpose', tokenPayload.purpose)
      .is('verified_at', null)
      .maybeSingle()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to validate OTP resend',
      })
    }

    challenge = (data as OtpChallengeRow | null) ?? null
  }

  if (!challenge) {
    challenge = await getLatestActiveChallenge(options.email, options.purpose)
  }

  if (!challenge) {
    return {
      allowed: true as const,
      waitSeconds: 0,
      resendCount: 0,
      challenge,
    }
  }

  const check = canResendOtp(
    challenge.last_sent_at,
    challenge.resend_count,
    getOtpLimits(options.purpose).resendCooldownMs,
  )
  return {
    ...check,
    resendCount: challenge.resend_count,
    challenge,
  }
}

export async function upsertOtpChallenge(options: {
  challengeId?: string | null
  email: string
  purpose: OtpPurpose
  code: string
  resendCount: number
  metadata?: Record<string, unknown>
}): Promise<OtpChallengeRow> {
  const admin = getSupabaseAdmin()
  const email = options.email.trim().toLowerCase()
  const expiresAt = new Date(Date.now() + getOtpLimits(options.purpose).ttlMs).toISOString()
  const lastSentAt = new Date().toISOString()
  const codeHash = hashOtpCode(options.code, email, options.purpose)

  if (options.challengeId) {
    const { data, error } = await admin
      .from('email_otp_challenges')
      .update({
        code_hash: codeHash,
        expires_at: expiresAt,
        resend_count: options.resendCount,
        last_sent_at: lastSentAt,
        attempts: 0,
        metadata: options.metadata || {},
        verified_at: null,
      })
      .eq('id', options.challengeId)
      .eq('email', email)
      .eq('purpose', options.purpose)
      .select(
        'id,email,purpose,code_hash,expires_at,attempts,max_attempts,resend_count,last_sent_at,verified_at',
      )
      .maybeSingle()

    if (!error && data) {
      return data as OtpChallengeRow
    }
  }

  const { data, error } = await admin
    .from('email_otp_challenges')
    .insert({
      email,
      purpose: options.purpose,
      code_hash: codeHash,
      expires_at: expiresAt,
      resend_count: options.resendCount,
      last_sent_at: lastSentAt,
      max_attempts: OTP_LIMITS.MAX_VERIFY_ATTEMPTS,
      metadata: options.metadata || {},
    })
    .select(
      'id,email,purpose,code_hash,expires_at,attempts,max_attempts,resend_count,last_sent_at,verified_at',
    )
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create OTP challenge',
    })
  }

  return data as OtpChallengeRow
}

export function buildChallengePayload(options: {
  id: string
  email: string
  purpose: OtpPurpose
  expiresAt: string
}): OtpChallengePayload {
  return {
    id: options.id,
    email: options.email,
    purpose: options.purpose,
    exp: new Date(options.expiresAt).getTime(),
  }
}

export async function getChallengeForVerification(options: {
  challengeToken: string
  email: string
  purpose: OtpPurpose
}) {
  const payload = parseChallengeToken(options.challengeToken)
  const normalizedEmail = options.email.trim().toLowerCase()
  if (payload.email !== normalizedEmail || payload.purpose !== options.purpose) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification session does not match this email',
      data: { code: 'OTP_SESSION_MISMATCH' },
    })
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('email_otp_challenges')
    .select(
      'id,email,purpose,code_hash,expires_at,attempts,max_attempts,resend_count,last_sent_at,verified_at',
    )
    .eq('id', payload.id)
    .eq('email', normalizedEmail)
    .eq('purpose', options.purpose)
    .maybeSingle()

  if (error || !data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification session expired. Request a new code.',
      data: { code: 'OTP_SESSION_EXPIRED' },
    })
  }

  return data as OtpChallengeRow
}

export async function markChallengeAttempt(challengeId: string) {
  const admin = getSupabaseAdmin()
  const { data: row, error: rowError } = await admin
    .from('email_otp_challenges')
    .select('attempts')
    .eq('id', challengeId)
    .single()
  if (rowError || !row) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update OTP attempts',
    })
  }
  const next = (row.attempts ?? 0) + 1
  const { error: updateError } = await admin
    .from('email_otp_challenges')
    .update({ attempts: next })
    .eq('id', challengeId)
  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update OTP attempts',
    })
  }
  return next
}

export async function deleteOtpChallenge(challengeId: string) {
  const admin = getSupabaseAdmin()
  await admin.from('email_otp_challenges').delete().eq('id', challengeId)
}

export async function markChallengeVerified(challengeId: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('email_otp_challenges')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', challengeId)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark OTP as verified',
    })
  }
}
