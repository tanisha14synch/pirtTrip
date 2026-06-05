import { proxyApiToBackend, shouldHandlePartnerOtpLocally } from '../../utils/api-proxy'
import { handlePartnerOtpVerify } from '../../utils/partner-otp-handlers'

export default defineEventHandler(async (event) => {
  if (shouldHandlePartnerOtpLocally()) {
    return handlePartnerOtpVerify(event)
  }
  return proxyApiToBackend(event)
})
