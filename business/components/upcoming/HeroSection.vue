<script setup>
const timeLeft = ref({
  days: 20,
  hours: 5,
  minutes: 55,
  seconds: 39,
})

const featureCards = [
  {
    id: 'join',
    src: '/images/vendor-hero-card-1.png',
    alt: 'Join as a Travel Business and get benefits',
  },
  {
    id: 'trips',
    src: '/images/vendor-hero-card-2.png',
    alt: 'Publish unlimited trips and itineraries',
  },
  {
    id: 'links',
    src: '/images/vendor-hero-card-3.png',
    alt: 'Publicly shareable trip links anywhere',
  },
  {
    id: 'brand',
    src: '/images/vendor-hero-card-4.png',
    alt: 'Branding and visibility',
  },
]

let timerId

const config = useRuntimeConfig()
const mainSiteUrl = computed(() =>
  String(config.public.mainSiteUrl || 'https://www.pirttrip.com').replace(/\/$/, ''),
)

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
  <section class="upcoming-hero relative overflow-hidden pb-16 pt-5 md:pb-20 md:pt-6">
    <div class="relative z-10 mx-auto w-[94%] max-w-[1280px]">
      <!-- Launch header: logo | countdown | contact -->
      <header
        class="flex flex-col gap-6 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
      >
        <a :href="mainSiteUrl" class="inline-flex shrink-0">
          <img
            src="/images/logo.png"
            alt="pirttrip"
            class="h-9 w-auto object-contain sm:h-10"
            width="584"
            height="192"
          >
        </a>

        <div
          class="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6 lg:gap-8"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <p
              class="shrink-0 font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white"
            >
              We are launching Soon!
            </p>

            <div class="flex gap-2">
              <div
                v-for="unit in [
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HRS', value: timeLeft.hours },
                  { label: 'MINS', value: timeLeft.minutes },
                  { label: 'SECS', value: timeLeft.seconds },
                ]"
                :key="unit.label"
                class="flex min-w-[54px] flex-col items-center justify-center rounded-[6px] bg-white px-2.5 py-2 sm:min-w-[58px]"
              >
                <span class="font-plein text-[20px] font-bold leading-none text-black sm:text-[22px]">
                  {{ pad(unit.value) }}
                </span>
                <span
                  class="mt-1 font-plein text-[9px] font-medium uppercase leading-none tracking-[0.02em] text-black/65 sm:text-[10px]"
                >
                  {{ unit.label }}
                </span>
              </div>
            </div>
          </div>

          <span
            class="hidden h-12 w-px shrink-0 bg-white/35 sm:block"
            aria-hidden="true"
          />

          <div class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white">
            <p>For any information, Contact</p>
            <p class="mt-0.5">
              Partner Support at:
              <a href="tel:+919711104186" class="font-normal text-white hover:underline">
                +91-9711104186
              </a>
            </p>
          </div>
        </div>
      </header>

      <!-- Hero body -->
      <div class="mt-10 grid grid-cols-1 items-start gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-14 xl:grid-cols-[1.08fr_0.92fr]">
        <article class="max-w-[580px] lg:pt-4">
          <p class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white">
            Lets Grow Your Group Travel Business With pirttrip
          </p>

          <h1
            class="mt-5 font-plein text-[34px] font-bold leading-[120%] tracking-[0] text-white sm:text-[42px] md:text-[48px] lg:text-[52px]"
          >
            Are you running a Travel Business ?
          </h1>

          <p
            class="mt-6 max-w-[520px] font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white/85"
          >
            pirttrip will be a one-stop discovery platform where travelers can explore all types of
            group trips posted by travel businesses like yours.
          </p>
        </article>

        <PartnerRegistrationForm />
      </div>

      <!-- Feature cards -->
      <div class="mt-10 flex flex-wrap justify-center gap-2 sm:gap-2.5 xl:mt-12 xl:flex-nowrap xl:gap-3">
        <img
          v-for="card in featureCards"
          :key="card.id"
          :src="card.src"
          :alt="card.alt"
          class="h-auto w-[calc(50%-4px)] max-w-[175px] shrink-0 rounded-[14px] object-contain sm:max-w-[190px] xl:w-[228px] xl:max-w-[228px]"
          loading="lazy"
          draggable="false"
        >
      </div>
    </div>
  </section>
</template>

<style scoped>
.upcoming-hero {
  background-color: #000;
  background-image: url('/images/upcoming-hero-bg.png');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}

</style>
