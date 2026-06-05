/** Read env at request/runtime — Railway injects vars after Docker build. */
export function readRuntimeEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) {
      return value
    }
  }
  return ''
}

export function getOtpSigningSecret(): string {
  const config = useRuntimeConfig()
  return (
    readRuntimeEnv('OTP_SECRET')
    || String(config.otpSecret || '').trim()
    || readRuntimeEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY', 'SERVICE_ROLE_KEY')
    || String(config.supabaseServiceRoleKey || '').trim()
  )
}
