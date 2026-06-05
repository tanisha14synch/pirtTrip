<script setup>
import { FOOTER_LEGAL_LINKS, FOOTER_QUICK_LINKS } from '~/constants/legal-links'

const props = defineProps({
  ctaMode: {
    type: String,
    default: 'registration',
    validator: (value) => ['registration', 'waitlist'].includes(value),
  },
})

const emit = defineEmits(['open-waitlist'])

const { homeHref, homeIsExternal } = useMainSite()

const CTA_BG = '/images/hero/hero-bg.png'
const FOOTER_LOGO_SRC = '/images/logo-black.svg'

const quickLinks = FOOTER_QUICK_LINKS

const legalLinks = FOOTER_LEGAL_LINKS

const isHashHref = (href) => typeof href === 'string' && href.startsWith('#')
const isExternalHref = (href) =>
  typeof href === 'string' && (href.startsWith('mailto:') || href.startsWith('http'))

const ctaHighlights = [
  'Establish Your Professional Travel Presence',
  'Showcase Tours & Travel Experiences',
  'Promote Trip Links Across Your Network',
  'Strengthen Your Brand & Increase Visibility',
]

const mobileCtaFeatures = [
  'Compare experiences',
  'Discover upcoming group trips',
  'Explore destinations',
]

const CONTACT_EMAIL = 'contact@pirttrip.com'
const CONTACT_PHONE_DISPLAY = '+91-9711104186'
const CONTACT_PHONE_TEL = 'tel:+919711104186'

const linkClass =
  'font-plein text-[16px] font-normal leading-[140%] tracking-[0] text-black/80 transition-colors hover:text-[#F76517]'

