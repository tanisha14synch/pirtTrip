import { z } from 'zod'
import { createAndSendOtp } from '~/server/utils/email-otp-service'

const bodySchema = z.object({
  email: z.string().email('Enter a valid email address'),
  challengeToken: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid email',
    })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const admin = getSupabaseAdmin()

  const { data: existing, error: lookupError } = await admin
    .from('waitlist_subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (lookupError && !lookupError.message.includes('waitlist_subscribers')) {
    throw createError({ statusCode: 500, statusMessage: lookupError.message })
  }

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This email is already on the waitlist',
    })
  }

  const result = await createAndSendOtp({
    email,
    purpose: 'waitlist',
    challengeToken: parsed.data.challengeToken,
  })

  return {
    success: true,
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
    ...('debugCode' in result ? { debugCode: result.debugCode } : {}),
  }
})
