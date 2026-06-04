<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const leadsApi = useAdminLeads()

const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const statusFilter = ref('')
const sortOrder = ref('desc')

const list = ref([])
const total = ref(0)
const searchDebounce = ref(null)

const statusOptions = ['NEW', 'CONTACTED', 'QUALIFIED', 'ONBOARDED', 'REJECTED']

async function loadLeads() {
  const res = await leadsApi.fetchLeads({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value,
    status: statusFilter.value,
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

async function onExport() {
  await leadsApi.exportCsv({
    search: search.value,
    status: statusFilter.value,
  })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

onMounted(loadLeads)
watch([page, statusFilter, sortOrder], loadLeads)
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-plein text-2xl font-bold">
          Partner Leads
        </h1>
        <p class="mt-1 text-sm text-black/60">
          {{ total }} total registrations
        </p>
      </div>
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center rounded-lg bg-[#F3A81A] px-4 font-plein text-sm font-bold text-white hover:opacity-90"
        @click="onExport"
      >
        Export CSV
      </button>
    </div>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <input
        v-model="search"
        type="search"
        placeholder="Search name, business, phone…"
        class="h-10 min-w-[200px] flex-1 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-[#F3A81A]"
        @input="onSearchInput"
      >
      <select
        v-model="statusFilter"
        class="h-10 rounded-lg border border-black/15 px-3 text-sm"
      >
        <option value="">
          All statuses
        </option>
        <option v-for="s in statusOptions" :key="s" :value="s">
          {{ s }}
        </option>
      </select>
      <select
        v-model="sortOrder"
        class="h-10 rounded-lg border border-black/15 px-3 text-sm"
      >
        <option value="desc">
          Newest first
        </option>
        <option value="asc">
          Oldest first
        </option>
      </select>
    </div>

    <p
      v-if="leadsApi.errorMessage"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ leadsApi.errorMessage }}
    </p>

    <div class="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-black/10 bg-black/[0.02]">
          <tr>
            <th class="px-4 py-3 font-semibold">
              Name
            </th>
            <th class="px-4 py-3 font-semibold">
              Phone
            </th>
            <th class="px-4 py-3 font-semibold">
              Registered
            </th>
            <th class="px-4 py-3 font-semibold">
              OTP
            </th>
            <th class="px-4 py-3 font-semibold">
              Status
            </th>
            <th class="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="leadsApi.loading">
            <td colspan="6" class="px-4 py-8 text-center text-black/50">
              Loading…
            </td>
          </tr>
          <tr v-else-if="!list.length">
            <td colspan="6" class="px-4 py-8 text-center text-black/50">
              No leads found
            </td>
          </tr>
          <tr
            v-for="lead in list"
            v-else
            :key="lead.id"
            class="border-b border-black/5 hover:bg-black/[0.02]"
          >
            <td class="px-4 py-3">
              {{ lead.first_name }} {{ lead.last_name }}
            </td>
            <td class="px-4 py-3">
              {{ lead.phone }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              {{ formatDate(lead.created_at) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="lead.otp_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
              >
                {{ lead.otp_verified ? 'Verified' : 'Pending' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium">
                {{ lead.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <NuxtLink
                :to="`/admin/leads/${lead.id}`"
                class="font-medium text-[#F76517] hover:underline"
              >
                View
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="totalPages > 1"
      class="mt-4 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        class="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
        :disabled="page <= 1"
        @click="page--"
      >
        Previous
      </button>
      <span class="text-sm text-black/60">Page {{ page }} of {{ totalPages }}</span>
      <button
        type="button"
        class="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="page++"
      >
        Next
      </button>
    </div>
  </div>
</template>
