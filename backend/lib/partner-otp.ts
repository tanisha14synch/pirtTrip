/** Stable challenge identifier for partner phone OTP (not a deliverable inbox). */
export function partnerOtpChallengeEmail(phone: string): string {
  return `partner+${phone.replace(/\D/g, '')}@challenge.pirttrip.local`
}
