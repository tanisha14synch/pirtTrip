<script setup lang="ts">
import type { WaitlistSubscriber } from '~/types/database'

definePageMeta({ ssr: false })

const { loading, errorMessage, fetchWaitlist } = useAdminWaitlist()

const page = ref(1)
const pageSize = 15
const search = ref('')
const sortBy = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

const list = ref<WaitlistSubscriber[]>([])
const total = ref(0)

const sortColumns = [
  { key: 'email', label: 'Email' },
  { key: 'source_page', label: 'Source' },
  { key: 'otp_verified', label: 'Verified' },
  { key: 'created_at', label: 'Joined' },
]

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function loadWaitlist() {
  const res = await fetchWaitlist({
    page: page.value,
    pageSize,
    search: search.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  })
  list.value = res.data
  total.value = res.total
}

function onSearchInput() {
  if (searchDebounce.value) clearTimeout(searchDebounce.value)
  searchDebounce.value = setTimeout(() => {
    page.value = 1
    loadWaitlist()
  }, 350)
}

function toggleSort(column: string) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
  page.value = 1
  loadWaitlist()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(loadWaitlist)
watch(page, loadWaitlist)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">
        Traveler waitlist
      </h1>
      <p class="mt-1 text-sm text-black/60">
        Emails registered on pirttrip.com (Join Waitlist).
      </p>
      <p v-if="total" class="mt-2 text-xs text-black/45">
        {{ total.toLocaleString('en-IN') }} sign-ups · showing {{ pageSize }} per page
      </p>
    </div>

    <div class="relative max-w-md">
      <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="search"
        type="search"
        placeholder="Search by email…"
        class="h-10 w-full rounded-lg border border-black/15 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-orange-100"
        @input="onSearchInput"
      >
    </div>

    <p
      v-if="errorMessage"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ errorMessage }}
    </p>

    <div class="mt-6 overflow-hidden rounded-xl border border-black/10 bg-white">
      <div class="overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-black/10 bg-[#fafafa] text-xs uppercase tracking-wide text-black/50">
            <tr>
              <th
                v-for="col in sortColumns"
                :key="col.key"
                class="cursor-pointer px-4 py-3 font-semibold hover:text-black"
                @click="toggleSort(col.key)"
              >
                {{ col.label }}
                <span v-if="sortBy === col.key">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="px-4 py-12 text-center text-black/50">
                Loading waitlist…
              </td>
            </tr>
            <tr v-else-if="!list.length">
              <td colspan="4" class="px-4 py-12 text-center text-black/50">
                No waitlist sign-ups yet
              </td>
            </tr>
            <tr
              v-for="row in list"
              v-else
              :key="row.id"
              class="border-b border-black/5 hover:bg-black/[0.02]"
            >
              <td class="px-4 py-3 font-medium text-black">
                {{ row.email }}
              </td>
              <td class="px-4 py-3 text-black/70">
                {{ row.source_page }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="row.otp_verified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'"
                >
                  {{ row.otp_verified ? 'Yes' : 'No' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-black/60">
                {{ formatDate(row.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="totalPages > 1"
      class="mt-4 flex items-center justify-between text-sm text-black/60"
    >
      <button
        type="button"
        class="rounded-lg border border-black/15 px-3 py-1.5 disabled:opacity-40"
        :disabled="page <= 1 || loading"
        @click="page--"
      >
        Previous
      </button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button
        type="button"
        class="rounded-lg border border-black/15 px-3 py-1.5 disabled:opacity-40"
        :disabled="page >= totalPages || loading"
        @click="page++"
      >
        Next
      </button>
    </div>
  </div>
</template>
