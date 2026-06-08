<script setup lang="ts">
definePageMeta({ layout: 'share', ssr: false })

const route = useRoute()
const token = computed(() => String(route.params.token || ''))

type ShareMeta = {
  label: string | null
  rowCount: number
  createdAt: string
  live: boolean
}

type SharePreview = {
  headers: string[]
  rows: string[][]
}

const loading = ref(true)
const verifying = ref(false)
const downloading = ref(false)
const errorMessage = ref<string | null>(null)
const meta = ref<ShareMeta | null>(null)
const password = ref('')
const accessToken = ref<string | null>(null)
const preview = ref<SharePreview | null>(null)
const unlocked = ref(false)

async function loadMeta() {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await $fetch<{
      success: boolean
      label: string | null
      rowCount: number
      createdAt: string
      live: boolean
    }>(apiUrl(`/api/admin/leads/export-share/${token.value}`))
    meta.value = {
      label: response.label,
      rowCount: response.rowCount,
      createdAt: response.createdAt,
      live: response.live,
    }
  } catch (err: unknown) {
    errorMessage.value = parseError(err)
    meta.value = null
  } finally {
    loading.value = false
  }
}

async function onVerify() {
  if (!password.value.trim()) {
    errorMessage.value = 'Enter the password'
    return
  }

  verifying.value = true
  errorMessage.value = null
  try {
    const response = await $fetch<{
      success: boolean
      label: string | null
      rowCount: number
      preview: SharePreview
      accessToken: string
      live: boolean
    }>(apiUrl(`/api/admin/leads/export-share/${token.value}/verify`), {
      method: 'POST',
      body: { password: password.value },
    })

    accessToken.value = response.accessToken
    preview.value = response.preview
    meta.value = {
      label: response.label,
      rowCount: response.rowCount,
      createdAt: meta.value?.createdAt || new Date().toISOString(),
      live: response.live,
    }
    unlocked.value = true
  } catch (err: unknown) {
    errorMessage.value = parseError(err)
  } finally {
    verifying.value = false
  }
}

async function onDownload() {
  if (!accessToken.value) return

  downloading.value = true
  errorMessage.value = null
  try {
    const response = await fetch(
      apiUrl(`/api/admin/leads/export-share/${token.value}/download`),
      { headers: { Authorization: `Bearer ${accessToken.value}` } },
    )
    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `pirttrip-vendors-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  } catch (err: unknown) {
    errorMessage.value = parseError(err)
  } finally {
    downloading.value = false
  }
}

function parseError(err: unknown): string {
  const e = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
  return e?.data?.statusMessage || e?.statusMessage || e?.message || 'Something went wrong'
}

onMounted(loadMeta)
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <div class="mb-8 text-center">
      <p class="text-2xl font-bold text-brand-primary">
        PirtTrip
      </p>
      <h1 class="mt-2 text-xl font-bold text-black">
        Shared vendor export
      </h1>
      <p v-if="meta" class="mt-1 text-sm text-black/60">
        {{ meta.label || 'Partner registrations' }} · {{ meta.rowCount.toLocaleString('en-IN') }} rows
      </p>
      <p v-if="meta?.live" class="mt-1 text-xs text-black/45">
        Live data · refreshes from database on each visit · password does not expire
      </p>
    </div>

    <p
      v-if="errorMessage"
      class="mx-auto mb-4 max-w-lg rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <div v-if="loading" class="text-center text-sm text-black/50">
      Loading share link…
    </div>

    <div v-else-if="meta && !unlocked" class="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <h2 class="text-lg font-bold text-black">
        Enter password
      </h2>
      <p class="mt-2 text-sm text-black/60">
        This export is password protected. Enter the password shared with you to view and download the data.
      </p>

      <form class="mt-5" @submit.prevent="onVerify">
        <label class="block text-xs font-semibold uppercase tracking-wide text-black/50">
          Password
        </label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="mt-2 h-11 w-full rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-orange-100"
          placeholder="Enter share password"
        >
        <button
          type="submit"
          class="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-brand-primary text-sm font-bold text-white hover:bg-brand-primary-dark disabled:opacity-60"
          :disabled="verifying"
        >
          {{ verifying ? 'Verifying…' : 'View data' }}
        </button>
      </form>
    </div>

    <div v-else-if="meta && unlocked && preview" class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-black/60">
          {{ meta.rowCount.toLocaleString('en-IN') }} rows · live from database
        </p>
        <button
          type="button"
          class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-dark disabled:opacity-60"
          :disabled="downloading"
          @click="onDownload"
        >
          {{ downloading ? 'Downloading…' : 'Download CSV' }}
        </button>
      </div>

      <div class="overflow-hidden rounded-xl border border-black/10 bg-white">
        <div class="overflow-auto">
          <table class="min-w-full text-left text-xs sm:text-sm">
            <thead class="border-b border-black/10 bg-[#fafafa] text-[11px] uppercase tracking-wide text-black/50">
              <tr>
                <th
                  v-for="header in preview.headers"
                  :key="header"
                  class="whitespace-nowrap px-3 py-2 font-semibold"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in preview.rows"
                :key="rowIndex"
                class="border-b border-black/5"
              >
                <td
                  v-for="(cell, cellIndex) in row"
                  :key="cellIndex"
                  class="whitespace-nowrap px-3 py-2 text-black/80"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
