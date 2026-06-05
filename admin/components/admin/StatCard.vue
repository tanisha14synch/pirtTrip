<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  hint?: string
  accent?: 'red' | 'blue' | 'green' | 'amber'
}>()
</script>

<template>
  <div class="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1e1b18]">
    <p class="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
      {{ label }}
    </p>
    <p
      class="mt-2 text-3xl font-bold"
      :class="{
        'text-brand-red': accent === 'red',
        'text-blue-600': accent === 'blue',
        'text-green-600': accent === 'green',
        'text-amber-600': accent === 'amber',
      }"
    >
      {{ value }}
    </p>
    <p v-if="hint" class="mt-1 text-xs text-black/45 dark:text-white/45">
      {{ hint }}
    </p>
  </div>
</template>
