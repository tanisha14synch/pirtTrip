import { z } from 'zod'

export type WaitlistStep = 'email' | 'otp' | 'success'

/** OTP disabled temporarily — set to true when email provider is ready. */
const OTP_ENABLED = false

export function useWaitlistRegistration() {
  const step = ref<WaitlistStep>('email')
  const email = ref('')
  const otpDigits = ref(['', '', '', '', '', ''])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const otpFlow = useEmailOtp()
  const challengeToken = ref<string | null>(null)

  const otpCode = computed(() => otpDigits.value.join(''))

  function reset() {
    step.value = 'email'
    email.value = ''
    otpDigits.value = ['', '', '', '', '', '']
    loading.value = false
    errorMessage.value = null
    challengeToken.value = null
    otpFlow.clearTimers()
  }

  function beginEmailStep() {
    step.value = 'email'
    otpDigits.value = ['', '', '', '', '', '']
    challengeToken.value = null
    errorMessage.value = null
    otpFlow.clearTimers()
  }

  /** Direct waitlist join (no OTP). */
  async function joinWaitlistDirect() {
    loading.value = true
    errorMessage.value = null

    try {
      const parsed = z.string().email('Enter a valid email address').safeParse(email.value.trim())
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? 'Invalid email')
      }

      const normalized = parsed.data.toLowerCase()
      email.value = normalized

      await $fetch(apiUrl('/api/waitlist/join'), {
        method: 'POST',
        body: { email: normalized },
      })

      step.value = 'success'
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
    } finally {
      loading.value = false
    }
  }

  /* OTP flow — commented until email (Resend/SMTP) is configured
  async function sendEmailOtp() {
    loading.value = true
    errorMessage.value = null

    try {
      const parsed = z.string().email('Enter a valid email address').safeParse(email.value.trim())
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? 'Invalid email')
      }

      const normalized = parsed.data.toLowerCase()

      const response = await $fetch<{
        success: boolean
        challengeToken: string
        expiresInSeconds: number
        resendCooldownSeconds: number
        debugCode?: string
      }>(apiUrl('/api/waitlist/send-otp'), {
        method: 'POST',
        body: {
          email: normalized,
          challengeToken: challengeToken.value ?? undefined,
        },
      })

      challengeToken.value = response.challengeToken
      email.value = normalized
      step.value = 'otp'
      otpDigits.value = ['', '', '', '', '', '']
      otpFlow.applySendResponse(response)

      if (import.meta.dev && response.debugCode) {
        console.info('[waitlist OTP debug]', response.debugCode)
      }
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
    } finally {
      loading.value = false
    }
  }

  async function resendEmailOtp() {
    if (!otpFlow.canResend.value) return
    await sendEmailOtp()
  }

  async function verifyOtpAndJoin() {
    loading.value = true
    errorMessage.value = null

    try {
      const token = otpCode.value.trim()
      if (token.length < 6) {
        throw new Error('Enter the 6-digit code from your email')
      }

      if (otpFlow.isExpired.value) {
        throw new Error('Code expired. Tap “Resend code” to get a new one.')
      }

      if (!challengeToken.value) {
        throw new Error('Verification session expired. Request a new code.')
      }

      await $fetch(apiUrl('/api/waitlist/verify-otp'), {
        method: 'POST',
        body: {
          email: email.value,
          code: token,
          challengeToken: challengeToken.value,
        },
      })

      step.value = 'success'
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
    } finally {
      loading.value = false
    }
  }
  */

  async function sendEmailOtp() {
    if (OTP_ENABLED) {
      // await sendEmailOtpOtpFlow()
      return
    }
    await joinWaitlistDirect()
  }

  async function resendEmailOtp() {
    if (!OTP_ENABLED) return
    // if (!otpFlow.canResend.value) return
    // await sendEmailOtp()
  }

  async function verifyOtpAndJoin() {
    if (!OTP_ENABLED) return
    // OTP verify implementation above
  }

  function setOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    otpDigits.value[index] = digit

    if (digit && index < otpDigits.value.length - 1) {
      const next = document.getElementById(`waitlist-otp-${index + 1}`) as HTMLInputElement | null
      next?.focus()
    }
  }

  function handleOtpKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
      const prev = document.getElementById(`waitlist-otp-${index - 1}`) as HTMLInputElement | null
      prev?.focus()
    }
  }

  function handleOtpPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    event.preventDefault()
    pasted.split('').forEach((char, i) => {
      if (i < otpDigits.value.length) otpDigits.value[i] = char
    })
  }

  return {
    step,
    email,
    otpDigits,
    otpCode,
    loading,
    errorMessage,
    otpFlow,
    otpEnabled: OTP_ENABLED,
    reset,
    beginEmailStep,
    sendEmailOtp,
    joinWaitlistDirect,
    resendEmailOtp,
    verifyOtpAndJoin,
    setOtpDigit,
    handleOtpKeydown,
    handleOtpPaste,
  }
}
