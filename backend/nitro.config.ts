import { fileURLToPath } from 'node:url'
import { defineNitroConfig } from 'nitropack/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineNitroConfig({
  rootDir,
  compatibilityDate: '2025-07-15',
  cors: true,
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  },
  runtimeConfig: {
    // Support common env aliases to avoid production outages from variable name drift.
    supabaseServiceRoleKey: '',
    otpSecret: '',
    resendApiKey: '',
    emailFrom: 'PirtTrip <onboarding@resend.dev>',
    aquasmsApiKey: '',
    aquasmsUsername: 'pirttrip',
    aquasmsSenderName: 'MARSTP',
    aquasmsSmsType: 'TRANS',
    aquasmsBaseUrl: 'http://login.aquasms.com/sendSMS',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '587',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY
        || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
        || '',
    },
  },
  alias: {
    '~': rootDir,
  },
})
