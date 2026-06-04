<script setup>
const { partnerLandingUrl } = usePartnerSite()

const CTA_BG = '/images/hero/hero-bg.png'

const ctaPoints = [
  'Launching soon with early partner benefits',
  'First 20 verified customer connect credits free',
  'Partner support: +91-9711104186',
]
</script>

<template>
  <section id="cta" class="bg-[#f5f5f5] py-16 md:py-20" aria-labelledby="cta-heading">
    <div class="mx-auto w-[94%] max-w-[1280px]">
      <div
        class="relative mx-auto min-h-[320px] w-full overflow-hidden rounded-tl-[56px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px] sm:min-h-[380px] md:min-h-[420px] md:rounded-tl-[100px]"
      >
        <img
          :src="CTA_BG"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          draggable="false"
          aria-hidden="true"
        >
        <div class="absolute inset-0 bg-black/55" aria-hidden="true" />

        <div
          class="relative z-10 flex h-full min-h-[320px] flex-col items-start justify-center gap-8 px-6 py-12 sm:px-10 md:min-h-[380px] md:flex-row md:items-center md:justify-between md:px-14 lg:px-16"
        >
          <div class="max-w-[580px]">
            <p class="font-plein text-[16px] font-bold leading-[130%] text-[#F76517]">
              Ready to grow?
            </p>
            <h2
              id="cta-heading"
              class="mt-3 font-plein text-[28px] font-bold leading-[130%] text-white sm:text-[36px] md:text-[42px]"
            >
              Join pirtTrip as a travel partner today
            </h2>
            <p class="mt-4 font-plein text-[16px] font-normal leading-[140%] text-white/85">
              Register your business, get early access, and start connecting with travelers when we launch.
            </p>
            <NuxtLink
              :to="partnerLandingUrl"
              class="mt-8 inline-flex h-[52px] min-w-[220px] items-center justify-center rounded-full bg-brand-gold px-10 font-plein text-[16px] font-bold text-white transition-opacity hover:opacity-90"
            >
              For Businesses
            </NuxtLink>
          </div>

          <ul class="flex flex-col gap-4 md:max-w-[320px]">
            <li
              v-for="point in ctaPoints"
              :key="point"
              class="flex items-start gap-3 font-plein text-[16px] font-normal leading-[140%] text-white"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F76517]" aria-hidden="true" />
              {{ point }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
