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
  'h-[40px] w-full rounded-[8px] border border-[#3a3530] bg-[#1e1b18] px-3 font-plein text-[14px] font-normal leading-[140%] text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#F3A81A]/70'

const linkClass =
  'text-[#F3A81A] underline decoration-[#F3A81A]/40 underline-offset-2 hover:decoration-[#F3A81A]'

const EDITING_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

function onPhoneInput(event) {
  form.phone = event.target.value.replace(/\D/g, '').slice(0, 10)
}

function onPhoneKeydown(event) {
  if (EDITING_KEYS.has(event.key)) return
  if (event.ctrlKey || event.metaKey) return

  if (/^\d$/.test(event.key)) {
    if (form.phone.length >= 10) event.preventDefault()
    return
  }

  event.preventDefault()
}

function onPhoneBeforeInput(event) {
  if (event.inputType !== 'insertText' && event.inputType !== 'insertCompositionText') return

  const data = event.data
  if (!data) return

  if (/\D/.test(data) || form.phone.length + data.length > 10) {
    event.preventDefault()
  }
}

function onPhonePaste(event) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '') ?? ''
  if (!pasted) return

  form.phone = `${form.phone}${pasted}`.replace(/\D/g, '').slice(0, 10)
}

function onNameInput(event, key) {
  form[key] = event.target.value.replace(/\d/g, '').slice(0, 80)
}

function onNameKeydown(event, key) {
  if (EDITING_KEYS.has(event.key)) return
  if (event.ctrlKey || event.metaKey) return

  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    return
  }

  if (event.key.length === 1 && form[key].length >= 80) {
    event.preventDefault()
  }
}

function onNameBeforeInput(event) {
  if (event.inputType !== 'insertText' && event.inputType !== 'insertCompositionText') return

  const data = event.data
  if (data && /\d/.test(data)) {
    event.preventDefault()
  }
}

function onNamePaste(event, key) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text').replace(/\d/g, '') ?? ''
  if (!pasted) return

  form[key] = `${form[key]}${pasted}`.slice(0, 80)
}

