/** Structured audit logs for partner registration OTP (no secrets in production). */

export function maskPhoneForAudit(e164: string): string {
  const local = e164.replace(/\D/g, '').slice(-10)
  return local.length === 10 ? `+91******${local.slice(-4)}` : 'invalid'
}

export function maskOtpForAudit(code: string): string {
  if (process.env.OTP_DEBUG === 'true') {
    return code
  }
  if (code.length < 2) {
    return '******'
  }
  return `******${code.slice(-2)}`
}

export function partnerOtpAudit(event: string, payload: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: 'partner_otp',
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  )
}
