<script setup>
const benefits = [
  {
    id: 'discover',
    title: 'Discover',
    description:
      'Browse trekking, road trips, wildlife, spiritual journeys, and more — all in one place.',
    icon: '/images/trust/trust-icon-11.png',
  },
  {
    id: 'compare',
    title: 'Compare',
    description:
      'Review itineraries, pricing tiers, and partner profiles side by side before you decide.',
    icon: '/images/trust/trust-icon-08.png',
  },
  {
    id: 'decide',
    title: 'Decide',
    description:
      'Choose the trip and travel partner that fits your style, budget, and travel dates.',
    icon: '/images/trust/trust-icon-06.png',
  },
  {
    id: 'travel',
    title: 'Travel',
    description:
      'Connect directly with partners to finalize plans — no middlemen, no hidden commissions.',
    icon: '/images/trust/trust-icon-03.png',
  },
]
</script>

<template>
  <section id="benefits" class="bg-[#f5f5f5] py-16 md:py-20" aria-labelledby="benefits-heading">
    <div class="mx-auto w-[94%] max-w-[1280px]">
      <header class="text-center">
        <p class="font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-[#F76517]">
          - Key Benefits -
        </p>
        <h2
          id="benefits-heading"
          class="mt-3 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-black sm:text-[34px] md:text-[40px]"
        >
          Everything you need to plan your next adventure
        </h2>
        <p class="mx-auto mt-4 max-w-[640px] font-plein text-[16px] font-normal leading-[140%] text-black/75">
          PirtTrip brings travelers and travel businesses together on a transparent discovery platform.
        </p>
      </header>

      <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <article
          v-for="benefit in benefits"
          :key="benefit.id"
          class="flex flex-col items-center rounded-[14px] border border-black/5 bg-white px-6 py-8 text-center shadow-sm transition-shadow hover:shadow-md"
        >
          <img
            :src="benefit.icon"
            :alt="''"
            class="h-14 w-14 object-contain"
            loading="lazy"
            draggable="false"
            aria-hidden="true"
          >
          <h3 class="mt-5 font-plein text-[20px] font-bold leading-[130%] text-black">
            {{ benefit.title }}
          </h3>
          <p class="mt-3 font-plein text-[15px] font-normal leading-[140%] text-black/70">
            {{ benefit.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
