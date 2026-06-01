<script setup>
const partners = [
  { id: 'drifttrip', name: 'DriftTrip' },
  { id: 'tripverse', name: 'Tripverse' },
  { id: 'wanderly', name: 'Wanderly' },
  { id: 'peakora', name: 'Peakora' },
  { id: 'roamora', name: 'Roamora' },
  { id: 'yatra', name: 'YatraGo' },
]
</script>

<template>
  <section class="w-full bg-[#f7f7f7]">
    <!-- Main partners block -->
    <div class="mx-auto w-[94%] max-w-[1280px] py-14 md:py-16 lg:py-20">
      <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 xl:gap-16">
        <!-- Left content -->
        <article class="max-w-[560px]">
          <p class="font-plein text-[20px] font-bold leading-[120%] text-[#F76517]">
            Our Partners
          </p>

          <h2
            class="mt-4 font-plein text-[34px] font-bold leading-[120%] tracking-[0] text-black sm:text-[42px] md:text-[48px] lg:text-[52px]"
          >
            We have partnered with 250+ Agencies across the globe
          </h2>

          <p
            class="mt-5 max-w-[500px] font-plein text-[16px] font-medium leading-[140%] tracking-[0] text-[#00000099] md:text-[18px]"
          >
            Our partnership with agencies helps users to explore trips from their nearby hosts and help them to
            explore local groups of traveler
          </p>

          <button
            type="button"
            class="mt-8 inline-flex h-[52px] items-center justify-center rounded-full border border-[#F76517] px-8 font-plein text-[16px] font-medium leading-[140%] text-[#F76517] transition-colors hover:bg-[#F76517]/5"
          >
            Join as a Partners
          </button>
        </article>

        <!-- Right map -->
        <div class="relative mx-auto w-full max-w-[640px] lg:max-w-none">
          <img
            src="/images/partners-map.png"
            alt="Partner agencies map across India"
            class="h-auto w-full object-contain "
            loading="lazy"
            draggable="false"
          >
        </div>
      </div>
    </div>

    <!-- Partner logos strip -->
    <div class="w-full bg-white py-10 md:py-12">
      <h3
        class="flex w-full items-center justify-center text-center font-plein text-[20px] font-bold leading-[130%] tracking-[0] text-black"
      >
        We have 500+ Partners
      </h3>

      <div
        class="mt-8 grid w-full grid-cols-2 items-center gap-y-6 px-5 sm:grid-cols-3 sm:px-8 md:grid-cols-6 md:px-10 lg:px-14 xl:px-20"
      >
        <span
          v-for="partner in partners"
          :key="partner.id"
          class="text-center font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-[#9ca3af]"
        >
          {{ partner.name }}
        </span>
      </div>
    </div>
  </section>
</template>
