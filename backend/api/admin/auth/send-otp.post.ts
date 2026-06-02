import { z } from 'zod'
import { createAndSendOtp } from '~/lib/email-otp-service'

const bodySchema = z.object({
  challengeToken: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const email = user.email?.toLowerCase()
  const body = await readBody(event).catch(() => ({}))
  const parsed = bodySchema.safeParse(body)

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Admin account has no email' })
  }

  const result = await createAndSendOtp({
    email,
    purpose: 'admin_login',
    challengeToken: parsed.success ? parsed.data.challengeToken : undefined,
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
