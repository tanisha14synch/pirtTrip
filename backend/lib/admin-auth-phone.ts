import type { H3Event } from 'h3'
import { logAdminAction, recordAdminSession } from './admin-audit'
import { createAndSendOtp } from './email-otp-service'
import { normalizePhone } from './phone'
import { getSupabaseAdmin } from './supabase'
import { getOtpTtlSeconds, getResendCooldownSeconds } from './otp'
import {
  buildChallengePayload,
  createChallengeToken,
  parseChallengeToken,
  upsertOtpChallenge,
} from './otp-challenge-token'
import { buildAdminLoginOtpSmsMessage, maskPhoneForDisplay } from './sms'

export const ALLOWED_ADMIN_PHONES = [
  '8887796127',
  '9027705474',
  '9616647333',
  '9876543210',
] as const

export const ADMIN_DEMO_PHONE = '9876543210'
export const ADMIN_DEMO_OTP = '123456'

export const ADMIN_NOT_REGISTERED_MESSAGE = 'Not a registered admin.'

export function isAdminDemoEnabled(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function isDemoAdminPhone(phone: string): boolean {
  return isAdminDemoEnabled() && phoneLocalDigits(phone) === ADMIN_DEMO_PHONE
}

export function isDemoAdminLogin(phone: string, code: string): boolean {
  return isDemoAdminPhone(phone) && code === ADMIN_DEMO_OTP
}

export function adminOtpChallengeEmail(phone: string): string {
  const local = phone.replace(/\D/g, '').slice(-10)
  return `admin+${local}@challenge.pirttrip.local`
}

export function phoneLocalDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

export function isAllowedAdminPhone(phone: string): boolean {
  const local = phoneLocalDigits(phone)
  if (isDemoAdminPhone(phone)) return true
  return (ALLOWED_ADMIN_PHONES as readonly string[]).includes(local)
}

export function assertAllowedAdminPhone(phone: string): void {
  if (!isAllowedAdminPhone(phone)) {
    throw createError({
      statusCode: 403,
      statusMessage: ADMIN_NOT_REGISTERED_MESSAGE,
      data: { code: 'ADMIN_NOT_AUTHORIZED' },
    })
  }
}

export function adminPhoneVariants(phone: string): string[] {
  const local = phoneLocalDigits(phone)
  return [...new Set([local, `+91${local}`, `91${local}`])]
}

export function adminLoginEmail(phone: string): string {
  const local = phoneLocalDigits(phone)
  return `admin+${local}@admin.pirttrip.local`
}

type AdminUserRow = {
  id: string
  email: string
  full_name: string
  role: string
  phone?: string | null
}

function isMissingPhoneColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || Boolean(error.message?.includes('phone'))
}

function matchAdminByPhone(rows: AdminUserRow[] | null | undefined, local: string) {
  return (rows ?? []).find(
    (row) => row.phone && phoneLocalDigits(row.phone) === local,
  ) ?? null
}

async function fetchAllAdminUsers(): Promise<AdminUserRow[]> {
  const admin = getSupabaseAdmin()
  const withPhone = await admin
    .from('admin_users')
    .select('id, email, full_name, role, phone')

  if (!withPhone.error) {
    return (withPhone.data ?? []) as AdminUserRow[]
  }

  if (!isMissingPhoneColumn(withPhone.error)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify admin phone',
    })
  }

  const withoutPhone = await admin
    .from('admin_users')
    .select('id, email, full_name, role')

  if (withoutPhone.error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify admin phone',
    })
  }

  return (withoutPhone.data ?? []) as AdminUserRow[]
}

export async function findAdminByPhone(phone: string) {
  const local = phoneLocalDigits(phone)
  const variants = adminPhoneVariants(phone)
  const admin = getSupabaseAdmin()

  const { data, error } = await admin
    .from('admin_users')
    .select('id, email, full_name, role, phone')
    .in('phone', variants)
    .limit(5)

  if (!error) {
    const match = matchAdminByPhone(data as AdminUserRow[], local)
    if (match) return match
  } else if (!isMissingPhoneColumn(error)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify admin phone',
    })
  }

  const allAdmins = await fetchAllAdminUsers()
  const byPhone = matchAdminByPhone(allAdmins, local)
  if (byPhone) return byPhone

  const loginEmail = adminLoginEmail(phone).toLowerCase()
  return allAdmins.find((row) => row.email.toLowerCase() === loginEmail) ?? null
}

