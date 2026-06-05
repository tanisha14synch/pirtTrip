import { z } from 'zod'
import { logAdminAction, recordAdminSession } from '~/lib/admin-audit'
import { verifyEmailOtp } from '~/lib/email-otp-service'
import { getSupabaseAdmin } from '~/lib/supabase'
import { zodErrorMessage } from '~/lib/validation'

const bodySchema = z.object({
  email: z.string().trim().email('Enter a valid admin email'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
  challengeToken: z.string().min(1, 'Verification session expired. Request a new code.'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error),
      data: { code: 'INVALID_REQUEST' },
    })
  }

  const email = parsed.data.email.toLowerCase()

  await verifyEmailOtp({
    email,
    purpose: 'admin_login',
    code: parsed.data.code,
    challengeToken: parsed.data.challengeToken,
  })

  const admin = getSupabaseAdmin()
  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('id, email, full_name, role')
    .eq('email', email)
    .maybeSingle()

  if (adminError || !adminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
      data: { code: 'ADMIN_NOT_AUTHORIZED' },
    })
  }

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

  if (authError || !authData.session) {
    throw createError({
      statusCode: 500,
      statusMessage: authError?.message || 'Failed to sign in admin',
      data: { code: 'ADMIN_SESSION_FAILED' },
    })
  }

  const verifiedAt = new Date().toISOString()
  await admin.auth.admin.updateUserById(adminUser.id, {
    app_metadata: {
      email_2fa_verified_at: verifiedAt,
    },
  })

  const maxAgeSeconds = 60 * 60 * 12
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000)

  setCookie(event, 'admin_2fa_verified', `${adminUser.id}:${Date.now()}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeSeconds,
    path: '/',
  })

  await recordAdminSession(event, adminUser.id, expiresAt)
  await logAdminAction(event, {
    adminId: adminUser.id,
    action: 'ADMIN_LOGIN_VERIFIED',
    resourceType: 'admin_user',
    resourceId: adminUser.id,
  })

  return {
    success: true,
    accessToken: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    expiresIn: authData.session.expires_in,
    user: adminUser,
  }
})
