import { getSupabaseAdmin, requireAdminWith2fa } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  await requireAdminWith2fa(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20))
  const search = String(query.search ?? '').trim()
  const sortBy = String(query.sortBy ?? 'created_at')
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'
  const otpVerified = String(query.otpVerified ?? '').trim()

  const allowedSort = ['created_at', 'email', 'source_page', 'otp_verified']
  const orderColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at'

  const admin = getSupabaseAdmin()
  let builder = admin
    .from('waitlist_subscribers')
    .select('id, email, otp_verified, source_page, created_at', { count: 'exact' })

  if (otpVerified === 'true') {
    builder = builder.eq('otp_verified', true)
  } else if (otpVerified === 'false') {
    builder = builder.eq('otp_verified', false)
  }

  if (search) {
    builder = builder.ilike('email', `%${search}%`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await builder
    .order(orderColumn, { ascending: sortOrder === 'asc' })
    .range(from, to)

  if (error) {
    if (error.code === '42P01' || error.message?.includes('waitlist_subscribers')) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Waitlist table missing. Run database migrations.',
        data: { code: 'WAITLIST_TABLE_MISSING' },
      })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  }
})
