import { proxyRequest } from 'h3'
import { z } from 'zod'
import { getSupabaseAdmin } from '../../utils/supabase-admin'

const bodySchema = z.object({
  email: z.string().email('Invalid email address'),
})

function resolveApiOrigin(): string {
  const config = useRuntimeConfig()
  const isProd = process.env.NODE_ENV === 'production'
  return (
    (config.apiProxyOrigin as string)
    || process.env.API_URL
    || process.env.NUXT_API_PROXY_ORIGIN
    || (!isProd ? 'http://127.0.0.1:3001' : '')
  )
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/, '')
}

/** Prefer local handler when service role is set; else proxy to backend API. */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const serviceKey = (config.supabaseServiceRoleKey as string)?.trim()

  if (!serviceKey) {
    const origin = resolveApiOrigin()
    if (!origin) {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Supabase service role is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the frontend or backend Railway service.',
      })
    }
    return proxyRequest(event, `${origin}${event.path}`)
  }

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid email',
    })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('waitlist_subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This email is already on the waitlist',
    })
  }

  const { data, error } = await admin
    .from('waitlist_subscribers')
    .insert({
      email,
      otp_verified: false,
      source_page: 'home',
    })
    .select()
    .single()

  if (error) {
    const msg = error.message.includes('waitlist_subscribers')
      ? 'Waitlist table missing: run supabase/migrations/20250601000003_waitlist.sql in Supabase SQL Editor.'
      : error.message
    throw createError({ statusCode: 500, statusMessage: msg })
  }

  return { success: true, subscriber: data }
})
