import { z } from 'zod'
import { createAndSendOtp } from '~/lib/email-otp-service'
import { partnerRegistrationSchema } from '~/lib/validation'
import { normalizePhone } from '~/lib/phone'

const bodySchema = partnerRegistrationSchema.extend({
  challengeToken: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid form',
    })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const phone = normalizePhone(parsed.data.phone)
  const admin = getSupabaseAdmin()

  const { data: existing } = await admin
    .from('partner_leads')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This phone number is already registered',
    })
  }

  const result = await createAndSendOtp({
    email,
    purpose: 'partner_registration',
    challengeToken: parsed.data.challengeToken,
    metadata: {
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      businessName: parsed.data.businessName.trim(),
      phone,
    },
  })

  return {
    success: true,
    email,
    challengeToken: result.challengeToken,
    expiresInSeconds: result.expiresInSeconds,
    resendCooldownSeconds: result.resendCooldownSeconds,
    ...('debugCode' in result ? { debugCode: result.debugCode } : {}),
  }
})
