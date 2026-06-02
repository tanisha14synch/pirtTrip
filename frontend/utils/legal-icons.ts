import type { LegalLinkId } from '~/constants/legal-links'

export const PAGE_ICON_MAP: Record<LegalLinkId, string> = {
  'travel-business-privacy': 'privacy',
  terms: 'terms',
  'cookie-policy': 'cookie',
  disclaimer: 'disclaimer',
  'anti-fraud': 'fraud',
  'content-listing': 'listing',
  'intellectual-property': 'ip',
}

const SECTION_ICON_CYCLE = [
  'check',
  'lock',
  'users',
  'scale',
  'chart',
  'globe',
  'image',
  'privacy',
] as const

export function getPageIcon(slug: string): string {
  return PAGE_ICON_MAP[slug as LegalLinkId] ?? 'document'
}

export function getSectionIcon(index: number, title: string): string {
  const t = title.toLowerCase()
  if (/contact/i.test(t)) return 'mail'
  if (/fraud|misuse|prohibited/i.test(t)) return 'fraud'
  if (/privacy|data|cookie/i.test(t)) return 'privacy'
  if (/intellectual|copyright|brand/i.test(t)) return 'ip'
  if (/payment|billing|commercial/i.test(t)) return 'chart'
  if (/security|retention|deletion/i.test(t)) return 'lock'
  if (/sharing|third|platform/i.test(t)) return 'globe'
  if (/listing|content|media|image/i.test(t)) return 'image'
  if (/user|partner|business|scope/i.test(t)) return 'users'
  if (/liability|disclaimer|guarantee/i.test(t)) return 'disclaimer'
  if (/terms|license|ownership/i.test(t)) return 'terms'
  return SECTION_ICON_CYCLE[index % SECTION_ICON_CYCLE.length]
}

export function getListItemIcon(index: number): string {
  const icons = ['check', 'lock', 'chart', 'globe', 'users', 'image']
  return icons[index % icons.length]
}

/** Tailwind gradient classes for icon tile backgrounds */
export const ICON_TILE_GRADIENTS = [
  'from-[#F76517]/25 to-[#F2AA19]/15',
  'from-[#F76517]/20 to-[#ff8c42]/10',
  'from-[#e85d12]/20 to-[#F2AA19]/12',
  'from-[#F76517]/18 to-[#ffd08a]/12',
] as const

export function getTileGradient(index: number): string {
  return ICON_TILE_GRADIENTS[index % ICON_TILE_GRADIENTS.length]
}
