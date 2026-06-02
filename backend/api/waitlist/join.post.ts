import { z } from 'zod'
import { getSupabaseAdmin } from '~/lib/supabase'

const bodySchema = z.object({
  email: z.string().email('Invalid email address'),
})

/** Temporary: join waitlist without OTP (re-enable OTP flow when email is configured). */
export default defineEventHandler(async (event) => {
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
