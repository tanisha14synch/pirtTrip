import { proxyApiToBackend, shouldHandlePartnerOtpLocally } from '../../utils/api-proxy'
import { handlePartnerOtpResend } from '../../utils/partner-otp-handlers'

export default defineEventHandler(async (event) => {
  if (shouldHandlePartnerOtpLocally()) {
    return handlePartnerOtpResend(event)
  }
  return proxyApiToBackend(event)
})
