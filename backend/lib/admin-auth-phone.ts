import type { H3Event } from 'h3'
import { logAdminAction, recordAdminSession } from './admin-audit'
import { createAndSendOtp } from './email-otp-service'
import { normalizePhone } from './phone'
import { getSupabaseAdmin } from './supabase'
import { upsertOtpChallenge, buildChallengePayload, createChallengeToken, parseChallengeToken } from './otp-challenge-token'
import { getOtpTtlSeconds, getResendCooldownSeconds } from './otp'
import { buildAdminLoginOtpSmsMessage, maskPhoneForDisplay } from './sms'

export const DEFAULT_ADMIN_DEMO_PHONE = '9876543210'
export const DEFAULT_ADMIN_DEMO_OTP = '123456'

export function adminOtpChallengeEmail(phone: string): string {
  const local = phone.replace(/\D/g, '').slice(-10)
  return `admin+${local}@challenge.pirttrip.local`
}

export function phoneLocalDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

export function isDemoAdminPhone(phone: string): boolean {
  return phoneLocalDigits(phone) === DEFAULT_ADMIN_DEMO_PHONE
}

export function isDemoAdminLogin(phone: string, code: string): boolean {
  return isDemoAdminPhone(phone) && code === DEFAULT_ADMIN_DEMO_OTP
}

export function adminPhoneVariants(phone: string): string[] {
  const local = phoneLocalDigits(phone)
  return [...new Set([local, `+91${local}`, `91${local}`])]
}

export async function findAdminByPhone(phone: string) {
  const admin = getSupabaseAdmin()
  const local = phoneLocalDigits(phone)
  const variants = adminPhoneVariants(phone)

  const { data, error } = await admin
    .from('admin_users')
    .select('id, email, full_name, role, phone')
    .in('phone', variants)
    .limit(5)

  if (error) {
    if (error.message?.includes('phone') || error.code === '42703') {
      return null
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify admin phone',
    })
  }

  const match = (data ?? []).find(
    (row) => row.phone && phoneLocalDigits(row.phone) === local,
  )

  if (match) return match

  const { data: fuzzy, error: fuzzyError } = await admin
    .from('admin_users')
    .select('id, email, full_name, role, phone')
    .ilike('phone', `%${local}`)
    .limit(5)

  if (fuzzyError) return null

  return (fuzzy ?? []).find(
    (row) => row.phone && phoneLocalDigits(row.phone) === local,
  ) ?? null
}

export async function ensureDemoAdminLinked(phone: string) {
  if (!isDemoAdminPhone(phone)) return null

  const existing = await findAdminByPhone(phone)
  if (existing) return existing

  const admin = getSupabaseAdmin()
  const { data: fallback, error } = await admin
    .from('admin_users')
    .select('id, email, full_name, role')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !fallback) return null

  const { data: updated, error: updateError } = await admin
    .from('admin_users')
    .update({ phone: DEFAULT_ADMIN_DEMO_PHONE })
    .eq('id', fallback.id)
    .select('id, email, full_name, role, phone')
    .single()

  if (updateError) {
    return { ...fallback, phone: DEFAULT_ADMIN_DEMO_PHONE }
  }

  return updated ?? { ...fallback, phone: DEFAULT_ADMIN_DEMO_PHONE }
}

export async function sendAdminPhoneOtp(options: {
  phone: string
  challengeToken?: string | null
}) {
  const normalized = normalizePhone(options.phone)
  const local = phoneLocalDigits(normalized)

  let adminUser = isDemoAdminPhone(normalized)
    ? await ensureDemoAdminLinked(normalized)
    : null

  if (!adminUser) {
    adminUser = await findAdminByPhone(normalized)
  }

  if (!adminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This phone number is not authorized for admin access.',
      data: { code: 'ADMIN_NOT_AUTHORIZED' },
    })
  }

  const challengeEmail = adminOtpChallengeEmail(normalized)

  if (isDemoAdminPhone(normalized)) {
    let challengeId: string | null = null
    if (options.challengeToken) {
      try {
        challengeId = parseChallengeToken(options.challengeToken).id
      } catch {
        challengeId = null
      }
    }

    const challenge = await upsertOtpChallenge({
      challengeId,
      email: challengeEmail,
      purpose: 'admin_login',
      code: DEFAULT_ADMIN_DEMO_OTP,
      resendCount: 0,
      metadata: { phone: normalized, demo: true },
    })
    const payload = buildChallengePayload({
      id: challenge.id,
      email: challengeEmail,
      purpose: 'admin_login',
      expiresAt: challenge.expires_at,
    })

    return {
      phone: local,
      phoneMasked: maskPhoneForDisplay(`+91${local}`),
      challengeToken: createChallengeToken(payload),
      expiresInSeconds: getOtpTtlSeconds('admin_login'),
      resendCooldownSeconds: getResendCooldownSeconds('admin_login'),
      debugCode: DEFAULT_ADMIN_DEMO_OTP,
      demoMode: true,
    }
  }

  const result = await createAndSendOtp({
    email: challengeEmail,
    purpose: 'admin_login',
    challengeToken: options.challengeToken,
    metadata: { phone: normalized },
    smsDelivery: {
      phone: normalized,
      buildMessage: buildAdminLoginOtpSmsMessage,
    },
  })

  return {
    phone: local,
    phoneMasked: maskPhoneForDisplay(normalized),
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
    ...('debugCode' in result ? { debugCode: result.debugCode } : {}),
  }
}

export async function completeAdminPhoneLogin(
  event: H3Event,
  options: { phone: string; email: string; adminUser: { id: string; email: string; full_name: string; role: string; phone?: string | null } },
) {
  const admin = getSupabaseAdmin()
  const email = options.email.toLowerCase()

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    throw createError({
      statusCode: 500,
      statusMessage: linkError?.message || 'Failed to create admin session',
      data: { code: 'ADMIN_SESSION_FAILED' },
    })
  }

  const { data: authData, error: authError } = await admin.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'email',
  })

  const session = authData?.session
  const authUserId = authData?.user?.id ?? session?.user?.id

  if (authError || !session || !authUserId) {
    throw createError({
      statusCode: 500,
      statusMessage: authError?.message || 'Failed to sign in admin',
      data: { code: 'ADMIN_SESSION_FAILED' },
    })
  }

  const verifiedAt = new Date().toISOString()
  const { error: metaError } = await admin.auth.admin.updateUserById(authUserId, {
    app_metadata: {
      email_2fa_verified_at: verifiedAt,
    },
  })

  if (metaError) {
    throw createError({
      statusCode: 500,
      statusMessage: metaError.message,
      data: { code: 'ADMIN_SESSION_FAILED' },
    })
  }

  const maxAgeSeconds = 60 * 60 * 12
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000)

  setCookie(event, 'admin_2fa_verified', `${authUserId}:${Date.now()}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeSeconds,
    path: '/',
  })

  await recordAdminSession(event, authUserId, expiresAt)
  await logAdminAction(event, {
    adminId: authUserId,
    action: 'ADMIN_LOGIN_VERIFIED',
    resourceType: 'admin_user',
    resourceId: authUserId,
  })

  return {
    success: true,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in,
    user: {
      ...options.adminUser,
      id: authUserId,
    },
  }
}
