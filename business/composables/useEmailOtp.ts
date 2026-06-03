export type EmailOtpSendResponse = {
  success: boolean
  expiresInSeconds: number
  resendCooldownSeconds: number
  debugCode?: string
}

export function useEmailOtp(options: { resendCooldownSeconds?: number } = {}) {
  const expiresInSeconds = ref(0)
  const resendCooldownSeconds = ref(options.resendCooldownSeconds ?? 60)
  const resendWaitSeconds = ref(0)
  let expiryTimer: ReturnType<typeof setInterval> | null = null
  let resendTimer: ReturnType<typeof setInterval> | null = null

  function clearTimers() {
    if (expiryTimer) clearInterval(expiryTimer)
    if (resendTimer) clearInterval(resendTimer)
    expiryTimer = null
    resendTimer = null
  }

  function startExpiryCountdown(seconds: number) {
    clearTimers()
    expiresInSeconds.value = seconds

    expiryTimer = setInterval(() => {
      if (expiresInSeconds.value <= 1) {
        expiresInSeconds.value = 0
        if (expiryTimer) clearInterval(expiryTimer)
        expiryTimer = null
        return
      }
      expiresInSeconds.value -= 1
    }, 1000)
  }

  function startResendCooldown(seconds: number) {
    if (resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
    resendWaitSeconds.value = seconds

    resendTimer = setInterval(() => {
      if (resendWaitSeconds.value <= 1) {
        resendWaitSeconds.value = 0
        if (resendTimer) clearInterval(resendTimer)
        resendTimer = null
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
  const isExpired = computed(() => expiresInSeconds.value === 0)

  onUnmounted(clearTimers)

  return {
    expiresInSeconds,
    resendWaitSeconds,
    resendCooldownSeconds,
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
