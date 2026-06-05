<script setup lang="ts">
import type { LeadStatus } from '~/types/database'

const props = defineProps<{ status: LeadStatus | string; verified?: boolean }>()

const classes = computed(() => {
  if (props.verified === true) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
  if (props.verified === false) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'

  const map: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    CONTACTED: 'bg-red-100 text-brand-red dark:bg-red-950 dark:text-red-300',
    QUALIFIED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    ONBOARDED: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    REJECTED: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  }
  return map[props.status] || 'bg-black/5 text-black/70'
})
</script>

<template>
  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="classes">
    <template v-if="verified === true">Verified</template>
    <template v-else-if="verified === false">Pending</template>
    <template v-else>{{ status }}</template>
  </span>
</template>
