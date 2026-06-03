<script setup lang="ts">
defineProps<{
  variant?: 'light' | 'dark'
}>()
</script>

<template>
  <p
    class="text-center font-plein text-[14px] font-normal leading-[160%] tracking-[0] sm:text-[16px]"
    :class="variant === 'dark' ? 'text-white/45' : 'text-black/50'"
  >
    © 2026
    <a
      href="https://www.pirttrip.com"
      target="_blank"
      rel="noopener noreferrer"
      class="underline-offset-2 transition-colors hover:underline"
      :class="variant === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'"
    >PirtTrip</a>.
    All rights reserved. A platform by
    <a
      href="https://www.martyrsservices.com"
      target="_blank"
      rel="noopener noreferrer"
      class="underline-offset-2 transition-colors hover:underline"
      :class="variant === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'"
    >Martyrs Services</a>.
  </p>
</template>
