/** Scalloped top edge for hero form card (0–1 objectBoundingBox coords). */
export function buildFormScallopClipPath(count: number): string {
  if (count <= 0) return 'none'

  const slot = 1 / count
  const half = slot * 0.38
  const depth = 0.072

  const parts: string[] = ['M 0 0']

  for (let i = 0; i < count; i++) {
    const cx = (i + 0.5) * slot
    const left = Math.max(0, cx - half)
    const right = Math.min(1, cx + half)
    parts.push(`L ${left.toFixed(4)} 0`)
    parts.push(`Q ${cx.toFixed(4)} ${depth} ${right.toFixed(4)} 0`)
  }

  parts.push('L 1 0', 'L 1 1', 'L 0 1', 'Z')
  return `path(evenodd, '${parts.join(' ')}')`
}
