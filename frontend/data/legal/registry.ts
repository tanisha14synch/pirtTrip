import { parseLegalText, type LegalParsedDocument } from '~/utils/parse-legal-text'

import antiFraudText from './text/anti-fraud.txt?raw'
import contentListingText from './text/content-listing-policy.txt?raw'
import cookiePolicyText from './text/cookie-policy.txt?raw'
import disclaimerText from './text/disclaimer.txt?raw'
import intellectualPropertyText from './text/intellectual-property.txt?raw'
import termsText from './text/terms.txt?raw'
import travelBusinessPrivacyText from './text/travel-business-privacy.txt?raw'

export type LegalPageSlug =
  | 'travel-business-privacy'
  | 'anti-fraud'
  | 'content-listing-policy'
  | 'intellectual-property'
  | 'cookie-policy'
  | 'terms'
  | 'disclaimer'

export type LegalPageEntry = {
  slug: LegalPageSlug
  document: LegalParsedDocument
}

const pages: LegalPageEntry[] = [
  {
    slug: 'travel-business-privacy',
    document: parseLegalText(
      travelBusinessPrivacyText,
      'Travel Business Data Privacy Policy',
    ),
  },
  {
    slug: 'anti-fraud',
    document: parseLegalText(
      antiFraudText,
      'Anti-Fraud & Platform Misuse Policy',
    ),
  },
  {
    slug: 'content-listing-policy',
    document: parseLegalText(
      contentListingText,
      'Content Listing & Package Accuracy Policy',
    ),
  },
  {
    slug: 'intellectual-property',
    document: parseLegalText(
      intellectualPropertyText,
      'Intellectual Property Policy',
    ),
  },
  {
    slug: 'cookie-policy',
    document: parseLegalText(
      cookiePolicyText,
      'Cookie Policy & Analytics Consent',
    ),
  },
  {
    slug: 'terms',
    document: parseLegalText(termsText, 'Terms & Conditions'),
  },
  {
    slug: 'disclaimer',
    document: parseLegalText(disclaimerText, 'Disclaimer for pirtTrip.com'),
  },
]

const bySlug = new Map(pages.map((p) => [p.slug, p]))

export function getLegalPage(slug: string): LegalPageEntry | undefined {
  return bySlug.get(slug as LegalPageSlug)
}

export function getAllLegalSlugs(): LegalPageSlug[] {
  return pages.map((p) => p.slug)
}
