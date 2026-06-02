import { z } from 'zod'
import { getSupabaseAdmin, requireAuth } from '~/lib/supabase'

const bodySchema = z.object({
  email: z.string().email('Invalid email address'),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid email',
    })
  }

  const email = parsed.data.email.trim().toLowerCase()

  if (user.email?.toLowerCase() !== email) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Email does not match verified session',
    })
  }

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
      auth_user_id: user.id,
      email,
      otp_verified: true,
      source_page: 'home',
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, subscriber: data }
})
