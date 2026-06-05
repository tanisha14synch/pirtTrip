export default defineEventHandler(async (event) => {
  await requireAdminWith2fa(event)

  const admin = getSupabaseAdmin()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayIso = todayStart.toISOString()

  const [
    totalRes,
    activeRes,
    pendingRes,
    todayRes,
    verifiedRes,
    suspendedRes,
  ] = await Promise.all([
    admin.from('partner_leads').select('id', { count: 'exact', head: true }),
    admin.from('partner_leads').select('id', { count: 'exact', head: true }).eq('status', 'ONBOARDED'),
    admin.from('partner_leads').select('id', { count: 'exact', head: true }).eq('status', 'NEW'),
    admin.from('partner_leads').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    admin.from('partner_leads').select('id', { count: 'exact', head: true }).eq('otp_verified', true),
    admin.from('partner_leads').select('id', { count: 'exact', head: true }).eq('status', 'SUSPENDED'),
  ])

  const total = totalRes.count ?? 0

  return {
    totalRegistrations: total,
    totalBusinesses: total,
    activeVendors: activeRes.count ?? 0,
    pendingApprovals: pendingRes.count ?? 0,
    totalLeads: total,
    todayRegistrations: todayRes.count ?? 0,
    verifiedRegistrations: verifiedRes.count ?? 0,
    suspendedAccounts: suspendedRes.count ?? 0,
  }
})
