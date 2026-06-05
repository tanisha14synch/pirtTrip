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
  const auth = useAuth()
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
      errorMessage.value = err instanceof Error ? err.message : 'Failed to load dashboard'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, errorMessage, stats, fetchStats }
}
