import { PARTNER_OTP_SEND_FAILED_MSG, isPartnerOtpSendSuccess } from '~/constants/partner-otp'
import { partnerRegistrationSchema } from '~/utils/validation'
import type { PartnerLead } from '~/types/database'

export type RegistrationStep = 'form' | 'otp' | 'success'

const OTP_ENABLED = true
const PARTNER_OTP_FETCH_TIMEOUT_MS = 90_000
const PHONE_REGISTERED_MSG = 'This phone number is already registered.'

type OtpSendResponse = {
  success: boolean
  challengeToken: string
  expiresInSeconds: number
  resendCooldownSeconds: number
  phoneMasked: string
}

function isFormValidationError(err: unknown): err is Error {
  if (!(err instanceof Error)) return false
  const msg = err.message
  return (
    msg.includes('policy')
    || msg.includes('Invalid form')
    || msg.includes('valid')
  )
}

function getSendOtpUserMessage(err: unknown): string {
  if (isFormValidationError(err)) {
    return err.message
  }

  const fetchError = err as {
    data?: { code?: string }
    statusCode?: number
  }

  if (
    fetchError.statusCode === 409
    || fetchError.data?.code === 'PHONE_ALREADY_REGISTERED'
  ) {
    return PHONE_REGISTERED_MSG
  }

  return PARTNER_OTP_SEND_FAILED_MSG
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
    otpDigits.value = ['', '', '', '', '', '']
    applySendResponse(response)
    step.value = 'otp'
  }

  function failSendOtp(err?: unknown) {
    step.value = 'form'
    challengeToken.value = null
    errorMessage.value = err ? getSendOtpUserMessage(err) : PARTNER_OTP_SEND_FAILED_MSG
  }

  async function sendOtp() {
    if (loading.value) return

    loading.value = true
    errorMessage.value = null
    step.value = 'form'

    try {
      if (!form.agreePolicies1 || !form.agreePolicies2) {
        throw new Error('Please accept the required policies to continue.')
      }

      const parsed = partnerRegistrationSchema.safeParse(getFormPayload())
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid form')
      }

      challengeToken.value = null

      const response = await $fetch<OtpSendResponse>(
        apiUrl('/api/partner/send-otp'),
        {
          method: 'POST',
          timeout: PARTNER_OTP_FETCH_TIMEOUT_MS,
          body: parsed.data,
        },
      )

      if (!isPartnerOtpSendSuccess(response)) {
        failSendOtp()
        return
      }

      applyOtpSendResponse(response, parsed.data.phone)

      await nextTick()
      document.getElementById('partner-otp-0')?.focus()
    } catch (err: unknown) {
      failSendOtp(err)
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
        timeout: PARTNER_OTP_FETCH_TIMEOUT_MS,
        body: {
          ...parsed.data,
          challengeToken: challengeToken.value ?? undefined,
        },
      })

      if (!isPartnerOtpSendSuccess(response)) {
        errorMessage.value = PARTNER_OTP_SEND_FAILED_MSG
        return
      }

      applyOtpSendResponse(response, parsed.data.phone)

      await nextTick()
      document.getElementById('partner-otp-0')?.focus()
    } catch (err: unknown) {
      errorMessage.value = getSendOtpUserMessage(err)
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
          timeout: PARTNER_OTP_FETCH_TIMEOUT_MS,
          body: {
            ...parsed.data,
            code: otpCode.value,
            challengeToken: challengeToken.value,
          },
        },
      )

      if (!result?.success || !result.lead) {
        throw new Error('Verification failed. Please check the code and try again.')
      }

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
