export default defineEventHandler(() => ({
  ok: true,
  service: 'pirt-trip-api',
  message: 'API is running. Use /api/health or /api/waitlist/send-otp.',
  docs: {
    health: '/api/health',
    waitlist: '/api/waitlist/send-otp',
    partner: '/api/partner/send-otp',
    admin: '/api/admin/me',
  },
}))
