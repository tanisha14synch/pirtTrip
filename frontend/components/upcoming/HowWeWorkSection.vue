<script setup>
import { PARTNER_WORKFLOW_STEPS } from '~/constants/partner-workflow-steps'

const stepKeys = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']

const steps = Object.fromEntries(
  stepKeys.map((key, index) => [key, PARTNER_WORKFLOW_STEPS[index]]),
)

const stepsList = PARTNER_WORKFLOW_STEPS

/** Positions aligned to map-bg.svg path (1300×697) */
const STEP_BG_SRC = '/images/how-we-work/map-bg.svg'
const STEP_BG_SRC_2X = '/images/how-we-work/map-bg.svg'
const STEP_BG_WIDTH = 1300
const STEP_BG_HEIGHT = 697
/** Map background height (viewport) */
const STEP_BG_VIEW_HEIGHT = '80svh'
/** White space below the map — steps can extend here without clipping */
const STAGE_BOTTOM_PADDING = 'clamp(7rem, 14vh, 11rem)'
const STEP_BG_ASPECT = STEP_BG_WIDTH / STEP_BG_HEIGHT
const desktopStepPlacements = [
  { key: 's1', class: 'absolute left-[3.5%] top-[10%] z-[2]' },
  { key: 's2', class: 'absolute left-[41.2%] top-[15%] z-[2]' },
  { key: 's3', class: 'absolute right-[5.5%] top-[5%] z-[2]' },
  { key: 's4', class: 'absolute right-[20%] top-[38%] z-[2]' },
  { key: 's5', class: 'absolute left-[30.2%] top-[46%] z-[2]' },
  { key: 's6', class: 'absolute left-[5%] top-[56%] z-[2]' },
  { key: 's7', class: 'absolute left-[39%] top-[80%] z-[2]' },
  { key: 's8', class: 'absolute right-[7%] top-[76%] z-[2]' },
]

const BG_REVEAL_MS = 700
const STEP_STAGGER_MS = 280

const stageRef = ref(null)
const hasStarted = ref(false)
const showBg = ref(false)
const visibleStepCount = ref(0)

let stepTimers = []
let sectionObserver = null

function clearStepTimers() {
  stepTimers.forEach((id) => clearTimeout(id))
  stepTimers = []
}

function startSequence() {
  if (hasStarted.value) return
  hasStarted.value = true
  clearStepTimers()

  showBg.value = true

  const isDesktop = window.matchMedia('(min-width: 1024px)').matches
  const stepsStartDelay = isDesktop ? BG_REVEAL_MS : 200

  desktopStepPlacements.forEach((_, index) => {
    const timer = setTimeout(() => {
      visibleStepCount.value = index + 1
    }, stepsStartDelay + index * STEP_STAGGER_MS)
    stepTimers.push(timer)
  })
}

function revealAllImmediately() {
  hasStarted.value = true
  clearStepTimers()
  showBg.value = true
  visibleStepCount.value = desktopStepPlacements.length
}

function isStepVisible(index) {
  return visibleStepCount.value > index
}

onMounted(() => {
  if (!stageRef.value) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    revealAllImmediately()
    return
  }

  if (window.matchMedia('(min-width: 1024px)').matches) {
    showBg.value = true
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        startSequence()
        sectionObserver?.disconnect()
        sectionObserver = null
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -60px 0px' },
  )

  sectionObserver.observe(stageRef.value)
})

onUnmounted(() => {
  sectionObserver?.disconnect()
  clearStepTimers()
})
</script>

