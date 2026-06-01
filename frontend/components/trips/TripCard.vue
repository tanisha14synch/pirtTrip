<script setup>
defineProps({
  trip: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="trip-card">
    <div class="trip-card__media">
      <img
        :src="trip.image"
        :alt="trip.title"
        class="trip-card__img"
        loading="lazy"
        draggable="false"
      >

      <div class="trip-card__shade" />

      <div class="trip-card__pill trip-card__pill--left">
        {{ trip.duration }}
      </div>

      <div class="trip-card__pill trip-card__pill--right">
        <strong>{{ trip.discountLabel }}</strong>
        <span>{{ trip.discountSuffix }}</span>
      </div>
    </div>

    <div class="trip-card__panel">
      <div class="trip-card__badgeRow">
        <span
          v-for="b in (trip.badges || [])"
          :key="b.id"
          class="trip-card__badge"
        >
          <span
            class="trip-card__tick"
            :class="{ 'is-verified': b.label?.toLowerCase().includes('verified') }"
            aria-hidden="true"
          >
            ✓
          </span>
          {{ b.label }}
        </span>
      </div>

      <div class="trip-card__titleRow">
        <h3 class="trip-card__title">
          {{ trip.title }}
        </h3>

        <div class="trip-card__brand">
          <img
            v-if="trip.logo"
            :src="trip.logo"
            alt=""
            class="trip-card__brandImg"
          >
          <span>DriftTrip</span>
        </div>
      </div>

      <div class="trip-card__metaRow">
        <p class="trip-card__meta">
          <svg class="trip-card__metaIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          {{ trip.region }}
        </p>

        <div class="trip-card__tags">
          <span
            v-for="tag in (trip.tags || [])"
            :key="tag"
            class="trip-card__tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="trip-card__stats">
        <template
          v-for="(s, i) in (trip.stats || [])"
          :key="`${s.k}-${s.v}-${i}`"
        >
          <div class="trip-card__stat">
            <div class="trip-card__statLine">
              <span class="trip-card__statKey">{{ s.k }}</span>
              <span class="trip-card__statVal">{{ s.v }}</span>
            </div>
            <span class="trip-card__statLabel">{{ s.label }}</span>
          </div>
          <span
            v-if="i !== (trip.stats || []).length - 1"
            class="trip-card__dot"
            aria-hidden="true"
          />
        </template>
      </div>

      <div class="trip-card__actions">
        <button type="button" class="trip-card__btn trip-card__btn--primary">
          {{ trip.ctas?.primary || 'Contact Curator' }}
        </button>
        <button type="button" class="trip-card__btn trip-card__btn--ghost">
          {{ trip.ctas?.secondary || 'Compare +' }}
        </button>
      </div>
    </div>
  </article>
</template>
<style scoped>
.trip-card {
  --card-gold: #e2980b;
  position: relative;
  width: 100%;
  aspect-ratio: 332 / 512;
  min-height: 28rem;
  border-radius: 1.125rem;
  overflow: hidden;
  background: #1a1a1a;
  color: #fff;
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.12);
}

.trip-card__media {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.trip-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-card__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0) 14%,
    rgba(0, 0, 0, 0.04) 45%,
    rgba(0, 0, 0, 0.55) 72%,
    rgba(0, 0, 0, 0.95) 100%
  );
  pointer-events: none;
}

/* Corner pills — image shows through behind them */
.trip-card__pill {
  position: absolute;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Plein, sans-serif;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
}

.trip-card__pill--left {
  left: 0;
  min-width: 4.4375rem;
  height: 2.875rem;
  padding: 0 0.875rem;
  background: #000000;
  font-size: 0.875rem;
  border-radius: 0.75rem 1.5rem 0.75rem 0.75rem;
  box-shadow:
    0.25rem 0 0 0 #ffffff,
    0 0.25rem 0 0 #ffffff;
}

.trip-card__pill--right {
  right: 0;
  min-width: 5.5rem;
  height: 2.875rem;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.4rem 0.65rem;
  background: var(--card-gold);
  border-radius: 1.5rem 0.75rem 0.75rem 0.75rem;
  box-shadow:
    -0.25rem 0 0 0 #ffffff,
    0 0.25rem 0 0 #ffffff;
}

.trip-card__pill--right strong {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.05;
}

.trip-card__pill--right span {
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1;
  opacity: 0.95;
}

/* Content panel */
.trip-card__panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  padding: 0 0.875rem 0.875rem;
  min-height: 52%;
}

.trip-card__badgeRow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.trip-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: 62.4375rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
  font-family: Plein, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  color: #ffffff;
  white-space: nowrap;
}

.trip-card__tick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #39b54a;
  line-height: 1;
}

.trip-card__titleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.trip-card__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-family: Plein, sans-serif;
  font-size: clamp(1.05rem, 1.3vw, 1.325rem);
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff;
}

/* DriftTrip — compact pill; image visible behind via glass */
.trip-card__brand {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 1.625rem;
  padding: 0 0.5rem 0 0.3rem;
  margin-right: -0.875rem;
  border-radius: 62.4375rem 0 0 62.4375rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: #111827;
  font-family: Poppins, Plein, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1;
}

.trip-card__brandImg {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  object-fit: cover;
}

.trip-card__metaRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.trip-card__meta {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  max-width: 48%;
  margin: 0;
  font-family: Poppins, Plein, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
  color: #ffffff;
}

.trip-card__metaIcon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin-top: 0.15rem;
}

.trip-card__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
}

.trip-card__tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 62.4375rem;
  background: rgba(156, 121, 48, 0.88);
  font-family: Plein, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  color: #ffffff;
}

.trip-card__stats {
  margin-top: auto;
  padding-top: 1.25rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.35rem;
}

.trip-card__stat {
  flex: 1;
  min-width: 0;
}

.trip-card__statLine {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.trip-card__statKey {
  font-family: Plein, sans-serif;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1.3;
  color: #ffffff;
}

.trip-card__statVal {
  font-family: Plein, sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.3;
  color: #ffffff;
}

.trip-card__statLabel {
  display: block;
  margin-top: 0.15rem;
  font-family: Plein, sans-serif;
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.7);
}

.trip-card__dot {
  flex-shrink: 0;
  width: 0.3125rem;
  height: 0.3125rem;
  margin-top: 0.35rem;
  border-radius: 50%;
  background: #ffffff;
}

.trip-card__actions {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.trip-card__btn {
  height: 2.375rem;
  border-radius: 62.4375rem;
  font-family: Plein, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
  transition: filter 0.2s ease;
}

.trip-card__btn--primary {
  border: none;
  background: var(--card-gold);
  color: #ffffff;
}

.trip-card__btn--ghost {
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: transparent;
  color: #ffffff;
}

.trip-card__btn:hover {
  filter: brightness(1.06);
}

@media (max-width: 48rem) {
  .trip-card {
    min-height: 26rem;
  }
}
</style>

