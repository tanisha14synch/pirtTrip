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
  const international = `91${local}`
  const base = `https://wa.me/${international}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/** Opens WhatsApp Web on desktop with the same pre-filled message. */
export function whatsAppWebUrl(phone: string, message?: string): string {
  const local = phoneDigits(phone)
  const params = new URLSearchParams({ phone: `91${local}` })
  if (message) params.set('text', message)
  return `https://web.whatsapp.com/send?${params.toString()}`
}

export function isMobileWhatsAppDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}
