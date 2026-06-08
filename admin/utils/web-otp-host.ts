/** Current page hostname for Android/iOS Web OTP SMS matching. */
export function getClientWebOtpHost(): string | undefined {
  if (import.meta.server) return undefined
  return window.location.hostname || undefined
}
