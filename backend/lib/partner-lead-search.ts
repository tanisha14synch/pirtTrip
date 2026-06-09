import type { LeadStatus } from '~/types/database'
import { queryParamFirst } from '~/lib/query-params'

const LEAD_STATUSES = new Set<LeadStatus>([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'ONBOARDED',
  'REJECTED',
  'SUSPENDED',
])

export function parseLeadStatusFilter(
  value: string | string[] | undefined | null,
): LeadStatus | null {
  const raw = queryParamFirst(value)
  if (!raw || !LEAD_STATUSES.has(raw as LeadStatus)) return null
  return raw as LeadStatus
}

/** Escape user input for PostgREST ilike patterns (wildcards + quotes). */
export function escapePostgrestIlike(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

/**
 * Apply multi-column ilike search for partner_leads.
 * Values must be double-quoted — unquoted `%` breaks PostgREST `.or()` parsing.
 */
export function applyPartnerLeadSearch<T extends { or: (filters: string) => T }>(
  builder: T,
  rawSearch: string | string[] | undefined | null,
): T {
  const search = queryParamFirst(rawSearch)
  if (!search) return builder

  const pattern = `"%${escapePostgrestIlike(search)}%"`
  const columns = ['first_name', 'last_name', 'business_name', 'phone', 'email'] as const
  const filter = columns.map((col) => `${col}.ilike.${pattern}`).join(',')

  return builder.or(filter)
}
