<script setup>
const categories = [
  { id: 'weekend', label: 'Weekend Getaway', icon: '🌴' },
  { id: 'backpacking', label: 'Backpacking', icon: '🎒' },
  { id: 'trekking', label: 'Trekking & Hiking', icon: '🥾' },
  { id: '2wheel', label: '2-Wheel Expedition', icon: '🏍️' },
  { id: '4wheel', label: '4-Wheel Expedition', icon: '🚙' },
  { id: 'road', label: 'Road Trip', icon: '🛣️' },
]

const selectedCategory = ref('trekking')
const search = ref('')

const baseCards = [
  {
    id: 'kerala',
    duration: '7D/6N',
    price: { variant: 'green', labelTop: 'Starting From', value: 'INR 1,299' },
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    badges: ['Verified Business', 'Customization Available'],
    metaTags: ['Premium', 'Trekking & Hiking'],
    rating: '4.5',
    title: 'Kerala Backwater Escape',
    brand: 'Roamora',
    brandLogo: '/images/logo.png',
    location: 'North-central, France',
    tags: ['Ladakh', 'Rishikesh'],
    itinerary: [
      { day: 'Day 1', label: 'Heritage', value: 'Jaipur' },
      { day: '+8', label: 'Exploring', value: 'Places' },
      { day: 'Day 8', label: 'Mountains of', value: 'Mount Abu' },
    ],
    category: 'trekking',
  },
  {
    id: 'rajasthan',
    duration: '7D/6N',
    price: { variant: 'blue', old: 'INR 4,999', value: 'INR 1,999' },
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    badges: ['Verified Business', 'Customization Available'],
    metaTags: ['Regular', 'Trekking & Hiking'],
    rating: '4.5',
    title: 'Rajasthan Heritage Journey',
    brand: 'Tripverse',
    brandLogo: '/images/logo.png',
    location: 'North-central, France',
    tags: ['Ladakh', 'Rishikesh'],
    itinerary: [
      { day: 'Day 1', label: 'Heritage', value: 'Jaipur' },
      { day: '+8', label: 'Exploring', value: 'Places' },
      { day: 'Day 8', label: 'Mountains of', value: 'Mount Abu' },
    ],
    category: 'trekking',
  },
  {
    id: 'spiti',
    duration: '7D/6N',
    price: { variant: 'gold', labelTop: 'Only', value: 'INR 12,999' },
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    badges: ['Verified Business', 'Customization Available'],
    metaTags: ['Premium', 'Trekking & Hiking'],
    rating: '4.5',
    title: 'Spiti Valley Adventure',
    brand: 'Wanderly',
    brandLogo: '/images/logo.png',
    location: 'North-central, France',
    tags: ['Ladakh', 'Rishikesh'],
    itinerary: [
      { day: 'Day 1', label: 'Heritage', value: 'Jaipur' },
      { day: '+8', label: 'Exploring', value: 'Places' },
      { day: 'Day 8', label: 'Mountains of', value: 'Mount Abu' },
    ],
    category: 'trekking',
  },
]

const cards = computed(() =>
  Array.from({ length: 9 }, (_, i) => {
    const source = baseCards[i % baseCards.length]
    return {
      ...source,
      id: `${source.id}-${i + 1}`,
    }
  }),
)

const filteredCards = computed(() => {
  const s = search.value.trim().toLowerCase()
  return cards.value.filter((c) => {
    const catOk = selectedCategory.value ? c.category === selectedCategory.value : true
    const searchOk = s ? `${c.title} ${c.location} ${c.brand}`.toLowerCase().includes(s) : true
    return catOk && searchOk
  })
})
</script>

<template>
  <section
    class="w-full pt-6 pb-10"
    style="background: linear-gradient(180deg, #FFFFFF 0%, #F2F2F2 71.35%);"
  >
    <div class="mx-auto w-[94%] max-w-[85rem] md:w-[92%]">
      <!-- Header -->
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="font-plein text-[20px] font-bold leading-[1.3] text-trip-orange">Our Package</p>
          <h2 class="mt-1 font-plein text-[34px] font-bold leading-[1.15] text-black">Uncover Perfect Holiday</h2>
        </div>

        <div class="relative w-full md:w-[360px]">
          <input
            v-model="search"
            type="text"
            class="h-[44px] w-full rounded-full border border-black/10 bg-white pl-5 pr-12 font-plein text-[12px] font-medium text-black/70 outline-none focus:border-black/20"
            placeholder="Search by location"
          >
          <button
            type="button"
            class="absolute right-1 top-1 grid h-[36px] w-[36px] place-items-center rounded-full bg-black text-white"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.3-4.3" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Category pills -->
      <div
        class="mt-6 flex items-center gap-[35px] overflow-x-auto rounded-[10px] bg-[#FBFDF6] px-[10px] py-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          v-for="c in categories"
          :key="c.id"
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-full font-plein whitespace-nowrap text-[14px] font-medium leading-none transition-colors"
          :class="
            c.id === selectedCategory
              ? 'bg-trip-gold px-[20px] py-[10px] text-white'
              : 'bg-transparent text-black/55 hover:bg-black/5 px-0 py-0'
          "
          @click="selectedCategory = c.id"
        >
          <span>{{ c.label }}</span>
          <span aria-hidden="true">{{ c.icon }}</span>
          <span
            v-if="c.id === selectedCategory"
            class="ml-1 inline-flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-4 w-4 text-white/90"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>

      <!-- Cards -->
      <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <PackagesPackageCard
          v-for="c in filteredCards"
          :key="c.id"
          :card="c"
        />
      </div>

      <div class="mt-8 flex justify-center">
        <button
          type="button"
          class="inline-flex h-[40px] min-w-[250px] items-center justify-center gap-2 rounded-full border border-[#E99A00] bg-white px-8 font-plein text-[17px] font-semibold leading-none text-black"
        >
          <span>Discover More Journeys</span>
          <span class="text-[#F76517]" aria-hidden="true">↓</span>
        </button>
      </div>
    </div>
  </section>
</template>
