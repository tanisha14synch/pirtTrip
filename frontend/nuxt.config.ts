// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'

function normalizeApiOrigin(raw: string): string {
  return raw.trim().replace(/\/$/, '').replace(/\/api$/, '')
}

function resolveApiOrigin(): string {
  const fromEnv =
    process.env.API_URL
    || process.env.NUXT_PUBLIC_API_URL
    || process.env.NUXT_PUBLIC_API_BASE_URL
    || ''
  if (fromEnv) return normalizeApiOrigin(fromEnv)
  // Local dev default when .env.development is missing
  if (!isProd) return 'http://127.0.0.1:3001'
  return ''
}

const apiOrigin = resolveApiOrigin()
const devApiTarget = `${apiOrigin || 'http://127.0.0.1:3001'}/api`

import {
  DEFAULT_DEV_PARTNER_SITE_URL,
  DEFAULT_PROD_PARTNER_SITE_URL,
} from './utils/partner-site-url'

const siteVariant = process.env.NUXT_PUBLIC_SITE_VARIANT || 'main'
const partnerSiteUrl = (process.env.NUXT_PUBLIC_PARTNER_SITE_URL || '').trim().replace(/\/$/, '')
const effectivePartnerSiteUrl = partnerSiteUrl
  || (isProd ? DEFAULT_PROD_PARTNER_SITE_URL : DEFAULT_DEV_PARTNER_SITE_URL)
const defaultPartnerHosts = 'business.pirttrip.com,business.localhost'
const partnerHosts = (process.env.NUXT_PUBLIC_PARTNER_HOSTS || defaultPartnerHosts)
  .split(',')
  .map(h => h.trim())
  .filter(Boolean)

const routeRules: Record<string, { redirect: { to: string, statusCode: number } } | { ssr: false }> = {
  '/admin/**': { ssr: false },
}

if (siteVariant === 'business') {
  routeRules['/business'] = { redirect: { to: '/', statusCode: 301 } }
  routeRules['/become-a-partner'] = { redirect: { to: '/', statusCode: 301 } }
  routeRules['/how-it-works'] = { redirect: { to: '/', statusCode: 301 } }
}
else if (effectivePartnerSiteUrl) {
  const partnerRoot = `${effectivePartnerSiteUrl}/`
  routeRules['/business'] = { redirect: { to: partnerRoot, statusCode: 301 } }
  routeRules['/become-a-partner'] = { redirect: { to: partnerRoot, statusCode: 301 } }
  routeRules['/how-it-works'] = { redirect: { to: partnerRoot, statusCode: 301 } }
}
else {
  routeRules['/how-it-works'] = { redirect: { to: '/business', statusCode: 301 } }
  routeRules['/become-a-partner'] = { redirect: { to: '/business', statusCode: 301 } }
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  runtimeConfig: {
    apiProxyOrigin: apiOrigin,
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY
      || process.env.SUPABASE_SERVICE_KEY
      || '',
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '',
      // When false (default), browser calls same-origin /api (server proxies to API_URL).
      apiDirect: process.env.NUXT_PUBLIC_API_DIRECT === 'true',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      siteVariant,
      partnerHosts,
      partnerSiteUrl: effectivePartnerSiteUrl,
      mainSiteUrl: process.env.NUXT_PUBLIC_MAIN_SITE_URL || '',
    },
  },
  nitro: {
    devProxy: {
      '/api': {
        // Nitro devProxy strips the matched prefix. Point to `/api` on backend
        // so `/api/waitlist/send-otp` stays routed to backend API handlers.
        target: devApiTarget,
        changeOrigin: true,
      },
    },
  },
  routeRules,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  tailwindcss: {
    configPath: 'tailwind.config.js',
    cssPath: '~/assets/css/main.css',
  },
})
