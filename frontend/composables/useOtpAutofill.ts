const DEFAULT_LENGTH = 6
const WEB_OTP_LISTEN_MS = 10 * 60 * 1000

interface OTPCredential extends Credential {
  code: string
}

function supportsWebOtp(): boolean {
  return typeof window !== 'undefined'
    && 'credentials' in navigator
    && 'OTPCredential' in window
}

export function useOtpAutofill(length = DEFAULT_LENGTH) {
  const digits = ref<string[]>(Array.from({ length }, () => ''))
  const inputRef = ref<HTMLInputElement | null>(null)
  let webOtpAbort: AbortController | null = null
  let listenTimeout: ReturnType<typeof setTimeout> | null = null

  const code = computed(() => digits.value.join(''))

  function fillFromString(raw: string) {
    const cleaned = raw.replace(/\D/g, '').slice(0, length)
    digits.value = Array.from({ length }, (_, index) => cleaned[index] ?? '')
    if (inputRef.value) {
      inputRef.value.value = cleaned
    }
  }

  function clearDigits() {
    digits.value = Array.from({ length }, () => '')
    if (inputRef.value) {
      inputRef.value.value = ''
    }
  }

  function onInput(event: Event) {
    fillFromString((event.target as HTMLInputElement).value)
  }

  function focusInput() {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }

  function stopListening() {
    if (listenTimeout) {
      clearTimeout(listenTimeout)
      listenTimeout = null
    }
    webOtpAbort?.abort()
    webOtpAbort = null
  }

  function startListening() {
    if (!supportsWebOtp()) return

    stopListening()
    webOtpAbort = new AbortController()
    listenTimeout = setTimeout(() => stopListening(), WEB_OTP_LISTEN_MS)

    navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: webOtpAbort.signal,
      } as CredentialRequestOptions)
      .then((credential) => {
        const otp = credential as OTPCredential | null
        if (otp?.code) {
          fillFromString(otp.code)
        }
      })
      .catch(() => {})
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      startListening()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    stopListening()
  })

  return {
    digits,
    code,
    inputRef,
    fillFromString,
    clearDigits,
    onInput,
    focusInput,
    startListening,
    stopListening,
    supportsWebOtp,
  }
}
