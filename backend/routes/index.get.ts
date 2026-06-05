export default defineEventHandler(() => ({
  ok: true,
  service: 'pirt-trip-api',
  message: 'API is running. Use /api/health or /api/waitlist/send-otp.',
  docs: {
    health: '/api/health',
    waitlist: '/api/waitlist/send-otp',
    partner: {
      sendOtp: '/api/partner/send-otp',
      resendOtp: '/api/partner/resend-otp',
      verifyOtp: '/api/partner/verify-otp',
    },
    admin: '/api/admin/me',
  },
}))
