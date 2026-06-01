<script setup>
const reactions = ['😆', '🥰', '😕', '😡']

const stats = [
  { id: 'experience', value: '30+', label: 'Years Experience' },
  { id: 'customers', value: '14K', label: 'Happy Customers' },
  { id: 'rating', value: '4.8', label: 'Rating' },
]
</script>

<template>
  <section class="w-full bg-[#f7f7f7] pb-8 pt-12 md:pb-10 md:pt-14">
    <div class="mx-auto h-auto w-[94%] max-w-[1159px] md:h-[603px]">
      <div class="grid h-full grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <!-- LEFT VISUAL -->
        <div class="relative mx-auto h-[430px] w-full max-w-[430px]">
          <img
            src="/images/about-p-shape.png"
            alt="About us scenic P-shape visual"
            class="absolute left-[44px] top-0 z-10 h-[430px] w-auto object-contain"
            loading="lazy"
            draggable="false"
          >

          <!-- Verified Box -->
          <aside
            class="about-float about-float--verified absolute left-[-18px] top-[26px] z-20 flex h-[128px] w-[92px] flex-col items-center rounded-[12px] bg-white p-[9px] text-center shadow-[-4px_8px_20px_0px_rgba(0,0,0,0.10)]"
          >
            <img
              src="/images/verified-badge.png"
              alt="Verified badge"
              class="h-[48px] w-[48px] object-contain"
              loading="lazy"
              draggable="false"
            >

            <p class="mt-2 font-plein text-[22px] font-semibold leading-[1.2] text-black">
              100%
            </p>

            <p class="mt-0.5 font-plein text-[13px] font-medium leading-[1.2] text-black/50">
              Verified
            </p>
          </aside>

          <!-- Experience Box -->
          <aside
            class="about-float about-float--experience absolute left-[88px] top-[286px] z-20 h-[92px] w-[200px] rounded-[14px] bg-white p-[12px] shadow-[10px_12px_32px_0px_rgba(0,0,0,0.08)]"
          >
            <p class="font-plein text-[16px] font-medium leading-[1.3] text-black">
              How your Experience?
            </p>

            <div class="mt-2.5 flex items-center justify-between">
              <span
                v-for="(icon, idx) in reactions"
                :key="idx"
                class="font-plein text-[30px] font-medium leading-none tracking-[0.02em]"
              >
                {{ icon }}
              </span>
            </div>
          </aside>
        </div>

        <!-- RIGHT CONTENT -->
        <article class="max-w-[560px]">
          <p class="font-plein text-[20px] font-bold leading-[130%] text-[#F76517]">
            Our Story
          </p>

          <h2 class="mt-4 font-plein text-[48px] font-bold leading-[130%] text-black">
            Bringing Your Travel Dreams to Life
          </h2>

          <p class="mt-5 max-w-[500px] font-plein text-[16px] font-normal leading-[140%] text-[#000000CC]">
            We provide personalized travel planning, expert advice, and a seamless booking process to make your dream
            vacation a reality.
          </p>

          <div class="mt-10 grid grid-cols-3 gap-8">
            <div v-for="item in stats" :key="item.id" class="text-center">
              <p class="font-plein text-[60px] font-bold leading-[120%] text-[#7ca023]">
                {{ item.value }}
              </p>

              <p class="mt-1 font-plein text-[18px] font-medium leading-[140%] text-black">
                {{ item.label }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes aboutFloatSoft {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes aboutFloatSoftAlt {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.about-float {
  will-change: transform;
}

.about-float--verified {
  animation: aboutFloatSoft 4.2s ease-in-out infinite;
}

.about-float--experience {
  animation: aboutFloatSoftAlt 4.8s ease-in-out infinite;
  animation-delay: 0.35s;
}

@media (prefers-reduced-motion: reduce) {
  .about-float--verified,
  .about-float--experience {
    animation: none;
  }
}
</style>