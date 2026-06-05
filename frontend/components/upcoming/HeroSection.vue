<script setup>
import { BUSINESS_HERO_BG_SRC } from '~/constants/business-hero-assets'

const HERO_BG_SRC = BUSINESS_HERO_BG_SRC

const { homeHref, homeIsExternal } = useMainSite()

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: HERO_BG_SRC,
      type: 'image/svg+xml',
    },
  ],
})

const timeLeft = ref({
  days: 20,
  hours: 5,
  minutes: 55,
  seconds: 39,
})

const featureCards = [
  {
    id: 'join',
    src: '/images/vendor-hero-card-1.svg',
    alt: 'Join as a Travel Business and get benefits',
  },
  {
    id: 'trips',
    src: '/images/vendor-hero-card-2.svg',
    alt: 'Publish unlimited trips and itineraries',
  },
  {
    id: 'links',
    src: '/images/vendor-hero-card-3.svg',
    alt: 'Publicly shareable trip links anywhere',
  },
  {
    id: 'brand',
    src: '/images/vendor-hero-card-4.svg',
    alt: 'Branding and visibility',
  },
]

let timerId

const countdownUnits = computed(() => [
  { label: 'DAYS', value: timeLeft.value.days },
  { label: 'HRS', value: timeLeft.value.hours },
  { label: 'MINS', value: timeLeft.value.minutes },
  { label: 'SECS', value: timeLeft.value.seconds },
])

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
  <section
    id="upcoming-hero"
    class="upcoming-hero relative isolate flex min-h-screen min-h-[100svh] flex-col overflow-hidden pt-4 md:pt-6"
  >
    <img
      :src="HERO_BG_SRC"
      alt=""
      class="hero-bg-media pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
      fetchpriority="high"
      loading="eager"
      decoding="async"
      draggable="false"
      aria-hidden="true"
    >

    <img
      src="/images/hero/business-hero-card-bottom.svg"
      alt=""
      class="hero-floating-card hero-floating-card--bottom pointer-events-none hidden lg:block"
      loading="lazy"
      draggable="false"
      aria-hidden="true"
    >
    <img
      src="/images/hero/business-hero-card-middle.svg"
      alt=""
      class="hero-floating-card hero-floating-card--middle pointer-events-none hidden lg:block"
      loading="lazy"
      draggable="false"
      aria-hidden="true"
    >

    <div class="hero-inner relative z-10 mx-auto flex w-[94%] max-w-[1280px] flex-1 flex-col pb-8 md:pb-10">
      <!-- Launch header -->
      <header class="border-b border-white/5 pb-3 lg:pb-4">
        <!-- Mobile: logo + compact countdown; contact hidden -->
        <div class="lg:hidden">
          <div class="flex items-center justify-between gap-2">
            <a
              v-if="homeIsExternal"
              :href="homeHref"
              class="inline-flex shrink-0"
              aria-label="PirtTrip home"
            >
              <img
                src="/images/logo.svg"
                alt="PirtTrip"
                class="h-8 w-auto object-contain"
                width="584"
                height="192"
              >
            </a>
            <NuxtLink
              v-else
              to="/"
              class="inline-flex shrink-0"
              aria-label="PirtTrip home"
            >
              <img
                src="/images/logo.svg"
                alt="PirtTrip"
                class="h-8 w-auto object-contain"
                width="584"
                height="192"
              >
            </NuxtLink>

            <div class="flex min-w-0 shrink-0 flex-col items-end gap-1">
              <p class="font-plein text-[9px] font-bold leading-[130%] tracking-[0] text-white">
                We are launching Soon!
              </p>

              <div class="flex gap-1">
                <div
                  v-for="unit in countdownUnits"
                  :key="unit.label"
                  class="flex min-w-[30px] flex-col items-center justify-center rounded-[4px] bg-white px-1 py-1"
                >
                  <span class="font-plein text-[10px] font-bold leading-none text-black">
                    {{ pad(unit.value) }}
                  </span>
                  <span
                    class="mt-0.5 font-plein text-[5px] font-medium uppercase leading-none tracking-[0.02em] text-black/65"
                  >
                    {{ unit.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop -->
        <div class="hidden lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <a
            v-if="homeIsExternal"
            :href="homeHref"
            class="inline-flex shrink-0"
            aria-label="PirtTrip home"
          >
            <img
              src="/images/logo.svg"
              alt="PirtTrip"
              class="h-10 w-auto object-contain"
              width="584"
              height="192"
            >
          </a>
          <NuxtLink
            v-else
            to="/"
            class="inline-flex shrink-0"
            aria-label="PirtTrip home"
          >
            <img
              src="/images/logo.svg"
              alt="PirtTrip"
              class="h-9 w-auto object-contain"
              width="584"
              height="192"
            >
          </NuxtLink>

          <div class="flex items-center gap-5">
            <div class="flex items-center gap-3">
              <p class="shrink-0 font-plein text-[14px] font-normal leading-[135%] tracking-[0] text-white">
                We are launching Soon!
              </p>

              <div class="flex gap-1.5">
                <div
                  v-for="unit in countdownUnits"
                  :key="unit.label"
                  class="flex min-w-[46px] flex-col items-center justify-center rounded-[5px] bg-white px-2 py-1.5"
                >
                  <span class="font-plein text-[16px] font-bold leading-none text-black">
                    {{ pad(unit.value) }}
                  </span>
                  <span
                    class="mt-0.5 font-plein text-[9px] font-medium uppercase leading-none tracking-[0.02em] text-black/65"
                  >
                    {{ unit.label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- <span
              class="h-9 w-px shrink-0 bg-white/35"
              aria-hidden="true"
            />

            <div class="font-plein text-[14px] font-normal leading-[135%] tracking-[0] text-white">
              <p>For any information, contact Business Support</p>
              <p class="mt-0.5">
                at:
                <a
                  href="mailto:contact@pirttrip.com"
                  class="font-normal text-white hover:underline"
                >contact@pirttrip.com</a>
              </p>
              <p class="mt-0.5">
                Or Call at:
                <a href="tel:+919711104186" class="font-normal text-white hover:underline">
                  +91-9711104186
                </a>
              </p>
            </div> -->
          </div>
        </div>
      </header>

      <div class="hero-main hero-main--fill relative min-h-0 flex-1">
        <!-- Hero body -->
        <div class="hero-body-stage hero-body-stage--fill relative z-10">
        <div
          id="partner-registration"
          class="grid scroll-mt-6 grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(520px,640px)] xl:gap-10"
        >
        <article class="mx-auto max-w-[580px] text-center lg:mx-0 lg:pt-1 lg:text-left xl:max-w-[500px]">
            <p class="font-plein text-[14px] font-normal leading-[135%] tracking-[0] text-white">
              Lets Grow Your Travel Business with
              <span class="text-brand-gold font-bold">PirtTrip</span>
            </p>

            <h1
              class="mt-3 font-plein text-[28px] font-bold leading-[118%] tracking-[0] text-white sm:text-[34px] md:text-[38px] lg:text-[40px]"
            >
              Running Your Travel Business All Alone?
            </h1>

            <p
              class="mx-auto mt-3 max-w-[480px] font-plein text-[14px] font-normal leading-[135%] tracking-[0] text-white/85 lg:mx-0"
            >
              Let us contribute a small effort to help your
              business reach more travelers.
            </p>
          </article>

        <PartnerRegistrationForm class="w-full lg:ml-auto" />
        </div>
        </div>

        <div
          class="hero-spacer min-h-0 flex-1"
          aria-hidden="true"
        />

      <!-- Feature cards -->
      <div class="hero-feature-cards relative z-10 flex shrink-0 flex-wrap justify-center gap-2.5 sm:gap-3 xl:flex-nowrap xl:gap-3.5 mt-10">
        <img
          v-for="card in featureCards"
          :key="card.id"
          :src="card.src"
          :alt="card.alt"
          class="h-auto min-h-[84px] w-[calc(80%-6px)] max-w-[172px] shrink-0 rounded-[12px] object-contain sm:min-h-[92px] sm:max-w-[188px] md:max-w-[200px] xl:h-[112px] xl:w-[220px] xl:max-w-[250px] xl:min-h-0"
          loading="lazy"
          draggable="false"
        >
      </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.upcoming-hero {
  background-color: #000;
  /* At least full viewport; grows naturally when content is taller */
  min-height: 100vh;
  min-height: 100svh;
  scroll-margin-top: 0;
}

.hero-inner {
  min-height: 100vh;
  min-height: 100svh;
}

.hero-bg-media {
  min-height: 100%;
  min-width: 100%;
}

/* Shorter than viewport: top margin pushes content down; spacer pins cards to the bottom */
.hero-main--fill {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  margin-top: clamp(0.75rem, 3vh, 1.5rem);
  isolation: isolate;
}

@media (min-width: 1024px) {
  .hero-main--fill {
    margin-top: clamp(1.5rem, 6vh, 5rem);
  }
}

.hero-body-stage--fill {
  flex: 0 0 auto;
}

.hero-spacer {
  flex: 1 1 auto;
  min-height: 0;
}

.hero-feature-cards {
  flex: 0 0 auto;
}

.hero-floating-card {
  position: absolute;
  width: auto;
  height: auto;
  max-width: none;
  border-radius: 0;
  object-fit: contain;
  object-position: center;
  filter:
    drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35))
    drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))
    drop-shadow(0 32px 64px rgba(0, 0, 0, 0.35));
  will-change: transform;
}

