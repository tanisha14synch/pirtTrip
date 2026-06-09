import type { LeadStatus } from '~/types/database'
import { logAdminAction } from '~/lib/admin-audit'
import { applyPartnerLeadSearch } from '~/lib/partner-lead-search'
import { getSupabaseAdmin, requireAdminWith2fa } from '~/lib/supabase'

function escapeCsv(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminWith2fa(event)

  const query = getQuery(event)
  const search = String(
    Array.isArray(query.search) ? query.search[0] ?? '' : query.search ?? '',
  ).trim()
  const status = String(query.status ?? '').trim() as LeadStatus | ''

  const admin = getSupabaseAdmin()
  let builder = admin.from('partner_leads').select('*')

  if (status) builder = builder.eq('status', status)
  builder = applyPartnerLeadSearch(builder, search)

  const { data, error } = await builder.order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const headers = [
    'id',
    'first_name',
    'last_name',
    'business_name',
    'phone',
    'email',
    'otp_verified',
    'status',
    'source_page',
    'notes',
    'created_at',
    'updated_at',
  ]

  const rows = (data ?? []).map((row) =>
    headers.map((h) => escapeCsv(row[h as keyof typeof row])).join(','),
  )

  const csv = [headers.join(','), ...rows].join('\n')

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="partner-leads.csv"')

  await logAdminAction(event, {
    adminId: adminUser.id,
    action: 'VENDORS_EXPORTED',
    resourceType: 'partner_leads',
    metadata: { count: (data ?? []).length, search, status },
  })

  return csv
})
