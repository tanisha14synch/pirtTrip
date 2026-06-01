<script setup>
defineProps({
  iconSrc: {
    type: String,
    required: true,
  },
  iconAlt: {
    type: String,
    default: '',
  },
  parts: {
    type: Array,
    required: true,
  },
})

const iconError = ref(false)
</script>

<template>
  <article class="trust-benefit-card relative flex w-[184px] shrink-0 flex-col items-center">
    <div class="relative w-full">
      <div
        class="trust-benefit-card__icon-box absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        aria-hidden="true"
      >
        <img
          v-if="!iconError"
          :src="iconSrc"
          :alt="iconAlt"
          class="trust-benefit-card__icon h-[69.14px] w-[74.86px] object-contain"
          loading="lazy"
          draggable="false"
          @error="iconError = true"
        >
        <span
          v-else
          class="h-[69.14px] w-[74.86px] rounded-[6px] bg-[#E2980B]/10"
        />
      </div>

      <div
        class="flex min-h-[140px] w-full flex-col items-center justify-center rounded-[14px] bg-white px-3 pb-4 pt-[54px] text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
      >
        <p class="font-poppins text-[12px] font-normal leading-[100%] tracking-[0] text-[#2D2D2D]">
          <template v-for="(part, index) in parts" :key="index">
            <span v-if="part.bold" class="font-semibold">{{ part.text }}</span>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.trust-benefit-card {
  padding-top: 51.43px;
}

.trust-benefit-card__icon-box {
  width: 102.86px;
  height: 102.86px;
  border-radius: 11.43px;
  background-color: rgb(226 152 11 / 0.04);
}
</style>
