<script setup lang="ts">
const { adminUser, signOut } = useAdminAuth()

const pillClass =
  'inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap'
</script>

<template>
  <header class="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-white px-6">
    <div />
    <div class="flex items-center gap-3">
      <div v-if="adminUser" class="hidden items-center gap-2 sm:flex">
        <span class="text-sm font-medium">{{ adminUser.full_name }}</span>
        <span :class="[pillClass, 'bg-orange-100 text-xs font-bold uppercase text-brand-primary']">
          {{ adminUser.role.replace('_', ' ') }}
        </span>
      </div>

      <button
        type="button"
        :class="[pillClass, 'border border-black/10 text-black/70 hover:bg-black/5']"
        @click="signOut"
      >
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  </header>
</template>