function onBusinessNameInput(event) {
  form.businessName = event.target.value.slice(0, 120)
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
    class="w-full scroll-mt-6 rounded-[14px] border border-white/[0.08] bg-[#141210]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:p-5"
  >
    <template v-if="step === 'success'">
      <h2 class="font-plein text-[22px] font-bold leading-[130%] text-white md:text-[26px]">
        Thank you for registering on PirtTrip Business!
      </h2>
      <p class="mt-3 font-plein text-[15px] leading-[150%] text-white/85">
        We are launching soon and working hard to bring your business dashboard live.
        We&apos;ll keep you updated once it is ready. For any queries, please contact
        Business Support at:
        <a
          href="mailto:contact@pirttrip.com"
          class="text-[#F3A81A] underline underline-offset-2 hover:text-[#f5b83d]"
        >contact@pirttrip.com</a>
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
      <h2 class="font-plein text-[17px] font-bold leading-[125%] tracking-[0] text-white md:text-[24px]">
        New to PirtTrip business?<span class="hidden md:inline"> Get Started</span>
      </h2>

      <p class="mt-2 font-plein text-[13px] font-normal leading-[135%] tracking-[0] text-white/90">
        Register Today &amp; Get
        <span class="font-bold text-[#F3A81A]">FIRST 20 CONNECT CREDITs for FREE</span>
        as a Welcome Benefit!
      </p>

      <div
        ref="connectsHelpRef"
        class="relative mt-2 inline-flex items-center"
        @mouseenter="showConnectsHelp"
        @mouseleave="hideConnectsHelp"
      >
        <span class="font-plein text-[13px] leading-[135%] text-white/70">What are connects</span>
        <button
          type="button"
          class="connects-help-trigger -ml-px inline-flex h-[18px] w-[14px] shrink-0 items-center justify-center font-plein text-[15px] font-bold leading-none text-[#F3A81A] transition-colors hover:text-white"
          aria-describedby="connects-help-tooltip"
          aria-label="What are connects?"
          :aria-expanded="connectsHelpOpen"
          @click="connectsHelpOpen = !connectsHelpOpen"
        >
          ?
        </button>

        <div
          v-show="connectsHelpOpen"
          id="connects-help-tooltip"
          class="absolute left-0 top-[calc(100%+8px)] z-30 w-[min(260px,calc(100vw-2.5rem))] rounded-[10px] border border-white/10 bg-[#1e1b18] p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          role="tooltip"
        >
          <p class="font-plein text-[13px] leading-[150%] text-white/85">
            Connects are credits that let you receive verified traveler inquiries on PirtTrip. Use them to connect with customers interested in your trips and packages.
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
        class="mt-4 space-y-2.5"
        @submit.prevent="onSubmitDetails"
      >
        <div class="grid grid-cols-2 gap-2.5">
          <input
            :value="form.firstName"
            type="text"
            placeholder="First Name"
            required
            autocomplete="given-name"
            maxlength="80"
            :class="inputClass"
            @input="onNameInput($event, 'firstName')"
            @keydown="onNameKeydown($event, 'firstName')"
            @beforeinput="onNameBeforeInput"
            @paste="onNamePaste($event, 'firstName')"
          >
          <input
            :value="form.lastName"
            type="text"
            placeholder="Last Name"
            required
            autocomplete="family-name"
            maxlength="80"
            :class="inputClass"
            @input="onNameInput($event, 'lastName')"
            @keydown="onNameKeydown($event, 'lastName')"
            @beforeinput="onNameBeforeInput"
            @paste="onNamePaste($event, 'lastName')"
          >
        </div>

        <input
          :value="form.businessName"
          type="text"
          placeholder="Business Name"
          required
          autocomplete="organization"
          maxlength="120"
          :class="inputClass"
          @input="onBusinessNameInput"
        >

        <div class="flex h-[40px] overflow-hidden rounded-[8px] border border-[#3a3530] bg-[#1e1b18] focus-within:border-[#F3A81A]/70">
          <span class="flex shrink-0 items-center border-r border-[#3a3530] px-3 font-plein text-[14px] text-white/70">
            +91 –
          </span>
          <input
            :value="form.phone"
            type="tel"
            placeholder="enter your mobile no."
            required
            autocomplete="tel-national"
            inputmode="numeric"
            pattern="[0-9]{10}"
            maxlength="10"
            class="min-w-0 flex-1 bg-transparent px-3 font-plein text-[14px] font-normal leading-[140%] text-white placeholder:text-white/35 outline-none"
            @input="onPhoneInput"
            @keydown="onPhoneKeydown"
            @beforeinput="onPhoneBeforeInput"
            @paste="onPhonePaste"
          >
        </div>

        <div class="space-y-2">
          <label class="flex cursor-pointer items-start gap-2">
            <input
              v-model="form.whatsappOptIn"
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#1e1b18] accent-[#F3A81A]"
            >
            <span class="font-plein text-[12px] leading-[140%] text-white/75">
              I would like to receive latest updates and useful information on WhatsApp.
            </span>
          </label>

          <label class="flex cursor-pointer items-start gap-2">
            <input
              v-model="form.agreePolicies1"
              type="checkbox"
              required
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#1e1b18] accent-[#F3A81A]"
            >
            <span class="font-plein text-[12px] leading-[140%] text-white/75">
              <span class="text-white/50">*</span>
              I have read and agree to the
              <NuxtLink to="/legal/terms" :class="linkClass" target="_blank">Terms &amp; Conditions</NuxtLink>,
              <NuxtLink to="/legal/travel-business-privacy" :class="linkClass" target="_blank">Travel Business Data Privacy Policy</NuxtLink>,
              and
              <NuxtLink to="/legal/disclaimer" :class="linkClass" target="_blank">Disclaimer</NuxtLink>.
            </span>
          </label>

          <label class="flex cursor-pointer items-start gap-2">
            <input
              v-model="form.agreePolicies2"
              type="checkbox"
              required
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-[#1e1b18] accent-[#F3A81A]"
            >
            <span class="font-plein text-[12px] leading-[140%] text-white/75">
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
          class="mt-0.5 flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#F3A81A] font-plein text-[15px] font-bold leading-[140%] tracking-[0] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
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

<style scoped>
.connects-help-trigger {
  color: #f3a81a;
}

.connects-help-trigger:hover {
  color: #fff;
}
</style>
