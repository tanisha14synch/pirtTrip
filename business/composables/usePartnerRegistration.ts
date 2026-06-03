import { partnerRegistrationSchema } from '~/utils/validation'
import type { PartnerLead } from '~/types/database'

export type RegistrationStep = 'form' | 'otp' | 'success'

/** OTP disabled temporarily — set to true when email provider is ready. */
const OTP_ENABLED = false

export function usePartnerRegistration() {
  const step = ref<RegistrationStep>('form')
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successLead = ref<PartnerLead | null>(null)
  const normalizedEmail = ref('')

  const otpFlow = useEmailOtp()
  const challengeToken = ref<string | null>(null)

  const form = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  })

  const otpDigits = ref(['', '', '', '', '', ''])
  const otpCode = computed(() => otpDigits.value.join(''))

  /** Direct partner registration (no OTP). */
  async function registerDirect() {
    loading.value = true
    errorMessage.value = null

    try {
      const parsed = partnerRegistrationSchema.safeParse({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
      })

      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? 'Invalid form')
      }

      const result = await $fetch<{ success: boolean; lead: PartnerLead }>(
        apiUrl('/api/partner/register-direct'),
        {
          method: 'POST',
          body: parsed.data,
        },
      )

      normalizedEmail.value = parsed.data.email
      successLead.value = result.lead
      step.value = 'success'
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
    } finally {
      loading.value = false
    }
  }

  /* OTP flow — commented until email (Resend/SMTP) is configured
  async function sendOtp() {
    loading.value = true
    errorMessage.value = null

    try {
      const parsed = partnerRegistrationSchema.safeParse({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
      })

      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? 'Invalid form')
      }

      const response = await $fetch<{
        success: boolean
        email: string
        challengeToken: string
        expiresInSeconds: number
        resendCooldownSeconds: number
        debugCode?: string
      }>(apiUrl('/api/partner/send-otp'), {
        method: 'POST',
        body: {
          ...parsed.data,
          challengeToken: challengeToken.value ?? undefined,
        },
      })

      challengeToken.value = response.challengeToken
      normalizedEmail.value = response.email
      step.value = 'otp'
      otpDigits.value = ['', '', '', '', '', '']
      otpFlow.applySendResponse(response)

      if (import.meta.dev && response.debugCode) {
        console.info('[partner OTP debug]', response.debugCode)
      }
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
    } finally {
      loading.value = false
    }
  }

  async function resendOtp() {
    if (!otpFlow.canResend.value) return
    await sendOtp()
  }

  async function verifyOtpAndRegister() {
    loading.value = true
    errorMessage.value = null

    try {
      const code = otpCode.value.trim()
      if (code.length < 6) {
        throw new Error('Enter the 6-digit code from your email')
      }

      if (otpFlow.isExpired.value) {
        throw new Error('Code expired. Tap “Resend code” to get a new one.')
      }

      if (!challengeToken.value) {
        throw new Error('Verification session expired. Request a new code.')
      }

      const result = await $fetch<{ success: boolean; lead: PartnerLead }>(
        apiUrl('/api/partner/verify-otp'),
        {
          method: 'POST',
          body: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone,
            email: normalizedEmail.value || form.email.trim(),
            code,
            challengeToken: challengeToken.value,
          },
        },
      )

      successLead.value = result.lead
      step.value = 'success'
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
    } finally {
      loading.value = false
    }
  }
  */

  async function sendOtp() {
    if (OTP_ENABLED) {
      return
    }
    await registerDirect()
  }

  async function resendOtp() {
    if (!OTP_ENABLED) return
  }

  async function verifyOtpAndRegister() {
    if (!OTP_ENABLED) return
  }

  function setOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    otpDigits.value[index] = digit

    if (digit && index < otpDigits.value.length - 1) {
      const next = document.getElementById(`partner-otp-${index + 1}`) as HTMLInputElement | null
      next?.focus()
    }
  }

  function handleOtpKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
      const prev = document.getElementById(`partner-otp-${index - 1}`) as HTMLInputElement | null
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

  function reset() {
    step.value = 'form'
    otpDigits.value = ['', '', '', '', '', '']
    errorMessage.value = null
    successLead.value = null
    normalizedEmail.value = ''
    challengeToken.value = null
    otpFlow.clearTimers()
  }

  return {
    step,
    form,
    otpDigits,
    otpCode,
    loading,
    errorMessage,
    successLead,
    normalizedEmail,
    otpFlow,
    otpEnabled: OTP_ENABLED,
    sendOtp,
    registerDirect,
    resendOtp,
    verifyOtpAndRegister,
    setOtpDigit,
    handleOtpKeydown,
    handleOtpPaste,
    reset,
  }
}
