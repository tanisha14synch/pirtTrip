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

const inputClass =
  'h-[46px] w-full rounded-[8px] border border-[#3a3530] bg-[#1e1b18] px-3.5 font-plein text-[15px] font-normal leading-[140%] text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#F3A81A]/70'

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
    class="w-full max-w-[480px] rounded-[14px] border border-white/[0.08] bg-[#141210]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:ml-auto lg:p-7"
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
      <h2 class="font-plein text-[30px] font-bold leading-[130%] tracking-[0] text-white md:text-[34px]">
        Get Started!
      </h2>

      <p class="mt-3 font-plein text-[15px] font-normal leading-[140%] tracking-[0] text-white/90">
        Register Today &amp;
        <span class="font-bold text-[#F3A81A]">Get First 20 Verified Customer Connect Credits for FREE</span>
        as a Welcome Benefit!
      </p>

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

        <input
          v-model="form.phone"
          type="tel"
          placeholder="Phone Number (10 digits)"
          required
          autocomplete="tel"
          inputmode="numeric"
          :class="inputClass"
        >

        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          required
          autocomplete="email"
          :class="inputClass"
        >

        <button
          type="submit"
          :disabled="loading"
          class="mt-1 flex h-[50px] w-full items-center justify-center gap-2.5 rounded-[8px] bg-[#F3A81A] font-plein text-[16px] font-bold leading-[140%] tracking-[0] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {{ loading ? 'Submitting…' : 'Subscribe' }}
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
          <span class="font-medium text-white">{{ normalizedEmail || form.email }}</span>
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
