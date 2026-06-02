<script setup>
const open = defineModel('open', { type: Boolean, default: false })

const {
  step,
  email,
  otpDigits,
  loading,
  errorMessage,
  otpFlow,
  reset,
  beginEmailStep,
  sendEmailOtp,
  resendEmailOtp,
  verifyOtpAndJoin,
  setOtpDigit,
  handleOtpKeydown,
  handleOtpPaste,
} = useWaitlistRegistration()

function close() {
  open.value = false
  reset()
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (!isOpen) reset()
})

async function onJoinNow() {
  try {
    await sendEmailOtp()
  } catch {}
}

async function onEnterOtp() {
  try {
    await verifyOtpAndJoin()
  } catch {}
}

function onOtpInput(index, event) {
  setOtpDigit(index, event.target.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
      >
        <div
          class="absolute inset-0 bg-black/55 backdrop-blur-md"
          aria-hidden="true"
          @click="close"
        />

        <div
          class="relative z-10 w-full max-w-[560px] rounded-[16px] border border-white/10 bg-[#1a1816]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-8"
        >
          <button
            type="button"
            class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
            @click="close"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <template v-if="step === 'success'">
            <h2 id="waitlist-modal-title" class="pr-10 font-plein text-[26px] font-bold leading-[130%] text-white sm:text-[30px]">
              You&apos;re on the list!
            </h2>
            <p class="mt-3 font-plein text-[15px] leading-[140%] text-white/75">
              We&apos;ll notify you at <span class="font-medium text-white">{{ email }}</span> when pirttrip launches.
            </p>
            <button
              type="button"
              class="mt-8 flex h-[50px] w-full items-center justify-center rounded-[10px] bg-[#F3A81A] font-plein text-[16px] font-bold text-white hover:opacity-90"
              @click="close"
            >
              Done
            </button>
          </template>

          <template v-else>
            <h2 id="waitlist-modal-title" class="pr-10 font-plein text-[26px] font-bold leading-[130%] text-white sm:text-[30px]">
              Join Waitlist Now
            </h2>

            <p class="mt-3 font-plein text-[14px] leading-[150%] text-white/70 sm:text-[15px]">
              Browse curated trips &amp; itineraries, connect with trusted travel organizers, and join unforgettable adventures — all from one platform.
            </p>

            <p
              v-if="errorMessage"
              class="mt-4 rounded-[8px] border border-red-500/40 bg-red-500/10 px-3 py-2 font-plein text-[14px] text-red-200"
              role="alert"
            >
              {{ errorMessage }}
            </p>

            <form
              v-if="step === 'email'"
              class="mt-6"
              @submit.prevent="onJoinNow"
            >
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="Enter email"
                class="h-[50px] w-full rounded-[10px] border border-white/15 bg-black/35 px-4 font-plein text-[15px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#F3A81A]/70"
              >
              <button
                type="submit"
                :disabled="loading"
                class="mt-4 flex h-[50px] w-full items-center justify-center rounded-[10px] bg-[#F3A81A] font-plein text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {{ loading ? 'Sending…' : 'Join Now' }}
              </button>
            </form>

            <form
              v-else-if="step === 'otp'"
              class="mt-6"
              @submit.prevent="onEnterOtp"
            >
              <p class="mb-2 font-plein text-[14px] text-white/70">
                Enter the 6-digit code sent to <span class="text-white">{{ email }}</span>
              </p>
              <p
                v-if="otpFlow.expiresInSeconds > 0"
                class="mb-4 font-plein text-[13px] text-white/45"
              >
                Code expires in {{ otpFlow.expiryLabel }}
              </p>
              <p
                v-else
                class="mb-4 font-plein text-[13px] text-amber-200/90"
              >
                Code expired. Resend to get a new one.
              </p>

              <div
                class="flex justify-between gap-2 sm:gap-3"
                @paste="handleOtpPaste"
              >
                <input
                  v-for="(_, index) in otpDigits"
                  :id="`waitlist-otp-${index}`"
                  :key="index"
                  :value="otpDigits[index]"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  autocomplete="one-time-code"
                  class="h-[52px] w-full max-w-[52px] rounded-[10px] border border-white/15 bg-black/35 text-center font-plein text-[20px] font-bold text-white outline-none transition-colors focus:border-[#F3A81A]/70"
                  @input="onOtpInput(index, $event)"
                  @keydown="handleOtpKeydown(index, $event)"
                >
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="mt-5 flex h-[50px] w-full items-center justify-center rounded-[10px] bg-[#F3A81A] font-plein text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {{ loading ? 'Verifying…' : 'Enter OTP' }}
              </button>

              <button
                type="button"
                class="mt-3 w-full py-2 font-plein text-[14px] text-white/55 hover:text-white disabled:opacity-50"
                :disabled="loading || !otpFlow.canResend"
                @click="resendEmailOtp"
              >
                {{
                  otpFlow.canResend
                    ? 'Resend code'
                    : `Resend in ${otpFlow.resendWaitSeconds}s`
                }}
              </button>

              <button
                type="button"
                class="mt-1 w-full py-2 font-plein text-[14px] text-white/45 hover:text-white"
                :disabled="loading"
                @click="beginEmailStep"
              >
                Change email
              </button>
            </form>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
