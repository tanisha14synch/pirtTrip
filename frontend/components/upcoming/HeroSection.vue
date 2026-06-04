<script setup>
const HERO_BG_SRC = '/images/upcoming-hero-bg.svg'

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
  <section class="upcoming-hero relative isolate overflow-hidden pt-5 md:pt-6">
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

    <div class="relative z-10 mx-auto w-[94%] max-w-[1280px] pb-10 md:pb-12">
      <!-- Launch header: logo | countdown | contact -->
      <header
        class="flex flex-col gap-4 border-b border-white/5 pb-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
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
            class="h-9 w-auto object-contain sm:h-10"
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
            class="h-8 w-auto object-contain sm:h-9"
            width="584"
            height="192"
          >
        </NuxtLink>

        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-5"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p
              class="shrink-0 font-plein text-[13px] font-normal leading-[135%] tracking-[0] text-white sm:text-[14px]"
            >
              We are launching Soon!
            </p>

            <div class="flex gap-1.5">
              <div
                v-for="unit in [
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HRS', value: timeLeft.hours },
                  { label: 'MINS', value: timeLeft.minutes },
                  { label: 'SECS', value: timeLeft.seconds },
                ]"
                :key="unit.label"
                class="flex min-w-[42px] flex-col items-center justify-center rounded-[5px] bg-white px-2 py-1.5 sm:min-w-[46px]"
              >
                <span class="font-plein text-[15px] font-bold leading-none text-black sm:text-[16px]">
                  {{ pad(unit.value) }}
                </span>
                <span
                  class="mt-0.5 font-plein text-[8px] font-medium uppercase leading-none tracking-[0.02em] text-black/65 sm:text-[9px]"
                >
                  {{ unit.label }}
                </span>
              </div>
            </div>
          </div>

          <span
            class="hidden h-9 w-px shrink-0 bg-white/35 sm:block"
            aria-hidden="true"
          />

          <div class="font-plein text-[8px] font-normal leading-[135%] tracking-[0] text-white sm:text-[14px]">
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

      <div class="hero-main relative mt-6 lg:mt-8">
        <!-- Hero body -->
        <div class="hero-body-stage relative z-10">
        <div
          id="partner-registration"
          class="grid scroll-mt-6 grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(520px,640px)] xl:gap-10"
        >
        <article class="max-w-[580px] lg:pt-1 xl:max-w-[500px]">
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
              class="mt-3 max-w-[480px] font-plein text-[14px] font-normal leading-[135%] tracking-[0] text-white/85"
            >
            Let us contribute a small effort to help your
            business reach more travelers.
            </p>
          </article>

        <PartnerRegistrationForm class="w-full lg:ml-auto" />
        </div>
        </div>

      <!-- Feature cards -->
      <div class="relative z-10 mt-5 flex flex-wrap justify-center gap-2 sm:gap-2 xl:mt-6 xl:flex-nowrap xl:gap-2.5">
        <img
          v-for="card in featureCards"
          :key="card.id"
          :src="card.src"
          :alt="card.alt"
          class="h-auto min-h-[76px] w-[calc(50%-4px)] max-w-[150px] shrink-0 rounded-[12px] object-contain sm:min-h-[84px] sm:max-w-[164px] xl:h-[100px] xl:w-[190px] xl:max-w-[190px] xl:min-h-0"
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
    height: 16rem;
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
