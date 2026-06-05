import { z } from 'zod'
import type { H3Event } from 'h3'
import { partnerRegistrationSchema } from '~/utils/validation'
import { normalizePhone } from '~/utils/phone'
import { getSupabaseAdmin } from './supabase-admin'
import { insertPartnerLead } from './partner-lead-insert'
import { logPartnerRegistrationSideEffects } from './partner-registration-logs'
import {
  assertPartnerPhoneAvailable,
  sendPartnerPhoneOtp,
  verifyPartnerPhoneOtp,
} from './phone-otp'

const sendBodySchema = partnerRegistrationSchema.extend({
  challengeToken: z.string().optional(),
})

const resendBodySchema = partnerRegistrationSchema.extend({
  challengeToken: z.string().min(1, 'Verification session expired. Submit the form again.'),
})

const verifyBodySchema = partnerRegistrationSchema.extend({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
  challengeToken: z.string().min(1, 'Verification session expired. Request a new code.'),
})

function parsePhone(raw: string): string {
  try {
    return normalizePhone(raw)
  } catch (e: unknown) {
    throw createError({
      statusCode: 400,
      statusMessage: e instanceof Error ? e.message : 'Invalid phone number',
    })
  }
}

export async function handlePartnerOtpSend(event: H3Event) {
  const body = await readBody(event)
  const parsed = sendBodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid form',
    })
  }

  const phone = parsePhone(parsed.data.phone)
  const admin = getSupabaseAdmin()
  await assertPartnerPhoneAvailable(admin, phone)
  const result = await sendPartnerPhoneOtp(admin, phone)

  return { success: true, ...result }
}

export async function handlePartnerOtpResend(event: H3Event) {
  const body = await readBody(event)
  const parsed = resendBodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid request',
    })
  }

  const phone = parsePhone(parsed.data.phone)
  const admin = getSupabaseAdmin()
  await assertPartnerPhoneAvailable(admin, phone)
  const result = await sendPartnerPhoneOtp(admin, phone)

  return { success: true, ...result }
}

export async function handlePartnerOtpVerify(event: H3Event) {
  const body = await readBody(event)
  const parsed = verifyBodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.errors[0]?.message ?? 'Invalid request',
    })
  }

  const phone = parsePhone(parsed.data.phone)
  const admin = getSupabaseAdmin()

  await verifyPartnerPhoneOtp(admin, phone, parsed.data.code, parsed.data.challengeToken)
  await assertPartnerPhoneAvailable(admin, phone)

  const email = parsed.data.email?.trim().toLowerCase() || null

  const { data: lead, error: leadError } = await insertPartnerLead(admin, {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    businessName: parsed.data.businessName,
    phone,
    email,
    whatsappOptIn: parsed.data.whatsappOptIn,
    otpVerified: true,
  })

  if (leadError || !lead) {
    const msg = leadError?.message ?? 'Failed to save registration'
    throw createError({
      statusCode: 500,
      statusMessage: msg,
      message: msg,
    })
  }

  await logPartnerRegistrationSideEffects(admin, lead.id, phone)

  return { success: true, lead }
}

export function isPartnerOtpApiPath(path: string): boolean {
  return path === '/api/partner/send-otp'
    || path === '/api/partner/resend-otp'
    || path === '/api/partner/verify-otp'
}
