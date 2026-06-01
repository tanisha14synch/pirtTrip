<script setup>
const metrics = [
  { id: 'travellers', value: '1200+', label: 'Travellers' },
  { id: 'trips', value: '5K+', label: 'Trips Marked' },
  { id: 'customers', value: '99%', label: 'Happy Customers' },
]

const reviews = [
  {
    id: 'annette',
    name: 'Annette Black',
    meta: 'Member since 2020',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    rating: '4.45',
    time: '1 weeks ago',
    text:
      'This was honestly one of the smoothest and most enjoyable trips I’ve ever been on. The itinerary was planned really well, the accommodations were great, and the trip leaders were supportive and friendly.',
  },
  {
    id: 'esther',
    name: 'Esther Howard',
    meta: 'Member since 2021',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    rating: '4.62',
    time: '2 days ago',
    text:
      'Had an amazing experience traveling. Everything was well-organized, from the stay to activities and coordination.',
  },
]
</script>

<template>
  <section class="w-full bg-white py-16">
    <div class="mx-auto w-[92%] max-w-[1280px]">
      <div class="grid grid-cols-1 items-start gap-12 xl:grid-cols-[0.85fr_1.15fr]">
        <!-- Left -->
        <article>
          <p class="font-plein text-[20px] font-bold uppercase leading-[120%] text-[#ff681f]">
            REVIEWS
          </p>

          <h2
            class="mt-3 max-w-none md:whitespace-nowrap
                   font-plein text-[30px] font-bold
                   leading-[130%] tracking-[0]
                   text-black"
          >
            What our Clients Say About Us
          </h2>

          <p
            class="mt-5 max-w-[430px]
                   font-plein text-[16px] font-normal
                   leading-[140%] tracking-[0]
                   text-[#000000CC]"
          >
            We have provided personalized travel planning, expert advice,
            and a seamless booking process to make their dream vacation
            a reality.
          </p>

          <div class="mt-14 grid max-w-[640px] grid-cols-3 gap-8">
            <div
              v-for="item in metrics"
              :key="item.id"
              class="text-center"
            >
              <h3
                class="font-plein text-[45px] font-bold
                       leading-[120%] tracking-[0]
                       text-[#7B9E22]"
              >
                {{ item.value }}
              </h3>

              <p
                class="font-plein text-[16px] font-medium
                       leading-[140%] tracking-[0]
                       text-black"
              >
                {{ item.label }}
              </p>
            </div>
          </div>
        </article>

        <!-- Right -->
        <article class="min-w-0">
          <div class="mb-8 flex items-center justify-end gap-10">
            <button
              type="button"
              class="text-[44px] leading-none text-[#32263e]"
              aria-label="Previous review"
            >
              ‹
            </button>

            <button
              type="button"
              class="text-[44px] leading-none text-black/25"
              aria-label="Next review"
            >
              ›
            </button>
          </div>

          <div class="overflow-x-auto pb-14 pl-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div class="flex gap-[14px]">
              <article
                v-for="review in reviews"
                :key="review.id"
                class="h-[256px] w-[414px] shrink-0
                       rounded-[28px] bg-[#FFF3DD40]
                       p-4 opacity-100
                       shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
              >
                <header class="flex items-start justify-between gap-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <img
                      :src="review.avatar"
                      :alt="review.name"
                      class="h-[56px] w-[56px] rounded-full object-cover"
                      loading="lazy"
                      draggable="false"
                    >

                    <div class="min-w-0">
                      <h3
                        class="truncate font-plein text-[20px]
                               font-bold leading-[130%] tracking-[0]
                               text-black"
                      >
                        {{ review.name }}
                      </h3>

                      <p
                        class="truncate font-plein text-[12px]
                               font-medium leading-[140%] tracking-[0]
                               text-[#000000CC]"
                      >
                        {{ review.meta }}
                      </p>
                    </div>
                  </div>

                  <p class="shrink-0 pt-3 font-plein text-[16px] font-bold text-black/70">
                    {{ review.rating }}
                    <span class="text-[#f5a51b]">★</span>
                  </p>
                </header>

                <p class="mt-[14px] font-plein text-[12px] font-medium leading-[140%] text-black/60">
                  {{ review.time }}
                </p>

                <p
                  class="mt-[14px] font-plein text-[14px]
                         font-normal leading-[140%] tracking-[0]
                         text-[#000000CC]"
                >
                  {{ review.text }}
                </p>
              </article>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>