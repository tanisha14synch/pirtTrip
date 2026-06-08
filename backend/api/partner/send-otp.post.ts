import { z } from 'zod'
import { assertOtpSendRateLimit } from '~/lib/otp-ip-rate-limit'
import {
  buildPartnerOtpSendSuccessResponse,
  throwPartnerOtpSendFailed,
} from '~/lib/partner-otp-response'
import { sendPartnerRegistrationOtp } from '~/lib/partner-registration-otp'
import { maskPhoneForAudit, partnerOtpAudit } from '~/lib/partner-otp-audit'
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
      data: { code: 'INVALID_FORM', success: false },
    })
  }

  let phone: string
  try {
    phone = normalizePhone(parsed.data.phone)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter a valid 10-digit mobile number',
      data: { code: 'INVALID_PHONE', success: false },
    })
  }

  try {
    assertOtpSendRateLimit(event, phone)

    partnerOtpAudit('send.api_request', {
      inputPhone: maskPhoneForAudit(`+91${parsed.data.phone}`),
      normalizedPhone: maskPhoneForAudit(phone),
    })

    const result = await sendPartnerRegistrationOtp(event, {
      data: parsed.data,
      isResend: false,
    })

    if (!result.readyForVerify || !result.challengeToken) {
      partnerOtpAudit('send.api_rejected', {
        phone: maskPhoneForAudit(phone),
        reason: 'not_ready_for_verify',
      })
      throwPartnerOtpSendFailed()
    }

    return buildPartnerOtpSendSuccessResponse({
      challengeToken: result.challengeToken,
      expiresInSeconds: result.expiresInSeconds,
      resendCooldownSeconds: result.resendCooldownSeconds,
      phoneMasked: result.phoneMasked,
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number; data?: { code?: string } }

      if (err.statusCode === 409 || err.data?.code === 'PHONE_ALREADY_REGISTERED') {
        throw error
      }

      if (err.statusCode === 400) {
        throw error
      }

      throwPartnerOtpSendFailed(err.statusCode === 429 ? 429 : 502, err.data?.code || 'OTP_SEND_FAILED')
    }

    console.error('[partner/send-otp]', error)
    throwPartnerOtpSendFailed()
  }
})
