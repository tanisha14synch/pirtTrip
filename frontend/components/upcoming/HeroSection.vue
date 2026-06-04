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
  <section class="upcoming-hero relative isolate flex min-h-screen min-h-[100svh] flex-col overflow-hidden pt-5 md:pt-6">
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

    <div class="hero-content relative z-10 mx-auto flex w-[94%] max-w-[1280px] flex-1 flex-col pb-8 md:pb-10 lg:pb-12">
      <!-- Launch header: logo | countdown | contact -->
      <header
        class="flex flex-col gap-3 border-b border-white/5 pb-3 sm:gap-4 sm:pb-4 md:gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 xl:gap-8"
      >
        <a
          v-if="homeIsExternal"
          :href="homeHref"
          class="inline-flex shrink-0"
          aria-label="PirtTrip home"
        >
          <img
            src="/images/logo.svg"
            alt="PirtTrip"
            class="h-8 w-auto object-contain sm:h-9 md:h-10 lg:h-11 xl:h-12"
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
            class="h-8 w-auto object-contain sm:h-9 md:h-10 lg:h-11 xl:h-12"
            width="584"
            height="192"
          >
        </NuxtLink>

        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-5"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p
              class="shrink-0 font-plein text-sm font-normal leading-snug text-white md:text-base lg:text-lg"
            >
              We are launching Soon!
            </p>

            <div class="flex gap-1.5 sm:gap-2 md:gap-2.5">
              <div
                v-for="unit in [
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HRS', value: timeLeft.hours },
                  { label: 'MINS', value: timeLeft.minutes },
                  { label: 'SECS', value: timeLeft.seconds },
                ]"
                :key="unit.label"
                class="hero-countdown-unit flex min-w-10 flex-col items-center justify-center rounded-md bg-white px-2 py-1.5 sm:min-w-11 md:min-w-12 md:px-2.5 md:py-2 lg:min-w-[3.25rem] xl:min-w-14"
              >
                <span class="font-plein text-base font-bold leading-none text-black sm:text-lg md:text-xl lg:text-2xl">
                  {{ pad(unit.value) }}
                </span>
                <span
                  class="mt-0.5 font-plein text-[10px] font-medium uppercase leading-none tracking-wide text-black/65 sm:text-xs md:text-sm"
                >
                  {{ unit.label }}
                </span>
              </div>
            </div>
          </div>

          <span
            class="hidden h-8 w-px shrink-0 bg-white/35 sm:block md:h-10 lg:h-12"
            aria-hidden="true"
          />

          <div class="font-plein text-sm font-normal leading-snug text-white md:text-base lg:text-lg">
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
          </div>
        </div>
      </header>

      <div class="hero-main relative mt-4 flex flex-1 flex-col sm:mt-5 md:mt-6 lg:mt-8">
        <!-- Hero body -->
        <div class="hero-body-stage relative z-10 flex flex-1 flex-col justify-center">
        <div
          id="partner-registration"
          class="grid scroll-mt-6 grid-cols-1 items-start gap-5 sm:gap-6 md:gap-7 lg:grid-cols-2 lg:gap-8 xl:gap-10 2xl:gap-12"
        >
        <article class="max-w-xl lg:max-w-2xl">
            <p class="font-plein text-sm font-normal leading-snug text-white md:text-base lg:text-lg xl:text-xl">
              Lets Grow Your Travel Business with
              <span class="text-brand-gold font-bold">PirtTrip</span>
            </p>

            <h1
              class="mt-2 font-plein text-2xl font-bold leading-tight text-white sm:mt-3 sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] 2xl:text-6xl"
            >
             Running Your Travel Business All Alone?
            </h1>

            <p
              class="mt-2 max-w-xl font-plein text-sm font-normal leading-snug text-white/85 sm:mt-3 md:text-base lg:text-lg xl:text-xl 2xl:max-w-2xl"
            >
            Let us contribute a small effort to help your
            business reach more travelers.
            </p>
          </article>

        <PartnerRegistrationForm class="hero-form w-full lg:ml-auto lg:max-w-xl xl:max-w-2xl" />
        </div>
        </div>

      <!-- Feature cards -->
      <div class="hero-feature-cards relative z-10 mt-4 flex flex-wrap justify-center gap-2 sm:mt-5 sm:gap-3 md:gap-4 lg:mt-auto lg:flex-nowrap lg:gap-5 xl:gap-6">
        <img
          v-for="card in featureCards"
          :key="card.id"
          :src="card.src"
          :alt="card.alt"
          class="hero-vendor-card h-16 w-[calc(50%-4px)] max-w-[9rem] shrink-0 rounded-xl object-contain sm:h-20 sm:max-w-[10rem] md:h-24 md:max-w-[11rem] lg:h-28 lg:max-w-xs xl:h-32 xl:max-w-sm 2xl:h-36 2xl:max-w-md"
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
}

.hero-bg-media {
  min-height: 100%;
  min-width: 100%;
}

.hero-main {
  isolation: isolate;
}

.hero-body-stage {
  min-height: 0;
}

/* Scale typography & cards on tall viewports (extra space inside 100vh) */
@media (min-height: 820px) and (min-width: 1024px) {
  .hero-content {
    padding-bottom: clamp(2rem, 4vh, 3.5rem);
  }

  .hero-countdown-unit {
    min-width: clamp(3rem, 5vw, 4.5rem);
    padding: clamp(0.5rem, 1vh, 0.75rem) clamp(0.5rem, 1.2vw, 0.875rem);
  }

  .hero-vendor-card {
    height: clamp(6.5rem, 12vh, 10rem);
    max-width: clamp(10rem, 14vw, 15rem);
  }
}

@media (min-height: 960px) and (min-width: 1280px) {
  .hero-vendor-card {
    height: clamp(7.5rem, 14vh, 11.5rem);
    max-width: clamp(11rem, 15vw, 17rem);
  }
}

@media (min-height: 820px) and (min-width: 1024px) {
  .hero-form {
    max-width: clamp(28rem, 36vw, 40rem);
  }
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
  height: clamp(9rem, 18vh, 14rem);
  width: auto;
  object-position: right center;
  transform: translateY(-50%);
  transform-origin: right center;
  animation: hero-float-middle 5s ease-in-out infinite;
}

/* Left — floating, bottom-left corner (image is pre-tilted) */
.hero-floating-card--bottom {
  position: absolute;
  bottom: clamp(0.75rem, 2vh, 1.5rem);
  left: 0;
  z-index: 2;
  display: block;
  margin: 0;
  padding: 0;
  height: clamp(8rem, 15vh, 12rem);
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
    height: clamp(12rem, 22vh, 18rem);
  }

  .hero-floating-card--bottom {
    height: clamp(10rem, 18vh, 15rem);
  }
}

@media (min-width: 1280px) {
  .hero-floating-card--middle {
    top: 62%;
    height: clamp(14rem, 24vh, 20rem);
  }

  .hero-floating-card--bottom {
    height: clamp(11rem, 20vh, 17rem);
  }
}

@media (min-height: 820px) and (min-width: 1024px) {
  .hero-floating-card--middle {
    height: clamp(15rem, 26vh, 22rem);
  }

  .hero-floating-card--bottom {
    height: clamp(12rem, 22vh, 18rem);
  }
}

@media (min-height: 960px) and (min-width: 1280px) {
  .hero-floating-card--middle {
    height: clamp(17rem, 28vh, 24rem);
  }

  .hero-floating-card--bottom {
    height: clamp(14rem, 24vh, 20rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-floating-card--middle,
  .hero-floating-card--bottom {
    animation: none;
  }
}
</style>
