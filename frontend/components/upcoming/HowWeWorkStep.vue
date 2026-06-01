<script setup>
const props = defineProps({
  number: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  iconSrc: {
    type: String,
    required: true,
  },
  iconAlt: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'flow',
    validator: (value) => ['flow', 'flow-compact', 'card'].includes(value),
  },
})

const isCompactFlow = computed(() => props.variant === 'flow-compact')
</script>

<template>
  <!-- Mobile -->
  <article
    v-if="variant === 'card'"
    class="flex gap-4 rounded-[14px] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
  >
    <div class="flex h-[88px] w-[88px] shrink-0 items-center justify-center">
      <img
        :src="iconSrc"
        :alt="iconAlt"
        class="max-h-full max-w-full object-contain"
        loading="lazy"
        draggable="false"
      >
    </div>

    <div class="min-w-0 flex-1">
      <p class="font-plein text-[14px] font-bold leading-[130%] text-[#F76517]">
        {{ number }}. {{ title }}
      </p>

      <p class="mt-2 font-poppins text-[12px] font-normal leading-[140%] text-[#2D2D2D]">
        {{ description }}
      </p>
    </div>
  </article>

  <!-- Desktop flow -->
  <article
    v-else-if="variant === 'flow' || variant === 'flow-compact'"
    class="flex max-w-full flex-col items-left text-left ml-6"
    :class="isCompactFlow ? 'w-[162px]' : 'w-[220px]'"
  >
    <div
      class="flex w-full items-end justify-center"
      :class="isCompactFlow ? 'h-[68px]' : 'h-[128px]'"
    >
      <img
        :src="iconSrc"
        :alt="iconAlt"
        class="object-contain object-bottom mix-blend-multiply"
        :class="isCompactFlow ? 'max-h-[62px] max-w-[140px]' : 'max-h-[120px] max-w-[200px]'"
        loading="lazy"
        draggable="false"
      >
    </div>

    <p
      class="font-plein font-bold leading-[130%] text-left text-black mt-3"
      :class="isCompactFlow ? 'text-[11px]' : 'text-[13px]'"
    >
      {{ number }}. {{ title }}
    </p>

    <p
      class="font-poppins font-normal text-[#2D2D2D]"
      :class="isCompactFlow ? 'mt-0.5 max-w-[162px] text-[10px] leading-[120%]' : 'mt-1.5 max-w-[210px] text-[12px] leading-[130%]'"
    >
      {{ description }}
    </p>
  </article>
</template>