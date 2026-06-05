export type EmailOtpSendResponse = {
  success: boolean
  expiresInSeconds: number
  resendCooldownSeconds: number
  debugCode?: string
}

const DEFAULT_OTP_TTL_SECONDS = 600
const DEFAULT_RESEND_COOLDOWN_SECONDS = 60

export function useEmailOtp(options: { resendCooldownSeconds?: number } = {}) {
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
    startExpiryCountdown(response.expiresInSeconds)
    startResendCooldown(response.resendCooldownSeconds)
    if (response.resendCooldownSeconds) {
      resendCooldownSeconds.value = response.resendCooldownSeconds
    }
  }

  function parseFetchError(err: unknown): string {
    const fetchError = err as {
      data?: { statusMessage?: string; message?: string; waitSeconds?: number }
      statusMessage?: string
      message?: string
    }

    const waitSeconds = fetchError?.data?.waitSeconds
    if (waitSeconds) {
      startResendCooldown(waitSeconds)
    }

    return (
      fetchError?.data?.statusMessage
      || fetchError?.statusMessage
      || fetchError?.data?.message
      || fetchError?.message
      || 'Something went wrong. Please try again.'
    )
  }

  const expiryLabel = computed(() => {
    const m = Math.floor(expiresInSeconds.value / 60)
    const s = expiresInSeconds.value % 60
    return `${m}:${String(s).padStart(2, '0')}`
  })

  const canResend = computed(() => resendWaitSeconds.value === 0)
  const isExpired = computed(() => otpSessionActive.value && expiresInSeconds.value === 0)

  onUnmounted(clearTimers)

  return {
    expiresInSeconds,
    resendWaitSeconds,
    resendCooldownSeconds,
    otpSessionActive,
    expiryLabel,
    canResend,
    isExpired,
    startExpiryCountdown,
    startResendCooldown,
    applySendResponse,
    parseFetchError,
    clearTimers,
  }
}
