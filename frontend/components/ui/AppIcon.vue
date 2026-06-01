<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <svg
    v-if="name === 'heart'"
    :class="iconClass"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
    />
  </svg>

  <svg
    v-else-if="name === 'chevron-left'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
  </svg>

  <svg
    v-else-if="name === 'chevron-right'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>

  <svg
    v-else-if="name === 'chevron-down'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
  </svg>

  <svg
    v-else-if="name === 'menu'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
  </svg>

  <svg
    v-else-if="name === 'close'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
  </svg>

  <svg
    v-else-if="name === 'location'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
    />
  </svg>

  <svg
    v-else-if="name === 'gps'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>

  <svg
    v-else-if="name === 'calendar'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>

  <svg
    v-else-if="name === 'swap'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path stroke-linecap="round" d="M7 10h10l-3-3M17 14H7l3 3" />
  </svg>

  <svg
    v-else-if="name === 'users'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
    />
  </svg>

  <svg
    v-else-if="name === 'thumbs-up'"
    :class="iconClass"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M14 9V5a3 3 0 00-6 0v4M5 11h9l-1 9H6l-1-9z"
    />
  </svg>
</template>
