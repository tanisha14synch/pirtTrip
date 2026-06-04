<script setup>
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Home 2 — PirtTrip | Explore Group Trips',
  meta: [
    {
      name: 'description',
      content:
        'Search and compare group trips, packages, and deals. Discover your next adventure with PirtTrip.',
    },
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Lato:wght@400&family=Roboto:wght@500&display=swap',
    },
  ],
})

const HERO_BG = '/images/hero/hero-bg.png'

/** Figma hero fills: #D9D9D9 base + 50% black + gold diagonal over image */
const HERO_BG_STYLE = {
  backgroundColor: '#D9D9D9',
  backgroundImage: [
    'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
    'linear-gradient(245.78deg, rgba(255, 171, 11, 0.3) 24.25%, rgba(0, 0, 0, 0.3) 73.29%)',
    `url('${HERO_BG}')`,
  ].join(', '),
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
}

const categories = [
  { id: 'trekking', label: 'Trekking & Hiking', image: '/images/categories/trekking-hiking.png' },
  { id: 'two-wheel', label: '2 Wheel Expedition', image: '/images/categories/two-wheel.png' },
  { id: 'four-wheel', label: '4 Wheel Expedition', image: '/images/categories/four-wheel.png' },
  { id: 'road-trip', label: 'Road Trip', image: '/images/categories/road-trip.png' },
  { id: 'wildlife', label: 'Wildlife', image: '/images/categories/wildlife.png' },
  { id: 'spiritual', label: 'Spiritual', image: '/images/categories/spiritual.png' },
  { id: 'girls-only', label: 'Girls Only', image: '/images/categories/girls-only.png' },
]

const tripTiers = [
  { id: 'regular', title: 'Regular Group Trips', description: 'For budget-friendly & fixed itineraries', active: true },
  { id: 'exclusive', title: 'Exclusive Group Trips', description: 'Limited seat curated seats designed for selective.', active: false },
  { id: 'luxury', title: 'Luxury Group Trips', description: 'Premium High comfort experience.', active: false },
]

const deals = [
  { id: 'goa', title: 'Goa Beach Escape', meta: '4D/3N — ₹7,999', badge: '45% off' },
  { id: 'manali', title: 'Manali Adventure Trip', meta: '5D/4N — ₹9,499', badge: '60% off' },
  { id: 'ladakh', title: 'Ladakh Expedition', meta: '7D/6N — ₹18,999', badge: '30% off' },
  { id: 'kerala', title: 'Kerala Backwaters', meta: '5D/4N — ₹11,499', badge: '25% off' },
]

const categoryTrack = ref(null)
const dealsTrack = ref(null)

const scrollCategories = (direction) => {
  const track = categoryTrack.value
  if (!track) return

  const firstItem = track.querySelector('.bridge-snap-group')
  if (!firstItem) return

  const gap = Number.parseFloat(getComputedStyle(track).gap) || 20
  const step = firstItem.offsetWidth + gap
  const maxScroll = track.scrollWidth - track.clientWidth
  const nextLeft =
    direction === 'next'
      ? Math.min(track.scrollLeft + step, maxScroll)
      : Math.max(track.scrollLeft - step, 0)

  track.scrollTo({ left: nextLeft, behavior: 'smooth' })
}

const scrollDeals = (direction) => {
  const track = dealsTrack.value
  if (!track) return

  const firstCard = track.querySelector('.deal-card')
  if (!firstCard) return

  const gap = Number.parseFloat(getComputedStyle(track).gap) || 12
  const step = firstCard.offsetWidth + gap
  const maxScroll = track.scrollWidth - track.clientWidth
  if (maxScroll <= 0) return

  const nextLeft =
    direction === 'next'
      ? Math.min(track.scrollLeft + step, maxScroll)
      : Math.max(track.scrollLeft - step, 0)

  track.scrollTo({ left: nextLeft, behavior: 'smooth' })
}
</script>