/* Right — flush to section right edge (image is pre-tilted) */
.hero-floating-card--middle {
  top: 58%;
  right: 0;
  z-index: 2;
  display: block;
  margin: 0;
  padding: 0;
  height: clamp(11rem, 20vh, 15rem);
  width: auto;
  object-position: right center;
  transform: translateY(-50%);
  transform-origin: right center;
  animation: hero-float-middle 5s ease-in-out infinite;
}

/* Left — floating, bottom-left corner (image is pre-tilted) */
.hero-floating-card--bottom {
  position: absolute;
  bottom: 1.25rem;
  left: 0;
  z-index: 2;
  display: block;
  margin: 0;
  padding: 0;
  height: clamp(10rem, 17vh, 13rem);
  width: auto;
  object-fit: contain;
  object-position: left bottom;
  transform-origin: left bottom;
  animation: hero-float-bottom 5.5s ease-in-out infinite;
}

@keyframes hero-float-middle {
  0%,
  100% {
    transform: translateY(-50%);
  }

  50% {
    transform: translateY(calc(-50% - 8px));
  }
}

@keyframes hero-float-bottom {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@media (min-width: 1024px) {
  .hero-floating-card--middle {
    top: 60%;
    height: 20rem;
  }

  .hero-floating-card--bottom {
    height: 12.5rem;
  }
}

@media (min-width: 1280px) {
  .hero-floating-card--middle {
    top: 62%;
    height: 15.5rem;
  }

  .hero-floating-card--bottom {
    height: 13.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-floating-card--middle,
  .hero-floating-card--bottom {
    animation: none;
  }
}
</style>
