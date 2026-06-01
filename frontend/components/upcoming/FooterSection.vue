<script setup>
const CTA_BG = '/images/hero/hero-bg.png'

const quickLinks = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'become-a-partner', label: 'Become a Partner', href: '/become-a-partner' },
  { id: 'home-2', label: 'Home 2', href: '/home-2' },
  { id: 'contact', label: 'Contact Us', href: '/#contact' },
]

const legalLinks = [
  { id: 'privacy', label: 'Privacy Policy', href: '#privacy' },
  { id: 'terms', label: 'Terms of Service', href: '#terms' },
  { id: 'cookies', label: 'Cookie Policy', href: '#cookies' },
]

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

            <NuxtLink
              to="#get-started"
              class="mt-7 inline-flex h-[50px] min-w-[220px] items-center justify-center rounded-full bg-white px-8 font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-black transition-opacity hover:opacity-90"
            >
              Join Traveler Waitlist
            </NuxtLink>
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
          <NuxtLink to="/" aria-label="Pirttrip home">
            <img
              src="/images/logo-black.png"
              alt="pirttrip"
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
              Legal
            </h3>

            <ul class="mt-5 space-y-[10px]">
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
                  href="mailto:pirttrip@gmail.com"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                >
                  pirttrip@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+11234567890"
                  class="font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-black"
                >
                  +1 (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p
        class="text-center font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/50"
      >
        Copyright © 2026 pirttrip. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>
