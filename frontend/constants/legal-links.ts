/** Shared legal footer and navigation links */
export const LEGAL_LINKS = [
  {
    id: 'travel-business-privacy',
    label: 'Privacy Policy',
    href: '/legal/travel-business-privacy',
    icon: 'privacy',
  },
  {
    id: 'terms',
    label: 'Terms & Conditions',
    href: '/legal/terms',
    icon: 'terms',
  },
  {
    id: 'cookie-policy',
    label: 'Cookie Policy',
    href: '/legal/cookie-policy',
    icon: 'cookie',
  },
  {
    id: 'disclaimer',
    label: 'Disclaimer',
    href: '/legal/disclaimer',
    icon: 'disclaimer',
  },
  {
    id: 'anti-fraud',
    label: 'Anti-Fraud Policy',
    href: '/legal/anti-fraud',
    icon: 'fraud',
  },
  {
    id: 'content-listing',
    label: 'Listing Accuracy Policy',
    href: '/legal/content-listing-policy',
    icon: 'listing',
  },
  {
    id: 'intellectual-property',
    label: 'Intellectual Property',
    href: '/legal/intellectual-property',
    icon: 'ip',
  },
] as const

export type LegalLinkId = (typeof LEGAL_LINKS)[number]['id']

/** First 3 legal pages + contact — footer Quick Links */
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

/** Remaining legal pages — footer Legal column (excludes Quick Link duplicates) */
export const FOOTER_LEGAL_LINKS = LEGAL_LINKS.slice(3)
