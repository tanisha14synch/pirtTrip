/** First scalar from h3 getQuery (avoids String(['','']) → ","). */
export function queryParamFirst(value: string | string[] | undefined | null): string {
  if (Array.isArray(value)) return String(value[0] ?? '').trim()
  return String(value ?? '').trim()
}
