import type { AdminUser } from '~/types/database'

export type AdminLoginStep = 'credentials' | 'otp'

export function useAuth() {
  const { $supabase } = useNuxtApp()
  const session = useState<{ access_token: string } | null>('auth-session', () => null)
  const adminProfile = useState<AdminUser | null>('admin-profile', () => null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const loginStep = ref<AdminLoginStep>('credentials')
  const pendingAdminEmail = ref<string | null>(null)
  const admin2faVerified = useState('admin-2fa-verified', () => false)

  const otpFlow = useEmailOtp()
  const adminChallengeToken = ref<string | null>(null)

  async function initSession() {
    const { data } = await $supabase.auth.getSession()
    session.value = data.session
      ? { access_token: data.session.access_token }
      : null

    if (session.value) {
      await refreshAdminAccessState()
    } else {
      adminProfile.value = null
      admin2faVerified.value = false
    }

    return data.session
  }

  async function refreshAdminAccessState() {
    if (!session.value?.access_token) {
      adminProfile.value = null
      admin2faVerified.value = false
      return null
    }

    try {
      const profile = await $fetch<{
        needs2fa: boolean
        email?: string
        user: AdminUser | null
      }>(apiUrl('/api/admin/me'), {
        headers: {
          Authorization: `Bearer ${session.value.access_token}`,
        },
      })

      if (profile.needs2fa) {
        admin2faVerified.value = false
        adminProfile.value = null
        pendingAdminEmail.value = profile.email ?? null
        loginStep.value = 'otp'
        return null
      }

      admin2faVerified.value = true
      adminProfile.value = profile.user
      loginStep.value = 'credentials'
      pendingAdminEmail.value = null
      return profile.user
    } catch (err: unknown) {
      adminProfile.value = null
      admin2faVerified.value = false

      const status = (err as { statusCode?: number; status?: number })?.statusCode
        ?? (err as { status?: number })?.status
      if (status === 403) {
        await $supabase.auth.signOut()
        session.value = null
      }

      return null
    }
  }

  async function signInAdmin(email: string, password: string) {
    loading.value = true
    errorMessage.value = null

    try {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) throw error

      session.value = data.session
        ? { access_token: data.session.access_token }
        : null

      const access = await refreshAdminAccessState()

      if (access) {
        return data.session
      }

      if (needsAdmin2fa.value) {
        pendingAdminEmail.value = email.trim().toLowerCase()
        await sendAdmin2faOtp()
        return data.session
      }

      await $supabase.auth.signOut()
      session.value = null
      throw new Error('Admin access required')
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendAdmin2faOtp() {
    if (!session.value?.access_token) {
      throw new Error('Sign in with your password first')
    }

    loading.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<{
        success: boolean
        email: string
        challengeToken: string
        expiresInSeconds: number
        resendCooldownSeconds: number
        debugCode?: string
      }>(apiUrl('/api/admin/auth/send-otp'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.value.access_token}`,
        },
        body: {
          challengeToken: adminChallengeToken.value ?? undefined,
        },
      })

      adminChallengeToken.value = response.challengeToken

      pendingAdminEmail.value = response.email
      otpFlow.applySendResponse(response)

      if (import.meta.dev && response.debugCode) {
        console.info('[admin 2FA OTP debug]', response.debugCode)
      }
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyAdmin2fa(code: string) {
    if (!session.value?.access_token) {
      throw new Error('Session expired. Please sign in again.')
    }

    loading.value = true
    errorMessage.value = null

    try {
      if (!adminChallengeToken.value) {
        throw new Error('Verification session expired. Request a new code.')
      }

      await $fetch(apiUrl('/api/admin/auth/verify-otp'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.value.access_token}`,
        },
        body: {
          code,
          challengeToken: adminChallengeToken.value,
        },
      })

      admin2faVerified.value = true
      loginStep.value = 'credentials'
      await refreshAdminAccessState()
    } catch (err: unknown) {
      errorMessage.value = otpFlow.parseFetchError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    await $fetch(apiUrl('/api/admin/auth/sign-out'), { method: 'POST' }).catch(() => {})
    await $supabase.auth.signOut()
    session.value = null
    adminProfile.value = null
    admin2faVerified.value = false
    pendingAdminEmail.value = null
    loginStep.value = 'credentials'
    adminChallengeToken.value = null
    otpFlow.clearTimers()
  }

  async function fetchAdminProfile() {
    return refreshAdminAccessState()
  }

  function getAuthHeaders(): Record<string, string> {
    if (!session.value?.access_token) {
      return {}
    }
    return {
      Authorization: `Bearer ${session.value.access_token}`,
    }
  }

  const isAuthenticated = computed(() => Boolean(session.value?.access_token))
  const isAdmin = computed(() => Boolean(adminProfile.value) && admin2faVerified.value)
  const needsAdmin2fa = computed(
    () => isAuthenticated.value && !admin2faVerified.value && loginStep.value === 'otp',
  )

  return {
    session,
    adminProfile,
    loading,
    errorMessage,
    loginStep,
    pendingAdminEmail,
    admin2faVerified,
    otpFlow,
    isAuthenticated,
    isAdmin,
    needsAdmin2fa,
    initSession,
    signInAdmin,
    sendAdmin2faOtp,
    verifyAdmin2fa,
    signOut,
    fetchAdminProfile,
    getAuthHeaders,
  }
}