function scrollToRegistration(event) {
  event?.preventDefault()
  // If user taps CTA from the footer/hero, show the whole hero again.
  // This ensures the fixed header is visible at the top.
  const heroEl = document.getElementById('upcoming-hero')
  if (heroEl) {
    heroEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  // Priority: form header ("Get Started") so the user immediately sees context.
  const el = document.getElementById('get-started')
    || document.getElementById('partner-registration')
  if (!el) return

  // If there's a fixed/static header, offset so the target isn't hidden.
  // We measure the first <header> on the page so it matches the real logo/header height.
  const headerEl = document.querySelector('header')
  const headerOffset = headerEl?.getBoundingClientRect().height ?? 88
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

function handleCtaClick(event) {
  event?.preventDefault()
  if (props.ctaMode === 'waitlist') {
    emit('open-waitlist')
    return
  }
  scrollToRegistration(event)
}

const mobileCtaLabel = computed(() =>
  props.ctaMode === 'waitlist' ? 'Join Traveler Waitlist' : 'Join Business',
)
</script>

<template>
  <footer class="w-full bg-[#f5f5f5]">
    <!-- Vendor CTA — Figma Frame 696:4084 -->
    <div class="mx-auto w-[94%] max-w-[1280px] pb-14 pt-10 md:pb-16 md:pt-12">
      <div
        class="relative mx-auto min-h-[360px] w-full max-w-[1261px] overflow-hidden rounded-tl-[72px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px] sm:min-h-[380px] md:h-[456px] md:rounded-tl-[100px]"
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

        <!-- Mobile (Figma) -->
        <div
          class="relative z-10 flex min-h-[360px] flex-col md:hidden"
        >
          <div class="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
            <p class="font-plein text-[14px] font-bold leading-[130%] tracking-[0] text-[#F76517]">
              Welcome
            </p>

            <h2
              class="mt-2 font-plein text-[22px] font-bold leading-[125%] tracking-[0] text-white"
            >
              Your Group Travel Business
              <br>
              With PirTrip
            </h2>

            <a
              href="#get-started"
              class="mt-5 inline-flex h-[48px] w-full max-w-[300px] items-center justify-center rounded-full bg-white px-6 font-plein text-[15px] font-bold leading-[130%] tracking-[0] text-black no-underline transition-opacity hover:opacity-90"
              @click="handleCtaClick"
            >
              {{ mobileCtaLabel }}
            </a>
          </div>

          <div
            class="flex items-stretch border-t border-white/10 px-2 py-4"
          >
            <p
              v-for="(feature, index) in mobileCtaFeatures"
              :key="feature"
              class="flex flex-1 items-center justify-center px-1 text-center font-plein text-[10px] font-normal leading-[130%] tracking-[0] text-white"
              :class="index > 0 ? 'border-l border-[#F76517]' : ''"
            >
              {{ feature }}
            </p>
          </div>
        </div>

        <!-- Desktop -->
        <div
          class="relative z-10 hidden h-full flex-col justify-center gap-10 px-6 py-10 sm:px-10 md:flex md:flex-row md:items-center md:gap-12 md:px-14 lg:px-16"
        >
          <div class="max-w-[620px] text-left">
            <p class="font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-[#F76517] md:text-[18px]">
              Let's Grow
            </p>

            <h2
              class="mt-3 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-white sm:text-[34px] md:text-[40px] lg:text-[44px]"
            >
              Lets Grow Your Travel Business with
              <span class="text-[#F3A81A]">PirtTrip!</span>
            </h2>

            <p class="mt-4 font-plein text-[18px] font-bold leading-[140%] tracking-[0] text-white sm:text-[20px] md:text-[22px]">
              Register Today &amp; Get 20 CONNECT CREDITs for FREE.
            </p>

            <a
              href="#get-started"
              class="mt-7 inline-flex h-[50px] min-w-[220px] items-center justify-center rounded-full bg-white px-8 font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-black no-underline transition-opacity hover:opacity-90"
              @click="handleCtaClick"
            >
              Join as Business
            </a>
          </div>

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
    <div class="mx-auto w-[94%] max-w-[1200px] pb-10">
      <div
        class="flex flex-col items-center gap-10 border-t border-black/[0.06] py-12 text-center lg:flex-row lg:items-start lg:gap-12 lg:py-14 lg:text-left xl:gap-16"
      >
        <!-- Brand -->
        <div class="w-full shrink-0 lg:w-[300px] xl:w-[320px]">
          <a
            v-if="homeIsExternal"
            :href="homeHref"
            class="mx-auto inline-flex shrink-0 lg:mx-0"
            aria-label="PirtTrip home"
          >
            <img
              :src="FOOTER_LOGO_SRC"
              alt="PirtTrip"
              class="h-10 w-auto object-contain"
              loading="lazy"
              draggable="false"
            >
          </a>
          <NuxtLink
            v-else
            to="/"
            class="mx-auto inline-flex shrink-0 lg:mx-0"
            aria-label="PirtTrip home"
          >
            <img
              :src="FOOTER_LOGO_SRC"
              alt="PirtTrip"
              class="h-10 w-auto object-contain"
              loading="lazy"
              draggable="false"
            >
          </NuxtLink>

          <p
            class="mt-5 font-plein text-[15px] font-normal leading-[145%] tracking-[0] text-black/75"
          >
            Grow your travel business with verified leads and tools built for travel partners on PirtTrip.
          </p>
        </div>

        <!-- Link columns -->
        <div
          class="grid min-w-0 w-full flex-1 grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-x-6 md:gap-x-10 lg:gap-x-12"
        >
          <div class="min-w-0 text-center lg:text-left">
            <h3 class="font-plein text-[17px] font-bold leading-[130%] text-black">
              Quick Links
            </h3>

            <ul class="mt-4 space-y-2.5">
              <li v-for="link in quickLinks" :key="link.id">
                <NuxtLink
                  v-if="!isHashHref(link.href) && !isExternalHref(link.href)"
                  :to="link.href"
                  :class="linkClass"
                >
                  {{ link.label }}
                </NuxtLink>
                <a
                  v-else
                  :href="link.href"
                  :class="linkClass"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <div class="min-w-0 text-center lg:text-left">
            <h3 class="font-plein text-[17px] font-bold leading-[130%] text-black">
              Legal
            </h3>

            <ul class="mt-4 space-y-2.5">
              <li v-for="link in legalLinks" :key="link.id">
                <NuxtLink
                  :to="link.href"
                  :class="linkClass"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="min-w-0 text-center lg:text-left">
            <h3 class="font-plein text-[17px] font-bold leading-[130%] text-black">
              Contact us
            </h3>

            <ul class="mt-4 space-y-2.5">
              <li>
                <a
                  :href="`mailto:${CONTACT_EMAIL}`"
                  :class="linkClass"
                >
                  {{ CONTACT_EMAIL }}
                </a>
              </li>
              <li>
                <a
                  :href="CONTACT_PHONE_TEL"
                  :class="linkClass"
                >
                  {{ CONTACT_PHONE_DISPLAY }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="border-t border-black/[0.06] pt-8">
        <LayoutFooterCopyright />
      </div>
    </div>
  </footer>

</template>
