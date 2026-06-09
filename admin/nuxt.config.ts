import { DEFAULT_DEV_API_URL, resolveAdminApiOrigin } from './utils/api-origin'
import { DEFAULT_PROD_SUPABASE_URL, resolveSupabasePublicConfig } from './utils/supabase-config'

const supabasePublic = resolveSupabasePublicConfig()

const isProd = process.env.NODE_ENV === 'production'
const apiOrigin = resolveAdminApiOrigin(isProd)

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
      supabaseUrl: supabasePublic.supabaseUrl || DEFAULT_PROD_SUPABASE_URL,
      supabaseAnonKey: supabasePublic.supabaseAnonKey,
      mainSiteUrl: process.env.NUXT_PUBLIC_MAIN_SITE_URL || 'https://business.pirttrip.com',
    },
  },
  nitro: {
    preset: 'node-server',
    devProxy: {
      '/api': {
        target: `${apiOrigin || DEFAULT_DEV_API_URL}/api`,
        changeOrigin: true,
      },
    },
  },
  routeRules: {
    '/**': { ssr: false },
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
