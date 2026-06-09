import { logAdminAction } from '~/lib/admin-audit'
import { applyPartnerLeadSearch, parseLeadStatusFilter } from '~/lib/partner-lead-search'
import { queryParamFirst } from '~/lib/query-params'
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
  const search = queryParamFirst(query.search)
  const statusFilter = parseLeadStatusFilter(query.status)

  const admin = getSupabaseAdmin()
  let builder = admin.from('partner_leads').select('*')

  if (statusFilter) builder = builder.eq('status', statusFilter)
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
    metadata: { count: (data ?? []).length, search, status: statusFilter },
  })

  return csv
})
