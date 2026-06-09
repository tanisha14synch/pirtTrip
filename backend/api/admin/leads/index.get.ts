import { applyPartnerLeadSearch, parseLeadStatusFilter } from '~/lib/partner-lead-search'
import { queryParamFirst } from '~/lib/query-params'
import { getSupabaseAdmin, requireAdminWith2fa } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  await requireAdminWith2fa(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20))
  const search = queryParamFirst(query.search)
  const statusFilter = parseLeadStatusFilter(query.status)
  const sortBy = queryParamFirst(query.sortBy) || 'created_at'
  const sortOrder = queryParamFirst(query.sortOrder) === 'asc' ? 'asc' : 'desc'
  const dateFrom = queryParamFirst(query.dateFrom)
  const dateTo = queryParamFirst(query.dateTo)
  const otpVerified = queryParamFirst(query.otpVerified)

  const allowedSort = ['created_at', 'updated_at', 'first_name', 'business_name', 'phone', 'status']
  const orderColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at'

  const admin = getSupabaseAdmin()
  let builder = admin
    .from('partner_leads')
    .select('*', { count: 'exact' })

  if (statusFilter) {
    builder = builder.eq('status', statusFilter)
  }

  if (otpVerified === 'true') {
    builder = builder.eq('otp_verified', true)
  } else if (otpVerified === 'false') {
    builder = builder.eq('otp_verified', false)
  }

  if (dateFrom) {
    builder = builder.gte('created_at', dateFrom)
  }

  if (dateTo) {
    const end = dateTo.includes('T') ? dateTo : `${dateTo}T23:59:59.999Z`
    builder = builder.lte('created_at', end)
  }

  builder = applyPartnerLeadSearch(builder, search)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await builder
    .order(orderColumn, { ascending: sortOrder === 'asc' })
    .range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  }
})
