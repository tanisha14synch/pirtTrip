/** Public admin app origin for shareable links (never localhost in production). */
export function getAdminSiteUrl(): string {
  const raw = (
    process.env.ADMIN_SITE_URL
    || process.env.NUXT_PUBLIC_ADMIN_SITE_URL
    || 'https://admin.pirttrip.com'
  ).trim().replace(/\/$/, '')

  return raw
}

export function buildCsvShareUrl(token: string): string {
  return `${getAdminSiteUrl()}/export/share/${token}`
}
