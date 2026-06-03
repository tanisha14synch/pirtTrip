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
  if (!isProd) return 'http://127.0.0.1:3001'
  return ''
}

const apiOrigin = resolveApiOrigin()
const devApiTarget = `${apiOrigin || 'http://127.0.0.1:3001'}/api`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    apiProxyOrigin: apiOrigin,
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '',
      apiDirect: process.env.NUXT_PUBLIC_API_DIRECT === 'true',
      /** Main marketing site (legal pages, home logo link) */
      mainSiteUrl: process.env.NUXT_PUBLIC_MAIN_SITE_URL || 'https://www.pirttrip.com',
    },
  },
  nitro: {
    devProxy: {
      '/api': {
        target: devApiTarget,
        changeOrigin: true,
      },
    },
  },
  routeRules: {
    '/become-a-partner': { redirect: { to: '/', statusCode: 301 } },
    '/how-it-works': { redirect: { to: '/', statusCode: 301 } },
    '/business': { redirect: { to: '/', statusCode: 301 } },
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
