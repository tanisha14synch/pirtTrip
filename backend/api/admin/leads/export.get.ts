import type { LeadStatus } from '~/types/database'
import { logAdminAction } from '~/lib/admin-audit'
import { buildPartnerLeadsCsv, fetchPartnerLeadsForExport } from '~/lib/partner-leads-csv'
import { requireAdminWith2fa } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdminWith2fa(event)

  const query = getQuery(event)
  const search = String(query.search ?? '').trim()
  const status = String(query.status ?? '').trim() as LeadStatus | ''

  const data = await fetchPartnerLeadsForExport({ search, status })
  const { csv, rowCount } = buildPartnerLeadsCsv(data)

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="partner-leads.csv"')

  await logAdminAction(event, {
    adminId: adminUser.id,
    action: 'VENDORS_EXPORTED',
    resourceType: 'partner_leads',
    metadata: { count: rowCount, search, status },
  })

  return csv
})
