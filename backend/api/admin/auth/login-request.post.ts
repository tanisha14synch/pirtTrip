import { z } from 'zod'
import { assertOtpSendRateLimit } from '~/lib/otp-ip-rate-limit'
import { createAndSendOtp } from '~/lib/email-otp-service'
import { getSupabaseAdmin } from '~/lib/supabase'
import { zodErrorMessage } from '~/lib/validation'

const bodySchema = z.object({
  email: z.string().trim().email('Enter a valid admin email'),
  challengeToken: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error),
      data: { code: 'INVALID_EMAIL' },
    })
  }

  const email = parsed.data.email.toLowerCase()
  assertOtpSendRateLimit(event, email)

  const admin = getSupabaseAdmin()
  const { data: adminUser } = await admin
    .from('admin_users')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (!adminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This email is not authorized for admin access.',
      data: { code: 'ADMIN_NOT_AUTHORIZED' },
    })
  }

  const result = await createAndSendOtp({
    email,
    purpose: 'admin_login',
    challengeToken: parsed.data.challengeToken,
  })

  return {
    success: true,
    email,
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
    ...('debugCode' in result ? { debugCode: result.debugCode } : {}),
  }
})
