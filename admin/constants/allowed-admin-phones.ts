/** Admin phones permitted to request OTP and sign in. */
export const ALLOWED_ADMIN_PHONES = [
  '8887796127',
  '9027705474',
  '9616647333',
  '9876543210',
] as const

/** Dev-only test login (no SMS). */
export const ADMIN_DEMO_PHONE = '9876543210'
export const ADMIN_DEMO_OTP = '123456'

export function isDemoAdminPhone(phone: string): boolean {
  if (!import.meta.dev) return false
  return phone.replace(/\D/g, '').slice(-10) === ADMIN_DEMO_PHONE
}

export function isAllowedAdminPhone(phone: string): boolean {
  const local = phone.replace(/\D/g, '').slice(-10)
  if (isDemoAdminPhone(local)) return true
  return (ALLOWED_ADMIN_PHONES as readonly string[]).includes(local)
}

export const ADMIN_NOT_REGISTERED_MESSAGE = 'Not a registered admin.'
