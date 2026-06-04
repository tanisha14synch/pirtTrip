<script setup>
const { homeHref, homeIsExternal } = useMainSite()

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
  <section class="upcoming-hero relative overflow-hidden pt-5 md:pt-6">
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

    <div class="relative z-10 mx-auto w-[94%] max-w-[1280px] pb-16 md:pb-20">
      <!-- Launch header: logo | countdown | contact -->
      <header
        class="flex flex-col gap-6 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
      >
        <a
          v-if="homeIsExternal"
          :href="homeHref"
          class="inline-flex shrink-0"
          aria-label="pirtTrip home"
        >
          <img
            src="/images/logo.svg"
            alt="pirtTrip"
            class="h-9 w-auto object-contain sm:h-10"
            width="584"
            height="192"
          >
        </a>
        <NuxtLink
          v-else
          to="/"
          class="inline-flex shrink-0"
          aria-label="pirtTrip home"
        >
          <img
            src="/images/logo.svg"
            alt="pirtTrip"
            class="h-9 w-auto object-contain sm:h-10"
            width="584"
            height="192"
          >
        </NuxtLink>

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

      <div class="hero-main relative mt-10 lg:mt-14">
        <!-- Hero body -->
        <div class="hero-body-stage relative z-10">
        <div
          id="partner-registration"
          class="grid scroll-mt-6 grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(560px,680px)] xl:gap-14"
        >
        <article class="max-w-[580px] lg:pt-4 xl:max-w-[540px]">
            <p class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white">
              Lets Grow Your Travel Business with
              <span class="text-brand-gold font-bold">PirtTrip</span>
            </p>

            <h1
              class="mt-5 font-plein text-[34px] font-bold leading-[120%] tracking-[0] text-white sm:text-[42px] md:text-[48px] lg:text-[52px]"
            >
             Running Your Travel Business All Alone?
            </h1>

            <p
              class="mt-6 max-w-[520px] font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white/85"
            >
            Let us contribute a small effort to help your
            business reach more travelers.
            </p>
          </article>

        <PartnerRegistrationForm class="w-full lg:ml-auto" />
        </div>
        </div>

      <!-- Feature cards -->
      <div class="relative z-10 mt-10 flex flex-wrap justify-center gap-2 sm:gap-2.5 xl:mt-12 xl:flex-nowrap xl:gap-3">
        <img
          v-for="card in featureCards"
          :key="card.id"
          :src="card.src"
          :alt="card.alt"
          class="h-auto min-h-[88px] w-[calc(50%-4px)] max-w-[168px] shrink-0 rounded-[14px] object-contain sm:min-h-[96px] sm:max-w-[182px] xl:h-[118px] xl:w-[218px] xl:max-w-[218px] xl:min-h-0"
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
  background-image: url('/images/upcoming-hero-bg.svg');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}

.hero-main {
  isolation: isolate;
}

.hero-body-stage {
  min-height: clamp(18rem, 38vh, 26rem);
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

/* Right — flush to section right edge, vertically centered (image is pre-tilted) */
.hero-floating-card--middle {
  top: 50%;
  right: 0;
  z-index: 1;
  display: block;
  margin: 0;
  padding: 0;
  height: clamp(18rem, 30vh, 24rem);
  width: auto;
  object-position: right center;
  transform: translateY(-50%);
  transform-origin: right center;
  animation: hero-float-middle 5s ease-in-out infinite;
}

/* Left — floating, bottom-left corner (image is pre-tilted) */
.hero-floating-card--bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: block;
  margin: 0;
  padding: 0;
  height: clamp(16rem, 26vh, 20rem);
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
    transform: translateY(calc(-50% - 12px));
  }
}

@keyframes hero-float-bottom {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

@media (min-width: 1024px) {
  .hero-floating-card--middle {
    height: 22rem;
  }

  .hero-floating-card--bottom {
    height: 19rem;
  }
}

@media (min-width: 1280px) {
  .hero-floating-card--middle {
    height: 24rem;
  }

  .hero-floating-card--bottom {
    height: 20rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-floating-card--middle,
  .hero-floating-card--bottom {
    animation: none;
  }
}
</style>