<template>
  <section
    id="how-we-work"
    class="bg-white py-8 lg:py-0"
    aria-labelledby="how-we-work-heading"
  >
    <div class="mx-auto w-[94%] max-w-[820px] lg:max-w-none lg:w-full">
      <header class="text-center lg:px-6 lg:pt-10 lg:pb-4">
        <p class="font-plein text-[24px] font-bold leading-[130%] tracking-[0] text-[#F76517] md:text-[26px]">
          How We Work?
        </p>

        <h2
          id="how-we-work-heading"
          class="mt-2 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-black md:text-[30px]"
        >
          Simple. Transparent. Business Friendly.
        </h2>
      </header>

      <div
        ref="stageRef"
        class="relative mx-auto mt-6 w-full lg:mt-0"
        :style="{ '--stage-bottom-pad': STAGE_BOTTOM_PADDING }"
      >
      <!-- Desktop — map exactly 80vh; padding below has no image; content not clipped -->
      <div
        class="relative hidden w-full bg-white lg:block lg:pb-[var(--stage-bottom-pad)]"
      >
        <div
          class="relative flex min-h-[512px] w-full items-center justify-center overflow-visible"
          :style="{ height: STEP_BG_VIEW_HEIGHT }"
        >
        <div
          class="how-we-work-canvas relative h-full shrink-0"
          :style="{
            aspectRatio: STEP_BG_ASPECT,
            width: `min(100%, calc(${STEP_BG_VIEW_HEIGHT} * ${STEP_BG_WIDTH} / ${STEP_BG_HEIGHT}))`,
          }"
        >
        <img
          :src="STEP_BG_SRC"
          :srcset="`${STEP_BG_SRC} ${STEP_BG_WIDTH}w, ${STEP_BG_SRC_2X} ${STEP_BG_WIDTH * 2}w`"
          :sizes="`min(100vw, calc(${STEP_BG_VIEW_HEIGHT} * ${STEP_BG_WIDTH} / ${STEP_BG_HEIGHT}))`"
          :width="STEP_BG_WIDTH"
          :height="STEP_BG_HEIGHT"
          alt=""
          class="how-we-work-bg pointer-events-none absolute inset-0 z-[1] h-full w-full object-contain object-center"
          :class="showBg ? 'how-we-work-bg--visible' : ''"
          fetchpriority="high"
          draggable="false"
          aria-hidden="true"
        >

        <!-- Decorations -->
        <img
          src="/images/how-we-work/deco-balloon-546ed1.png"
          alt=""
          class="how-we-work-deco pointer-events-none absolute left-0 top-[38%] z-[3] h-auto w-[52px] opacity-90"
          :class="showBg ? 'how-we-work-deco--visible' : ''"
          aria-hidden="true"
          loading="lazy"
          draggable="false"
        >

        <img
          src="/images/how-we-work/deco-cloud-4c18b7.png"
          alt=""
          class="how-we-work-deco pointer-events-none absolute right-0 top-[56%] z-[3] h-auto w-[48px] opacity-90"
          :class="showBg ? 'how-we-work-deco--visible' : ''"
          style="transition-delay: 120ms"
          aria-hidden="true"
          loading="lazy"
          draggable="false"
        >

        <div
          v-for="(placement, index) in desktopStepPlacements"
          :key="placement.key"
          :class="[
            placement.class,
            'how-we-work-step',
            isStepVisible(index) ? 'how-we-work-step--visible' : '',
          ]"
        >
          <UpcomingHowWeWorkStep
            v-bind="steps[placement.key]"
            variant="flow-compact"
          />
        </div>
        </div>
        </div>
      </div>

      <!-- Mobile -->
      <ol class="mt-8 flex flex-col gap-4 lg:hidden">
        <li
          v-for="(step, index) in stepsList"
          :key="step.number"
          :class="[
            'how-we-work-step',
            isStepVisible(index) ? 'how-we-work-step--visible' : '',
          ]"
        >
          <UpcomingHowWeWorkStep
            v-bind="step"
            variant="card"
          />
        </li>
      </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-we-work-bg {
  opacity: 0;
  transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}

.how-we-work-bg--visible {
  opacity: 1;
}

.how-we-work-deco {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

.how-we-work-deco--visible {
  opacity: 0.9;
  transform: translateY(0);
}

.how-we-work-step {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.how-we-work-step--visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .how-we-work-bg,
  .how-we-work-deco,
  .how-we-work-step {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
