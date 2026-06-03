<script setup lang="ts">
import { LEGAL_LINKS } from '~/constants/legal-links'
import type { LegalParsedDocument } from '~/utils/parse-legal-text'
import { getPageIcon, getTileGradient } from '~/utils/legal-icons'

const props = defineProps<{
  document: LegalParsedDocument
  slug: string
}>()

const route = useRoute()
const currentSlug = computed(() => props.slug || String(route.params.slug ?? ''))
const pageIcon = computed(() => getPageIcon(currentSlug.value))
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#121212] pb-16">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(247,101,23,0.14),transparent_42%),radial-gradient(circle_at_90%_8%,rgba(242,170,25,0.1),transparent_38%)]"
      aria-hidden="true"
    />

    <div class="pointer-events-none absolute left-8 top-32 h-32 w-32 rounded-full bg-[#F76517]/15 blur-3xl orb-float" aria-hidden="true" />
    <div class="pointer-events-none absolute right-8 top-48 h-40 w-40 rounded-full bg-[#F2AA19]/12 blur-3xl orb-float-delayed" aria-hidden="true" />

    <div class="relative mx-auto w-[94%] max-w-[1140px] px-4 pt-24 md:pt-28">
      <div
        class="rounded-[28px] border border-white/10 bg-white px-5 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:px-10 md:py-12 page-enter"
      >
        <header class="flex items-start gap-4 border-b border-black/10 pb-8 md:gap-5">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F76517]/30 to-[#F2AA19]/20 text-[#F76517] shadow-[0_8px_24px_rgba(247,101,23,0.2)] icon-pulse md:h-[72px] md:w-[72px]"
            aria-hidden="true"
          >
            <LegalIcon :name="pageIcon" class="h-9 w-9 md:h-10 md:w-10" />
          </div>
          <h1
            class="flex-1 font-plein text-[28px] font-bold leading-[120%] tracking-[0] text-black md:text-[42px]"
          >
            {{ document.title }}
          </h1>
        </header>

        <div class="mt-8">
          <LegalDocumentBody :document="document" />
        </div>

        <aside
          class="mt-12 flex gap-4 rounded-2xl border border-[#F76517]/25 bg-gradient-to-r from-[#F76517]/12 to-[#F2AA19]/10 p-5 md:p-6"
          aria-label="Contact"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F76517]/25 to-[#F2AA19]/15 text-[#F76517]"
            aria-hidden="true"
          >
            <LegalIcon name="mail" class="h-6 w-6" />
          </div>
          <div>
            <p class="font-plein text-[16px] font-bold text-black">
              Questions?
            </p>
            <p class="mt-2 font-plein text-[16px] leading-[160%] text-black/80">
              <a
                href="mailto:contact@pirttrip.com"
                class="text-[#e15f16] underline-offset-2 hover:underline"
              >contact@pirttrip.com</a>
            </p>
          </div>
        </aside>
      </div>

      <nav
        class="mt-10 rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] page-enter-delayed"
        aria-label="Other legal pages"
      >
        <h2 class="font-plein text-[18px] font-bold text-white">
          Other policies
        </h2>
        <ul class="mt-5 flex flex-wrap gap-3">
          <li
            v-for="(link, linkIndex) in LEGAL_LINKS"
            :key="link.id"
          >
            <NuxtLink
              :to="link.href"
              class="group inline-flex h-[104px] w-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#242424] px-3 py-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#F76517]/50 hover:bg-[#2d2218] hover:shadow-[0_12px_28px_rgba(247,101,23,0.2)]"
              :class="link.href === `/legal/${currentSlug}` ? 'border-[#F76517]/70 bg-[#2d2218]' : ''"
            >
              <div
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-[#F76517] transition-transform duration-300 group-hover:scale-110"
                :class="getTileGradient(linkIndex)"
                aria-hidden="true"
              >
                <LegalIcon :name="link.icon" class="h-6 w-6" />
              </div>
              <span class="flex h-[34px] items-center justify-center font-plein text-[12px] font-semibold leading-[130%] text-white/90 md:text-[13px]">
                {{ link.label }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <LayoutFooterCopyright variant="dark" class="mt-8" />
    </div>
  </div>
</template>

<style scoped>
.page-enter {
  animation: rise-fade 0.55s ease-out both;
}

.page-enter-delayed {
  animation: rise-fade 0.55s ease-out both;
  animation-delay: 0.12s;
}

.icon-pulse {
  animation: icon-pop 0.6s ease-out both;
}

.orb-float {
  animation: float-y 6s ease-in-out infinite;
}

.orb-float-delayed {
  animation: float-y 7.5s ease-in-out infinite;
  animation-delay: 0.9s;
}

@keyframes rise-fade {
  from {
    transform: translateY(14px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes icon-pop {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes float-y {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
