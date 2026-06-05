import {
  handlePartnerOtpResend,
  handlePartnerOtpSend,
  handlePartnerOtpVerify,
  isPartnerOtpApiPath,
} from '../utils/partner-otp-handlers'
import { proxyApiToBackend, shouldHandlePartnerOtpLocally } from '../utils/api-proxy'

export default defineEventHandler(async (event) => {
  const path = event.path
  const method = event.method

  if (shouldHandlePartnerOtpLocally() && isPartnerOtpApiPath(path) && method === 'POST') {
    if (path === '/api/partner/send-otp') return handlePartnerOtpSend(event)
    if (path === '/api/partner/resend-otp') return handlePartnerOtpResend(event)
    if (path === '/api/partner/verify-otp') return handlePartnerOtpVerify(event)
  }

  return proxyApiToBackend(event)
})
