/**
 * Normalize Indian phone numbers to E.164 (+91XXXXXXXXXX).
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (digits.length === 10) {
    return `+91${digits}`
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`
  }

  if (raw.startsWith('+') && digits.length >= 10) {
    return `+${digits}`
  }

  throw new Error('Enter a valid 10-digit Indian mobile number')
}

export function formatPhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  if (digits.length >= 10) {
    const local = digits.slice(-10)
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`
  }
  return e164
}
