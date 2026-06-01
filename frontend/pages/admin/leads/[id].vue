<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const route = useRoute()
const leadsApi = useAdminLeads()

const lead = ref(null)
const activity = ref([])
const otpLogs = ref([])
const editStatus = ref('')
const editNotes = ref('')
const saving = ref(false)
const message = ref(null)

const statusOptions = ['NEW', 'CONTACTED', 'QUALIFIED', 'ONBOARDED', 'REJECTED']

async function load() {
  const id = String(route.params.id)
  const res = await leadsApi.fetchLead(id)
  lead.value = res.lead
  activity.value = res.activity
  otpLogs.value = res.otpLogs
  editStatus.value = res.lead.status
  editNotes.value = res.lead.notes ?? ''
}

async function save() {
  if (!lead.value) return
  saving.value = true
  message.value = null
  try {
    await leadsApi.updateLead(lead.value.id, {
      status: editStatus.value,
      notes: editNotes.value || null,
    })
    message.value = 'Lead updated successfully'
    await load()
  } catch {
    message.value = leadsApi.errorMessage.value ?? 'Update failed'
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!lead.value) return
  if (!confirm('Delete this lead permanently?')) return
  await leadsApi.deleteLead(lead.value.id)
  await navigateTo('/admin')
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

onMounted(load)
</script>

<template>
  <div v-if="leadsApi.loading && !lead" class="py-12 text-center text-black/50">
    Loading…
  </div>

  <div v-else-if="lead">
  <NuxtLink to="/admin" class="text-sm font-medium text-[#F76517] hover:underline">
    ← Back to leads
  </NuxtLink>

  <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 class="font-plein text-2xl font-bold">
        {{ lead.first_name }} {{ lead.last_name }}
      </h1>
      <p class="mt-1 text-black/60">
        {{ lead.phone }}
        <span v-if="lead.email"> · {{ lead.email }}</span>
      </p>
      <p class="mt-2 text-sm text-black/50">
        Registered {{ formatDate(lead.created_at) }}
        · Source: {{ lead.source_page }}
        · OTP: {{ lead.otp_verified ? 'Verified' : 'Not verified' }}
      </p>
    </div>
    <button
      type="button"
      class="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      @click="remove"
    >
      Delete lead
    </button>
  </div>

  <p
    v-if="message"
    class="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
  >
    {{ message }}
  </p>

  <div class="mt-8 grid gap-8 lg:grid-cols-2">
    <section class="rounded-xl border border-black/10 bg-white p-6">
      <h2 class="font-plein text-lg font-bold">
        Manage lead
      </h2>
      <div class="mt-4 space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Status</label>
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
          <label class="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            v-model="editNotes"
            rows="5"
            class="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[#F3A81A]"
            placeholder="Internal notes…"
          />
        </div>
        <button
          type="button"
          :disabled="saving"
          class="h-10 rounded-lg bg-[#F3A81A] px-6 font-plein text-sm font-bold text-white disabled:opacity-60"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </section>

    <section class="rounded-xl border border-black/10 bg-white p-6">
      <h2 class="font-plein text-lg font-bold">
        OTP history
      </h2>
      <ul v-if="otpLogs.length" class="mt-4 space-y-3 text-sm">
        <li
          v-for="log in otpLogs"
          :key="log.id"
          class="rounded-lg border border-black/5 px-3 py-2"
        >
          <p>
            Sent: {{ log.otp_sent_at ? formatDate(log.otp_sent_at) : '—' }}
          </p>
          <p>
            Verified: {{ log.verified_at ? formatDate(log.verified_at) : '—' }}
          </p>
          <p>Attempts: {{ log.attempts }} · {{ log.is_verified ? 'Verified' : 'Pending' }}</p>
        </li>
      </ul>
      <p v-else class="mt-4 text-sm text-black/50">
        No OTP logs for this phone.
      </p>
    </section>
  </div>

  <section class="mt-8 rounded-xl border border-black/10 bg-white p-6">
    <h2 class="font-plein text-lg font-bold">
      Activity timeline
    </h2>
    <ul v-if="activity.length" class="mt-4 space-y-3">
      <li
        v-for="item in activity"
        :key="item.id"
        class="border-l-2 border-[#F3A81A] pl-4 text-sm"
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
</template>
