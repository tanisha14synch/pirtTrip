export type AdminTheme = 'light' | 'dark'

export function useAdminTheme() {
  const theme = useState<AdminTheme>('admin-theme', () => 'light')

  function applyTheme(value: AdminTheme) {
    theme.value = value
    if (import.meta.client) {
      localStorage.setItem('admin-theme', value)
      document.documentElement.classList.toggle('dark', value === 'dark')
    }
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function initTheme() {
    if (!import.meta.client) return
    const saved = localStorage.getItem('admin-theme') as AdminTheme | null
    applyTheme(saved === 'dark' ? 'dark' : 'light')
  }

  return { theme, applyTheme, toggleTheme, initTheme }
}
