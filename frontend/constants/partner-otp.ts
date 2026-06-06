/** Single user-facing message for all partner OTP send/resend failures. */
export const PARTNER_OTP_SEND_FAILED_MSG = 'Unable to send OTP. Please try again later.'

export type PartnerOtpSendResponse = {
  success: boolean
  challengeToken?: string
  expiresInSeconds?: number
  resendCooldownSeconds?: number
  phoneMasked?: string
}

export function isPartnerOtpSendSuccess(
  response: unknown,
): response is PartnerOtpSendResponse & { success: true; challengeToken: string } {
  return Boolean(
    response
    && typeof response === 'object'
    && (response as PartnerOtpSendResponse).success === true
    && typeof (response as PartnerOtpSendResponse).challengeToken === 'string'
    && (response as PartnerOtpSendResponse).challengeToken,
  )
}
