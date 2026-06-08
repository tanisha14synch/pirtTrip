import {
  assertCsvShareActive,
  fetchLiveShareExport,
  getCsvShareByToken,
  incrementCsvShareDownload,
  parseCsvShareAccessToken,
} from '~/lib/csv-share'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')?.trim()
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share link' })
  }

  const authHeader = getRequestHeader(event, 'authorization') || ''
  const accessToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : String(getQuery(event).accessToken ?? '').trim()

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Enter the password to download this file',
      data: { code: 'SHARE_ACCESS_REQUIRED' },
    })
  }

  const access = parseCsvShareAccessToken(accessToken)
  if (access.token !== token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid access session',
      data: { code: 'SHARE_ACCESS_INVALID' },
    })
  }

  const share = await getCsvShareByToken(token)
  if (!share || share.id !== access.shareId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Share link not found',
      data: { code: 'SHARE_NOT_FOUND' },
    })
  }

  assertCsvShareActive(share)
  await incrementCsvShareDownload(share.id)

  const { csv } = await fetchLiveShareExport()
  const filename = `pirttrip-vendors-${new Date().toISOString().slice(0, 10)}.csv`
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

  return csv
})
