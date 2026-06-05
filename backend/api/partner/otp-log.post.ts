import { z } from 'zod'
import { normalizePhone } from '~/lib/phone'
import { getSupabaseAdmin, requireAuth } from '~/lib/supabase'

const bodySchema = z.object({
  phone: z.string(),
  event: z.enum(['sent', 'attempt']),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const phone = normalizePhone(parsed.data.phone)
  const admin = getSupabaseAdmin()

  if (parsed.data.event === 'sent') {
    const { error } = await admin.from('otp_logs').insert({
      phone,
      auth_user_id: user.id,
      otp_sent_at: new Date().toISOString(),
      attempts: 0,
      is_verified: false,
    })

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return { success: true }
  }

  const { data: latest } = await admin
    .from('otp_logs')
    .select('id, attempts')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latest) {
    await admin
      .from('otp_logs')
      .update({ attempts: (latest.attempts ?? 0) + 1 })
      .eq('id', latest.id)
  }

  return { success: true }
})
