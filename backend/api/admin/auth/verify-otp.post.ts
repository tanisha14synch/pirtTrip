import { z } from 'zod'
import { logAdminAction, recordAdminSession } from '~/lib/admin-audit'
import { verifyEmailOtp } from '~/lib/email-otp-service'
import { zodErrorMessage } from '~/lib/validation'

const bodySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
  challengeToken: z.string().min(1, 'Verification session expired. Request a new code.'),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error, 'Invalid code'),
    })
  }

  const email = user.email?.toLowerCase()
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Admin account has no email' })
  }

  await verifyEmailOtp({
    email,
    purpose: 'admin_login',
    code: parsed.data.code,
    challengeToken: parsed.data.challengeToken,
  })

  const admin = getSupabaseAdmin()
  const verifiedAt = new Date().toISOString()

  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      email_2fa_verified_at: verifiedAt,
    },
  })

  if (metaError) {
    throw createError({ statusCode: 500, statusMessage: metaError.message })
  }

  const maxAgeSeconds = 60 * 60 * 12
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000)

  setCookie(event, 'admin_2fa_verified', `${user.id}:${Date.now()}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeSeconds,
    path: '/',
  })

  await recordAdminSession(event, user.id, expiresAt)
  await logAdminAction(event, {
    adminId: user.id,
    action: 'ADMIN_LOGIN_VERIFIED',
    resourceType: 'admin_user',
    resourceId: user.id,
  })

  return { success: true, verifiedAt }
})
