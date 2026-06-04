<script setup lang="ts">
import { getLegalPage } from '~/data/legal/registry'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const page = computed(() => getLegalPage(slug.value))

watchEffect(() => {
  if (!page.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Policy not found',
    })
  }
})

const doc = computed(() => page.value!.document)

useHead({
  title: () => `${doc.value.title} — PirtTrip`,
  meta: [
    {
      name: 'description',
      content: () =>
        `${doc.value.title} for PirtTrip.com — operated by Martyrs Services, Bareilly, India.`,
    },
  ],
})

definePageMeta({
  layout: 'default',
})
</script>

<template>
  <LegalPageLayout :document="doc" :slug="slug" />
</template>
