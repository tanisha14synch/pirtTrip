import { z } from 'zod'
import { verifyEmailOtp } from '~/lib/email-otp-service'

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
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid code',
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

  setCookie(event, 'admin_2fa_verified', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  })

  return { success: true, verifiedAt }
})
