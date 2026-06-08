import { z } from 'zod'
import { phoneLocalDigits, sendAdminPhoneOtp } from '~/lib/admin-auth-phone'
import { assertOtpSendRateLimit } from '~/lib/otp-ip-rate-limit'
import { webOtpHostSchema, zodErrorMessage } from '~/lib/validation'

const bodySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  challengeToken: z.string().optional(),
  webOtpHost: webOtpHostSchema,
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error),
      data: { code: 'INVALID_PHONE' },
    })
  }

  const phoneKey = phoneLocalDigits(parsed.data.phone)
  assertOtpSendRateLimit(event, `admin:${phoneKey}`)

  const result = await sendAdminPhoneOtp({
    phone: parsed.data.phone,
    challengeToken: parsed.data.challengeToken,
    webOtpHost: parsed.data.webOtpHost,
  })

  return {
    success: true,
    phone: result.phone,
    phoneMasked: result.phoneMasked,
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
  }
})
