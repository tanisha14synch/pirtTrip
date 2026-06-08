import type { AdminUser } from '~/types/database'
import { ADMIN_NOT_REGISTERED_MESSAGE, isAllowedAdminPhone } from '~/constants/allowed-admin-phones'

type OtpSendResponse = {
  success: boolean
  phone: string
  phoneMasked: string
  challengeToken: string
  expiresInSeconds: number
  resendCooldownSeconds: number
}

export function useAdminAuth() {
  const { $supabase } = useNuxtApp()
  const accessToken = useState<string | null>('admin-access-token', () => null)
  const adminUser = useState<AdminUser | null>('admin-user', () => null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const loginPhone = ref('')
  const phoneMasked = ref('')
  const challengeToken = ref<string | null>(null)
  const otpDigits = ref(['', '', '', '', '', ''])
  const step = ref<'phone' | 'otp'>('phone')
  const resendWaitSeconds = ref(0)
  const expiresInSeconds = ref(0)
  let resendTimer: ReturnType<typeof setInterval> | null = null
  let expiryTimer: ReturnType<typeof setInterval> | null = null

  function clearTimers() {
    if (resendTimer) clearInterval(resendTimer)
    if (expiryTimer) clearInterval(expiryTimer)
    resendTimer = null
    expiryTimer = null
  }

  function startResendCooldown(seconds: number) {
    if (resendTimer) clearInterval(resendTimer)
    resendWaitSeconds.value = seconds
    resendTimer = setInterval(() => {
      if (resendWaitSeconds.value <= 1) {
        resendWaitSeconds.value = 0
        if (resendTimer) clearInterval(resendTimer)
        return
      }
      resendWaitSeconds.value -= 1
    }, 1000)
  }

  function startExpiryCountdown(seconds: number) {
    if (expiryTimer) clearInterval(expiryTimer)
    expiresInSeconds.value = seconds
    expiryTimer = setInterval(() => {
      if (expiresInSeconds.value <= 1) {
        expiresInSeconds.value = 0
        if (expiryTimer) clearInterval(expiryTimer)
        return
      }
      expiresInSeconds.value -= 1
    }, 1000)
  }

  function getAuthHeaders(): Record<string, string> {
    if (!accessToken.value) return {}
    return { Authorization: `Bearer ${accessToken.value}` }
  }

  async function initSession() {
    if (import.meta.server) return

    try {
      if (!$supabase?.auth) return

      const { data, error } = await $supabase.auth.getSession()
      if (error) {
        await $supabase.auth.signOut().catch(() => {})
        accessToken.value = null
        adminUser.value = null
        return
      }

      const token = data.session?.access_token
      if (!token) {
        accessToken.value = null
        adminUser.value = null
        return
      }

      accessToken.value = token
      await refreshProfile()
    } catch {
      accessToken.value = null
      adminUser.value = null
      await $supabase?.auth?.signOut().catch(() => {})
    }
  }

  async function refreshProfile() {
    if (!accessToken.value) {
      adminUser.value = null
      return null
    }
    try {
      const profile = await $fetch<{ needs2fa: boolean; user: AdminUser | null }>(
        apiUrl('/api/admin/me'),
        { headers: getAuthHeaders() },
      )
      if (profile.needs2fa) {
        if (!adminUser.value) {
          adminUser.value = null
        }
        return adminUser.value
      }
      adminUser.value = profile.user
      return profile.user
    } catch {
      if (!adminUser.value) {
        accessToken.value = null
        await $supabase.auth.signOut()
      }
      return adminUser.value
    }
  }

  async function requestOtp() {
    const localPhone = loginPhone.value.replace(/\D/g, '').slice(-10)
    if (!/^\d{10}$/.test(localPhone)) {
      errorMessage.value = 'Enter a valid 10-digit mobile number'
      return
    }
    if (!isAllowedAdminPhone(localPhone)) {
      errorMessage.value = ADMIN_NOT_REGISTERED_MESSAGE
      return
    }

    loading.value = true
    errorMessage.value = null
    try {
      const response = await $fetch<OtpSendResponse>(apiUrl('/api/admin/auth/login-request'), {
        method: 'POST',
        body: {
          phone: loginPhone.value.trim(),
          challengeToken: challengeToken.value ?? undefined,
        },
      })
      challengeToken.value = response.challengeToken
      loginPhone.value = response.phone
      phoneMasked.value = response.phoneMasked
      step.value = 'otp'
      otpDigits.value = ['', '', '', '', '', '']
      startExpiryCountdown(response.expiresInSeconds)
      startResendCooldown(response.resendCooldownSeconds)
    } catch (err: unknown) {
      errorMessage.value = parseError(err)
    } finally {
      loading.value = false
    }
  }

  async function verifyOtp() {
    const localPhone = loginPhone.value.replace(/\D/g, '').slice(-10)
    if (!isAllowedAdminPhone(localPhone)) {
      errorMessage.value = ADMIN_NOT_REGISTERED_MESSAGE
      step.value = 'phone'
      challengeToken.value = null
      return
    }

    loading.value = true
    errorMessage.value = null
    const code = otpDigits.value.join('')
    try {
      const result = await $fetch<{
        success: boolean
        accessToken: string
        refreshToken: string
        user: AdminUser
      }>(apiUrl('/api/admin/auth/login-verify'), {
        method: 'POST',
        body: {
          phone: loginPhone.value.trim(),
          code,
          challengeToken: challengeToken.value,
        },
      })

      if (!result?.accessToken || !result?.refreshToken || !result?.user?.id) {
        throw new Error('Invalid login response from server')
      }

      const { error: sessionError } = await $supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      })

      if (sessionError) {
        throw new Error(sessionError.message)
      }

      accessToken.value = result.accessToken
      adminUser.value = result.user
      clearTimers()
      await navigateTo('/vendors')
    } catch (err: unknown) {
      errorMessage.value = parseError(err)
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await $fetch(apiUrl('/api/admin/auth/sign-out'), { method: 'POST' }).catch(() => {})
    await $supabase.auth.signOut()
    accessToken.value = null
    adminUser.value = null
    step.value = 'phone'
    challengeToken.value = null
    clearTimers()
    await navigateTo('/login')
  }

  function parseError(err: unknown): string {
    const e = err as {
      data?: { statusMessage?: string; code?: string }
      statusMessage?: string
      message?: string
    }
    if (e?.data?.code === 'ADMIN_NOT_AUTHORIZED') {
      return ADMIN_NOT_REGISTERED_MESSAGE
    }
    return e?.data?.statusMessage || e?.statusMessage || e?.message || 'Something went wrong'
  }

  const isAuthenticated = computed(() => Boolean(accessToken.value && adminUser.value))
  const canResend = computed(() => resendWaitSeconds.value === 0)
  const canRequestOtp = computed(() => /^\d{10}$/.test(loginPhone.value.replace(/\D/g, '').slice(-10)))
  const canVerify = computed(() => otpDigits.value.join('').length === 6)
  const expiryLabel = computed(() => {
    const s = expiresInSeconds.value
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${String(r).padStart(2, '0')}`
  })
  const resendWaitLabel = computed(() => {
    const s = resendWaitSeconds.value
    const m = Math.floor(s / 60)
    const r = s % 60
    return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${s}s`
  })

  function resetToPhoneStep() {
    step.value = 'phone'
    challengeToken.value = null
    otpDigits.value = ['', '', '', '', '', '']
    errorMessage.value = null
    loading.value = false
    clearTimers()
  }

  function resetLoginForm() {
    loginPhone.value = ''
    resetToPhoneStep()
  }

  return {
    accessToken,
    adminUser,
    loading,
    errorMessage,
    loginPhone,
    phoneMasked,
    otpDigits,
    step,
    challengeToken,
    resendWaitSeconds,
    expiresInSeconds,
    isAuthenticated,
    canResend,
    canRequestOtp,
    canVerify,
    expiryLabel,
    resendWaitLabel,
    initSession,
    requestOtp,
    verifyOtp,
    signOut,
    resetToPhoneStep,
    resetLoginForm,
    getAuthHeaders,
    refreshProfile,
  }
}