<template>
  <main class="overflow-x-hidden">
    <section
      class="hero-section"
      aria-label="Hero"
    >
      <!-- Background -->
      <div
        class="pointer-events-none absolute inset-0 z-0"
        :style="HERO_BG_STYLE"
        role="img"
        aria-label="Hero background"
      />

      <!-- Title -->
      <div class="hero-copy">
        <div class="hero-copy-inner">
          <h1 class="hero-heading font-plein">
            Your <span>Next</span> Group <span>Trip</span> Starts Here!
          </h1>
          <p class="subtitle-text font-plein">
            Discover | Compare | Decide | Travel
          </p>
        </div>
      </div>

      <!-- Desktop hero block -->
      <div class="hero-desktop">
        <div class="hero-form-shell">
          <!-- Category badges + nav arrows -->
          <div class="bridge-row">
            <button
              type="button"
              class="category-arrow"
              aria-label="Previous categories"
              @click="scrollCategories('prev')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div
              ref="categoryTrack"
              class="bridge-track"
              :style="{ '--category-count': categories.length }"
            >
              <div
                v-for="category in categories"
                :key="category.id"
                class="bridge-snap-group"
              >
                <img
                  :src="category.image"
                  :alt="category.label"
                  class="bridge-badge"
                  loading="lazy"
                  draggable="false"
                >
              </div>
            </div>

            <button
              type="button"
              class="category-arrow"
              aria-label="Next categories"
              @click="scrollCategories('next')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- White search card -->
          <div class="hero-form-card">
            <div class="hero-form-filters">
              <div class="hero-scope-group">
                <label class="hero-scope-option">
                  <span class="hero-scope-radio is-checked">
                    <span class="hero-scope-radio-dot" />
                  </span>
                  <span class="switch-label active-switch-label">Domestic</span>
                </label>
                <label class="hero-scope-option">
                  <span class="hero-scope-radio" />
                  <span class="switch-label">International</span>
                </label>
              </div>

              <div class="audience-toggle-group">
                <button type="button" class="audience-toggle is-active">
                  All
                </button>
                <button type="button" class="audience-toggle">
                  Women/Girls Only
                </button>
              </div>
            </div>

            <div class="search-fields-grid">
              <button
                type="button"
                class="search-swap-btn"
                aria-label="Swap locations"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>

              <div class="search-field">
                <span class="search-label">From</span>
                <div class="search-field-body">
                  <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path stroke-linecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  <div>
                    <p class="search-value font-plein">Delhi</p>
                    <p class="search-sub-value">Current Location</p>
                  </div>
                </div>
              </div>

              <div class="search-field">
                <span class="search-label">To</span>
                <p class="search-value font-plein">Odisha</p>
                <p class="search-sub-value">Mahendra Giri Hills</p>
              </div>

              <div class="search-field">
                <div class="search-field-head">
                  <span class="search-label">Month</span>
                  <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p class="search-value font-plein">May, 26</p>
                <p class="search-sub-value">Thursday</p>
              </div>

              <div class="search-field">
                <div class="search-field-head">
                  <span class="search-label">Trip Type</span>
                  <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p class="search-value font-plein">Default</p>
              </div>

              <div class="search-field">
                <div class="search-field-head">
                  <span class="search-label">No. of Travellers</span>
                  <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p class="search-value font-plein">1 Traveller</p>
              </div>
            </div>

            <div class="hero-trip-tiers">
              <div
                v-for="tier in tripTiers"
                :key="tier.id"
                class="hero-trip-tier"
                :class="tier.active ? 'is-active' : ''"
              >
                <span class="trip-card-title">{{ tier.title }}</span>
                <span class="trip-card-description">{{ tier.description }}</span>
              </div>
            </div>

            <div class="search-cta-wrap">
              <button type="button" class="search-cta">
                <span class="search-btn-text">Search</span>
              </button>
            </div>
          </div>
        </div>

        <div class="hero-deals-bar">
          <span class="hero-deals-label">
            Deals Today
          </span>

          <button
            type="button"
            class="deals-arrow"
            aria-label="Previous deals"
            @click="scrollDeals('prev')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div ref="dealsTrack" class="deals-track">
            <a
              v-for="deal in deals"
              :key="deal.id"
              href="#"
              class="deal-card"
            >
              <span class="discount-pill deal-card-badge">{{ deal.badge }}</span>
              <span class="deal-card-blob" aria-hidden="true" />
              <span class="deal-card-title">{{ deal.title }}</span>
              <span class="deal-card-subtitle">{{ deal.meta }}</span>
            </a>
          </div>

          <button
            type="button"
            class="deals-arrow"
            aria-label="Next deals"
            @click="scrollDeals('next')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile -->
      <div class="hero-mobile">
        <div class="hero-mobile-categories hero-scroll-hide">
          <img
            v-for="category in categories"
            :key="`m-${category.id}`"
            :src="category.image"
            :alt="category.label"
            class="hero-mobile-category-img"
          >
        </div>

        <div class="hero-mobile-card">
          <div class="hero-form-filters">
            <div class="hero-scope-group">
              <label class="hero-scope-option">
                <span class="hero-scope-radio is-checked">
                  <span class="hero-scope-radio-dot" />
                </span>
                <span class="switch-label active-switch-label">Domestic</span>
              </label>
              <label class="hero-scope-option">
                <span class="hero-scope-radio" />
                <span class="switch-label">International</span>
              </label>
            </div>
            <div class="audience-toggle-group">
              <button type="button" class="audience-toggle is-active">All</button>
              <button type="button" class="audience-toggle">Women/Girls Only</button>
            </div>
          </div>

          <div class="hero-mobile-fields">
            <div class="hero-mobile-field">
              <p class="search-label">From</p>
              <p class="search-value">Select City</p>
            </div>
            <div class="hero-mobile-field">
              <p class="search-label">To</p>
              <p class="search-value">Select Destination</p>
            </div>
            <div class="hero-mobile-field">
              <p class="search-label">Trip month</p>
              <p class="search-sub-value">Select Month</p>
            </div>
            <div class="hero-mobile-field-grid">
              <div class="hero-mobile-field">
                <p class="search-label">No. of Travelers</p>
                <p class="search-value">1 Adult</p>
              </div>
              <div class="hero-mobile-field">
                <p class="search-label">Trip Type</p>
                <p class="search-value">Economy</p>
              </div>
            </div>
          </div>

          <div class="hero-mobile-tier-chips">
            <span
              v-for="tier in tripTiers"
              :key="`m-${tier.id}`"
              class="hero-mobile-tier-chip"
            >
              {{ tier.title }}
            </span>
          </div>

          <button type="button" class="search-cta search-cta--full">
            <span class="search-btn-text">Search</span>
          </button>
        </div>

        <div class="hero-mobile-deals">
          <p class="subtitle-text hero-mobile-deals-title">Deals Today</p>
          <div class="deals-track-mobile hero-scroll-hide">
            <a
              v-for="deal in deals"
              :key="`md-${deal.id}`"
              href="#"
              class="deal-card"
            >
              <span class="discount-pill deal-card-badge">{{ deal.badge }}</span>
              <span class="deal-card-blob" aria-hidden="true" />
              <span class="deal-card-title">{{ deal.title }}</span>
              <span class="deal-card-subtitle">{{ deal.meta }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <TripsUpcomingTripsSection />

    <PackagesOurPackageSection />

    <HomeAboutUsSection />

    <HomeClientReviewsSection />

    <HomeOurPartnersSection />

    <HomeSocialFeedSection />
  </main>

  <HomeFooterSection />
</template>

