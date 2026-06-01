<script setup>
const store = useHomeStore()
const { hero } = storeToRefs(store)

const state = computed(() => hero.value.upcomingTrips)

const selectedTab = computed({
  get: () => state.value.selectedTab,
  set: (v) => {
    hero.value.upcomingTrips.selectedTab = v
  },
})

const selectedMonth = computed({
  get: () => state.value.selectedMonth,
  set: (v) => {
    hero.value.upcomingTrips.selectedMonth = v
  },
})

const track = ref(null)

const filteredTrips = computed(() => {
  const trips = state.value.trips || []

  return trips.filter((t) => {
    const tabOk = selectedTab.value
      ? t.scope === selectedTab.value
      : true

    const monthOk =
      selectedMonth.value === 'all'
        ? true
        : t.month === selectedMonth.value

    return tabOk && monthOk
  })
})

const scrollCards = (dir) => {
  const el = track.value

  if (!el) return

  const card = el.querySelector('.upcoming-card')

  if (!card) return

  const gap =
    Number.parseFloat(getComputedStyle(el).gap) || 40

  const step = card.offsetWidth + gap

  const maxScroll = el.scrollWidth - el.clientWidth

  const next =
    dir === 'next'
      ? Math.min(el.scrollLeft + step, maxScroll)
      : Math.max(el.scrollLeft - step, 0)

  el.scrollTo({
    left: next,
    behavior: 'smooth',
  })
}
</script>

<template>
  <section class="upcoming-wrap">
    <div class="upcoming-inner">
      <div class="upcoming-head">
        <div class="upcoming-left">
          <p class="upcoming-eyebrow">
            {{ state.eyebrow }}
          </p>

          <h2 class="upcoming-title">
            {{ state.title }}
          </h2>
        </div>

        <div class="upcoming-tabs" role="tablist" aria-label="Trip scope">
          <button
            v-for="t in state.tabs"
            :key="t.id"
            type="button"
            class="upcoming-tab"
            :class="t.id === selectedTab ? 'is-active' : ''"
            @click="selectedTab = t.id"
          >
            {{ t.label }}
          </button>
        </div>

        <div class="upcoming-nav">
          <button
            type="button"
            class="upcoming-navBtn"
            aria-label="Previous cards"
            @click="scrollCards('prev')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            class="upcoming-navBtn"
            aria-label="Next cards"
            @click="scrollCards('next')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="upcoming-months" role="list">
        <button
          v-for="m in state.months"
          :key="m.id"
          type="button"
          class="upcoming-month"
          :class="m.id === selectedMonth ? 'is-active' : ''"
          @click="selectedMonth = m.id"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="upcoming-carousel">
        <div ref="track" class="upcoming-track">
          <div
            v-for="(trip, index) in filteredTrips"
            :key="trip.id"
            class="upcoming-card"
            :class="{ 'is-center': index === 1 }"
          >
            <TripsTripCard :trip="trip" />
          </div>
        </div>
      </div>

      <div class="upcoming-more">
        <button type="button" class="upcoming-moreBtn">
          More Trips Coming !
          <span class="upcoming-moreArrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
<style scoped>
/* Figma Frame 2147224614 — tokens */
.upcoming-wrap {
  --up-orange: #f76517;
  --up-gold: #e2980b;
  --up-cream-top: #fff6e5;
  --up-text: #000000;
  --up-text-muted: rgba(0, 0, 0, 0.5);
  --up-text-tab: rgba(0, 0, 0, 0.75);
  --up-card-w: clamp(17rem, 23vw, 20.75rem);
  --up-card-gap: clamp(1.5rem, 2.5vw, 2.5rem);

  width: 100%;
  background: linear-gradient(180deg, var(--up-cream-top) 0%, #ffffff 100%);
  padding: clamp(2rem, 4vw, 2.6875rem) 0 clamp(2rem, 3vw, 2.125rem);
  overflow: hidden;
}

.upcoming-inner {
  width: min(92%, 85rem);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: clamp(1.75rem, 3vw, 3rem);
}

/* Header — Figma Frame 156 */
.upcoming-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'title tabs'
    'nav nav';
  align-items: center;
  column-gap: clamp(1rem, 3vw, 2rem);
  row-gap: 1rem;
}

.upcoming-left {
  grid-area: title;
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  min-width: 0;
  max-width: none;
}

.upcoming-eyebrow {
  font-family: Plein, sans-serif;
  font-size: clamp(1rem, 1.25vw, 1.25rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--up-orange);
}

.upcoming-title {
  font-family: Plein, sans-serif;
  font-size: clamp(1.5rem, 2vw, 1.875rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--up-text);
  white-space: nowrap;
}

