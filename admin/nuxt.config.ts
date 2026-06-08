const isProd = process.env.NODE_ENV === 'production'
const apiOrigin = (
  process.env.API_URL
  || process.env.NUXT_API_PROXY_ORIGIN
  || (!isProd ? 'http://127.0.0.1:3001' : '')
)
  .trim()
  .replace(/\/$/, '')
  .replace(/\/api$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  devServer: {
    port: Number(process.env.PORT || 3002),
    host: 'localhost',
  },
  vite: {
    server: { strictPort: true },
  },
  runtimeConfig: {
    apiProxyOrigin: apiOrigin,
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      mainSiteUrl: process.env.NUXT_PUBLIC_MAIN_SITE_URL || 'https://business.pirttrip.com',
      adminSiteUrl: (process.env.NUXT_PUBLIC_ADMIN_SITE_URL || 'https://admin.pirttrip.com').replace(/\/$/, ''),
    },
  },
  nitro: {
    devProxy: {
      '/api': {
        target: `${apiOrigin || 'http://127.0.0.1:3001'}/api`,
        changeOrigin: true,
      },
    },
  },
  routeRules: {
    '/**': {
      ssr: false,
      headers: {
        'Permissions-Policy': 'otp-credentials=(self)',
      },
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'PirtTrip Admin',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
