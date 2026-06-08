import { assertCsvShareActive, fetchLiveShareExport, getCsvShareByToken } from '~/lib/csv-share'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')?.trim()
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })
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

  const { rowCount } = await fetchLiveShareExport()

  return {
    success: true,
    label: share.label,
    rowCount,
    createdAt: share.created_at,
    passwordRequired: true,
    live: true,
  }
})
