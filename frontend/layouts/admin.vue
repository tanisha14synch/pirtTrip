<script setup>
const auth = useAuth()

async function handleSignOut() {
  await auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5] font-sans text-black">
    <header class="border-b border-black/10 bg-white">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NuxtLink to="/admin" class="font-plein text-xl font-bold lowercase">
          PirtTrip <span class="text-sm font-normal text-black/50">admin</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <span
            v-if="auth.adminProfile"
            class="hidden text-sm text-black/60 sm:inline"
          >
            {{ auth.adminProfile.full_name }}
            ({{ auth.adminProfile.role }})
          </span>
          <button
            type="button"
            class="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5"
            @click="handleSignOut"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <slot />
    </main>
  </div>
</template>
