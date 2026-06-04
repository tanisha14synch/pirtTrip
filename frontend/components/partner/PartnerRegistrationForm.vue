<script setup>
const {
  step,
  form,
  otpDigits,
  loading,
  errorMessage,
  successLead,
  normalizedEmail,
  otpFlow,
  otpEnabled,
  sendOtp,
  resendOtp,
  verifyOtpAndRegister,
  setOtpDigit,
  handleOtpKeydown,
  handleOtpPaste,
  reset,
} = usePartnerRegistration()

const connectsHelpOpen = ref(false)
const connectsHelpRef = ref(null)

const inputClass =
  'h-[46px] w-full rounded-[8px] border border-[#3a3530] bg-[#1e1b18] px-3.5 font-plein text-[15px] font-normal leading-[140%] text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#F3A81A]/70'

const linkClass =
  'text-[#F3A81A] underline decoration-[#F3A81A]/40 underline-offset-2 hover:decoration-[#F3A81A]'

function onPhoneInput(event) {
  form.phone = event.target.value.replace(/\D/g, '').slice(0, 10)
}

function toggleConnectsHelp() {
  connectsHelpOpen.value = !connectsHelpOpen.value
}

function onDocumentClick(event) {
  if (!connectsHelpRef.value?.contains(event.target)) {
    connectsHelpOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

async function onSubmitDetails() {
  try {
    await sendOtp()
  } catch {}
}

async function onSubmitOtp() {
  try {
    await verifyOtpAndRegister()
  } catch {}
}

function onOtpInput(index, event) {
  setOtpDigit(index, event.target.value)
}
</script>

<template>
  <aside
    id="get-started"
    class="w-full scroll-mt-6 rounded-[14px] border border-white/[0.08] bg-[#141210]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-7"
  >
    <template v-if="step === 'success'">
      <h2 class="font-plein text-[30px] font-bold leading-[130%] text-white md:text-[34px]">
        You&apos;re registered!
      </h2>
      <p class="mt-3 font-plein text-[15px] leading-[140%] text-white/85">
        Thank you{{ successLead ? `, ${successLead.first_name}` : '' }}. Our team will contact you shortly.
      </p>
      <button
        type="button"
        class="mt-6 flex h-[50px] w-full items-center justify-center rounded-[8px] border border-white/20 font-plein text-[15px] font-medium text-white hover:bg-white/5"
        @click="reset"
      >
        Register another business
      </button>
    </template>

    <template v-else>
      <h2 class="font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-white md:text-[32px]">
        New to pirtTrip business? Get Started
      </h2>

      <p class="mt-3 font-plein text-[15px] font-normal leading-[140%] tracking-[0] text-white/90">
        Register Today &amp; Get
        <span class="font-bold text-[#F3A81A]">FIRST 20 CONNECT CREDITs for FREE</span>
        as a Welcome Benefit!
      </p>

      <div
        ref="connectsHelpRef"
        class="relative mt-3 inline-flex items-center gap-1.5"
      >
        <span class="font-plein text-[14px] text-white/70">What are connects?</span>
        <button
          type="button"
          class="flex h-5 w-5 items-center justify-center rounded-full border border-white/25 bg-white/10 font-plein text-[12px] font-bold leading-none text-white/80 transition-colors hover:border-[#F3A81A]/60 hover:text-[#F3A81A]"
          aria-label="What are connects?"
          :aria-expanded="connectsHelpOpen"
          @click.stop="toggleConnectsHelp"
        >
          ?
        </button>

        <div
          v-if="connectsHelpOpen"
          class="absolute left-0 top-full z-20 mt-2 w-[260px] rounded-[10px] border border-white/10 bg-[#1e1b18] p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          role="tooltip"
        >
          <p class="font-plein text-[13px] leading-[150%] text-white/85">
            Connects are credits that let you receive verified traveler inquiries on pirtTrip. Use them to connect with customers interested in your trips and packages.
          </p>
        </div>
      </div>

      <p
        v-if="errorMessage"
        class="mt-4 rounded-[8px] border border-red-500/40 bg-red-500/10 px-3 py-2 font-plein text-[14px] text-red-200"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <form
        v-if="step === 'form'"
        class="mt-6 space-y-3"
        @submit.prevent="onSubmitDetails"
      >
        <div class="grid grid-cols-2 gap-3">
          <input
            v-model="form.firstName"
            type="text"
            placeholder="First Name"
            required
            autocomplete="given-name"
            :class="inputClass"
          >
          <input
            v-model="form.lastName"
            type="text"
            placeholder="Last Name"
            required
            autocomplete="family-name"
            :class="inputClass"
          >
        </div>

        <div class="flex h-[46px] overflow-hidden rounded-[8px] border border-[#3a3530] bg-[#1e1b18] focus-within:border-[#F3A81A]/70">
          <span class="flex shrink-0 items-center border-r border-[#3a3530] px-3.5 font-plein text-[15px] text-white/70">
            +91 –
          </span>
          <input
            :value="form.phone"
            type="tel"
            placeholder="enter your mobile no."
            required
            autocomplete="tel-national"
            inputmode="numeric"
            maxlength="10"
            class="min-w-0 flex-1 bg-transparent px-3.5 font-plein text-[15px] font-normal leading-[140%] text-white placeholder:text-white/35 outline-none"
            @input="onPhoneInput"
          >
        </div>

        <div class="space-y-3 pt-1">
          <label class="flex cursor-pointer items-start gap-2.5">
            <input
              v-model="form.whatsappOptIn"
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#1e1b18] accent-[#F3A81A]"
            >
            <span class="font-plein text-[13px] leading-[150%] text-white/75">
              <span class="text-white/50">Optional:</span>
              I would like to receive latest updates and useful information on WhatsApp.
            </span>
          </label>

          <label class="flex cursor-pointer items-start gap-2.5">
            <input
              v-model="form.agreePolicies1"
              type="checkbox"
              required
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#1e1b18] accent-[#F3A81A]"
            >
            <span class="font-plein text-[13px] leading-[150%] text-white/75">
              <span class="text-white/50">*</span>
              I have read and agree to the
              <NuxtLink to="/legal/terms" :class="linkClass" target="_blank">Terms &amp; Conditions</NuxtLink>,
              <NuxtLink to="/legal/travel-business-privacy" :class="linkClass" target="_blank">Travel Business Data Privacy Policy</NuxtLink>,
              and
              <NuxtLink to="/legal/disclaimer" :class="linkClass" target="_blank">Disclaimer</NuxtLink>.
            </span>
          </label>

          <label class="flex cursor-pointer items-start gap-2.5">
            <input
              v-model="form.agreePolicies2"
              type="checkbox"
              required
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#1e1b18] accent-[#F3A81A]"
            >
            <span class="font-plein text-[13px] leading-[150%] text-white/75">
              <span class="text-white/50">*</span>
              I agree to the
              <NuxtLink to="/legal/cookie-policy" :class="linkClass" target="_blank">Cookie Policy</NuxtLink>,
              <NuxtLink to="/legal/content-listing-policy" :class="linkClass" target="_blank">Content Listing &amp; Package Accuracy Policy</NuxtLink>,
              <NuxtLink to="/legal/intellectual-property" :class="linkClass" target="_blank">Brand Usage Policy</NuxtLink>,
              <NuxtLink to="/legal/intellectual-property" :class="linkClass" target="_blank">Intellectual Property Policy</NuxtLink>,
              and
              <NuxtLink to="/legal/anti-fraud" :class="linkClass" target="_blank">Anti-Fraud &amp; Platform Misuse Policy</NuxtLink>.
            </span>
          </label>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="mt-1 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[8px] bg-[#F3A81A] font-plein text-[16px] font-bold leading-[140%] tracking-[0] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {{ loading ? 'Submitting…' : 'Register Now' }}
          <svg
            v-if="!loading"
            class="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 3L11 14M22 3l-7 18-4-7-7-4 18-7z" />
          </svg>
        </button>
      </form>

      <!-- OTP step disabled until email provider is configured -->
      <form
        v-else-if="otpEnabled && step === 'otp'"
        class="mt-6 space-y-3"
        @submit.prevent="onSubmitOtp"
      >
        <p class="font-plein text-[14px] leading-[140%] text-white/80">
          Enter the 6-digit code sent to
          <span class="font-medium text-white">{{ normalizedEmail }}</span>
        </p>

        <p
          v-if="otpFlow.expiresInSeconds > 0"
          class="font-plein text-[13px] text-white/50"
        >
          Code expires in {{ otpFlow.expiryLabel }}
        </p>
        <p
          v-else
          class="font-plein text-[13px] text-amber-200/90"
        >
          Code expired. Resend to get a new one.
        </p>

        <div
          class="flex justify-between gap-2"
          @paste="handleOtpPaste"
        >
          <input
            v-for="(_, index) in otpDigits"
            :id="`partner-otp-${index}`"
            :key="index"
            :value="otpDigits[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            autocomplete="one-time-code"
            class="h-[52px] w-full max-w-[52px] rounded-[8px] border border-[#3a3530] bg-[#1e1b18] text-center font-plein text-[20px] font-bold text-white outline-none focus:border-[#F3A81A]/70"
            @input="onOtpInput(index, $event)"
            @keydown="handleOtpKeydown(index, $event)"
          >
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="mt-1 flex h-[50px] w-full items-center justify-center rounded-[8px] bg-[#F3A81A] font-plein text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {{ loading ? 'Verifying…' : 'Verify & Register' }}
        </button>

        <button
          type="button"
          class="w-full py-2 font-plein text-[14px] text-white/60 hover:text-white disabled:opacity-50"
          :disabled="loading || !otpFlow.canResend"
          @click="resendOtp"
        >
          {{
            otpFlow.canResend
              ? 'Resend code'
              : `Resend in ${otpFlow.resendWaitSeconds}s`
          }}
        </button>

        <button
          type="button"
          class="w-full py-2 font-plein text-[14px] text-white/45 hover:text-white"
          :disabled="loading"
          @click="reset"
        >
          Edit details
        </button>
      </form>
    </template>
  </aside>
</template>
