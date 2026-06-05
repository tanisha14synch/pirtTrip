<script setup lang="ts">
definePageMeta({ ssr: false })

const dashboard = useAdminDashboard()

onMounted(() => dashboard.fetchStats())

const cards = computed(() => {
  const s = dashboard.stats.value
  if (!s) return []
  return [
    { label: 'Total Registrations', value: s.totalRegistrations, accent: 'red' as const },
    { label: 'Total Businesses', value: s.totalBusinesses, accent: 'blue' as const },
    { label: 'Active Vendors', value: s.activeVendors, hint: 'Status: ONBOARDED', accent: 'green' as const },
    { label: 'Pending Approvals', value: s.pendingApprovals, hint: 'Status: NEW', accent: 'amber' as const },
    { label: 'Total Leads', value: s.totalLeads, accent: 'blue' as const },
    { label: "Today's Registrations", value: s.todayRegistrations, accent: 'red' as const },
  ]
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold">
        Dashboard
      </h1>
      <p class="mt-1 text-sm text-black/60 dark:text-white/60">
        Overview of partner registrations and vendor activity.
      </p>
    </div>

    <p
      v-if="dashboard.errorMessage"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ dashboard.errorMessage }}
    </p>

    <div v-if="dashboard.loading && !dashboard.stats" class="py-16 text-center text-black/50">
      Loading dashboard…
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        v-for="card in cards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :hint="card.hint"
        :accent="card.accent"
      />
    </div>

    <div class="mt-8 rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1e1b18]">
      <h2 class="text-lg font-bold">
        Quick actions
      </h2>
      <div class="mt-4 flex flex-wrap gap-3">
        <NuxtLink
          to="/vendors"
          class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-dark"
        >
          View all businesses
        </NuxtLink>
        <NuxtLink
          to="/vendors?status=NEW"
          class="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
        >
          Pending approvals
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
