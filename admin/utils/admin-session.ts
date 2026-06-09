import type { AdminUser } from '~/types/database'

const ACCESS_TOKEN_KEY = 'pirttrip_admin_access_token'
const REFRESH_TOKEN_KEY = 'pirttrip_admin_refresh_token'
const USER_KEY = 'pirttrip_admin_user'

export type StoredAdminSession = {
  accessToken: string
  refreshToken: string
  user: AdminUser
}

export function saveAdminSession(session: StoredAdminSession): void {
  if (!import.meta.client) return
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function loadAdminSession(): StoredAdminSession | null {
  if (!import.meta.client) return null

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)?.trim()
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)?.trim()
  const rawUser = localStorage.getItem(USER_KEY)
  if (!accessToken || !refreshToken || !rawUser) return null

  try {
    const user = JSON.parse(rawUser) as AdminUser
    if (!user?.id) return null
    return { accessToken, refreshToken, user }
  } catch {
    return null
  }
}

export function clearAdminSession(): void {
  if (!import.meta.client) return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
