<script setup lang="ts">
const error = useError()

const message = computed(() => {
  const raw = error.value?.message || 'Something went wrong'
  if (raw.includes('ENOENT') && raw.includes('nuxt-vite-node')) {
    return 'Admin dev server needs a restart. Run: cd admin && npm run dev'
  }
  return raw
})

function goLogin() {
  useAdminToast().clearAll()
  clearError({ redirect: '/login' })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#141210] px-4 text-white">
    <div class="w-full max-w-md rounded-2xl border border-white/10 bg-[#1e1b18] p-8 text-center">
      <p class="text-5xl font-bold text-brand-red">
        {{ error?.statusCode || 500 }}
      </p>
      <p class="mt-4 text-sm text-white/70">
        {{ message }}
      </p>
      <button
        type="button"
        class="mt-6 rounded-xl bg-brand-red px-5 py-3 text-sm font-bold text-white"
        @click="goLogin"
      >
        Back to login
      </button>
    </div>
  </div>
</template>
