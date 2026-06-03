<script setup>
import { FOOTER_LEGAL_LINKS, FOOTER_QUICK_LINKS } from '~/constants/legal-links'

const CTA_BG = '/images/hero/hero-bg.png'
const waitlistOpen = ref(false)
const config = useRuntimeConfig()
const mainSiteUrl = computed(() =>
  String(config.public.mainSiteUrl || 'https://www.pirttrip.com').replace(/\/$/, ''),
)

const quickLinks = FOOTER_QUICK_LINKS

const legalLinks = FOOTER_LEGAL_LINKS

const isExternalHref = (href) =>
  typeof href === 'string' && (href.startsWith('mailto:') || href.startsWith('http'))

const ctaHighlights = [
  'Compare experiences',
  'Discover upcoming group trips',
  'Explore destinations',
]
</script>

<template>
  <footer class="w-full bg-[#f5f5f5]">
    <!-- Vendor CTA — Figma Frame 696:4084 -->
    <div class="mx-auto w-[94%] max-w-[1280px] pb-14 pt-10 md:pb-16 md:pt-12">
      <div
        class="relative mx-auto h-[280px] w-full max-w-[1261px] overflow-hidden rounded-tl-[56px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px] sm:h-[360px] md:h-[456px] md:rounded-tl-[100px]"
      >
        <img
          :src="CTA_BG"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          draggable="false"
          aria-hidden="true"
        >

        <div
          class="absolute inset-0 bg-black/55"
          aria-hidden="true"
        />

        <div
          class="relative z-10 flex h-full flex-col justify-center gap-10 px-6 py-10 sm:px-10 md:flex-row md:items-center md:gap-12 md:px-14 lg:px-16"
        >
          <!-- Left -->
          <div class="max-w-[620px] text-left">
            <p class="font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-[#F76517] md:text-[18px]">
              Let's Grow
            </p>

            <h2
              class="mt-3 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-white sm:text-[34px] md:text-[40px] lg:text-[44px]"
            >
              Your Group Travel Business With PirTrip
            </h2>

            <p class="mt-4 font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white/85">
              Get notified during launch
            </p>

            <button
              type="button"
              class="mt-7 inline-flex h-[50px] min-w-[220px] items-center justify-center rounded-full bg-white px-8 font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-black transition-opacity hover:opacity-90"
              @click="waitlistOpen = true"
            >
              Join Traveler Waitlist
            </button>
          </div>

          <!-- Right -->
          <div
            class="flex items-stretch gap-6 md:ml-auto md:min-w-[240px] md:gap-8 lg:min-w-[280px]"
          >
            <div
              class="w-[3px] shrink-0 rounded-full bg-[#F76517]"
              aria-hidden="true"
            />

            <ul class="flex flex-col justify-center gap-4 py-1">
              <li
                v-for="item in ctaHighlights"
                :key="item"
                class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-white md:text-[18px]"
              >
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer links -->
    <div class="mx-auto w-[94%] max-w-[1261px] pb-10">
      <div
        class="flex w-full flex-col items-start justify-between gap-10 py-12 md:min-h-[269px] md:py-16 lg:flex-row lg:gap-0"
      >
        <div class="max-w-[340px] shrink-0">
          <a :href="mainSiteUrl" aria-label="Pirttrip home">
            <img
              src="/images/logo-black.png"
              alt="pirttrip"
              class="h-10 w-auto object-contain"
              loading="lazy"
              draggable="false"
            >
          </a>

          <p
            class="mt-6 max-w-[300px] font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80"
          >
            Find your perfect getaway from our curated list of top destinations.
          </p>
        </div>

        <div
          class="flex w-full max-w-[547px] flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-[50px] lg:w-[547px] lg:shrink-0 lg:flex-nowrap"
        >
          <div class="shrink-0">
            <h3 class="font-plein text-[18px] font-bold leading-[130%] tracking-[0] text-black">
              Quick Links
            </h3>

            <ul class="mt-5 space-y-[10px]">
              <li v-for="link in quickLinks" :key="link.id">
                <a
                  :href="link.href"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                  :target="isExternalHref(link.href) ? '_blank' : undefined"
                  :rel="isExternalHref(link.href) ? 'noopener noreferrer' : undefined"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <div class="shrink-0">
            <h3 class="font-plein text-[18px] font-bold leading-[130%] tracking-[0] text-black">
              Legal
            </h3>

            <ul class="mt-5 max-w-[220px] space-y-[10px]">
              <li v-for="link in legalLinks" :key="link.id">
                <a
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <div class="shrink-0">
            <h3 class="font-plein text-[18px] font-bold leading-[130%] tracking-[0] text-black">
              Contact us
            </h3>

            <ul class="mt-5 space-y-[10px]">
              <li>
                <a
                  href="mailto:contact@pirttrip.com"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                >
                  contact@pirttrip.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919711104186"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                >
                  +91-9711104186
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <LayoutFooterCopyright />
    </div>
  </footer>

  <LandingWaitlistModal v-model:open="waitlistOpen" />
</template>
