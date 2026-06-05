<script setup lang="ts">
const { toasts } = useAdminToast()
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
    <div
      v-for="item in toasts"
      :key="item.id"
      class="pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg dark:border-white/10"
      :class="{
        'border-green-200 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100': item.type === 'success',
        'border-red-200 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100': item.type === 'error',
        'border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100': item.type === 'info',
      }"
      role="status"
    >
      {{ item.message }}
    </div>
  </div>
</template>
