import type {
  LeadStatus,
  LeadsListQuery,
  LeadsListResponse,
  PartnerLead,
} from '~/types/database'

interface LeadDetailResponse {
  lead: PartnerLead
  activity: Array<{
    id: string
    action: string
    old_value: string | null
    new_value: string | null
    admin_id: string | null
    created_at: string
  }>
  otpLogs: Array<{
    id: string
    phone: string
    otp_sent_at: string | null
    verified_at: string | null
    attempts: number
    is_verified: boolean
    created_at: string
  }>
}

export function useAdminLeads() {
  const auth = useAuth()
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function fetchLeads(params: LeadsListQuery = {}): Promise<LeadsListResponse> {
    loading.value = true
    errorMessage.value = null

    try {
      return await $fetch<LeadsListResponse>(apiUrl('/api/admin/leads'), {
        headers: auth.getAuthHeaders(),
        query: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          search: params.search ?? '',
          status: params.status ?? '',
          sortBy: params.sortBy ?? 'created_at',
          sortOrder: params.sortOrder ?? 'desc',
        },
      })
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to load leads'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchLead(id: string): Promise<LeadDetailResponse> {
    loading.value = true
    errorMessage.value = null

    try {
      return await $fetch<LeadDetailResponse>(apiUrl(`/api/admin/leads/${id}`), {
        headers: auth.getAuthHeaders(),
      })
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to load lead'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLead(
    id: string,
    payload: { status?: LeadStatus; notes?: string | null },
  ) {
    loading.value = true
    errorMessage.value = null

    try {
      return await $fetch(apiUrl(`/api/admin/leads/${id}`), {
        method: 'PATCH',
        headers: auth.getAuthHeaders(),
        body: payload,
      })
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to update lead'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteLead(id: string) {
    loading.value = true
    errorMessage.value = null

    try {
      return await $fetch(apiUrl(`/api/admin/leads/${id}`), {
        method: 'DELETE',
        headers: auth.getAuthHeaders(),
      })
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to delete lead'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function exportCsv(params: { search?: string; status?: string } = {}) {
    const headers = auth.getAuthHeaders()
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)

    const url = apiUrl(`/api/admin/leads/export?${query.toString()}`)
    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error('Export failed')
    }

    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.download = `partner-leads-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(downloadUrl)
  }

  return {
    loading,
    errorMessage,
    fetchLeads,
    fetchLead,
    updateLead,
    deleteLead,
    exportCsv,
  }
}
