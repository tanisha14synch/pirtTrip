import { z } from 'zod'
import {
  assertCsvShareActive,
  createCsvShareAccessPayload,
  createCsvShareAccessToken,
  fetchLiveShareExport,
  getCsvShareByToken,
  incrementCsvShareView,
  verifySharePassword,
} from '~/lib/csv-share'
import { zodErrorMessage } from '~/lib/validation'

const bodySchema = z.object({
  password: z.string().min(1, 'Enter the password'),
})

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')?.trim()
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorMessage(parsed.error),
      data: { code: 'INVALID_REQUEST' },
    })
  }

  const share = await getCsvShareByToken(token)
  if (!share) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Share link not found',
      data: { code: 'SHARE_NOT_FOUND' },
    })
  }

  assertCsvShareActive(share)

  if (!verifySharePassword(parsed.data.password, share.password_hash)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Incorrect password',
      data: { code: 'SHARE_PASSWORD_INVALID' },
    })
  }

  await incrementCsvShareView(share.id)

  const { rowCount, preview } = await fetchLiveShareExport(true)
  const accessToken = createCsvShareAccessToken(createCsvShareAccessPayload(share))

  return {
    success: true,
    label: share.label,
    rowCount,
    preview,
    accessToken,
    live: true,
  }
})
