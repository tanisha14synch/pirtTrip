const DEFAULT_PARTNER_HOST = 'business.pirttrip.com'
const DEFAULT_ADMIN_HOST = 'admin.pirttrip.com'

/** Allowed hosts for Web OTP SMS suffix (Android Chrome autofill). */
const ALLOWED_HOST_SUFFIXES = [
  'pirttrip.com',
  'localhost',
  '127.0.0.1',
]

function normalizeHost(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
}

function isAllowedWebOtpHost(host: string): boolean {
  if (!host) return false
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  )
}

export function resolveWebOtpHost(
  clientHost: string | undefined | null,
  fallback: string,
): string {
  const normalized = normalizeHost(clientHost || '')
  if (normalized && isAllowedWebOtpHost(normalized)) {
    return normalized
  }
  return normalizeHost(fallback) || fallback
}

export function resolvePartnerWebOtpHost(clientHost?: string | null): string {
  const envHost = process.env.OTP_WEB_OTP_HOST?.trim()
  return resolveWebOtpHost(clientHost, envHost || DEFAULT_PARTNER_HOST)
}

export function resolveAdminWebOtpHost(clientHost?: string | null): string {
  const envHost =
    process.env.OTP_WEB_OTP_ADMIN_HOST?.trim()
    || process.env.OTP_WEB_OTP_HOST?.trim()
  return resolveWebOtpHost(clientHost, envHost || DEFAULT_ADMIN_HOST)
}
