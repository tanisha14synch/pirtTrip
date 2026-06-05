import { z } from 'zod'
import {
  adminOtpChallengeEmail,
  completeAdminPhoneLogin,
  ensureDemoAdminLinked,
  findAdminByPhone,
  isDemoAdminLogin,
  phoneLocalDigits,
} from '~/lib/admin-auth-phone'
import { verifyEmailOtp } from '~/lib/email-otp-service'
import { normalizePhone } from '~/lib/phone'
import { zodErrorMessage } from '~/lib/validation'

const bodySchema = z.object({
  phone: z.string().trim().min(10, 'Enter a valid 10-digit mobile number'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
  challengeToken: z.string().min(1, 'Verification session expired. Request a new code.'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error),
      data: { code: 'INVALID_REQUEST' },
    })
  }

  const normalizedPhone = normalizePhone(parsed.data.phone)
  const challengeEmail = adminOtpChallengeEmail(normalizedPhone)

  if (!isDemoAdminLogin(normalizedPhone, parsed.data.code)) {
    await verifyEmailOtp({
      email: challengeEmail,
      purpose: 'admin_login',
      code: parsed.data.code,
      challengeToken: parsed.data.challengeToken,
    })
  }

  let adminUser = await findAdminByPhone(normalizedPhone)
  if (!adminUser) {
    adminUser = await ensureDemoAdminLinked(normalizedPhone)
  }

  if (!adminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
      data: { code: 'ADMIN_NOT_AUTHORIZED' },
    })
  }

  return completeAdminPhoneLogin(event, {
    phone: phoneLocalDigits(normalizedPhone),
    email: adminUser.email,
    adminUser,
  })
})