async function linkPhoneToAdmin(adminUserId: string, local: string) {
  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('admin_users')
    .update({ phone: local })
    .eq('id', adminUserId)

  if (error && !isMissingPhoneColumn(error)) {
    console.warn('[admin-auth] failed to link phone to admin user:', error.message)
  }
}

async function ensureAuthUserForAdmin(email: string, fullName: string): Promise<string> {
  const admin = getSupabaseAdmin()
  const normalizedEmail = email.toLowerCase()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (!createError && created.user?.id) {
    return created.user.id
  }

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    throw createError({
      statusCode: 500,
      statusMessage: createError?.message || listError.message || 'Failed to create admin account',
      data: { code: 'ADMIN_SESSION_FAILED' },
    })
  }

  const existing = listed.users.find((user) => user.email?.toLowerCase() === normalizedEmail)
  if (existing?.id) {
    return existing.id
  }

  throw createError({
    statusCode: 500,
    statusMessage: createError?.message || 'Failed to create admin account',
    data: { code: 'ADMIN_SESSION_FAILED' },
  })
}

async function upsertAdminUserRow(options: {
  id: string
  email: string
  fullName: string
  phone: string
}): Promise<AdminUserRow> {
  const admin = getSupabaseAdmin()
  const payload = {
    id: options.id,
    email: options.email.toLowerCase(),
    full_name: options.fullName,
    role: 'ADMIN' as const,
    phone: options.phone,
  }

  const withPhone = await admin
    .from('admin_users')
    .upsert(payload, { onConflict: 'id' })
    .select('id, email, full_name, role, phone')
    .single()

  if (!withPhone.error && withPhone.data) {
    return withPhone.data as AdminUserRow
  }

  if (!isMissingPhoneColumn(withPhone.error)) {
    throw createError({
      statusCode: 500,
      statusMessage: withPhone.error?.message || 'Failed to save admin profile',
      data: { code: 'ADMIN_SESSION_FAILED' },
    })
  }

  const { id, email, full_name, role } = payload
  const withoutPhone = await admin
    .from('admin_users')
    .upsert({ id, email, full_name, role }, { onConflict: 'id' })
    .select('id, email, full_name, role')
    .single()

  if (withoutPhone.error || !withoutPhone.data) {
    throw createError({
      statusCode: 500,
      statusMessage: withoutPhone.error?.message || 'Failed to save admin profile',
      data: { code: 'ADMIN_SESSION_FAILED' },
    })
  }

  return { ...withoutPhone.data, phone: options.phone } as AdminUserRow
}

export async function ensureAdminUserForAllowedPhone(phone: string): Promise<AdminUserRow> {
  const local = phoneLocalDigits(phone)
  const email = adminLoginEmail(phone)
  const fullName = `Admin ${local}`

  const existing = await findAdminByPhone(phone)
  if (existing) {
    await linkPhoneToAdmin(existing.id, local)
    return { ...existing, phone: existing.phone || local }
  }

  const allAdmins = await fetchAllAdminUsers()
  const unassignedAdmin = allAdmins.find((row) => !row.phone || !phoneLocalDigits(row.phone))
  if (unassignedAdmin && allAdmins.length <= ALLOWED_ADMIN_PHONES.length) {
    await linkPhoneToAdmin(unassignedAdmin.id, local)
    return { ...unassignedAdmin, phone: local }
  }

  const authUserId = await ensureAuthUserForAdmin(email, fullName)
  return upsertAdminUserRow({
    id: authUserId,
    email,
    fullName,
    phone: local,
  })
}

export async function resolveAllowedAdminUser(phone: string): Promise<AdminUserRow> {
  assertAllowedAdminPhone(phone)
  return ensureAdminUserForAllowedPhone(phone)
}

export async function sendAdminPhoneOtp(options: {
  phone: string
  challengeToken?: string | null
}) {
  const normalized = normalizePhone(options.phone)
  const local = phoneLocalDigits(normalized)

  assertAllowedAdminPhone(normalized)

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
      code: ADMIN_DEMO_OTP,
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
