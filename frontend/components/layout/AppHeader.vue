<script setup>
const store = useHomeStore()
const { header, ui } = storeToRefs(store)

const headerBarStyle = computed(() => store.headerBarStyle)
const headerNavStyle = computed(() => store.headerNavStyle)
const headerButtonStyle = computed(() => store.headerButtonStyle)

const ctaClass = (variant) => {
  const base =
    'inline-flex items-center justify-center text-center text-sm font-medium leading-tight text-white transition-opacity hover:opacity-90'
  if (variant === 'dark') {
    return `${base} bg-brand-dark`
  }
  return `${base} bg-brand-gold`
}

const navLinkClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap text-white hover:opacity-80'

const updateHeaderScroll = () => {
  const threshold = header.value.scrollThreshold ?? 24
  store.setHeaderScrolled(window.scrollY > threshold)
}

onMounted(() => {
  updateHeaderScroll()
  window.addEventListener('scroll', updateHeaderScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateHeaderScroll)
  store.setHeaderScrolled(false)
})

watch(
  () => ui.value.mobileMenuOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 w-full">
    <div
      :style="headerBarStyle"
      class="w-full"
    >
      <div
        class="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
      <NuxtLink
        :to="header.logo.href"
        class="inline-flex shrink-0 items-center"
        :aria-label="header.logo.alt"
      >
        <img
          v-if="header.logo.image"
          :src="header.logo.image"
          :alt="header.logo.alt"
          class="h-9 w-auto max-h-[52px] object-contain sm:h-10"
          width="584"
          height="192"
          fetchpriority="high"
        >
        <span
          v-else
          class="font-plein text-xl font-bold lowercase text-white"
        >{{ header.logo.text }}</span>
      </NuxtLink>

      <div class="ml-auto hidden items-center lg:flex">
        <nav
          class="flex items-center"
          aria-label="Main navigation"
        >
          <template
            v-for="(link, index) in header.navLinks"
            :key="link.id"
          >
            <span
              v-if="index > 0"
              class="mx-4 h-4 w-px shrink-0 bg-white/35"
              aria-hidden="true"
            />
            <NuxtLink
              :to="link.href"
              :class="navLinkClass"
              :style="headerNavStyle"
            >
              <UiAppIcon
                v-if="link.icon === 'heart'"
                name="heart"
                icon-class="h-4 w-4 shrink-0"
              />
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>

        <div
          class="ml-6 flex items-center"
          :style="{ gap: `${header.buttons.gap}px` }"
        >
          <NuxtLink
            v-for="cta in header.ctas"
            :key="cta.id"
            :to="cta.href"
            :class="ctaClass(cta.variant)"
            :style="headerButtonStyle"
          >
            {{ cta.label }}
          </NuxtLink>
        </div>
      </div>

      <button
        type="button"
        class="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gold text-white lg:hidden"
        :aria-expanded="ui.mobileMenuOpen"
        :aria-label="header.mobileMenuLabel"
        @click="store.toggleMobileMenu()"
      >
        <UiAppIcon
          :name="ui.mobileMenuOpen ? 'close' : 'menu'"
          icon-class="h-5 w-5"
        />
      </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="ui.mobileMenuOpen"
        class="absolute inset-x-0 top-full border-t border-white/10 bg-black/95 backdrop-blur-lg lg:hidden"
      >
        <nav
          class="flex flex-col gap-1 px-4 py-4"
          aria-label="Mobile navigation"
        >
          <NuxtLink
            v-for="link in header.navLinks"
            :key="link.id"
            :to="link.href"
            :class="`${navLinkClass} px-3 py-3`"
            :style="headerNavStyle"
            @click="store.setMobileMenuOpen(false)"
          >
            <UiAppIcon
              v-if="link.icon === 'heart'"
              name="heart"
              icon-class="h-4 w-4"
            />
            {{ link.label }}
          </NuxtLink>

          <div
            class="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4"
            :style="{ gap: `${header.buttons.gap}px` }"
          >
            <NuxtLink
              v-for="cta in header.ctas"
              :key="cta.id"
              :to="cta.href"
              :class="`${ctaClass(cta.variant)} w-full text-center`"
              :style="headerButtonStyle"
              @click="store.setMobileMenuOpen(false)"
            >
              {{ cta.label }}
            </NuxtLink>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>
