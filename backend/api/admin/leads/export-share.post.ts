import { z } from 'zod'
import { logAdminAction } from '~/lib/admin-audit'
import { buildCsvShareUrl } from '~/lib/admin-site-url'
import {
  generateShareToken,
  hashSharePassword,
} from '~/lib/csv-share'
import { fetchAllPartnerLeadsForExport } from '~/lib/partner-leads-csv'
import { getSupabaseAdmin, requireAdminWith2fa } from '~/lib/supabase'
import { zodErrorMessage } from '~/lib/validation'

const bodySchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  label: z.string().max(120).optional(),
})

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminWith2fa(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error),
      data: { code: 'INVALID_REQUEST' },
    })
  }

  const leads = await fetchAllPartnerLeadsForExport()
  const rowCount = leads.length
  const token = generateShareToken()

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('admin_csv_shares')
    .insert({
      token,
      password_hash: hashSharePassword(parsed.data.password),
      csv_content: null,
      row_count: rowCount,
      label: parsed.data.label?.trim() || 'Live vendor export',
      created_by: adminUser.id,
      expires_at: null,
    })
    .select('id, token, row_count, label, created_at')
    .single()

  if (error) {
    throw createError({
      statusCode: error.code === '42P01' ? 503 : 500,
      statusMessage: error.code === '42P01'
        ? 'CSV share is not available. Run database migrations.'
        : error.message,
      data: { code: 'SHARE_CREATE_FAILED' },
    })
  }

  await logAdminAction(event, {
    adminId: adminUser.id,
    action: 'VENDORS_EXPORT_SHARE_CREATED',
    resourceType: 'admin_csv_shares',
    resourceId: data.id,
    metadata: { rowCount, live: true },
  })

  return {
    success: true,
    token: data.token,
    shareUrl: buildCsvShareUrl(data.token),
    rowCount: data.row_count,
    label: data.label,
    createdAt: data.created_at,
    live: true,
  }
})
