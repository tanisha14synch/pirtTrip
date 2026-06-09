export type DashboardStats = {
  totalRegistrations: number
  totalBusinesses: number
  activeVendors: number
  pendingApprovals: number
  totalLeads: number
  todayRegistrations: number
  verifiedRegistrations: number
  suspendedAccounts: number
}

export function useAdminDashboard() {
  const auth = useAdminAuth()
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const stats = ref<DashboardStats | null>(null)

  async function fetchStats() {
    loading.value = true
    errorMessage.value = null
    try {
      stats.value = await $fetch<DashboardStats>(apiUrl('/api/admin/dashboard/stats'), {
        headers: auth.getAuthHeaders(),
      })
    } catch (err: unknown) {
      const e = err as { data?: { statusMessage?: string }; message?: string }
      errorMessage.value = e?.data?.statusMessage || e?.message || 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  return { loading, errorMessage, stats, fetchStats }
}
