import { proxyApiToBackend, shouldHandlePartnerOtpLocally } from '../../utils/api-proxy'
import { handlePartnerOtpSend } from '../../utils/partner-otp-handlers'

export default defineEventHandler(async (event) => {
  if (shouldHandlePartnerOtpLocally()) {
    return handlePartnerOtpSend(event)
  }
  return proxyApiToBackend(event)
})
