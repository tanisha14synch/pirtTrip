import { z } from 'zod'
import { assertOtpSendRateLimit } from '~/lib/otp-ip-rate-limit'
import { sendPartnerRegistrationOtp } from '~/lib/partner-registration-otp'
import { normalizePhone } from '~/lib/phone'
import { partnerRegistrationSchema, zodErrorMessage } from '~/lib/validation'

const bodySchema = partnerRegistrationSchema.extend({
  challengeToken: z.string().min(1, 'Verification session expired. Submit the form again.'),
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

  let phone: string
  try {
    phone = normalizePhone(parsed.data.phone)
  } catch (error: unknown) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Invalid phone number',
      data: { code: 'INVALID_PHONE' },
    })
  }

  try {
    assertOtpSendRateLimit(event, phone)

    const result = await sendPartnerRegistrationOtp({
      data: parsed.data,
      challengeToken: parsed.data.challengeToken,
    })

    return {
      success: true,
      ...result,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to resend verification code. Please try again.',
      data: { code: 'OTP_RESEND_FAILED' },
    })
  }
})
