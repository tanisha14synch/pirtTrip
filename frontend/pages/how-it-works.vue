<script setup>
const { partnerLandingUrl } = usePartnerSite()

await navigateTo(partnerLandingUrl.value, {
  external: partnerLandingUrl.value.startsWith('http'),
  redirectCode: 301,
})
</script>
