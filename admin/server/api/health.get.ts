import { resolveAdminApiOrigin } from '~/utils/api-origin'

export default defineEventHandler(() => {
  const isProd = process.env.NODE_ENV === 'production'
  const apiOrigin = resolveAdminApiOrigin(isProd, {
    bakedOrigin: useRuntimeConfig().apiProxyOrigin as string,
  })

  return {
    ok: true,
    service: 'pirttrip-admin',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    port: process.env.PORT || null,
    host: process.env.HOST || process.env.NITRO_HOST || null,
    nodeEnv: process.env.NODE_ENV || null,
    apiOriginConfigured: Boolean(apiOrigin),
    apiOrigin: isProd ? (apiOrigin || null) : apiOrigin,
  }
})
