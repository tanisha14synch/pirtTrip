<script setup>
const steps = {
  s1: {
    number: '01',
    title: 'Step 1',
    description:
      'Travel Partner registers on PirTrip and creates a professional business profile.',
    iconSrc: '/images/how-we-work/step-01-illustration.png',
    iconAlt: 'Partner registers on PirTrip',
  },
  s2: {
    number: '02',
    title: 'Step 2',
    description: 'Partner posts upcoming trips, itineraries & travel packages.',
    iconSrc: '/images/how-we-work/step-02-illustration.png',
    iconAlt: 'Partner posts trips',
  },
  s3: {
    number: '03',
    title: 'Step 3',
    description:
      'Travelers explore destinations, compare options, and discover suitable travel partners.',
    iconSrc: '/images/how-we-work/step-03-illustration.png',
    iconAlt: 'Travelers explore destinations',
  },
  s4: {
    number: '04',
    title: 'Step 4',
    description:
      'Interested travelers send inquiries or connect requests for specific trips or requirements.',
    iconSrc: '/images/how-we-work/step-04-illustration.png',
    iconAlt: 'Travelers send inquiries',
  },
  s5: {
    number: '05',
    title: 'Step 5',
    description:
      'Verified customer leads are matched and shared directly with the relevant travel partner only.',
    iconSrc: '/images/how-we-work/step-05-illustration.png',
    iconAlt: 'Verified leads matched',
  },
  s6: {
    number: '06',
    title: 'Step 6',
    description:
      'Travel Partner contacts the traveler directly to discuss trip planning, pricing and customization.',
    iconSrc: '/images/how-we-work/step-06-illustration.png',
    iconAlt: 'Partner contacts traveler',
  },
  s7: {
    number: '07',
    title: 'Step 7',
    description:
      'Traveler and Partner finalize bookings and trip details independently without platform interference.',
    iconSrc: '/images/how-we-work/step-07-illustration.png',
    iconAlt: 'Finalize bookings independently',
  },
  s8: {
    number: '08',
    title: 'Step 8',
    description:
      'Partner grows business visibility, receives more traveler connects and builds long-term customer relationships through the platform.',
    iconSrc: '/images/how-we-work/step-08-illustration.png',
    iconAlt: 'Grow visibility and relationships',
  },
}

const stepsList = Object.values(steps)

/** Positions aligned to step_bg.svg pin valleys (1250×1069) — content sits under each curve */
const desktopStepPlacements = [
  { key: 's1', class: 'absolute left-[2%] top-[8%] z-[2]' },
  { key: 's2', class: 'absolute left-[38%] top-[20%] z-[2]' },
  { key: 's3', class: 'absolute right-[5.5%] top-[10%] z-[2]' },
  { key: 's4', class: 'absolute right-[16%] top-[45%] z-[2]' },
  { key: 's5', class: 'absolute left-[21%] top-[44%] z-[2]' },
  { key: 's6', class: 'absolute left-[2.5%] top-[68%] z-[2]' },
  { key: 's7', class: 'absolute left-[39.5%] top-[75%] z-[2]' },
  { key: 's8', class: 'absolute right-[6.5%] top-[78%] z-[2]' },
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
    class="bg-white py-8 lg:py-10"
    aria-labelledby="how-we-work-heading"
  >
    <div class="mx-auto w-[94%] max-w-[820px]">
      <header class="text-center">
        <p class="font-plein text-[16px] font-bold leading-[130%] tracking-[0] text-[#F76517]">
          How We Work?
        </p>

        <h2
          id="how-we-work-heading"
          class="mt-2 font-plein text-[20px] font-bold leading-[130%] tracking-[0] text-black"
        >
          Simple. Transparent. Business Friendly.
        </h2>
      </header>

      <div
        ref="stageRef"
        class="relative mx-auto mt-6 w-full"
      >
      <!-- Desktop — width locked to step_bg.svg (1250×1069) -->
      <div
        class="relative hidden w-full lg:block"
        style="aspect-ratio: 1250 / 1069"
      >
        <!-- Background path -->
        <img
          src="/images/how-we-work/step_bg.svg"
          alt=""
          class="how-we-work-bg pointer-events-none absolute inset-0 z-[1] h-full w-full object-fill"
          :class="showBg ? 'how-we-work-bg--visible' : ''"
          aria-hidden="true"
          loading="lazy"
          draggable="false"
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
  transform: scale(0.97);
  transition:
    opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}

.how-we-work-bg--visible {
  opacity: 1;
  transform: scale(1);
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
