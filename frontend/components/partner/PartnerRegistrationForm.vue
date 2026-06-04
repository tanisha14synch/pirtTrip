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
  'h-10 w-full rounded-lg border border-[#3a3530] bg-[#1e1b18] px-3 font-plein text-sm font-normal leading-normal text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#F3A81A]/70 md:h-11 md:px-3.5 md:text-base lg:h-12 lg:text-lg xl:h-[3.25rem]'

const checkboxClass =
  'mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#1e1b18] accent-[#F3A81A] md:h-[1.125rem] md:w-[1.125rem] lg:h-5 lg:w-5'

const labelTextClass =
  'font-plein text-xs leading-snug text-white/75 md:text-sm lg:text-base'

const linkClass =
  'text-[#F3A81A] underline decoration-[#F3A81A]/40 underline-offset-2 hover:decoration-[#F3A81A]'

function onPhoneInput(event) {
  form.phone = event.target.value.replace(/\D/g, '').slice(0, 10)
}

function showConnectsHelp() {
  connectsHelpOpen.value = true
}

function hideConnectsHelp() {
  connectsHelpOpen.value = false
}

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
    class="w-full scroll-mt-6 rounded-[14px] border border-white/[0.08] bg-[#141210]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-5 md:p-6 lg:p-7 xl:p-8"
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
      <h2 class="font-plein text-lg font-bold leading-tight text-white sm:text-xl md:text-2xl lg:text-3xl">
        New to PirtTrip business? Get Started
      </h2>

      <p class="mt-2 font-plein text-xs font-normal leading-snug text-white/90 sm:text-sm md:text-base lg:text-lg">
        Register Today &amp; Get
        <span class="font-bold text-[#F3A81A]">FIRST 20 CONNECT CREDITs for FREE</span>
        as a Welcome Benefit!
      </p>

      <div class="relative mt-2 inline-flex items-center gap-1.5">
        <span class="font-plein text-xs text-white/70 sm:text-sm md:text-base">What are connects?</span>
        <div
          ref="connectsHelpRef"
          class="relative inline-flex"
          @mouseenter="showConnectsHelp"
          @mouseleave="hideConnectsHelp"
          @focusin="showConnectsHelp"
          @focusout="hideConnectsHelp"
        >
          <button
            type="button"
            class="flex h-5 w-5 items-center justify-center rounded-full border border-white/25 bg-white/10 font-plein text-xs font-bold leading-none text-white/80 transition-colors hover:border-[#F3A81A]/60 hover:text-[#F3A81A] md:h-6 md:w-6 md:text-sm"
            aria-describedby="connects-help-tooltip"
            aria-label="What are connects?"
            :aria-expanded="connectsHelpOpen"
          >
            ?
          </button>

          <div
            v-show="connectsHelpOpen"
            id="connects-help-tooltip"
            class="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-[10px] border border-white/10 bg-[#1e1b18] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)] sm:left-0 sm:w-72 sm:translate-x-0 md:p-4 lg:w-80"
            role="tooltip"
          >
            <p class="font-plein text-xs leading-snug text-white/85 sm:text-sm md:text-base">
              Connects are credits that let you receive verified traveler inquiries on PirtTrip. Use them to connect with customers interested in your trips and packages.
            </p>
          </div>
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
        class="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5"
        @submit.prevent="onSubmitDetails"
      >
        <div class="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
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

        <input
          v-model="form.businessName"
          type="text"
          placeholder="Business Name"
          required
          autocomplete="organization"
          :class="inputClass"
        >

        <div class="flex h-10 overflow-hidden rounded-lg border border-[#3a3530] bg-[#1e1b18] focus-within:border-[#F3A81A]/70 md:h-11 lg:h-12 xl:h-[3.25rem]">
          <span class="flex shrink-0 items-center border-r border-[#3a3530] px-3 font-plein text-sm text-white/70 md:text-base lg:text-lg">
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
            class="min-w-0 flex-1 bg-transparent px-3 font-plein text-sm font-normal leading-normal text-white placeholder:text-white/35 outline-none md:text-base lg:text-lg"
            @input="onPhoneInput"
          >
        </div>

        <div class="space-y-2 md:space-y-2.5">
          <label class="flex cursor-pointer items-start gap-2 md:gap-2.5">
            <input
              v-model="form.whatsappOptIn"
              type="checkbox"
              :class="checkboxClass"
            >
            <span :class="labelTextClass">
              I would like to receive latest updates and useful information on WhatsApp.
            </span>
          </label>

          <label class="flex cursor-pointer items-start gap-2 md:gap-2.5">
            <input
              v-model="form.agreePolicies1"
              type="checkbox"
              required
              :class="checkboxClass"
            >
            <span :class="labelTextClass">
              <span class="text-white/50">*</span>
              I have read and agree to the
              <NuxtLink to="/legal/terms" :class="linkClass" target="_blank">Terms &amp; Conditions</NuxtLink>,
              <NuxtLink to="/legal/travel-business-privacy" :class="linkClass" target="_blank">Travel Business Data Privacy Policy</NuxtLink>,
              and
              <NuxtLink to="/legal/disclaimer" :class="linkClass" target="_blank">Disclaimer</NuxtLink>.
            </span>
          </label>

          <label class="flex cursor-pointer items-start gap-2 md:gap-2.5">
            <input
              v-model="form.agreePolicies2"
              type="checkbox"
              required
              :class="checkboxClass"
            >
            <span :class="labelTextClass">
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
          class="mt-0.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#F3A81A] font-plein text-sm font-bold leading-normal text-white transition-opacity hover:opacity-90 disabled:opacity-60 md:h-12 md:text-base lg:h-14 lg:text-lg xl:h-[3.25rem] xl:text-xl"
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
