<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: 'Waitlist', to: '/', icon: 'dashboard' },
  { label: 'Businesses', to: '/vendors', icon: 'vendors' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 flex-col border-r border-black/10 bg-white lg:flex">
    <div class="flex h-16 shrink-0 items-center border-b border-black/10 px-5">
      <NuxtLink to="/vendors" class="flex min-w-0 items-center gap-2">
        <img
          src="/images/logo-black.svg"
          alt="PirtTrip"
          class="h-10 w-auto max-w-[160px] object-contain object-left"
        >
        <span class="shrink-0 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          Admin
        </span>
      </NuxtLink>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto p-3">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(item.to)
          ? 'bg-orange-50 text-brand-primary'
          : 'text-black/70 hover:bg-black/5'"
      >
        <svg v-if="item.icon === 'dashboard'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <svg v-else class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {{ item.label }}
      </NuxtLink>
    </nav>

    <p class="shrink-0 border-t border-black/10 px-5 py-4 text-xs text-black/40">
      PirtTrip Admin v1.0
    </p>
  </aside>
</template>
