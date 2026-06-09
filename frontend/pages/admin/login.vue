<script setup>
definePageMeta({
  layout: false,
  middleware: 'admin-auth',
})

const auth = useAuth()
const email = ref('')
const password = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const localError = ref(null)

const otpCode = computed(() => otpDigits.value.join(''))

const otpStepActive = computed(() => auth.loginStep.value === 'otp' || auth.needsAdmin2fa.value)
const { otpAutofillRef, onOtpAutofillInput } = useOtpAutofill({
  otpDigits,
  active: otpStepActive,
  enableWebOtp: false,
})

watch(
  () => auth.needsAdmin2fa.value,
  (needs) => {
    if (needs) {
      otpDigits.value = ['', '', '', '', '', '']
    }
  },
)

async function onCredentialsSubmit() {
  localError.value = null
  try {
    await auth.signInAdmin(email.value, password.value)
    if (auth.isAdmin.value) {
      await navigateTo('/admin')
    }
  } catch {
    localError.value = auth.errorMessage.value ?? 'Login failed'
  }
}

async function onOtpSubmit() {
  localError.value = null
  try {
    await auth.verifyAdmin2fa(otpCode.value)
    await navigateTo('/admin')
  } catch {
    localError.value = auth.errorMessage.value ?? 'Verification failed'
  }
}

async function onResendOtp() {
  localError.value = null
  try {
    await auth.sendAdmin2faOtp()
  } catch {
    localError.value = auth.errorMessage.value ?? 'Could not resend code'
  }
}

function setOtpDigit(index, value) {
  const digit = value.replace(/\D/g, '').slice(-1)
  otpDigits.value[index] = digit
  if (digit && index < otpDigits.value.length - 1) {
    document.getElementById(`admin-otp-${index + 1}`)?.focus()
  }
}

function handleOtpKeydown(index, event) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    document.getElementById(`admin-otp-${index - 1}`)?.focus()
  }
}

function handleOtpPaste(event) {
  const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6)
  if (!pasted) return
  event.preventDefault()
  pasted.split('').forEach((char, i) => {
    if (i < otpDigits.value.length) otpDigits.value[i] = char
  })
}

async function backToCredentials() {
  await auth.signOut()
  auth.loginStep.value = 'credentials'
  otpDigits.value = ['', '', '', '', '', '']
  localError.value = null
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#141210] px-4">
    <form
      v-if="auth.loginStep === 'credentials' && !auth.needsAdmin2fa"
      class="w-full max-w-md rounded-[14px] border border-white/10 bg-[#1e1b18] p-8"
      @submit.prevent="onCredentialsSubmit"
    >
      <h1 class="font-plein text-2xl font-bold text-white">
        Admin Login
      </h1>
      <p class="mt-2 font-plein text-sm text-white/60">
        Partner leads dashboard
      </p>

      <p
        v-if="localError || auth.errorMessage"
        class="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        role="alert"
      >
        {{ localError || auth.errorMessage }}
      </p>

      <div class="mt-6 space-y-4">
        <div>
          <label class="mb-1 block font-plein text-sm text-white/70">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="h-11 w-full rounded-lg border border-[#3a3530] bg-black/40 px-3 text-white outline-none focus:border-[#F3A81A]"
          >
        </div>
        <div>
          <label class="mb-1 block font-plein text-sm text-white/70">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="h-11 w-full rounded-lg border border-[#3a3530] bg-black/40 px-3 text-white outline-none focus:border-[#F3A81A]"
          >
        </div>
      </div>

      <button
        type="submit"
        :disabled="auth.loading"
        class="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#F3A81A] font-plein font-bold text-white disabled:opacity-60"
      >
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <form
      v-else
      class="relative w-full max-w-md rounded-[14px] border border-white/10 bg-[#1e1b18] p-8"
      @submit.prevent="onOtpSubmit"
    >
      <input
        ref="otpAutofillRef"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        class="pointer-events-none absolute h-px w-px opacity-0"
        tabindex="-1"
        aria-hidden="true"
        @input="onOtpAutofillInput"
      >

      <h1 class="font-plein text-2xl font-bold text-white">
        Verify your email
      </h1>
      <p class="mt-2 font-plein text-sm text-white/60">
        Enter the 6-digit code sent to
        <span class="text-white">{{ auth.pendingAdminEmail || email }}</span>
      </p>

      <p
        v-if="localError || auth.errorMessage"
        class="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        role="alert"
      >
        {{ localError || auth.errorMessage }}
      </p>

      <p
        v-if="auth.otpFlow.expiresInSeconds > 0"
        class="mt-4 font-plein text-sm text-white/50"
      >
        Code expires in {{ auth.otpFlow.expiryLabel }}
      </p>
      <p
        v-else-if="auth.otpFlow.expiresInSeconds === 0 && auth.loginStep === 'otp'"
        class="mt-4 font-plein text-sm text-amber-200/90"
      >
        Code expired. Resend to get a new one.
      </p>

      <div
        class="mt-6 flex justify-between gap-2"
        @paste="handleOtpPaste"
      >
        <input
          v-for="(_, index) in otpDigits"
          :id="`admin-otp-${index}`"
          :key="index"
          :value="otpDigits[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          autocomplete="off"
          class="h-12 w-full max-w-[52px] rounded-lg border border-[#3a3530] bg-black/40 text-center font-plein text-xl font-bold text-white outline-none focus:border-[#F3A81A]"
          @input="setOtpDigit(index, $event.target.value)"
          @keydown="handleOtpKeydown(index, $event)"
        >
      </div>

      <button
        type="submit"
        :disabled="auth.loading || otpCode.length < 6"
        class="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-[#F3A81A] font-plein font-bold text-white disabled:opacity-60"
      >
        {{ auth.loading ? 'Verifying…' : 'Verify & continue' }}
      </button>

      <button
        type="button"
        class="mt-3 w-full py-2 font-plein text-sm text-white/55 hover:text-white disabled:opacity-50"
        :disabled="auth.loading || !auth.otpFlow.canResend"
        @click="onResendOtp"
      >
        {{
          auth.otpFlow.canResend
            ? 'Resend code'
            : `Resend in ${auth.otpFlow.resendWaitSeconds}s`
        }}
      </button>

      <button
        type="button"
        class="mt-1 w-full py-2 font-plein text-sm text-white/45 hover:text-white"
        @click="backToCredentials"
      >
        Back to sign in
      </button>
    </form>
  </div>
</template>
