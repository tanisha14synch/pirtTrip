<script setup>
const { partnerLandingUrl } = usePartnerSite()

const travelerFeatures = [
  'Search domestic and international group trips',
  'Filter by category, month, and trip type',
  'View deals, packages, and upcoming departures',
  'Read reviews and explore partner social feeds',
]

const partnerFeatures = [
  'Register your travel business and build a profile',
  'Publish unlimited trips and shareable itineraries',
  'Receive verified, OTP-confirmed traveler inquiries',
  'Keep 100% of your customers — no commission on bookings',
]

const featureCards = [
  {
    id: 'join',
    src: '/images/vendor-hero-card-1.svg',
    alt: 'Join as a travel business partner',
  },
  {
    id: 'trips',
    src: '/images/vendor-hero-card-2.svg',
    alt: 'Publish trips and itineraries',
  },
  {
    id: 'links',
    src: '/images/vendor-hero-card-3.svg',
    alt: 'Shareable trip links',
  },
  {
    id: 'brand',
    src: '/images/vendor-hero-card-4.svg',
    alt: 'Branding and visibility for partners',
  },
]
</script>

<template>
  <section id="features" class="bg-white py-16 md:py-20" aria-labelledby="features-heading">
    <div class="mx-auto w-[94%] max-w-[1280px]">
      <header class="text-center">
        <p class="font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-[#F76517]">
          - Features -
        </p>
        <h2
          id="features-heading"
          class="mt-3 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-black sm:text-[34px] md:text-[40px]"
        >
          Built for travelers and travel partners
        </h2>
      </header>

      <div class="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <div class="rounded-[14px] border border-black/8 bg-[#fafafa] p-8">
          <h3 class="font-plein text-[22px] font-bold leading-[130%] text-black">
            For Travelers
          </h3>
          <ul class="mt-6 space-y-4">
            <li
              v-for="item in travelerFeatures"
              :key="item"
              class="flex items-start gap-3 font-plein text-[16px] font-normal leading-[140%] text-black/80"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
          <NuxtLink
            to="/home-2"
            class="mt-8 inline-flex h-[48px] items-center justify-center rounded-[9px] bg-brand-gold px-6 font-plein text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Start Exploring
          </NuxtLink>
        </div>

        <div class="rounded-[14px] border border-black/8 bg-black p-8 text-white">
          <h3 class="font-plein text-[22px] font-bold leading-[130%]">
            For Travel Partners
          </h3>
          <ul class="mt-6 space-y-4">
            <li
              v-for="item in partnerFeatures"
              :key="item"
              class="flex items-start gap-3 font-plein text-[16px] font-normal leading-[140%] text-white/85"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
          <NuxtLink
            :to="partnerLandingUrl"
            class="mt-8 inline-flex h-[48px] items-center justify-center rounded-[9px] bg-brand-gold px-6 font-plein text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Become a Partner
          </NuxtLink>
        </div>
      </div>

      <div class="mt-14 flex flex-wrap justify-center gap-2 sm:gap-3">
        <img
          v-for="card in featureCards"
          :key="card.id"
          :src="card.src"
          :alt="card.alt"
          class="h-auto w-[calc(50%-4px)] max-w-[175px] rounded-[14px] object-contain sm:max-w-[190px] lg:w-[228px] lg:max-w-[228px]"
          loading="lazy"
          draggable="false"
        >
      </div>
    </div>
  </section>
</template>
