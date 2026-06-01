<script setup>
const HERO_BG = '/images/hero/hero-bg.png'

const heroStyle = {
  backgroundColor: '#D9D9D9',
  backgroundImage: [
    'linear-gradient(0deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45))',
    'linear-gradient(90deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.15) 45%, rgba(255, 171, 11, 0.12) 100%)',
    `url('${HERO_BG}')`,
  ].join(', '),
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
}

const timeLeft = ref({
  days: 20,
  hours: 5,
  minutes: 55,
  seconds: 39,
})

const waitlistOpen = ref(false)

let timerId

const pad = (value) => String(value).padStart(2, '0')

const tickCountdown = () => {
  let total = timeLeft.value.days * 86400
    + timeLeft.value.hours * 3600
    + timeLeft.value.minutes * 60
    + timeLeft.value.seconds

  total = Math.max(0, total - 1)

  timeLeft.value = {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

onMounted(() => {
  timerId = window.setInterval(tickCountdown, 1000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<template>
  <section class="relative flex min-h-screen flex-col overflow-hidden" aria-label="Coming soon">
    <div
      class="pointer-events-none absolute inset-0 z-0"
      :style="heroStyle"
      aria-hidden="true"
    />

    <!-- Top bar (Figma) -->
    <header class="relative z-20 w-full px-4 pt-5 sm:px-8 sm:pt-6 lg:px-12">
      <div class="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NuxtLink to="/" class="inline-flex shrink-0">
          <img
            src="/images/logo.png"
            alt="pirttrip"
            class="h-9 w-auto object-contain sm:h-10"
            width="584"
            height="192"
          >
        </NuxtLink>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <NuxtLink
            to="/become-a-partner"
            class="inline-flex h-[44px] shrink-0 items-center justify-center rounded-[8px] bg-[#F3A81A] px-5 font-plein text-[15px] font-bold text-white transition-opacity hover:opacity-90 sm:h-[46px] sm:px-6"
          >
            Become a Partner
          </NuxtLink>

          <span class="hidden h-10 w-px shrink-0 bg-white/35 sm:block" aria-hidden="true" />

          <div class="font-plein text-[13px] font-normal leading-[140%] text-white sm:text-[14px]">
            <p>For any information, Contact</p>
            <p>
              Partner Support at:
              <a href="tel:+919711104186" class="text-white hover:underline">+91-9711104186</a>
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero content -->
    <div class="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-8 text-center sm:px-6 sm:pb-20">
      <p class="font-plein text-[14px] font-medium uppercase tracking-[0.12em] text-white/90 sm:text-[15px]">
        Coming Soon
      </p>

      <h1
        class="mt-4 max-w-[920px] font-plein text-[32px] font-bold leading-[115%] tracking-[-0.02em] text-white sm:text-[44px] md:text-[52px] lg:text-[56px]"
      >
        Find, Join &amp; Experience Amazing Group Trips
      </h1>

      <p class="mt-5 max-w-[720px] font-plein text-[15px] font-normal leading-[150%] text-white/85 sm:text-[17px] md:text-[18px]">
        Find exciting group trips, meet fellow travelers, and explore new destinations through experiences crafted by trusted organizers.
      </p>

      <!-- Countdown -->
      <div class="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
        <div
          v-for="unit in [
            { label: 'DAYS', value: timeLeft.days },
            { label: 'HRS', value: timeLeft.hours },
            { label: 'MINS', value: timeLeft.minutes },
            { label: 'SECS', value: timeLeft.seconds },
          ]"
          :key="unit.label"
          class="flex min-w-[64px] flex-col items-center justify-center rounded-[10px] border border-white/10 bg-black/45 px-3 py-3 backdrop-blur-sm sm:min-w-[72px] sm:px-4 sm:py-3.5"
        >
          <span class="font-plein text-[22px] font-bold leading-none text-white sm:text-[26px]">
            {{ pad(unit.value) }}
          </span>
          <span class="mt-1.5 font-plein text-[10px] font-medium uppercase tracking-[0.06em] text-white/65 sm:text-[11px]">
            {{ unit.label }}
          </span>
        </div>
      </div>

      <button
        type="button"
        class="group mt-10 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full border border-[#F3A81A] bg-black/40 px-8 font-plein text-[16px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:px-10"
        @click="waitlistOpen = true"
      >
        Join Waitlist Now
        <svg
          class="h-4 w-4 text-[#F3A81A] transition-transform group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>

    <LandingWaitlistModal v-model:open="waitlistOpen" />
  </section>
</template>
