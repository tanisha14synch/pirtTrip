import { partnerRegistrationSchema } from '~/utils/validation'
import type { PartnerLead } from '~/types/database'

export type RegistrationStep = 'form' | 'otp' | 'success'

const OTP_ENABLED = true

type OtpSendResponse = {
  success: boolean
  challengeToken: string
  expiresInSeconds: number
  resendCooldownSeconds: number
  phoneMasked: string
  debugCode?: string
}

export function usePartnerRegistration() {
  const step = ref<RegistrationStep>('form')
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const successLead = ref<PartnerLead | null>(null)

  const {
    expiresInSeconds: otpExpiresInSeconds,
    resendWaitSeconds: otpResendWaitSeconds,
    otpSessionActive,
    expiryLabel: otpExpiryLabel,
    resendWaitLabel: otpResendWaitLabel,
    canResend: otpCanResend,
    isExpired: otpIsExpired,
    applySendResponse,
    parseFetchError: parseOtpFetchError,
    clearTimers: clearOtpTimers,
  } = useEmailOtp()
  const challengeToken = ref<string | null>(null)
  const otpPhoneMasked = ref('')
  const otpDebugMode = ref(false)

  const form = reactive({
    firstName: '',
    lastName: '',
    businessName: '',
    phone: '',
    whatsappOptIn: false,
    agreePolicies1: false,
    agreePolicies2: false,
  })

  const otpDigits = ref(['', '', '', '', '', ''])
  const otpCode = computed(() => otpDigits.value.join(''))
  const canVerifyOtp = computed(() => otpCode.value.length === 6 && !otpIsExpired.value)

  function getFormPayload() {
    return {
      firstName: form.firstName,
      lastName: form.lastName,
      businessName: form.businessName,
      phone: form.phone.replace(/\D/g, '').slice(0, 10),
      whatsappOptIn: form.whatsappOptIn,
    }
  }

  function applyOtpSendResponse(response: OtpSendResponse, phone: string) {
    challengeToken.value = response.challengeToken
    otpPhoneMasked.value = response.phoneMasked || `+91 ******${phone.slice(-4)}`
    step.value = 'otp'
    otpDigits.value = ['', '', '', '', '', '']
    applySendResponse(response)
    otpDebugMode.value = Boolean(response.debugCode)

    if (response.debugCode) {
      console.info('[partner OTP]', response.debugCode)
    }
  }

  async function sendOtp() {
    loading.value = true
    errorMessage.value = null

    try {
      if (!form.agreePolicies1 || !form.agreePolicies2) {
        throw new Error('Please accept the required policies to continue.')
      }

      const parsed = partnerRegistrationSchema.safeParse(getFormPayload())
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid form')
      }

      challengeToken.value = null

      const response = await $fetch<OtpSendResponse & { success?: boolean }>(
        apiUrl('/api/partner/send-otp'),
        {
          method: 'POST',
          timeout: 30_000,
          body: parsed.data,
        },
      )

      if (!response?.challengeToken) {
        throw new Error('Unable to send OTP now. Please try again later.')
      }

      applyOtpSendResponse(response, parsed.data.phone)

      await nextTick()
      document.getElementById('partner-otp-0')?.focus()
    } catch (err: unknown) {
      errorMessage.value = parseOtpFetchError(err)
    } finally {
      loading.value = false
    }
  }

  async function resendOtp() {
    if (loading.value) return

    if (otpResendWaitSeconds.value > 0) {
      errorMessage.value = `Please wait ${otpResendWaitSeconds.value}s before resending.`
      return
    }

    loading.value = true
    errorMessage.value = null

    try {
      const parsed = partnerRegistrationSchema.safeParse(getFormPayload())
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid form')
      }

      const response = await $fetch<OtpSendResponse>(apiUrl('/api/partner/resend-otp'), {
        method: 'POST',
        timeout: 30_000,
        body: {
          ...parsed.data,
          challengeToken: challengeToken.value ?? undefined,
        },
      })

      applyOtpSendResponse(response, parsed.data.phone)

      await nextTick()
      document.getElementById('partner-otp-0')?.focus()
    } catch (err: unknown) {
      errorMessage.value = parseOtpFetchError(err)
    } finally {
      loading.value = false
    }
  }

  async function verifyOtpAndRegister() {
    if (!canVerifyOtp.value) {
      errorMessage.value = otpIsExpired.value
        ? 'Code expired. Tap “Resend OTP” to get a new one.'
        : 'Enter the 6-digit verification code'
      return
    }

    loading.value = true
    errorMessage.value = null

    try {
      if (!challengeToken.value) {
        throw new Error('Verification session expired. Request a new code.')
      }

      const parsed = partnerRegistrationSchema.safeParse(getFormPayload())
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid form')
      }

      const result = await $fetch<{ success: boolean; lead: PartnerLead }>(
        apiUrl('/api/partner/verify-otp'),
        {
          method: 'POST',
          timeout: 30_000,
          body: {
            ...parsed.data,
            code: otpCode.value,
            challengeToken: challengeToken.value,
          },
        },
      )

      successLead.value = result.lead
      step.value = 'success'
      clearOtpTimers()
    } catch (err: unknown) {
      errorMessage.value = parseOtpFetchError(err)
    } finally {
      loading.value = false
    }
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
    form.firstName = ''
    form.lastName = ''
    form.businessName = ''
    form.phone = ''
    form.whatsappOptIn = false
    form.agreePolicies1 = false
    form.agreePolicies2 = false
    otpDigits.value = ['', '', '', '', '', '']
    errorMessage.value = null
    successLead.value = null
    challengeToken.value = null
    otpPhoneMasked.value = ''
    otpDebugMode.value = false
    clearOtpTimers()
  }

  return {
    step,
    form,
    otpDigits,
    otpCode,
    canVerifyOtp,
    loading,
    errorMessage,
    successLead,
    otpPhoneMasked,
    otpDebugMode,
    otpExpiresInSeconds,
    otpResendWaitSeconds,
    otpSessionActive,
    otpExpiryLabel,
    otpResendWaitLabel,
    otpCanResend,
    otpIsExpired,
    otpEnabled: OTP_ENABLED,
    sendOtp,
    resendOtp,
    verifyOtpAndRegister,
    setOtpDigit,
    handleOtpKeydown,
    handleOtpPaste,
    reset,
  }
}
