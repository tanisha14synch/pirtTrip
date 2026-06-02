import { proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const origin = (
    (config.apiProxyOrigin as string)
    || process.env.API_URL
    || process.env.NUXT_API_PROXY_ORIGIN
    || ''
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
