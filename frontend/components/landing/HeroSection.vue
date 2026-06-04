<script setup>
const { partnerLandingUrl } = usePartnerSite()

const HERO_BG = '/images/hero/hero-bg.png'

const heroStyle = {
  backgroundColor: '#D9D9D9',
  backgroundImage: [
    'linear-gradient(0deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55))',
    'linear-gradient(245.78deg, rgba(255, 171, 11, 0.28) 24.25%, rgba(0, 0, 0, 0.35) 73.29%)',
    `url('${HERO_BG}')`,
  ].join(', '),
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
}

const highlights = [
  'Discover curated group trips across India',
  'Compare itineraries, pricing, and travel partners',
  'Connect directly with verified travel businesses',
]
</script>

<template>
  <section class="relative min-h-[92dvh] overflow-hidden pt-[72px] lg:pt-[88px]" aria-label="Hero">
    <div class="pointer-events-none absolute inset-0 z-0" :style="heroStyle" aria-hidden="true" />

    <div class="relative z-10 mx-auto flex min-h-[calc(92dvh-72px)] w-[94%] max-w-[1280px] flex-col justify-center py-14 lg:min-h-[calc(92dvh-88px)] lg:py-20">
      <p class="font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-[#F76517]">
        India&apos;s group travel discovery platform
      </p>

      <h1
        class="mt-4 max-w-[780px] font-plein text-[36px] font-bold leading-[115%] tracking-[0] text-white sm:text-[44px] md:text-[52px] lg:text-[56px]"
      >
        Your <span class="text-brand-gold">Next</span> Group <span class="text-brand-gold">Trip</span> Starts Here
      </h1>

      <p class="mt-5 max-w-[600px] font-plein text-[18px] font-normal leading-[140%] tracking-[0] text-white/90 md:text-[20px]">
        Discover, compare, and book unforgettable group adventures — or grow your travel business as a pirtTrip partner.
      </p>

      <ul class="mt-8 flex max-w-[640px] flex-col gap-3">
        <li
          v-for="item in highlights"
          :key="item"
          class="flex items-start gap-3 font-plein text-[16px] font-normal leading-[140%] text-white/85"
        >
          <span
            class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold"
            aria-hidden="true"
          />
          {{ item }}
        </li>
      </ul>

      <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <NuxtLink
          :to="partnerLandingUrl"
          class="inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[9px] bg-brand-gold px-8 font-plein text-[16px] font-bold leading-[140%] text-white transition-opacity hover:opacity-90"
        >
          Become a Partner
        </NuxtLink>
        <NuxtLink
          to="/home-2"
          class="inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[9px] border border-white/40 bg-white/10 px-8 font-plein text-[16px] font-medium leading-[140%] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Explore Trips
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
