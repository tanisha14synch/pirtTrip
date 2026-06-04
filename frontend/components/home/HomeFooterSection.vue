<script setup>
import { FOOTER_LEGAL_LINKS, FOOTER_QUICK_LINKS } from '~/constants/legal-links'

const { partnerLandingUrl } = usePartnerSite()

const CTA_BG = '/images/hero/hero-bg.png'

const quickLinks = FOOTER_QUICK_LINKS

const legalLinks = FOOTER_LEGAL_LINKS

const isHashHref = (href) => typeof href === 'string' && href.startsWith('#')
const isExternalHref = (href) =>
  typeof href === 'string' && (href.startsWith('mailto:') || href.startsWith('http'))
</script>

<template>
  <footer class="w-full bg-[#f5f5f5]">
    <!-- Vendor CTA banner -->
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
          class="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center md:px-10"
        >
          <p class="font-plein text-[20px] font-bold leading-[120%] tracking-[0] text-[#F76517]">
            Welcome Onboarding
          </p>

          <h2
            class="mt-4 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-white sm:text-[34px] md:whitespace-nowrap md:text-[40px] lg:text-[44px]"
          >
            Let Travelers reach you directly!
          </h2>

          <NuxtLink
            :to="partnerLandingUrl"
            class="mt-8 inline-flex h-[52px] min-w-[220px] items-center justify-center rounded-full bg-[#F76517] px-10 font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-white transition-opacity hover:opacity-90"
          >
            Become a Partner
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Footer links -->
    <div class="mx-auto w-[94%] max-w-[1261px] pb-10">
      <div
        class="flex w-full flex-col items-start justify-between gap-10 py-12 md:min-h-[269px] md:py-16 lg:flex-row lg:gap-0"
      >
        <!-- Logo + description -->
        <div class="max-w-[340px] shrink-0">
          <NuxtLink to="/" aria-label="pirtTrip home">
            <img
              src="/images/logo-black.png"
              alt="pirtTrip"
              class="h-10 w-auto object-contain"
              loading="lazy"
              draggable="false"
            >
          </NuxtLink>

          <p
            class="mt-6 max-w-[300px] font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80"
          >
            Find your perfect getaway from our curated list of top destinations.
          </p>
        </div>

        <!-- Quick Links + Legal + Contact -->
        <div
          class="flex w-full max-w-[547px] flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-[50px] lg:w-[547px] lg:shrink-0 lg:flex-nowrap"
        >
          <div class="shrink-0">
            <h3 class="font-plein text-[18px] font-bold leading-[130%] tracking-[0] text-black">
              Quick Links
            </h3>

            <ul class="mt-5 space-y-[10px]">
              <li v-for="link in quickLinks" :key="link.id">
                <NuxtLink
                  v-if="!isHashHref(link.href) && !isExternalHref(link.href)"
                  :to="link.href"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                >
                  {{ link.label }}
                </NuxtLink>
                <a
                  v-else
                  :href="link.href"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
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
                <NuxtLink
                  :to="link.href"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                >
                  {{ link.label }}
                </NuxtLink>
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
</template>
