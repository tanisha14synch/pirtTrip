import type { LeadStatus } from '~/types/database'
import { getSupabaseAdmin } from './supabase'

export const PARTNER_LEAD_CSV_HEADERS = [
  'id',
  'first_name',
  'last_name',
  'business_name',
  'phone',
  'email',
  'otp_verified',
  'status',
  'source_page',
  'notes',
  'created_at',
  'updated_at',
] as const

export function escapeCsv(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildPartnerLeadsCsv(
  rows: Array<Record<string, unknown>>,
): { csv: string; rowCount: number } {
  const body = rows.map((row) =>
    PARTNER_LEAD_CSV_HEADERS.map((h) => escapeCsv(row[h])).join(','),
  )
  const csv = [PARTNER_LEAD_CSV_HEADERS.join(','), ...body].join('\n')
  return { csv, rowCount: rows.length }
}

export async function fetchAllPartnerLeadsForExport() {
  return fetchPartnerLeadsForExport({ search: '', status: '' })
}

export async function fetchPartnerLeadsForExport(options: {
  search?: string
  status?: LeadStatus | ''
}) {
  const admin = getSupabaseAdmin()
  let builder = admin.from('partner_leads').select('*')

  const search = options.search?.trim() ?? ''
  const status = options.status?.trim() ?? ''

  if (status) builder = builder.eq('status', status as LeadStatus)
  if (search) {
    builder = builder.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,business_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`,
    )
  }

  const { data, error } = await builder.order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data ?? []
}

export function parseCsvPreview(csv: string, maxRows?: number) {
  const lines = csv.split('\n').filter((line) => line.length > 0)
  if (!lines.length) {
    return { headers: [...PARTNER_LEAD_CSV_HEADERS], rows: [] as string[][] }
  }

  const headers = lines[0].split(',')
  const dataLines = maxRows == null ? lines.slice(1) : lines.slice(1, maxRows + 1)
  const rows = dataLines.map((line) => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
        continue
      }
      if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
        continue
      }
      current += char
    }
    values.push(current)
    return values
  })

  return { headers, rows }
}
