<script setup lang="ts">
defineProps({
  label: { type: String, default: 'Delete' },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 font-semibold text-red-700 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
    :class="compact
      ? 'rounded border border-red-300 px-2 py-1 text-xs'
      : 'rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm dark:border-red-800 dark:bg-red-950/30'"
    @click="emit('click')"
  >
    <svg class="shrink-0" :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    {{ label }}
  </button>
</template>
