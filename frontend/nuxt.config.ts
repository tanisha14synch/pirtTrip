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

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  runtimeConfig: {
    apiProxyOrigin: apiOrigin,
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '',
      // When false (default), browser calls same-origin /api (server proxies to API_URL).
      apiDirect: process.env.NUXT_PUBLIC_API_DIRECT === 'true',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
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
  routeRules: {
    '/how-it-works': { redirect: { to: '/business', statusCode: 301 } },
    '/become-a-partner': { redirect: { to: '/business', statusCode: 301 } },
    '/admin/**': { ssr: false },
  },
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
