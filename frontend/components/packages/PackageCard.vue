<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
})

const priceStyle = computed(() => {
  const v = props.card?.price?.variant

  if (v === 'green') {
    return {
      bg: '#098B00',
      labelClass: 'text-white',
    }
  }

  if (v === 'blue') {
    return {
      bg: '#0B19E2',
      labelClass: 'text-white/90',
    }
  }

  return {
    bg: '#E2980B',
    labelClass: 'text-[#FFF6E5]',
  }
})
</script>

<template>
  <article
    class="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-b-[28px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)] "
  >
    <!-- IMAGE -->
    <div class="relative h-[220px] sm:h-[245px] md:h-[270px]">
      <div class="absolute inset-0 overflow-hidden">
        <img
          :src="card.image"
          :alt="card.title"
          class="h-full w-full rounded-3xl object-cover "
          loading="lazy"
          draggable="false"
        >

        <!-- overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/[0.04] via-transparent to-black/[0.55] rounded-br-3xl"
        />
      </div>

      <!-- duration -->
      <div
        class="absolute left-0 top-0 z-30 flex h-[42px] min-w-[78px]
        items-center justify-center rounded-bl-[12px]
        rounded-br-[12px] rounded-tl-[12px]
        rounded-tr-[24px] border-b-[4px]
        border-r-[4px] border-white
        bg-black px-[14px] text-[14px]
        font-extrabold text-white"
      >
        <span>{{ card.duration }}</span>
      </div>

      <!-- PRICE -->
      <div
        class="absolute right-10 top-0 z-30 flex h-[46px]
        min-w-[178px] items-center justify-center
        gap-2 rounded-bl-[12px]
        rounded-br-[12px] rounded-tl-[12px]
        rounded-tr-[24px] border-b-[4px]
        border-l-[4px] border-r-[4px]
        border-white px-4 text-white"
        :style="{ backgroundColor: priceStyle.bg }"
      >
        <!-- PERFECT FIGMA CURVE
        <span
          class="pointer-events-none absolute -left-[24px] top-0 h-[24px] w-[24px]"
          :style="{
            borderTopRightRadius: '24px',
            boxShadow: `12px -12px 0 0 ${priceStyle.bg}`,
          }" -->
        <!-- /> -->

        <!-- top label -->
        <span
          v-if="card.price?.labelTop"
          class="inline-flex flex-col text-[10px] font-medium leading-[1.05]"
          :class="priceStyle.labelClass"
        >
          <template v-if="card.price.labelTop.toLowerCase() === 'starting from'">
            <span class="block">Starting</span>
            <span class="block">From</span>
          </template>
          <template v-else>
            {{ card.price.labelTop }}
          </template>
        </span>

        <!-- old price -->
        <span
          v-if="card.price?.old"
          class="text-[13px] font-medium leading-none line-through"
          :class="priceStyle.labelClass"
        >
          {{ card.price.old }}
        </span>

        <!-- current price -->
        <span
          class="text-[16px] font-extrabold leading-none text-white"
        >
          {{ card.price.value }}
        </span>
      </div>

      <!-- badges -->
      <div
        class="absolute bottom-[62px] left-[14px] z-20 flex flex-wrap gap-2"
      >
        <span
          v-for="b in (card.badges || [])"
          :key="b"
          class="inline-flex items-center gap-[6px]
          rounded-full border border-white/70
          bg-black/35 px-[13px] py-[6px]
          text-[11px] font-medium text-white
          backdrop-blur-md"
        >
          <span
            v-if="b.toLowerCase().includes('verified')"
            class="font-black text-[#39B54A]"
          >
            ✓
          </span>

          {{ b }}
        </span>
      </div>

      <!-- bottom curve area -->
      <div
        class="absolute bottom-0 left-0 z-30 flex
        min-h-[46px] max-w-[calc(100%-58px)]
        flex-wrap items-center gap-1.5
        rounded-tr-[22px] bg-white
        py-[9px] pl-[11px] pr-5"
      >
        <span
          v-for="t in (card.metaTags || [])"
          :key="t"
          class="inline-flex shrink-0 items-center
          rounded-full border border-[#E7C37C]
          bg-white px-[10px] py-[5px]
          text-[10px] font-semibold leading-none
          text-[#E2980B]"
        >
          {{ t }}
        </span>

        <span
          class="inline-flex shrink-0 items-center
          gap-1 rounded-full bg-black
          px-[9px] py-[5px] text-[10px]
          font-semibold leading-none text-white"
        >
          <span class="text-[11px] text-[#F3A81A]">★</span>
          {{ card.rating }}
        </span>

        <!-- bottom smooth curve -->
        <span
          class="pointer-events-none absolute
          -right-[24px] bottom-0 h-[24px]
          w-[24px] rounded-bl-[24px]
          bg-transparent
          shadow-[-8px_8px_0_8px_#fff]"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- CONTENT -->
    <div class="px-[18px] pb-[22px] pt-[20px]">
      <!-- title -->
      <div class="flex items-start justify-between gap-3">
        <h3
          class="m-0 flex-1 text-[24px]
          font-[850] leading-[1.16]
          tracking-[-0.02em] text-black"
        >
          {{ card.title }}
        </h3>

        <!-- brand -->
        <div
          class="mt-1 mr-[-18px] flex h-[40px]
          min-w-[152px] items-center gap-2
          rounded-l-full bg-[#F1F1F1]
          px-3 pr-5 text-[12px] font-medium text-[#333]"
        >
          <img
            v-if="card.brandLogo"
            :src="card.brandLogo"
            alt=""
            class="h-[22px] w-[22px] object-contain"
          >

          <span>{{ card.brand }}</span>
        </div>
      </div>

      <!-- location -->
      <div
        class="mt-5 flex items-center justify-between gap-3"
      >
        <p
          class="m-0 flex min-w-0 items-center
          gap-2 text-[14px] font-semibold
          text-[#5B6389]"
        >
          <svg
            class="h-[18px] w-[18px] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M22 2L11 13"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M22 2L15 22L11 13L2 9L22 2Z"
            />
          </svg>

          <span class="truncate">
            {{ card.location }}
          </span>
        </p>

        <!-- tags -->
        <div class="flex flex-wrap justify-end gap-2">
          <span
            v-for="tag in (card.tags || [])"
            :key="tag"
            class="rounded-full bg-[#F8E5BD]
            px-[15px] py-[8px]
            text-[13px] font-semibold
            leading-none text-[#705A35]"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- itinerary -->
      <div class="mt-[22px] flex items-center gap-2">
        <template
          v-for="(it, idx) in (card.itinerary || [])"
          :key="`${it.day}-${idx}`"
        >
          <div
            class="flex min-h-[48px] flex-1
            items-center gap-[7px]
            rounded-[10px] bg-[#FFFBF6]
            px-[10px] py-[9px]"
          >
            <strong
              class="whitespace-nowrap text-[11px]
              font-extrabold text-[#333]"
            >
              {{ it.day }}
            </strong>

            <div>
              <small
                v-if="it.label"
                class="block whitespace-nowrap
                text-[8px] font-medium
                leading-[1.1] text-[#9B9B9B]"
              >
                {{ it.label }}
              </small>

              <b
                class="block whitespace-nowrap
                text-[10px] font-extrabold
                leading-[1.2] text-[#F76517]"
              >
                {{ it.value }}
              </b>
            </div>
          </div>

          <i
            v-if="idx !== (card.itinerary || []).length - 1"
            class="h-[6px] w-[6px]
            shrink-0 rounded-full bg-[#D9D9D9]"
          />
        </template>
      </div>

      <!-- buttons -->
      <div class="mt-[22px] grid grid-cols-2 gap-[14px]">
        <button
          class="h-[46px] rounded-full
          border border-[#E99A00]
          bg-[#E99A00]
          text-[13px] font-bold text-white"
        >
          Contact Curator
        </button>

        <button
          class="h-[46px] rounded-full
          border border-[#E99A00]
          bg-white text-[13px]
          font-bold text-[#E99A00]"
        >
          Compare +
        </button>
      </div>
    </div>
  </article>
</template>