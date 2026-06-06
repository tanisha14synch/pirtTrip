import { partnerOtpDeliveryErrorMessage } from './sms'

export const PARTNER_OTP_SEND_FAILED_MSG = partnerOtpDeliveryErrorMessage()

export type PartnerOtpSendApiResponse = {
  success: true
  challengeToken: string
  expiresInSeconds: number
  resendCooldownSeconds: number
  phoneMasked: string
}

export function buildPartnerOtpSendSuccessResponse(options: {
  challengeToken: string
  expiresInSeconds: number
  resendCooldownSeconds: number
  phoneMasked: string
}): PartnerOtpSendApiResponse {
  return {
    success: true,
    challengeToken: options.challengeToken,
    expiresInSeconds: options.expiresInSeconds,
    resendCooldownSeconds: options.resendCooldownSeconds,
    phoneMasked: options.phoneMasked,
  }
}

/** Map any send/resend failure to a single user-safe API error (no provider details). */
export function throwPartnerOtpSendFailed(
  statusCode = 502,
  code = 'OTP_SEND_FAILED',
): never {
  throw createError({
    statusCode,
    statusMessage: PARTNER_OTP_SEND_FAILED_MSG,
    data: { code, success: false },
  })
}
