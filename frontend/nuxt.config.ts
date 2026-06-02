// https://nuxt.com/docs/api/configuration/nuxt-config
const apiUrl =
  process.env.NUXT_PUBLIC_API_URL
  || process.env.API_URL
  || process.env.NUXT_PUBLIC_API_BASE_URL
  || ''

const normalizedApiOrigin = (apiUrl || 'http://127.0.0.1:3001')
  .replace(/\/$/, '')
  .replace(/\/api$/, '')
const devApiTarget = `${normalizedApiOrigin}/api`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  runtimeConfig: {
    apiProxyOrigin:
      process.env.API_URL
      || process.env.NUXT_PUBLIC_API_URL
      || process.env.NUXT_PUBLIC_API_BASE_URL
      || '',
    public: {
      apiUrl,
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
    '/how-it-works': { redirect: { to: '/become-a-partner', statusCode: 301 } },
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
