import type { Ref } from 'vue'
import { extractOtpCode, isWebOtpSupported } from '~/utils/otp-autofill'

type OtpCredential = Credential & { code?: string }

type UseOtpAutofillOptions = {
  otpDigits: Ref<string[]>
  /** When true, listens for SMS autofill (Web OTP + iOS one-time-code). */
  active: Ref<boolean> | ComputedRef<boolean>
  /** Android Chrome Web OTP API (SMS only). Default true. */
  enableWebOtp?: boolean
  /** Fired after a full code is applied to digit boxes. */
  onFilled?: (code: string) => void
}

export function useOtpAutofill(options: UseOtpAutofillOptions) {
  const otpAutofillRef = ref<HTMLInputElement | null>(null)
  let abortController: AbortController | null = null

  function stopWebOtpListener() {
    abortController?.abort()
    abortController = null
  }

  function applyOtpCode(raw: string): boolean {
    const code = extractOtpCode(raw, options.otpDigits.value.length)
    if (!code) return false

    const chars = code.split('')
    options.otpDigits.value = options.otpDigits.value.map((_, index) => chars[index] ?? '')
    options.onFilled?.(code)
    return true
  }

  function onOtpAutofillInput(event: Event) {
    const target = event.target as HTMLInputElement
    if (!applyOtpCode(target.value)) return
    target.value = ''
  }

  async function startWebOtpListener() {
    if (options.enableWebOtp === false) return
    if (!isWebOtpSupported()) return

    stopWebOtpListener()
    abortController = new AbortController()

    try {
      const credential = await navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: abortController.signal,
      } as CredentialRequestOptions) as OtpCredential | null

      if (credential?.code) {
        applyOtpCode(credential.code)
      }
    } catch (error: unknown) {
      const name = (error as { name?: string })?.name
      if (name !== 'AbortError') {
        // Permission denied or unsupported — manual entry remains available.
      }
    }
  }

  watch(
    () => unref(options.active),
    (isActive) => {
      if (!import.meta.client) return

      if (isActive) {
        startWebOtpListener()
        nextTick(() => {
          otpAutofillRef.value?.focus({ preventScroll: true })
        })
        return
      }

      stopWebOtpListener()
      if (otpAutofillRef.value) {
        otpAutofillRef.value.value = ''
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stopWebOtpListener()
  })

  return {
    otpAutofillRef,
    onOtpAutofillInput,
    applyOtpCode,
  }
}
