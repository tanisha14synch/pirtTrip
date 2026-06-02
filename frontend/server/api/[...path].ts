import { proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isProd = process.env.NODE_ENV === 'production'
  const origin = (
    (config.apiProxyOrigin as string)
    || process.env.API_URL
    || process.env.NUXT_API_PROXY_ORIGIN
    || (!isProd ? 'http://127.0.0.1:3001' : '')
  )
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/, '')

  if (!origin) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API proxy is not configured. Set API_URL on frontend service.',
    })
  }

  const target = `${origin}${event.path}`
  return proxyRequest(event, target)
})
