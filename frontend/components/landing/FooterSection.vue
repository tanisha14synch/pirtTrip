<script setup>
import { FOOTER_LEGAL_LINKS, FOOTER_QUICK_LINKS } from '~/constants/legal-links'

const quickLinks = [
  ...FOOTER_QUICK_LINKS.slice(0, 3),
  { id: 'benefits', label: 'Benefits', href: '/#benefits' },
  { id: 'features', label: 'Features', href: '/#features' },
]

const legalLinks = FOOTER_LEGAL_LINKS

const isHashHref = (href) => typeof href === 'string' && href.startsWith('#')
</script>

<template>
  <footer class="w-full border-t border-black/10 bg-[#f5f5f5]">
    <div class="mx-auto w-[94%] max-w-[1261px] pb-10">
      <div
        class="flex w-full flex-col items-start justify-between gap-10 py-12 md:min-h-[220px] md:py-16 lg:flex-row"
      >
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
          <p class="mt-6 max-w-[300px] font-plein text-[16px] font-normal leading-[140%] text-black/80">
            Discover, compare, and book group trips — or partner with pirtTrip to grow your travel business.
          </p>
        </div>

        <div class="flex w-full flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-12 lg:gap-16">
          <div>
            <h3 class="font-plein text-[18px] font-bold leading-[130%] text-black">
              Quick Links
            </h3>
            <ul class="mt-5 space-y-[10px]">
              <li v-for="link in quickLinks" :key="link.id">
                <NuxtLink
                  v-if="!isHashHref(link.href)"
                  :to="link.href"
                  class="font-plein text-[16px] font-normal leading-[140%] text-black/80 transition-colors hover:text-black"
                >
                  {{ link.label }}
                </NuxtLink>
                <a
                  v-else
                  :href="link.href"
                  class="font-plein text-[16px] font-normal leading-[140%] text-black/80 transition-colors hover:text-black"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-plein text-[18px] font-bold leading-[130%] text-black">
              Legal
            </h3>
            <ul class="mt-5 max-w-[220px] space-y-[10px]">
              <li v-for="link in legalLinks" :key="link.id">
                <NuxtLink
                  :to="link.href"
                  class="font-plein text-[16px] font-normal leading-[140%] text-black/80 transition-colors hover:text-black"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-plein text-[18px] font-bold leading-[130%] text-black">
              Contact us
            </h3>
            <ul class="mt-5 space-y-[10px]">
              <li>
                <a
                  href="mailto:contact@pirttrip.com"
                  class="font-plein text-[16px] font-normal leading-[140%] text-black/80 transition-colors hover:text-black"
                >
                  contact@pirttrip.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919711104186"
                  class="font-plein text-[16px] font-normal leading-[140%] text-black/80 transition-colors hover:text-black"
                >
                  Partner Support: +91-9711104186
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
