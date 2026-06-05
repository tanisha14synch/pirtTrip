import { randomInt } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_VERIFY_ATTEMPTS = 5

export function maskPhoneForDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  const local = digits.slice(-10)
  if (local.length !== 10) return e164
  return `+91 ******${local.slice(-4)}`
}

function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

async function getLatestOtpRow(admin: SupabaseClient, phone: string) {
  const { data, error } = await admin
    .from('phone_otps')
    .select('id, created_at, attempts, verified, expires_at, otp_code')
    .eq('phone_number', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load OTP session',
    })
  }

  return data
}

export async function assertPartnerPhoneAvailable(admin: SupabaseClient, phone: string) {
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

export async function sendPartnerPhoneOtp(admin: SupabaseClient, phone: string) {
  const latest = await getLatestOtpRow(admin, phone)

  if (latest?.created_at) {
    const elapsed = Date.now() - new Date(latest.created_at).getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
      throw createError({
        statusCode: 429,
        statusMessage: `Please wait ${waitSeconds} seconds before resending`,
        data: { code: 'OTP_RATE_LIMITED', waitSeconds },
      })
    }
  }

  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString()

  const { data, error } = await admin
    .from('phone_otps')
    .insert({
      phone_number: phone,
      otp_code: code,
      expires_at: expiresAt,
      attempts: 0,
      verified: false,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to create OTP',
    })
  }

  console.info(`[OTP] partner_registration code for ${phone}: ${code}`)

  return {
    challengeToken: data.id as string,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    resendCooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
    phoneMasked: maskPhoneForDisplay(phone),
    debugCode: code,
  }
}

export async function verifyPartnerPhoneOtp(
  admin: SupabaseClient,
  phone: string,
  code: string,
  challengeToken: string,
) {
  const { data: row, error } = await admin
    .from('phone_otps')
    .select('id, otp_code, expires_at, attempts, verified')
    .eq('id', challengeToken)
    .eq('phone_number', phone)
    .maybeSingle()

  if (error || !row) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification session expired. Request a new code.',
      data: { code: 'OTP_SESSION_EXPIRED' },
    })
  }

  if (row.verified) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This code has already been used. Request a new code.',
      data: { code: 'OTP_ALREADY_USED' },
    })
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Verification code has expired. Please request a new code.',
      data: { code: 'OTP_EXPIRED' },
    })
  }

  if ((row.attempts ?? 0) >= MAX_VERIFY_ATTEMPTS) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many failed attempts. Please request a new code.',
      data: { code: 'OTP_TOO_MANY_ATTEMPTS' },
    })
  }

  if (row.otp_code !== code) {
    const nextAttempts = (row.attempts ?? 0) + 1
    await admin
      .from('phone_otps')
      .update({ attempts: nextAttempts })
      .eq('id', row.id)

    const remaining = MAX_VERIFY_ATTEMPTS - nextAttempts
    throw createError({
      statusCode: 400,
      statusMessage:
        remaining > 0
          ? `Invalid code. ${remaining} attempt(s) remaining.`
          : 'Invalid code. Please request a new code.',
      data: { code: 'OTP_INVALID', remainingAttempts: Math.max(remaining, 0) },
    })
  }

  await admin
    .from('phone_otps')
    .update({ verified: true })
    .eq('id', row.id)
}
