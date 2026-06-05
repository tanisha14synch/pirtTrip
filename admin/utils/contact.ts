export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

export function telUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const e164 = digits.startsWith('91') ? digits : `91${phoneDigits(phone)}`
  return `tel:+${e164}`
}

export function whatsAppUrl(phone: string, message?: string): string {
  const local = phoneDigits(phone)
  const base = `https://wa.me/91${local}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
