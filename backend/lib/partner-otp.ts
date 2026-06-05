/** Stable challenge identifier for partner phone OTP (not a deliverable inbox). */
export function partnerOtpChallengeEmail(phone: string): string {
  const local = phone.replace(/\D/g, '').slice(-10)
  return `partner+${local}@challenge.pirttrip.local`
}

/** Legacy + current challenge inbox keys (for cleanup after re-registration). */
export function partnerOtpChallengeEmailVariants(phone: string): string[] {
  const digits = phone.replace(/\D/g, '')
  const local = digits.slice(-10)
  return [...new Set([
    `partner+${local}@challenge.pirttrip.local`,
    `partner+91${local}@challenge.pirttrip.local`,
    `partner+${digits}@challenge.pirttrip.local`,
  ].filter(Boolean))]
}
