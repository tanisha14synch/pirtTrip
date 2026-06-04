import type { LeadStatus } from '~/types/database'

export default defineEventHandler(async (event) => {
  await requireAdminWith2fa(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20))
  const search = String(query.search ?? '').trim()
  const status = String(query.status ?? '').trim() as LeadStatus | ''
  const sortBy = String(query.sortBy ?? 'created_at')
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'

  const allowedSort = ['created_at', 'updated_at', 'first_name', 'status']
  const orderColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at'

  const admin = getSupabaseAdmin()
  let builder = admin
    .from('partner_leads')
    .select('*', { count: 'exact' })

  if (status) {
    builder = builder.eq('status', status)
  }

  if (search) {
    builder = builder.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,business_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`,
    )
  }

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
