import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'
import { getSupabaseAdmin } from './supabase'

export async function logAdminAction(
  event: H3Event,
  options: {
    adminId: string | null
    action: string
    resourceType?: string
    resourceId?: string
    metadata?: Record<string, unknown>
  },
) {
  const admin = getSupabaseAdmin()
  const ip = getRequestIP(event, { xForwardedFor: true }) || null

  const { error } = await admin.from('admin_audit_logs').insert({
    admin_id: options.adminId,
    action: options.action,
    resource_type: options.resourceType ?? null,
    resource_id: options.resourceId ?? null,
    metadata: options.metadata ?? {},
    ip_address: ip,
  })

  if (error) {
    console.warn('[admin-audit] insert failed:', error.message)
  }
}

export async function recordAdminSession(
  event: H3Event,
  adminId: string,
  expiresAt: Date,
) {
  const admin = getSupabaseAdmin()
  const ip = getRequestIP(event, { xForwardedFor: true }) || null
  const userAgent = getRequestHeader(event, 'user-agent') || null

  const { error } = await admin.from('admin_sessions').insert({
    admin_id: adminId,
    expires_at: expiresAt.toISOString(),
    ip_address: ip,
    user_agent: userAgent,
  })

  if (error) {
    console.warn('[admin-session] insert failed:', error.message)
  }
}
