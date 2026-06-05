export type ToastType = 'success' | 'error' | 'info'

export type AdminToast = {
  id: number
  type: ToastType
  message: string
}

export function useAdminToast() {
  const toasts = useState<AdminToast[]>('admin-toasts', () => [])
  let nextId = 1

  function push(type: ToastType, message: string, durationMs = 4000) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, type, message }]
    if (import.meta.client) {
      setTimeout(() => dismiss(id), durationMs)
    }
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
    dismiss,
  }
}
