/** Admin SMS recipient when a partner completes registration. */
export const DEFAULT_PARTNER_REGISTRATION_ADMIN_NOTIFY_PHONE = '9319203573'

export function getPartnerRegistrationAdminNotifyPhone(): string {
  const raw = (
    process.env.PARTNER_REGISTRATION_ADMIN_NOTIFY_PHONE?.trim()
    || DEFAULT_PARTNER_REGISTRATION_ADMIN_NOTIFY_PHONE
  )
  const local = raw.replace(/\D/g, '').slice(-10)
  return local.length === 10 ? `+91${local}` : raw
}

/** 10-digit local number for admin notification SMS body. */
export function formatMobileForAdminSms(e164: string): string {
  const local = e164.replace(/\D/g, '').slice(-10)
  return local.length === 10 ? local : e164
}
