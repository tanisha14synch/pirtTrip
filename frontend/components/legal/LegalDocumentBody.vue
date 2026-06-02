<script setup lang="ts">
import type { LegalParsedDocument } from '~/utils/parse-legal-text'
import { getListItemIcon, getSectionIcon, getTileGradient } from '~/utils/legal-icons'

defineProps<{
  document: LegalParsedDocument
}>()
</script>

<template>
  <div class="legal-document">
    <div
      v-if="document.intro.length"
      class="doc-appear flex gap-4 rounded-2xl border border-[#F76517]/20 bg-gradient-to-br from-[#fff8f4] via-white to-[#fff5ee] p-5 md:p-6"
    >
      <div
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F76517]/25 to-[#F2AA19]/15 text-[#F76517] shadow-sm"
        aria-hidden="true"
      >
        <LegalIcon name="document" class="h-7 w-7" />
      </div>
      <div class="min-w-0 space-y-3">
        <p
          v-for="(paragraph, index) in document.intro"
          :key="`intro-${index}`"
          class="font-plein text-[16px] font-normal leading-[160%] tracking-[0] text-black/85"
        >
          {{ paragraph }}
        </p>
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3">
      <section
        v-for="(section, sectionIndex) in document.sections"
        :key="`section-${sectionIndex}`"
        class="doc-appear w-full rounded-2xl border border-black/10 bg-[#fafafa] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F76517]/30 hover:shadow-[0_14px_32px_rgba(247,101,23,0.14)] md:p-6"
        :style="{ animationDelay: `${Math.min(sectionIndex, 10) * 60}ms` }"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[#F76517]"
            :class="getTileGradient(sectionIndex)"
            aria-hidden="true"
          >
            <LegalIcon
              :name="getSectionIcon(sectionIndex, section.title)"
              class="h-6 w-6"
            />
          </div>
          <component
            :is="section.level === 3 ? 'h3' : 'h2'"
            v-if="section.title"
            :class="
              section.level === 3
                ? 'flex-1 font-plein text-[17px] font-bold leading-[130%] text-black'
                : 'flex-1 font-plein text-[19px] font-bold leading-[130%] text-black md:text-[21px]'
            "
          >
            {{ section.title }}
          </component>
        </div>

        <div
          v-if="section.paragraphs.length"
          class="mt-4 space-y-3"
        >
          <p
            v-for="(paragraph, pIndex) in section.paragraphs"
            :key="`p-${sectionIndex}-${pIndex}`"
            class="font-plein text-[15px] font-normal leading-[160%] text-black/80"
          >
            {{ paragraph }}
          </p>
        </div>

        <ul
          v-if="section.list.length"
          class="mt-3 flex flex-col gap-2"
        >
          <li
            v-for="(item, itemIndex) in section.list"
            :key="`li-${sectionIndex}-${itemIndex}`"
            class="flex items-start gap-2.5 rounded-xl border border-black/8 bg-white p-3 transition-colors hover:border-[#F76517]/25 hover:bg-[#fffaf7]"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[#F76517]"
              :class="getTileGradient(itemIndex + sectionIndex)"
              aria-hidden="true"
            >
              <LegalIcon
                :name="getListItemIcon(itemIndex)"
                class="h-4 w-4"
              />
            </div>
            <div class="min-w-0 flex-1 font-plein text-[14px] leading-[150%] text-black/85">
              <template v-if="item.startsWith('www.') || item.startsWith('http')">
                <a
                  :href="item.startsWith('http') ? item : `https://${item}`"
                  class="text-[#F76517] underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{ item }}</a>
              </template>
              <template v-else-if="item.startsWith('Email:')">
                <a
                  :href="`mailto:${item.replace(/^Email:\s*/i, '').trim()}`"
                  class="text-[#F76517] underline-offset-2 hover:underline"
                >{{ item }}</a>
              </template>
              <template v-else>
                {{ item }}
              </template>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.doc-appear {
  animation: card-enter 0.5s ease-out both;
}

@keyframes card-enter {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
