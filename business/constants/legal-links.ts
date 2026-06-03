/** Shared legal footer links — paths resolve on the main marketing site */

const MAIN_SITE = (process.env.NUXT_PUBLIC_MAIN_SITE_URL || 'https://www.pirttrip.com').replace(
  /\/$/,
  '',
)

function resolveHref(href: string): string {
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href
  }
  return `${MAIN_SITE}${href.startsWith('/') ? href : `/${href}`}`
}

export const LEGAL_LINKS = [
  {
    id: 'travel-business-privacy',
    label: 'Privacy Policy',
    href: resolveHref('/legal/travel-business-privacy'),
    icon: 'privacy',
  },
  {
    id: 'terms',
    label: 'Terms & Conditions',
    href: resolveHref('/legal/terms'),
    icon: 'terms',
  },
  {
    id: 'cookie-policy',
    label: 'Cookie Policy',
    href: resolveHref('/legal/cookie-policy'),
    icon: 'cookie',
  },
  {
    id: 'disclaimer',
    label: 'Disclaimer',
    href: resolveHref('/legal/disclaimer'),
    icon: 'disclaimer',
  },
  {
    id: 'anti-fraud',
    label: 'Anti-Fraud Policy',
    href: resolveHref('/legal/anti-fraud'),
    icon: 'fraud',
  },
  {
    id: 'content-listing',
    label: 'Listing Accuracy Policy',
    href: resolveHref('/legal/content-listing-policy'),
    icon: 'listing',
  },
  {
    id: 'intellectual-property',
    label: 'Intellectual Property',
    href: resolveHref('/legal/intellectual-property'),
    icon: 'ip',
  },
] as const

export type LegalLinkId = (typeof LEGAL_LINKS)[number]['id']

export const FOOTER_QUICK_LINKS = [
  ...LEGAL_LINKS.slice(0, 3).map(({ id, label, href }) => ({
    id,
    label,
    href,
  })),
  {
    id: 'contact',
    label: 'Contact Us',
    href: 'mailto:contact@pirttrip.com',
  },
] as const

export const FOOTER_LEGAL_LINKS = LEGAL_LINKS.slice(3)
