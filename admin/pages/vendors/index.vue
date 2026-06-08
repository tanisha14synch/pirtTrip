<script setup lang="ts">
import type { PartnerLead } from '~/types/database'

definePageMeta({ ssr: false })

const {
  loading: leadsLoading,
  errorMessage: leadsError,
  fetchLeads,
  deleteLead,
  exportCsv,
  createExportShare,
} = useAdminLeads()
const toast = useAdminToast()

const page = ref(1)
const pageSize = 10
const search = ref('')
const sortBy = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

const list = ref<PartnerLead[]>([])
const total = ref(0)

const sortColumns = [
  { key: 'business_name', label: 'Business' },
  { key: 'first_name', label: 'Owner' },
  { key: 'phone', label: 'Mobile' },
  { key: 'created_at', label: 'Registered' },
]

const confirmOpen = ref(false)
const confirmLoading = ref(false)
const pendingDelete = ref<PartnerLead | null>(null)

const shareOpen = ref(false)
const shareLoading = ref(false)
const sharePassword = ref('')
const sharePasswordConfirm = ref('')
const shareLink = ref('')
const shareRowCount = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function loadLeads() {
  const res = await fetchLeads({
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
    loadLeads()
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
  loadLeads()
}

function askDelete(lead: PartnerLead) {
  pendingDelete.value = lead
  confirmOpen.value = true
}

async function runConfirm() {
  if (!pendingDelete.value) return
  confirmLoading.value = true
  try {
    const lead = pendingDelete.value
    const result = await deleteLead(lead.id) as { message?: string }
    toast.success(result?.message || 'Business deleted from database')
    confirmOpen.value = false
    pendingDelete.value = null
    await loadLeads()
  } catch {
    toast.error(leadsError.value || 'Delete failed')
  } finally {
    confirmLoading.value = false
  }
}

async function onExportAll() {
  try {
    await exportCsv({ search: search.value })
    toast.success('CSV downloaded')
  } catch {
    toast.error('Export failed')
  }
}

function openShareModal() {
  sharePassword.value = ''
  sharePasswordConfirm.value = ''
  shareLink.value = ''
  shareRowCount.value = 0
  shareOpen.value = true
}

async function onCreateShareLink() {
  if (sharePassword.value.length < 6) {
    toast.error('Password must be at least 6 characters')
    return
  }
  if (sharePassword.value !== sharePasswordConfirm.value) {
    toast.error('Passwords do not match')
    return
  }

  shareLoading.value = true
  try {
    const result = await createExportShare({
      password: sharePassword.value,
    })
    shareRowCount.value = result.rowCount
    shareLink.value = result.shareUrl
    toast.success('Share link created')
  } catch {
    toast.error(leadsError.value || 'Could not create share link')
  } finally {
    shareLoading.value = false
  }
}

async function copyShareLink() {
  if (!shareLink.value) return
  try {
    await navigator.clipboard.writeText(shareLink.value)
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy link')
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

function ownerName(lead: PartnerLead) {
  return `${lead.first_name} ${lead.last_name}`.trim()
}

const confirmCopy = computed(() => {
  if (!pendingDelete.value) return { title: '', message: '' }
  const name = ownerName(pendingDelete.value)
  const phone = pendingDelete.value.phone
  return {
    title: 'Delete',
    message: `Permanently delete ${name} (${phone})? Registration, OTP logs, and all related data will be removed. This cannot be undone.`,
  }
})

onMounted(loadLeads)
watch(page, loadLeads)
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          Businesses
        </h1>
        <p class="mt-1 text-sm text-black/60">
          All partner registrations from Supabase.
        </p>
        <p v-if="total" class="mt-2 text-xs text-black/45">
          {{ total.toLocaleString('en-IN') }} businesses · showing {{ pageSize }} per page
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg border border-brand-primary px-4 py-2 text-sm font-bold text-brand-primary hover:bg-brand-primary/5"
          @click="openShareModal"
        >
          Create share link
        </button>
        <button
          type="button"
          class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-dark"
          @click="onExportAll"
        >
          Download CSV
        </button>
      </div>
    </div>

    <div class="relative mt-6 max-w-md">
      <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="search"
        type="search"
        placeholder="Search businesses…"
        class="h-10 w-full rounded-lg border border-black/15 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-orange-100"
        @input="onSearchInput"
      >
    </div>

    <p
      v-if="leadsError"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ leadsError }}
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
              <th class="px-4 py-3 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="leadsLoading">
              <td colspan="5" class="px-4 py-12 text-center text-black/50">
                Loading businesses…
              </td>
            </tr>
            <tr v-else-if="!list.length">
              <td colspan="5" class="px-4 py-12 text-center text-black/50">
                No businesses found
              </td>
            </tr>
            <tr
              v-for="lead in list"
              v-else
              :key="lead.id"
              class="border-b border-black/5 hover:bg-black/[0.02]"
            >
              <td class="px-4 py-3">
                <NuxtLink :to="`/vendors/${lead.id}`" class="font-medium text-brand-primary hover:underline">
                  {{ lead.business_name || '—' }}
                </NuxtLink>
              </td>
              <td class="px-4 py-3 font-medium">
                {{ ownerName(lead) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                {{ lead.phone }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-black/60">
                <span class="block text-xs">{{ relativeTime(lead.created_at) }}</span>
                <span class="text-[11px] text-black/40">{{ formatDate(lead.created_at) }}</span>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <AdminBusinessActionButtons
                  :phone="lead.phone"
                  :name="ownerName(lead)"
                  :business="lead.business_name"
                  @delete="askDelete(lead)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="total > 0" class="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        class="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page <= 1 || leadsLoading"
        @click="page--"
      >
        Previous
      </button>
      <span class="text-sm text-black/60">
        Page {{ page }} of {{ totalPages }} · {{ total }} total
      </span>
      <button
        type="button"
        class="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="page >= totalPages || leadsLoading"
        @click="page++"
      >
        Next
      </button>
    </div>

    <div
      v-if="shareOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      @click.self="shareOpen = false"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-bold">
          Create password-protected share link
        </h3>
        <p class="mt-2 text-sm text-black/60">
          Generate a permanent link. The password never expires. Each visit loads all current vendor data from the database.
        </p>

        <template v-if="!shareLink">
          <div class="mt-5 space-y-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-black/50">Password</label>
              <input
                v-model="sharePassword"
                type="password"
                class="mt-1 h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-orange-100"
                placeholder="Min. 6 characters"
              >
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-black/50">Confirm password</label>
              <input
                v-model="sharePasswordConfirm"
                type="password"
                class="mt-1 h-10 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-orange-100"
                placeholder="Re-enter password"
              >
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium"
              :disabled="shareLoading"
              @click="shareOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              :disabled="shareLoading"
              @click="onCreateShareLink"
            >
              {{ shareLoading ? 'Creating…' : 'Create link' }}
            </button>
          </div>
        </template>

        <template v-else>
          <p class="mt-4 text-sm text-black/70">
            {{ shareRowCount.toLocaleString('en-IN') }} rows right now · live data on every visit
          </p>
          <div class="mt-3 flex gap-2">
            <input
              :value="shareLink"
              readonly
              class="h-10 min-w-0 flex-1 rounded-lg border border-black/15 bg-black/[0.02] px-3 text-xs outline-none"
            >
            <button
              type="button"
              class="shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white"
              @click="copyShareLink"
            >
              Copy
            </button>
          </div>
          <p class="mt-3 text-xs text-black/50">
            Share this link and password separately. New registrations appear automatically when the link is opened.
          </p>
          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium"
              @click="shareOpen = false"
            >
              Done
            </button>
          </div>
        </template>
      </div>
    </div>

    <AdminConfirmModal
      :open="confirmOpen"
      :title="confirmCopy.title"
      :message="confirmCopy.message"
      :confirm-label="'Delete'"
      danger
      :loading="confirmLoading"
      @cancel="confirmOpen = false"
      @confirm="runConfirm"
    />
  </div>
</template>
