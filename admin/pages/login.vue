<script setup lang="ts">
definePageMeta({ layout: 'auth', ssr: false })

const {
  loginPhone,
  otpDigits,
  step,
  loading,
  errorMessage,
  phoneMasked,
  expiresInSeconds,
  canRequestOtp,
  canVerify,
  canResend,
  expiryLabel,
  resendWaitLabel,
  requestOtp,
  verifyOtp,
  challengeToken,
  resetLoginForm,
} = useAdminAuth()

const otpStepActive = computed(() => step.value === 'otp')
const { otpAutofillRef, onOtpAutofillInput } = useOtpAutofill({
  otpDigits,
  active: otpStepActive,
  enableWebOtp: true,
})

function onPhoneInput(event: Event) {
  const target = event.target as HTMLInputElement
  loginPhone.value = target.value.replace(/\D/g, '').slice(0, 10)
}

async function onPhoneSubmit() {
  await requestOtp()
}

async function onOtpSubmit() {
  await verifyOtp()
}

async function onResend() {
  await requestOtp()
}

function backToPhone() {
  challengeToken.value = null
  otpDigits.value = ['', '', '', '', '', '']
  errorMessage.value = null
  loading.value = false
  step.value = 'phone'
}

function onOtpInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const digit = target.value.replace(/\D/g, '').slice(-1)
  const next = [...otpDigits.value]
  next[index] = digit
  otpDigits.value = next
  if (digit && index < next.length - 1) {
    document.getElementById(`admin-otp-${index + 1}`)?.focus()
  }
}

function handleOtpKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    document.getElementById(`admin-otp-${index - 1}`)?.focus()
  }
}

function handleOtpPaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6)
  if (!pasted) return
  event.preventDefault()
  const next = [...otpDigits.value]
  pasted.split('').forEach((char, i) => {
    if (i < next.length) next[i] = char
  })
  otpDigits.value = next
}

onMounted(() => {
  resetLoginForm()
})
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left brand panel -->
    <section class="hidden w-[42%] flex-col justify-between bg-brand-primary p-10 text-white lg:flex">
      <div>
        <p class="text-2xl font-bold tracking-tight">
          PirtTrip
        </p>
        <h1 class="mt-16 text-4xl font-bold leading-tight">
          Welcome to the<br>Admin Panel
        </h1>
        <p class="mt-4 max-w-md text-white/85">
          Manage partner registrations, vendor approvals, and inbound enquiries from one place.
        </p>
        <ul class="mt-10 space-y-4 text-sm text-white/90">
          <li
            v-for="item in [
              'Review and approve partner registrations',
              'Contact vendors via call or WhatsApp',
              'Track OTP verification and lead status',
              'Export registration data to CSV',
            ]"
            :key="item"
            class="flex items-start gap-3"
          >
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {{ item }}
          </li>
        </ul>
      </div>
      <p class="text-xs text-white/60">
        © {{ new Date().getFullYear() }} PirtTrip. All rights reserved.
      </p>
    </section>

    <!-- Right auth card -->
    <section class="flex flex-1 items-center justify-center bg-[#f3f4f6] px-4 py-10">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <!-- Step 1: Phone -->
        <form v-if="step === 'phone'" @submit.prevent="onPhoneSubmit">
          <h2 class="text-2xl font-bold text-black">
            Welcome back
          </h2>
          <p class="mt-2 text-sm text-black/60">
            Enter your admin phone number
          </p>

          <p
            v-if="errorMessage"
            class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <label class="mt-6 block text-xs font-semibold uppercase tracking-wide text-black/50">
            Phone number
          </label>
          <div class="mt-2 flex overflow-hidden rounded-xl border border-black/15 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-orange-100">
            <span class="flex items-center border-r border-black/10 bg-black/[0.03] px-4 text-sm font-semibold text-black/70">
              +91
            </span>
            <input
              :value="loginPhone"
              type="tel"
              inputmode="numeric"
              maxlength="10"
              autocomplete="tel"
              placeholder="10-digit mobile number"
              class="h-12 flex-1 px-4 text-sm outline-none"
              @input="onPhoneInput"
            >
          </div>

          <button
            type="submit"
            :disabled="loading || !canRequestOtp"
            class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-gold text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/35"
          >
            {{ loading ? 'Sending OTP…' : 'Get OTP' }}
            <svg v-if="!loading" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </form>

        <!-- Step 2: OTP -->
        <form v-else class="relative" @submit.prevent="onOtpSubmit">
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

          <button
            type="button"
            class="mb-6 flex items-center gap-1 text-sm font-medium text-black/50 hover:text-black"
            @click="backToPhone"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Change number
          </button>

          <h2 class="text-2xl font-bold text-black">
            Verify OTP
          </h2>
          <p class="mt-2 text-sm text-black/60">
            Enter the 6-digit code sent to
            <strong class="text-black">{{ phoneMasked || `+91 ${loginPhone}` }}</strong>
          </p>

          <p
            v-if="errorMessage"
            class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <p v-if="expiresInSeconds > 0" class="mt-4 text-sm text-black/50">
            OTP expires in <strong>{{ expiryLabel }}</strong>
          </p>
          <p v-else-if="expiresInSeconds === 0" class="mt-4 text-sm text-amber-700">
            OTP expired. Resend to get a new one.
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
              class="h-[52px] w-full max-w-[52px] rounded-xl border border-black/15 text-center text-xl font-bold text-black outline-none focus:border-brand-primary focus:ring-2 focus:ring-orange-100"
              @input="onOtpInput(index, $event)"
              @keydown="handleOtpKeydown(index, $event)"
            >
          </div>

          <button
            type="submit"
            :disabled="loading || !canVerify"
            class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-gold text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/35"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ loading ? 'Verifying…' : 'Verify & Login' }}
          </button>

          <button
            type="button"
            class="mt-3 w-full py-2 text-sm font-medium text-brand-primary hover:underline disabled:opacity-50"
            :disabled="loading || !canResend"
            @click="onResend"
          >
            {{ canResend ? 'Resend OTP' : `Resend OTP in ${resendWaitLabel}` }}
          </button>
        </form>

        <p class="mt-8 text-center text-xs text-black/40">
          Only authorized administrators can access this panel.
        </p>
        <p class="mt-2 text-center text-xs text-black/30 lg:hidden">
          © {{ new Date().getFullYear() }} PirtTrip
        </p>
      </div>
    </section>
  </div>
</template>
