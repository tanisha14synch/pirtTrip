<script setup>
const props = defineProps({
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
  variant: {
    type: String,
    default: 'mobile',
    validator: (v) => ['mobile', 'desktop'].includes(v),
  },
})

const iconError = ref(false)
const isDesktop = computed(() => props.variant === 'desktop')
</script>

<template>
  <article
    class="trust-benefit-card relative flex flex-col items-center justify-self-center"
    :class="[
      isDesktop ? 'trust-benefit-card--desktop w-[184px] shrink-0' : 'trust-benefit-card--mobile w-full min-w-0',
    ]"
  >
    <div class="relative w-full">
      <div
        class="trust-benefit-card__icon-box absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        aria-hidden="true"
      >
        <img
          v-if="!iconError"
          :src="iconSrc"
          :alt="iconAlt"
          class="trust-benefit-card__icon object-contain"
          loading="lazy"
          draggable="false"
          @error="iconError = true"
        >
        <span
          v-else
          class="trust-benefit-card__icon-fallback rounded-[5px] bg-[#E2980B]/10"
        />
      </div>

      <div
        class="trust-benefit-card__body flex w-full flex-col items-center justify-center rounded-[14px] bg-white text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
      >
        <p class="trust-benefit-card__text font-poppins font-normal tracking-[0] text-[#2D2D2D]">
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
  padding-top: 24px;
}

.trust-benefit-card__icon-box {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #faf3e0;
}

.trust-benefit-card__icon,
.trust-benefit-card__icon-fallback {
  width: 32px;
  height: 32px;
}

.trust-benefit-card--mobile .trust-benefit-card__body {
  min-height: 118px;
  padding: 28px 6px 12px;
  border-radius: 10px;
}

.trust-benefit-card--mobile .trust-benefit-card__text {
  font-size: 10px;
  line-height: 130%;
}

.trust-benefit-card__body {
  min-height: 88px;
  padding: 26px 6px 10px;
  border-radius: 10px;
}

.trust-benefit-card__text {
  font-size: 9px;
  line-height: 125%;
}

.trust-benefit-card--desktop {
  padding-top: 51.43px;
}

.trust-benefit-card--desktop .trust-benefit-card__icon-box {
  width: 102.86px;
  height: 102.86px;
  border-radius: 11.43px;
  background-color: rgb(226 152 11 / 0.04);
}

.trust-benefit-card--desktop .trust-benefit-card__icon,
.trust-benefit-card--desktop .trust-benefit-card__icon-fallback {
  width: 69.14px;
  height: 69.14px;
}

.trust-benefit-card--desktop .trust-benefit-card__body {
  min-height: 140px;
  padding: 54px 12px 16px;
  border-radius: 14px;
}

.trust-benefit-card--desktop .trust-benefit-card__text {
  font-size: 12px;
  line-height: 100%;
}

</style>
