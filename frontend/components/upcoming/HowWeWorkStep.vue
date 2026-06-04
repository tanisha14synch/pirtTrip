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
    default: '',
  },
  parts: {
    type: Array,
    default: () => [],
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
    validator: (value) => ['flow', 'flow-compact', 'card', 'timeline'].includes(value),
  },
  isLast: {
    type: Boolean,
    default: false,
  },
  onDarkBg: {
    type: Boolean,
    default: false,
  },
})

const isCompactFlow = computed(() => props.variant === 'flow-compact')
</script>

<template>
  <!-- Mobile timeline (Figma) -->
  <article
    v-if="variant === 'timeline'"
    class="how-we-work-timeline-step grid grid-cols-[96px_24px_1fr] gap-x-2.5 sm:grid-cols-[104px_28px_1fr] sm:gap-x-3"
    :class="isLast ? '' : 'pb-9 sm:pb-10'"
  >
    <div class="flex items-center justify-center self-start pt-1">
      <img
        :src="iconSrc"
        :alt="iconAlt"
        class="h-auto w-full max-w-[92px] object-contain sm:max-w-[100px]"
        loading="lazy"
        draggable="false"
      >
    </div>

    <div
      class="relative z-[1] flex items-start justify-center self-start pt-3"
      aria-hidden="true"
    >
      <span
        class="h-[14px] w-[14px] shrink-0 rounded-full border-2 border-[#BDBDBD] bg-white box-border sm:h-[15px] sm:w-[15px]"
      />
    </div>

    <div class="min-w-0 pb-1 pt-0.5">
      <div class="flex items-start gap-1.5">
        <svg
          class="mt-0.5 h-[18px] w-[14px] shrink-0"
          viewBox="0 0 14 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M7 0C3.686 0 1 2.686 1 6c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6Zm0 8.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z"
            fill="#FBC02D"
            stroke="#F76517"
            stroke-width="0.5"
          />
        </svg>

        <p class="font-plein text-[14px] font-bold leading-[130%] text-black sm:text-[15px]">
          {{ number }}. {{ title }}
        </p>
      </div>

      <p class="mt-2 font-poppins text-[12px] font-normal leading-[150%] text-[#4F4F4F] sm:text-[13px]">
        <template v-if="parts.length">
          <template v-for="(part, index) in parts" :key="index">
            <span v-if="part.bold" class="font-semibold text-[#2D2D2D]">{{ part.text }}</span>
            <template v-else>{{ part.text }}</template>
          </template>
        </template>
        <template v-else>{{ description }}</template>
      </p>
    </div>
  </article>

  <!-- Mobile card (legacy) -->
  <article
    v-else-if="variant === 'card'"
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
        <template v-if="parts.length">
          <template v-for="(part, index) in parts" :key="index">
            <span v-if="part.bold" class="font-semibold">{{ part.text }}</span>
            <template v-else>{{ part.text }}</template>
          </template>
        </template>
        <template v-else>{{ description }}</template>
      </p>
    </div>
  </article>

  <!-- Desktop flow -->
  <article
    v-else-if="variant === 'flow' || variant === 'flow-compact'"
    class="flex max-w-full flex-col items-left text-left"
    :class="isCompactFlow ? 'w-[168px]' : 'w-[220px]'"
  >
    <div
      class="flex w-full items-end justify-center"
      :class="isCompactFlow ? 'h-[64px]' : 'h-[128px]'"
    >
      <img
        :src="iconSrc"
        :alt="iconAlt"
        class="object-contain object-bottom"
        :class="isCompactFlow ? 'h-[56px] w-[130px]' : 'max-h-[120px] max-w-[200px]'"
        decoding="async"
        draggable="false"
      >
    </div>

    <p
      class="mt-3 text-left font-plein font-bold leading-[130%]"
      :class="[
        isCompactFlow ? 'text-[12px]' : 'text-[13px]',
        onDarkBg ? 'text-white' : 'text-black',
      ]"
    >
      {{ number }}. {{ title }}
    </p>

    <p
      class="font-poppins font-normal"
      :class="[
        isCompactFlow ? 'mt-0.5 max-w-[168px] text-[10px] leading-[120%]' : 'mt-1.5 max-w-[210px] text-[12px] leading-[130%]',
        onDarkBg ? 'text-white/75' : 'text-[#2D2D2D]',
      ]"
    >
      <template v-if="parts.length">
        <template v-for="(part, index) in parts" :key="index">
          <span v-if="part.bold" class="font-semibold">{{ part.text }}</span>
          <template v-else>{{ part.text }}</template>
        </template>
      </template>
      <template v-else>{{ description }}</template>
    </p>
  </article>
</template>