/* Tabs — Figma 337×56: space-between, active pill 160px */
.upcoming-tabs {
  grid-area: tabs;
  justify-self: end;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: min(100%, 21.0625rem);
  min-width: 16.5rem;
  height: 3.5rem;
  padding: 0.625rem 0.625rem 0.625rem 1rem;
  border-radius: 1.875rem;
  background: #ffffff;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.upcoming-tab {
  flex: 0 0 auto;
  height: 2.25rem;
  padding: 0 1.25rem;
  border: none;
  border-radius: 62.4375rem;
  background: transparent;
  font-family: Plein, sans-serif;
  font-size: clamp(0.95rem, 1.1vw, 1.25rem);
  font-weight: 700;
  line-height: 1.4;
  color: var(--up-text-tab);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.upcoming-tab.is-active {
  flex: 0 0 10rem;
  width: 10rem;
  min-width: 10rem;
  padding: 0;
  background: var(--up-gold);
  color: #ffffff;
}

/* Nav — Figma 56px circles, gap 16px */
.upcoming-nav {
  grid-area: nav;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.upcoming-navBtn {
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--up-text);
  background: transparent;
  color: var(--up-text);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upcoming-navBtn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.upcoming-navBtn svg {
  display: block;
  width: 1.125rem;
  height: 1.125rem;
}

/* Months — Figma Frame 175: radius 60px, gap ~35px */
.upcoming-months {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.5rem, 2vw, 2.1875rem);
  width: 100%;
  max-width: 78.3125rem;
  margin-inline: auto;
  min-height: 3.75rem;
  padding: 0.625rem 1.25rem;
  border-radius: 3.75rem;
  background: #ffffff;
  overflow-x: auto;
  scrollbar-width: none;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.05);
}

.upcoming-months::-webkit-scrollbar {
  display: none;
}

.upcoming-month {
  flex: 0 0 auto;
  min-width: 2.5rem;
  padding: 0.5rem 0.85rem;
  border-radius: 62.4375rem;
  font-family: Plein, sans-serif;
  font-size: clamp(0.95rem, 1.1vw, 1.25rem);
  font-weight: 500;
  line-height: 1.4;
  color: var(--up-text-muted);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.upcoming-month.is-active {
  min-width: 3.375rem;
  padding: 0.42rem 0.85rem;
  background: var(--up-text);
  color: #ffffff;
  font-weight: 500;
}

/* Carousel — Figma gap 40px, card 332×512 */
.upcoming-carousel {
  margin-top: clamp(0.25rem, 1vw, 0.5rem);
}

.upcoming-track {
  display: flex;
  align-items: flex-end;
  gap: var(--up-card-gap);
  overflow-x: auto;
  padding: clamp(1rem, 2vw, 1.5rem) clamp(0.5rem, 3vw, 2.5rem) clamp(1.5rem, 2.5vw, 2.5rem);
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.upcoming-track::-webkit-scrollbar {
  display: none;
}

.upcoming-card {
  flex: 0 0 var(--up-card-w);
  scroll-snap-align: center;
  transition: transform 0.35s ease;
}

.upcoming-card.is-center {
  transform: translateY(-1.5rem);
}

/* More button — Figma 278×49, stroke #E2980B */
.upcoming-more {
  display: flex;
  justify-content: center;
  margin-top: clamp(0.25rem, 1vw, 0.5rem);
}

.upcoming-moreBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-width: min(100%, 17.375rem);
  height: 3.0625rem;
  padding: 0 2rem;
  border-radius: 62.4375rem;
  border: 1px solid var(--up-gold);
  background: #ffffff;
  font-family: Plein, sans-serif;
  font-size: clamp(0.9rem, 1vw, 1rem);
  font-weight: 500;
  line-height: 1.4;
  color: var(--up-text);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upcoming-moreBtn:hover {
  background: #fffaf2;
}

.upcoming-moreArrow {
  display: inline-flex;
  color: var(--up-orange);
}

.upcoming-moreArrow svg {
  display: block;
  width: 0.85rem;
  height: 1.2rem;
}

@media (min-width: 64rem) {
  .upcoming-head {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    grid-template-areas: 'title tabs nav';
  }

  .upcoming-tabs {
    justify-self: center;
  }
}

@media (max-width: 64rem) {
  .upcoming-tabs {
    justify-self: end;
    width: min(100%, 21.0625rem);
  }

  .upcoming-nav {
    justify-self: end;
  }

  .upcoming-months {
    justify-content: flex-start;
    gap: 0.75rem;
  }

  .upcoming-card.is-center {
    transform: none;
  }
}

@media (max-width: 40rem) {
  .upcoming-head {
    grid-template-columns: 1fr;
    grid-template-areas:
      'title'
      'tabs'
      'nav';
  }

  .upcoming-tabs {
    justify-self: stretch;
    width: 100%;
    min-width: 0;
  }

  .upcoming-nav {
    justify-self: center;
  }
}

@media (max-width: 48rem) {
  .upcoming-inner {
    width: 94%;
  }

  .upcoming-wrap {
    --up-card-w: clamp(15.5rem, 78vw, 17rem);
  }

  .upcoming-navBtn {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>

