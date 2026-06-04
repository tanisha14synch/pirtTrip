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
      { text: 'Transparent and travel-business-friendly platform', bold: false },
    ],
  },
  {
    id: 'discovery',
    iconSrc: '/images/trust/trust-icon-11.png',
    iconAlt: 'Discovery platform not travel agency',
    parts: [
      { text: 'pirtTrip acts as a ', bold: false },
      { text: 'discovery platform', bold: true },
      { text: ' not a ', bold: false },
      { text: 'competing travel agency', bold: true },
    ],
  },
]
</script>

<template>
  <section class="relative overflow-hidden bg-[#f5f5f5] py-14 md:py-16">
    <div class="relative z-10 mx-auto w-[94%] max-w-[1280px]">
      <header class="text-center">
        <p class="font-plein text-[24px] font-bold leading-[130%] tracking-[0] text-[#F76517] md:text-[26px]">
          - Why Trust pirtTrip? -
        </p>

        <h2
          class="mt-3 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-black md:text-[30px]"
        >
          YOUR CUSTOMERs remain ALL YOURs
        </h2>
      </header>

      <div class="mt-14 flex flex-col items-center gap-10">
        <div class="flex max-w-full flex-wrap justify-center gap-x-3 gap-y-14">
          <UpcomingTrustBenefitCard
            v-for="benefit in rowOne"
            :key="benefit.id"
            :icon-src="benefit.iconSrc"
            :icon-alt="benefit.iconAlt"
            :parts="benefit.parts"
          />
        </div>

        <div class="flex max-w-full flex-wrap justify-center gap-x-3 gap-y-14">
          <UpcomingTrustBenefitCard
            v-for="benefit in rowTwo"
            :key="benefit.id"
            :icon-src="benefit.iconSrc"
            :icon-alt="benefit.iconAlt"
            :parts="benefit.parts"
          />
        </div>
      </div>

      <p
        class="relative z-10 mt-14 text-center font-poppins text-[20px] font-medium leading-[100%] tracking-[0] text-black"
      >
        Your CUSTOMERs. Your BRAND. Your BUSINESS.
      </p>
    </div>

    <!-- Optional: add /images/trust/trust-skyline.png when asset is ready -->
  </section>
</template>
