<script setup>
const store = useHomeStore()
const { hero } = storeToRefs(store)

const categoryTrack = ref(null)

const scrollCategories = (direction) => {
  const track = categoryTrack.value
  if (!track) return

  const firstItem = track.querySelector('.bridge-snap-group')
  if (!firstItem) return

  const gap = Number.parseFloat(getComputedStyle(track).gap) || 16
  const step = firstItem.offsetWidth + gap
  const maxScroll = track.scrollWidth - track.clientWidth

  const nextLeft =
    direction === 'next'
      ? Math.min(track.scrollLeft + step, maxScroll)
      : Math.max(track.scrollLeft - step, 0)

  track.scrollTo({
    left: nextLeft,
    behavior: 'smooth',
  })
}

const visibleCategoryCount = computed(
  () => hero.value.categories.filter((category) => category.image).length,
)

const heroBackgroundStyle = computed(() => store.heroBackgroundStyle)
</script>

<template>
  <section class="hero-section" aria-label="Hero">
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      :style="heroBackgroundStyle"
      role="img"
      aria-label="Hero background"
    />

    <div class="absolute inset-0 z-[1] bg-black/40" />

    <div class="hero-copy">
      <div class="hero-copy-inner">
        <h1 class="hero-heading font-plein">
          Your <span>Next</span> Group <span>Trip</span> Starts Here!
        </h1>
        <p class="subtitle-text font-plein">
          {{ hero.subtitle }}
        </p>
      </div>
    </div>

    <div class="hero-desktop">
      <div class="hero-form-shell">
        <div class="bridge-row">
          <button
            type="button"
            class="category-arrow"
            aria-label="Previous categories"
            @click="scrollCategories('prev')"
          >
            <UiAppIcon name="chevron-left" icon-class="h-5 w-5" />
          </button>

          <div
            ref="categoryTrack"
            class="bridge-track"
            :style="{ '--category-count': visibleCategoryCount }"
          >
            <div
              v-for="category in hero.categories"
              :key="category.id"
              class="bridge-snap-group"
            >
              <img
                v-if="category.image"
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
            <UiAppIcon name="chevron-right" icon-class="h-5 w-5" />
          </button>
        </div>

        <div class="hero-form-card">
          <div class="hero-form-filters">
            <div class="hero-scope-group">
              <label
                v-for="option in hero.search.scopeOptions"
                :key="option.id"
                class="hero-scope-option"
              >
                <span
                  class="hero-scope-radio"
                  :class="option.id === hero.search.selectedScope ? 'is-checked' : ''"
                >
                  <span
                    v-if="option.id === hero.search.selectedScope"
                    class="hero-scope-radio-dot"
                  />
                </span>
                <span
                  class="switch-label"
                  :class="option.id === hero.search.selectedScope ? 'active-switch-label' : ''"
                >
                  {{ option.label }}
                </span>
              </label>
            </div>

            <div class="audience-toggle-group">
              <button
                v-for="option in hero.search.audienceOptions"
                :key="option.id"
                type="button"
                class="audience-toggle"
                :class="option.id === hero.search.selectedAudience ? 'is-active' : ''"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="search-fields-grid">
            <button type="button" class="search-swap-btn" aria-label="Swap locations">
              <UiAppIcon name="swap" icon-class="h-5 w-5" />
            </button>

            <div
              v-for="field in hero.search.desktopFields"
              :key="field.id"
              class="search-field"
            >
              <span class="search-label">{{ field.label }}</span>

              <div class="search-field-body">
                <UiAppIcon
                  v-if="field.icon"
                  :name="field.icon"
                  icon-class="search-field-icon mt-1 h-5 w-5 text-[#F4B223]"
                />

                <div>
                  <p class="search-value font-plein">
                    {{ field.value }}
                  </p>
                  <p
                    v-if="field.subValue"
                    class="search-sub-value"
                  >
                    {{ field.subValue }}
                  </p>
                </div>

                <UiAppIcon
                  v-if="field.hasChevron"
                  name="chevron-down"
                  icon-class="h-4 w-4 text-[#9CA3AF]"
                />
              </div>
            </div>
          </div>

          <div class="hero-trip-tiers">
            <button
              v-for="tier in hero.search.tripTiers"
              :key="tier.id"
              type="button"
              class="hero-trip-tier"
              :class="tier.id === hero.search.selectedTier ? 'is-active' : ''"
            >
              <span class="trip-card-title">{{ tier.title }}</span>
              <span class="trip-card-description">{{ tier.description }}</span>
            </button>
          </div>

          <div class="search-cta-wrap">
            <NuxtLink
              :to="hero.search.searchButton.href"
              class="search-cta"
            >
              <span class="search-btn-text">{{ hero.search.searchButton.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
