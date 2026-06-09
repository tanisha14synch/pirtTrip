import type {
  WaitlistListQuery,
  WaitlistListResponse,
} from '~/types/database'

export function useAdminWaitlist() {
  const auth = useAdminAuth()
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function fetchWaitlist(params: WaitlistListQuery = {}): Promise<WaitlistListResponse> {
    loading.value = true
    errorMessage.value = null
    try {
      return await $fetch<WaitlistListResponse>(apiUrl('/api/admin/waitlist'), {
        headers: auth.getAuthHeaders(),
        query: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          search: params.search ?? '',
          sortBy: params.sortBy ?? 'created_at',
          sortOrder: params.sortOrder ?? 'desc',
          otpVerified: params.otpVerified ?? '',
        },
      })
    } catch (err: unknown) {
      errorMessage.value = parseFetchError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    fetchWaitlist,
  }
}

function parseFetchError(err: unknown): string {
  const e = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
  return e?.data?.statusMessage || e?.statusMessage || e?.message || 'Request failed'
}
