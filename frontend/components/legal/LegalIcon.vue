<script setup lang="ts">
defineProps<{
  name: string
  iconClass?: string
}>()
</script>

<template>
  <svg
    v-if="name === 'privacy'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l7 4v5c0 4.2-3 7.8-7 9-4-1.2-7-4.8-7-9V7l7-4z" />
    <path stroke-linecap="round" d="M9.5 12.2l1.8 1.8 3.7-3.7" />
  </svg>

  <svg
    v-else-if="name === 'terms'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M8 4h8l3 3v13H8V4z" />
    <path stroke-linecap="round" d="M11 10h5M11 14h5M11 18h3" />
  </svg>

  <svg
    v-else-if="name === 'cookie'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="9" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="15" r="1" fill="currentColor" stroke="none" />
  </svg>

  <svg
    v-else-if="name === 'disclaimer'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M12 3l9 16H3L12 3z" />
    <path stroke-linecap="round" d="M12 9v5M12 17h.01" />
  </svg>

  <svg
    v-else-if="name === 'fraud'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M12 3l8 4v5c0 4.5-3.4 8.4-8 9.5C7.4 20.4 4 16.5 4 12V7l8-4z" />
    <path stroke-linecap="round" d="M12 8v5M12 16h.01" />
  </svg>

  <svg
    v-else-if="name === 'listing'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path stroke-linecap="round" d="M8 10h8M8 14h5" />
  </svg>

  <svg
    v-else-if="name === 'ip'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <path stroke-linecap="round" d="M8.5 12h7M12 8.5v7" />
  </svg>

  <svg
    v-else-if="name === 'mail'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path stroke-linecap="round" d="M3 8l9 6 9-6" />
  </svg>

  <svg
    v-else-if="name === 'lock'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <rect x="6" y="10" width="12" height="10" rx="2" />
    <path stroke-linecap="round" d="M8 10V8a4 4 0 118 0v2" />
  </svg>

  <svg
    v-else-if="name === 'scale'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M12 4v16M6 8h12M8 16l4-4 4 4" />
  </svg>

  <svg
    v-else-if="name === 'users'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <circle cx="9" cy="9" r="3" />
    <circle cx="17" cy="10" r="2.5" />
    <path stroke-linecap="round" d="M4 19c0-2.8 2.2-5 5-5M15 19c0-2 1.6-3.5 3.5-3.5" />
  </svg>

  <svg
    v-else-if="name === 'chart'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M5 19V9M12 19V5M19 19v-7" />
  </svg>

  <svg
    v-else-if="name === 'globe'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <path stroke-linecap="round" d="M4 12h16M12 4a12 12 0 010 16M12 4a12 12 0 000 16" />
  </svg>

  <svg
    v-else-if="name === 'check'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <path stroke-linecap="round" d="M8.5 12.2l2.2 2.2 4.8-4.8" />
  </svg>

  <svg
    v-else-if="name === 'image'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path stroke-linecap="round" d="M6 17l4-4 3 3 2-2 3 3" />
  </svg>

  <svg
    v-else
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    <rect x="5" y="4" width="14" height="16" rx="2" />
    <path stroke-linecap="round" d="M9 9h6M9 13h6M9 17h4" />
  </svg>
</template>
