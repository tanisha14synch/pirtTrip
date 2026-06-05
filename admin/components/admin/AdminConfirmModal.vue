<script setup lang="ts">
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm action' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  danger: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    @click.self="emit('cancel')"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-[#1e1b18] dark:text-white">
      <h3 class="text-lg font-bold">
        {{ title }}
      </h3>
      <p class="mt-2 text-sm text-black/70 dark:text-white/70">
        {{ message }}
      </p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
          :disabled="loading"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-red hover:bg-brand-red-dark'"
          :disabled="loading"
          @click="emit('confirm')"
        >
          {{ loading ? 'Please wait…' : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
