<script setup>
const posts = [
  {
    id: 'jimmy',
    username: 'JimmyKim',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    comments: 145,
  },
  {
    id: 'kristi',
    username: 'kristicunga',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
    image:
      'https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=600&q=80',
    comments: 145,
  },
  {
    id: 'lisa',
    username: 'LisaWill',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80',
    comments: 145,
  },
]

const FEATURED_IMAGE = '/images/social-feed-featured.png'
</script>

<template>
  <section class="w-full bg-[#f5f5f5] py-14 md:py-16 lg:py-20">
    <div class="mx-auto w-[94%] max-w-[1280px]">
      <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 xl:gap-14">
        <!-- Left -->
        <article class="min-w-0">
          <p class="font-plein text-[20px] font-bold leading-[120%] tracking-[0] text-[#F76517]">
            Social Feed
          </p>

          <h2
            class="mt-3 font-plein text-[28px] font-bold leading-[130%] tracking-[0] text-black"
          >
            What's on instagram
          </h2>

          <div class="mt-8">
            <img
              :src="FEATURED_IMAGE"
              alt="Travel flat lay with map, camera, and Explore our feed"
              class="h-auto w-full rounded-[20px]"
              loading="lazy"
              draggable="false"
            >
          </div>
        </article>

        <!-- Right: 3 cards — 3rd card half clipped at column edge (like Figma) -->
        <div class="social-feed-viewport min-w-0 w-full overflow-hidden pl-6 pb-8">
          <div class="flex justify-start gap-5">
              <article
                v-for="post in posts"
                :key="post.id"
                class="social-feed-card shrink-0 overflow-hidden rounded-[18px] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.1)]"
              >
              <!-- Card header -->
              <header class="flex items-center justify-between gap-2 px-4 py-3">
                <div class="flex min-w-0 items-center gap-2.5">
                  <img
                    :src="post.avatar"
                    :alt="`${post.username} profile`"
                    class="h-9 w-9 shrink-0 rounded-full object-cover"
                    loading="lazy"
                    draggable="false"
                  >
                  <span
                    class="truncate font-plein text-[15px] font-bold leading-[130%] tracking-[0] text-black"
                  >
                    {{ post.username }}
                  </span>
                </div>

                <button
                  type="button"
                  class="shrink-0 px-1 font-plein text-[20px] font-bold leading-none text-black/70"
                  aria-label="More options"
                >
                  ···
                </button>
              </header>

              <!-- Post image -->
              <img
                :src="post.image"
                :alt="`Instagram post by ${post.username}`"
                class="aspect-square w-full object-cover"
                loading="lazy"
                draggable="false"
              >

              <!-- Actions -->
              <div class="flex items-center justify-between px-4 py-3">
                <div class="flex items-center gap-3.5">
                  <span class="text-[26px] leading-none text-[#ed4956]" aria-hidden="true">♥</span>
                  <svg
                    class="h-[26px] w-[26px] text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.96L3 20l1.96-4.745A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <svg
                    class="h-[26px] w-[26px] text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M22 3L11 14M22 3l-7 18-4-7-7-4 18-7z"
                    />
                  </svg>
                </div>

                <svg
                  class="h-[26px] w-[26px] text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 5h14v14H5z"
                  />
                </svg>
              </div>

              <!-- Card footer -->
              <footer class="px-4 pb-4">
                <p class="font-plein text-[15px] font-bold leading-[130%] tracking-[0] text-black">
                  {{ post.username }}
                </p>
                <p class="mt-1.5 font-plein text-[13px] font-medium leading-[140%] tracking-[0] text-[#00000080]">
                  View all {{ post.comments }} comments
                </p>
              </footer>
              </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Container width = 2.5 cards → 3rd card is half visible on the right */
.social-feed-viewport {
  --social-gap: 20px;
  container-type: inline-size;
}

.social-feed-card {
  width: calc((100cqw - var(--social-gap) * 2) / 2.5);
  max-width: 340px;
  flex-shrink: 0;
}
</style>
