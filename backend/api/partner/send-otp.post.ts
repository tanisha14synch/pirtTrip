import { z } from 'zod'
import { assertOtpSendRateLimit } from '~/lib/otp-ip-rate-limit'
import { sendPartnerRegistrationOtp } from '~/lib/partner-registration-otp'
import { normalizePhone } from '~/lib/phone'
import { partnerRegistrationSchema, zodErrorMessage } from '~/lib/validation'

const bodySchema = partnerRegistrationSchema

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error, 'Invalid form'),
      data: { code: 'INVALID_FORM' },
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

    const result = await sendPartnerRegistrationOtp(event, {
      data: parsed.data,
      isResend: false,
    })

    return {
      success: true,
      ...result,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('[partner/send-otp]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to send OTP now. Please try again later.',
      data: { code: 'OTP_SEND_FAILED' },
    })
  }
})
