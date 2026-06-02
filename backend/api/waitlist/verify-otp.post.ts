import { z } from 'zod'
import { verifyEmailOtp } from '~/lib/email-otp-service'

const bodySchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
  challengeToken: z.string().min(1, 'Verification session expired. Request a new code.'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid request',
    })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const code = parsed.data.code

  await verifyEmailOtp({
    email,
    purpose: 'waitlist',
    code,
    challengeToken: parsed.data.challengeToken,
  })

  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('waitlist_subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return { success: true, alreadyRegistered: true }
  }

  const { data, error } = await admin
    .from('waitlist_subscribers')
    .insert({
      email,
      otp_verified: true,
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
