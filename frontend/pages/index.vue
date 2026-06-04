<script setup>
const { isBusinessSite } = useSiteVariant()

definePageMeta({
  layout: false,
})

setPageLayout(isBusinessSite.value ? 'upcoming' : false)

if (isBusinessSite.value) {
  useBusinessLandingHead()
}
else {
  useHead({
    title: 'pirtTrip — Find, Join & Experience Amazing Group Trips',
    meta: [
      {
        name: 'description',
        content:
          'Coming soon: find exciting group trips, meet fellow travelers, and explore destinations with trusted organizers on pirtTrip.',
      },
    ],
  })
}
</script>

<template>
  <PartnerBusinessLandingContent v-if="isBusinessSite" />
  <LandingLaunchHeroSection v-else />
</template>
