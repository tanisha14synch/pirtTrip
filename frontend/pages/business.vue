<script setup>
const { isBusinessSite } = useSiteVariant()
const { partnerLandingUrl } = usePartnerSite()

definePageMeta({
  layout: 'upcoming',
})

if (isBusinessSite.value) {
  await navigateTo('/', { redirectCode: 301 })
}
else if (partnerLandingUrl.value.startsWith('http')) {
  await navigateTo(partnerLandingUrl.value, { external: true, redirectCode: 301 })
}

useBusinessLandingHead()
</script>

<template>
  <PartnerBusinessLandingContent />
</template>
