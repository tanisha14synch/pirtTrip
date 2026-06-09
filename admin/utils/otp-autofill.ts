export const DEFAULT_OTP_LENGTH = 6

/** Extract a fixed-length numeric OTP from SMS, paste, or Web OTP payload. */
export function extractOtpCode(text: string, length = DEFAULT_OTP_LENGTH): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const exact = trimmed.match(new RegExp(`^\\d{${length}}$`))
  if (exact) return exact[0]

  const wordBoundary = trimmed.match(new RegExp(`\\b(\\d{${length}})\\b`))
  if (wordBoundary) return wordBoundary[1]

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length >= length) {
    return digits.slice(0, length)
  }

  return null
}

export function isWebOtpSupported(): boolean {
  if (!import.meta.client) return false
  return 'OTPCredential' in window && 'credentials' in navigator
}
