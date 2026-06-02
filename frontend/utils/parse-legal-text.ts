export type LegalParsedSection = {
  title: string
  level: 2 | 3
  paragraphs: string[]
  list: string[]
}

export type LegalParsedDocument = {
  title: string
  effectiveDate?: string
  platform?: string
  operator?: string
  intro: string[]
  sections: LegalParsedSection[]
}

const META_PATTERNS: { key: keyof Pick<LegalParsedDocument, 'effectiveDate' | 'platform' | 'operator'>; re: RegExp }[] = [
  { key: 'effectiveDate', re: /^Effective Date:\s*(.+)$/i },
  { key: 'platform', re: /^Platform:\s*(.+)$/i },
  { key: 'operator', re: /^Operated by:\s*(.+)$/i },
]

const SECTION_H2 = /^\d+\.\s+/
const SECTION_H3 = /^[A-Z]\.\s+/
const BULLET = /^[\u2022•\-–]\s*/

function isBulletLine(line: string) {
  return BULLET.test(line.trim())
}

function stripBullet(line: string) {
  return line.trim().replace(BULLET, '').trim()
}

function flushParagraph(buffer: string[], target: string[]) {
  const text = buffer.join(' ').trim()
  if (text) target.push(text)
  buffer.length = 0
}

function flushSection(
  section: LegalParsedSection | null,
  sections: LegalParsedSection[],
) {
  if (section && (section.paragraphs.length || section.list.length || section.title)) {
    sections.push(section)
  }
}

/**
 * Parses plain-text legal documents with numbered sections and bullet lists.
 */
export function parseLegalText(raw: string, title: string): LegalParsedDocument {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const meta: Partial<LegalParsedDocument> = { title, intro: [], sections: [] }
  const introParagraphBuffer: string[] = []
  const intro: string[] = []
  const sections: LegalParsedSection[] = []

  let current: LegalParsedSection | null = null
  let paragraphBuffer: string[] = []
  let inIntro = true

  const pushParagraph = () => {
    if (!paragraphBuffer.length) return
    const text = paragraphBuffer.join(' ').trim()
    paragraphBuffer = []
    if (!text) return
    if (inIntro) intro.push(text)
    else if (current) current.paragraphs.push(text)
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      pushParagraph()
      continue
    }

    let metaMatched = false
    for (const { key, re } of META_PATTERNS) {
      const m = line.match(re)
      if (m) {
        meta[key] = m[1].replace(/^\[|\]$/g, '').trim()
        metaMatched = true
        break
      }
    }
    if (metaMatched) continue

    if (SECTION_H2.test(line)) {
      pushParagraph()
      flushSection(current, sections)
      inIntro = false
      current = { title: line, level: 2, paragraphs: [], list: [] }
      continue
    }

    if (SECTION_H3.test(line)) {
      pushParagraph()
      flushSection(current, sections)
      inIntro = false
      current = { title: line, level: 3, paragraphs: [], list: [] }
      continue
    }

    if (isBulletLine(line)) {
      pushParagraph()
      inIntro = false
      if (!current) {
        current = { title: '', level: 2, paragraphs: [], list: [] }
      }
      current.list.push(stripBullet(line))
      continue
    }

    if (inIntro) {
      paragraphBuffer.push(line)
      continue
    }

    if (!current) {
      current = { title: '', level: 2, paragraphs: [], list: [] }
    }
    paragraphBuffer.push(line)
  }

  pushParagraph()
  if (inIntro && paragraphBuffer.length) {
    flushParagraph(paragraphBuffer, intro)
  }
  flushSection(current, sections)

  return {
    title,
    effectiveDate: meta.effectiveDate,
    platform: meta.platform,
    operator: meta.operator,
    intro,
    sections,
  }
}
