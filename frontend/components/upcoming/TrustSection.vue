<script setup>
const rowOne = [
  {
    id: 'no-contact',
    iconSrc: '/images/trust/trust-icon-01.png',
    iconAlt: 'We never contact your customers',
    parts: [
      { text: 'We ', bold: false },
      { text: 'NEVER', bold: true },
      { text: ' contact your customers for selling any/other tours & packages', bold: false },
    ],
  },
  {
    id: 'no-share',
    iconSrc: '/images/trust/trust-icon-02.png',
    iconAlt: 'We never share customer details',
    parts: [
      { text: 'We ', bold: false },
      { text: 'NEVER', bold: true },
      { text: ' share your customer details with other travel businesses.', bold: false },
    ],
  },
  {
    id: 'direct',
    iconSrc: '/images/trust/trust-icon-03.png',
    iconAlt: 'Direct customer contact',
    parts: [
      { text: 'Travelers/Customers contact you directly — ', bold: false },
      { text: 'NO Middle Interference', bold: true },
    ],
  },
  {
    id: 'no-booking',
    iconSrc: '/images/trust/trust-icon-04.png',
    iconAlt: 'No direct bookings on platform',
    parts: [
      { text: 'We ', bold: false },
      { text: 'DO NOT', bold: true },
      { text: ' take direct bookings on our platform', bold: false },
    ],
  },
  {
    id: 'no-commission',
    iconSrc: '/images/trust/trust-icon-05.png',
    iconAlt: 'No commission on bookings',
    parts: [
      { text: 'We ', bold: false },
      { text: 'DO NOT', bold: true },
      { text: ' take any commission on your bookings', bold: false },
    ],
  },
  {
    id: 'profile',
    iconSrc: '/images/trust/trust-icon-06.png',
    iconAlt: 'Visit itinerary and business profile',
    parts: [
      { text: 'Traveler/Customer can directly visit your ', bold: false },
      { text: 'itinerary pages and business profile.', bold: true },
    ],
  },
]

const rowTwo = [
  {
    id: 'manage',
    iconSrc: '/images/trust/trust-icon-07.png',
    iconAlt: 'Manage pricing and bookings',
    parts: [
      { text: 'You manage your own ', bold: false },
      { text: 'pricing, communication and bookings.', bold: true },
    ],
  },
  {
    id: 'visibility',
    iconSrc: '/images/trust/trust-icon-08.png',
    iconAlt: 'Visibility and leads',
    parts: [
      { text: 'We help you generate ', bold: false },
      { text: 'visibility and leads', bold: true },
      { text: ', not take away your customers', bold: false },
    ],
  },
  {
    id: 'otp',
    iconSrc: '/images/trust/trust-icon-09.png',
    iconAlt: 'OTP verified inquiries',
    parts: [
      { text: 'OTP-verified', bold: true },
      { text: ' Traveler/Customer inquiries for better quality leads', bold: false },
    ],
  },
  {
    id: 'transparent',
    iconSrc: '/images/trust/trust-icon-10.png',
    iconAlt: 'Transparent platform',
    parts: [
      { text: 'Transparent and travel-business-friendly', bold: true },
      { text: ' platform', bold: false },
    ],
  },
  {
    id: 'discovery',
    iconSrc: '/images/trust/trust-icon-11.png',
    iconAlt: 'Discovery platform not travel agency',
    parts: [
      { text: 'PirtTrip acts as a ', bold: false },
      { text: 'discovery platform', bold: true },
      { text: ' not a ', bold: false },
      { text: 'competing travel agency', bold: true },
    ],
  },
]

const trustBenefits = [...rowOne, ...rowTwo]
const mobileRowOne = trustBenefits.slice(0, 9)
const mobileRowTwo = trustBenefits.slice(9)
</script>

<template>
  <section class="relative overflow-x-hidden bg-[#f5f5f5] py-10 md:py-16">
    <div class="relative z-10 mx-auto w-full max-w-[1280px] px-1.5 sm:w-[94%] sm:px-0">
      <header class="text-center">
        <p class="font-plein text-[14px] font-bold leading-[130%] tracking-[0] text-[#F76517] sm:text-[18px] md:text-[22px]">
          - Why Trust PirtTrip? -
        </p>

        <h2
          class="mx-auto mt-1.5 max-w-[18em] font-plein text-[20px] font-bold leading-[125%] tracking-[0] text-black sm:mt-2 sm:max-w-none sm:text-[24px] md:text-[30px]"
        >
          YOUR CUSTOMERs remain ALL YOURs
        </h2>
      </header>

      <!-- Mobile only: 3 cards per row; last 2 centered -->
      <div class="trust-mobile-layout mx-auto mt-8 w-full md:hidden">
        <div class="trust-mobile-grid">
          <UpcomingTrustBenefitCard
            v-for="benefit in mobileRowOne"
            :key="`m-${benefit.id}`"
            :icon-src="benefit.iconSrc"
            :icon-alt="benefit.iconAlt"
            :parts="benefit.parts"
          />
        </div>

        <div class="trust-mobile-last-row">
          <UpcomingTrustBenefitCard
            v-for="benefit in mobileRowTwo"
            :key="`m-${benefit.id}`"
            :icon-src="benefit.iconSrc"
            :icon-alt="benefit.iconAlt"
            :parts="benefit.parts"
          />
        </div>
      </div>

      <!-- Desktop: unchanged flex layout -->
      <div class="mt-8 hidden flex-col items-center gap-10 md:flex md:mt-9">
        <div class="flex max-w-full flex-wrap justify-center gap-x-3 gap-y-14">
          <UpcomingTrustBenefitCard
            v-for="benefit in rowOne"
            :key="benefit.id"
            variant="desktop"
            :icon-src="benefit.iconSrc"
            :icon-alt="benefit.iconAlt"
            :parts="benefit.parts"
          />
        </div>

        <div class="flex max-w-full flex-wrap justify-center gap-x-3 gap-y-14">
          <UpcomingTrustBenefitCard
            v-for="benefit in rowTwo"
            :key="benefit.id"
            variant="desktop"
            :icon-src="benefit.iconSrc"
            :icon-alt="benefit.iconAlt"
            :parts="benefit.parts"
          />
        </div>
      </div>

      <p
        class="relative z-10 mt-10 text-center font-poppins text-[14px] font-medium leading-[130%] tracking-[0] text-black sm:mt-14 sm:text-[17px] md:text-[20px] md:leading-[100%]"
      >
        Your CUSTOMERs. Your BRAND. Your BUSINESS.
      </p>
    </div>

    <!-- Optional: add /images/trust/trust-skyline.png when asset is ready -->
  </section>
</template>

<style scoped>
.trust-mobile-layout {
  --trust-mobile-gap: clamp(10px, 3.2vw, 16px);
  --trust-mobile-row-gap: clamp(24px, 6vw, 32px);
}

.trust-mobile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--trust-mobile-gap);
  row-gap: var(--trust-mobile-row-gap);
  padding-inline: var(--trust-mobile-gap);
}

.trust-mobile-last-row {
  display: flex;
  justify-content: center;
  gap: var(--trust-mobile-gap);
  padding-inline: var(--trust-mobile-gap);
  margin-top: var(--trust-mobile-row-gap);
}

.trust-mobile-last-row > :deep(.trust-benefit-card) {
  width: calc((100% - 2 * var(--trust-mobile-gap)) / 3);
  flex-shrink: 0;
}
</style>
