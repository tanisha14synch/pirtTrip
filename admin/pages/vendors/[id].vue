<script setup lang="ts">
import type { LeadStatus, PartnerLead } from '~/types/database'

definePageMeta({ ssr: false })

const route = useRoute()
const {
  loading: leadsLoading,
  errorMessage: leadsError,
  fetchLead,
  updateLead,
  deleteLead,
} = useAdminLeads()
const toast = useAdminToast()

const lead = ref<PartnerLead | null>(null)
const activity = ref<Array<{
  id: string
  action: string
  old_value: string | null
  new_value: string | null
  created_at: string
}>>([])
const otpLogs = ref<Array<{
  id: string
  otp_sent_at: string | null
  verified_at: string | null
  attempts: number
  is_verified: boolean
  created_at: string
}>>([])

const editStatus = ref<LeadStatus>('NEW')
const editNotes = ref('')
const saving = ref(false)
const confirmOpen = ref(false)
const confirmLoading = ref(false)

const statusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'ONBOARDED', 'REJECTED', 'SUSPENDED']

async function load() {
  const res = await fetchLead(String(route.params.id))
  lead.value = res.lead
  activity.value = res.activity
  otpLogs.value = res.otpLogs
  editStatus.value = res.lead.status
  editNotes.value = res.lead.notes ?? ''
}

async function save() {
  if (!lead.value) return
  saving.value = true
  try {
    await updateLead(lead.value.id, {
      status: editStatus.value,
      notes: editNotes.value || null,
    })
    toast.success('Vendor updated')
    await load()
  } catch {
    toast.error(leadsError.value || 'Update failed')
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!lead.value) return
  confirmLoading.value = true
  try {
    const result = await deleteLead(lead.value.id) as { message?: string }
    toast.success(result?.message || 'Vendor deleted from database')
    await navigateTo('/vendors')
  } catch {
    toast.error(leadsError.value || 'Delete failed')
  } finally {
    confirmLoading.value = false
    confirmOpen.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function ownerName(l: PartnerLead) {
  return `${l.first_name} ${l.last_name}`.trim()
}

const fields = computed(() => {
  if (!lead.value) return []
  const l = lead.value
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Business name', value: l.business_name || '—' },
    { label: 'Owner name', value: ownerName(l) },
    { label: 'Mobile', value: l.phone },
  ]

  if (l.email?.trim()) {
    rows.push({ label: 'Email', value: l.email.trim() })
  }

  rows.push(
    { label: 'OTP verified', value: l.otp_verified ? 'Yes' : 'No' },
    { label: 'Status', value: l.status },
    { label: 'Source page', value: 'Business' },
    { label: 'Registered', value: formatDate(l.created_at) },
    { label: 'Last updated', value: formatDate(l.updated_at) },
    { label: 'Lead ID', value: l.id },
  )

  return rows
})

onMounted(load)
</script>

<template>
  <div v-if="leadsLoading && !lead" class="py-16 text-center text-black/50">
    Loading vendor…
  </div>

  <div v-else-if="lead">
    <NuxtLink to="/vendors" class="text-sm font-medium text-brand-primary hover:underline">
      ← Back to businesses
    </NuxtLink>

    <div class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold">
          {{ ownerName(lead) }}
        </h1>
        <p class="mt-1 text-black/60">
          {{ lead.business_name || 'No business name' }} · {{ lead.phone }}
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <AdminStatusBadge :status="lead.status" />
          <AdminStatusBadge :verified="lead.otp_verified" status="" />
        </div>
      </div>
      <AdminBusinessActionButtons
        :phone="lead.phone"
        :name="ownerName(lead)"
        :business="lead.business_name"
        @delete="confirmOpen = true"
      />
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <section class="rounded-xl border border-black/10 bg-white p-6">
        <h2 class="text-lg font-bold">
          Registration details
        </h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div v-for="f in fields" :key="f.label" class="grid grid-cols-3 gap-2 border-b border-black/5 pb-2">
            <dt class="text-black/50">
              {{ f.label }}
            </dt>
            <dd class="col-span-2 break-words font-medium">
              {{ f.value }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="rounded-xl border border-black/10 bg-white p-6">
        <h2 class="text-lg font-bold">
          Manage vendor
        </h2>
        <div class="mt-4 space-y-4">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase text-black/50">Status</label>
            <select
              v-model="editStatus"
              class="h-10 w-full rounded-lg border border-black/15 px-3 text-sm"
            >
              <option v-for="s in statusOptions" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase text-black/50">Notes</label>
            <textarea
              v-model="editNotes"
              rows="5"
              class="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand-primary"
              placeholder="Internal notes…"
            />
          </div>
          <button
            type="button"
            :disabled="saving"
            class="h-9 rounded-lg bg-brand-primary px-6 text-sm font-bold text-white disabled:opacity-60"
            @click="save"
          >
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </section>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <section class="rounded-xl border border-black/10 bg-white p-6">
        <h2 class="text-lg font-bold">
          OTP history
        </h2>
        <ul v-if="otpLogs.length" class="mt-4 space-y-3 text-sm">
          <li
            v-for="log in otpLogs"
            :key="log.id"
            class="rounded-lg border border-black/5 px-3 py-2"
          >
            <p>Sent: {{ log.otp_sent_at ? formatDate(log.otp_sent_at) : '—' }}</p>
            <p>Verified: {{ log.verified_at ? formatDate(log.verified_at) : '—' }}</p>
            <p>Attempts: {{ log.attempts }} · {{ log.is_verified ? 'Verified' : 'Pending' }}</p>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-black/50">
          No OTP logs for this phone.
        </p>
      </section>

      <section class="rounded-xl border border-black/10 bg-white p-6">
        <h2 class="text-lg font-bold">
          Activity timeline
        </h2>
        <ul v-if="activity.length" class="mt-4 space-y-3">
          <li
            v-for="item in activity"
            :key="item.id"
            class="border-l-2 border-brand-primary pl-4 text-sm"
          >
            <p class="font-medium">
              {{ item.action }}
            </p>
            <p v-if="item.old_value || item.new_value" class="text-black/60">
              {{ item.old_value }} → {{ item.new_value }}
            </p>
            <p class="text-xs text-black/40">
              {{ formatDate(item.created_at) }}
            </p>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-black/50">
          No activity yet.
        </p>
      </section>
    </div>

    <AdminConfirmModal
      :open="confirmOpen"
      title="Delete"
      :message="`Permanently delete ${ownerName(lead)} (${lead.phone})? All registration and OTP data will be removed from the database. This cannot be undone.`"
      confirm-label="Delete permanently"
      danger
      :loading="confirmLoading"
      @cancel="confirmOpen = false"
      @confirm="remove"
    />
  </div>
</template>
