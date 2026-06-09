export default defineNitroPlugin(() => {
  const isProd = process.env.NODE_ENV === 'production'
  const apiOrigin = process.env.API_URL?.trim() || process.env.NUXT_API_PROXY_ORIGIN?.trim() || ''

  console.info('[pirttrip-admin] nitro listening', {
    host: process.env.HOST || process.env.NITRO_HOST || '0.0.0.0',
    port: process.env.PORT || '3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    apiConfigured: Boolean(apiOrigin) || !isProd,
  })

  if (isProd && !apiOrigin) {
    console.warn('[pirttrip-admin] API_URL is not set — /api proxy will fail until configured')
  }
})
