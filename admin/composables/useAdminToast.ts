export type ToastType = 'success' | 'error' | 'info'

export type AdminToast = {
  id: number
  type: ToastType
  message: string
}

function isValidToast(item: AdminToast | null | undefined): item is AdminToast {
  return Boolean(item && typeof item.id === 'number' && item.message)
}

export function useAdminToast() {
  const toasts = useState<AdminToast[]>('admin-toasts', () => [])
  const nextId = useState('admin-toast-next-id', () => 1)

  function sanitize() {
    const cleaned = toasts.value.filter(isValidToast)
    if (cleaned.length !== toasts.value.length) {
      toasts.value = cleaned
    }
  }

  function push(type: ToastType, message: string, durationMs = 4000) {
    sanitize()
    const id = nextId.value++
    toasts.value = [...toasts.value, { id, type, message }]
    if (import.meta.client) {
      setTimeout(() => dismiss(id), durationMs)
    }
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => isValidToast(t) && t.id !== id)
  }

  function clearAll() {
    toasts.value = []
  }

  const visibleToasts = computed(() => toasts.value.filter(isValidToast))

  return {
    toasts: visibleToasts,
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
    dismiss,
    clearAll,
  }
}
