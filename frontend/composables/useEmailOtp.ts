export type EmailOtpSendResponse = {
  success: boolean
  expiresInSeconds: number
  resendCooldownSeconds: number
  debugCode?: string
}

const DEFAULT_OTP_TTL_SECONDS = 300
const DEFAULT_RESEND_COOLDOWN_SECONDS = 300
const OTP_SEND_FAILED_MSG = 'Unable to send OTP. Please try again later.'

export function useEmailOtp(options: {
  resendCooldownSeconds?: number
  /** Match resend countdown to OTP expiry (partner registration). */
  syncResendWithExpiry?: boolean
} = {}) {
  const expiresInSeconds = ref(0)
  const resendCooldownSeconds = ref(options.resendCooldownSeconds ?? DEFAULT_RESEND_COOLDOWN_SECONDS)
  const resendWaitSeconds = ref(0)
  const otpSessionActive = ref(false)
  let expiryTimer: ReturnType<typeof setInterval> | null = null
  let resendTimer: ReturnType<typeof setInterval> | null = null

  function clearExpiryTimer() {
    if (expiryTimer) clearInterval(expiryTimer)
    expiryTimer = null
  }

  function clearResendTimer() {
    if (resendTimer) clearInterval(resendTimer)
    resendTimer = null
  }

  function clearTimers() {
    clearExpiryTimer()
    clearResendTimer()
    otpSessionActive.value = false
  }

  function startExpiryCountdown(seconds: number) {
    clearExpiryTimer()
    const ttl = Number.isFinite(seconds) && seconds > 0
      ? Math.floor(seconds)
      : DEFAULT_OTP_TTL_SECONDS
    expiresInSeconds.value = ttl
    otpSessionActive.value = true

    expiryTimer = setInterval(() => {
      if (expiresInSeconds.value <= 1) {
        expiresInSeconds.value = 0
        clearExpiryTimer()
        return
      }
      expiresInSeconds.value -= 1
    }, 1000)
  }

  function startResendCooldown(seconds: number) {
    clearResendTimer()
    const cooldown = Number.isFinite(seconds) && seconds >= 0
      ? Math.floor(seconds)
      : DEFAULT_RESEND_COOLDOWN_SECONDS
    resendWaitSeconds.value = cooldown

    if (cooldown <= 0) return

    resendTimer = setInterval(() => {
      if (resendWaitSeconds.value <= 1) {
        resendWaitSeconds.value = 0
        clearResendTimer()
        return
      }
      resendWaitSeconds.value -= 1
    }, 1000)
  }

  function applySendResponse(response: EmailOtpSendResponse) {
    const ttlSeconds = Number.isFinite(response.expiresInSeconds) && response.expiresInSeconds > 0
      ? Math.floor(response.expiresInSeconds)
      : DEFAULT_OTP_TTL_SECONDS
    const resendSeconds = options.syncResendWithExpiry
      ? ttlSeconds
      : (Number.isFinite(response.resendCooldownSeconds) && response.resendCooldownSeconds >= 0
          ? Math.floor(response.resendCooldownSeconds)
          : DEFAULT_RESEND_COOLDOWN_SECONDS)

    startExpiryCountdown(ttlSeconds)
    startResendCooldown(resendSeconds)
    resendCooldownSeconds.value = resendSeconds
  }

  function parseFetchError(err: unknown): string {
    const fetchError = err as {
      data?: { statusMessage?: string; message?: string; waitSeconds?: number; code?: string }
      statusMessage?: string
      message?: string
    }

    const waitSeconds = fetchError?.data?.waitSeconds
    if (waitSeconds) {
      startResendCooldown(waitSeconds)
    }

    const code = fetchError?.data?.code
    if (
      code === 'OTP_SMS_DELIVERY_FAILED'
      || code === 'OTP_SMS_PROVIDER_MISSING'
      || code === 'OTP_SEND_FAILED'
    ) {
      return OTP_SEND_FAILED_MSG
    }

    const rawMessage =
      fetchError?.data?.statusMessage
      || fetchError?.statusMessage
      || fetchError?.data?.message
      || fetchError?.message
      || ''

    if (/^\[POST\]\s*"\/api\//.test(rawMessage) || /^\[GET\]\s*"\/api\//.test(rawMessage)) {
      return OTP_SEND_FAILED_MSG
    }

    return (
      rawMessage
      || 'Something went wrong. Please try again.'
    )
  }

  const expiryLabel = computed(() => formatCountdown(expiresInSeconds.value))
  const resendWaitLabel = computed(() => formatCountdown(resendWaitSeconds.value))

  function formatCountdown(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const canResend = computed(() => resendWaitSeconds.value === 0)
  const isExpired = computed(() => otpSessionActive.value && expiresInSeconds.value === 0)

  onUnmounted(clearTimers)

  return {
    expiresInSeconds,
    resendWaitSeconds,
    resendCooldownSeconds,
    otpSessionActive,
    expiryLabel,
    resendWaitLabel,
    canResend,
    isExpired,
    startExpiryCountdown,
    startResendCooldown,
    applySendResponse,
    parseFetchError,
    clearTimers,
  }
}
