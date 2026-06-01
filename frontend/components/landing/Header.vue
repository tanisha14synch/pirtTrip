<script setup>
const store = useLandingStore()
const { header, ui } = storeToRefs(store)

const navLinkClass =
  'inline-flex items-center whitespace-nowrap font-plein text-[16px] font-medium leading-[140%] text-white transition-opacity hover:opacity-80'

const ctaClass =
  'inline-flex h-[52px] items-center justify-center rounded-[9px] px-5 font-plein text-[16px] font-medium leading-tight text-white transition-opacity hover:opacity-90'

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
  <header
    class="fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300"
    :class="ui.headerScrolled ? 'bg-black/90 shadow-lg backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'"
  >
    <div class="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[88px] lg:px-8">
      <NuxtLink
        :to="header.logo.href"
        class="inline-flex shrink-0 items-center"
        :aria-label="header.logo.alt"
      >
        <img
          :src="header.logo.image"
          :alt="header.logo.alt"
          class="h-9 w-auto object-contain sm:h-10"
          width="584"
          height="192"
          fetchpriority="high"
        >
      </NuxtLink>

      <div class="ml-auto hidden items-center lg:flex">
        <nav class="flex items-center" aria-label="Main navigation">
          <template v-for="(link, index) in header.navLinks" :key="link.id">
            <span
              v-if="index > 0"
              class="mx-4 h-4 w-px shrink-0 bg-white/35"
              aria-hidden="true"
            />
            <NuxtLink :to="link.href" :class="navLinkClass">
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>

        <div class="ml-6 flex items-center gap-3">
          <NuxtLink
            :to="header.travelerCta.href"
            class="inline-flex h-[52px] items-center justify-center rounded-[9px] border border-white/30 px-5 font-plein text-[16px] font-medium text-white transition-colors hover:bg-white/10"
          >
            {{ header.travelerCta.label }}
          </NuxtLink>
          <NuxtLink
            :to="header.partnerCta.href"
            :class="`${ctaClass} bg-brand-dark`"
          >
            {{ header.partnerCta.label }}
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
        <UiAppIcon :name="ui.mobileMenuOpen ? 'close' : 'menu'" icon-class="h-5 w-5" />
      </button>
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
        <nav class="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
          <NuxtLink
            v-for="link in header.navLinks"
            :key="link.id"
            :to="link.href"
            :class="`${navLinkClass} px-3 py-3`"
            @click="store.setMobileMenuOpen(false)"
          >
            {{ link.label }}
          </NuxtLink>

          <div class="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
            <NuxtLink
              :to="header.travelerCta.href"
              :class="`${ctaClass} w-full border border-white/30 bg-transparent`"
              @click="store.setMobileMenuOpen(false)"
            >
              {{ header.travelerCta.label }}
            </NuxtLink>
            <NuxtLink
              :to="header.partnerCta.href"
              :class="`${ctaClass} w-full bg-brand-dark`"
              @click="store.setMobileMenuOpen(false)"
            >
              {{ header.partnerCta.label }}
            </NuxtLink>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>
