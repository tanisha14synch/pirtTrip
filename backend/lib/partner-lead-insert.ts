import type { SupabaseClient } from '@supabase/supabase-js'
import type { PartnerLead } from '~/types/database'

export type PartnerLeadInsertInput = {
  firstName: string
  lastName: string
  businessName: string
  phone: string
  email: string | null
  whatsappOptIn?: boolean
  otpVerified?: boolean
  authUserId?: string | null
}

function buildPartnerNotes(businessName: string, whatsappOptIn?: boolean): string | null {
  const parts: string[] = []
  const name = businessName.trim()
  if (name) {
    parts.push(`Business: ${name}`)
  }
  if (whatsappOptIn) {
    parts.push('WhatsApp updates: opted in')
  }
  return parts.length ? parts.join('\n') : null
}

/** Supabase/PostgREST error when partner_leads.business_name column is missing. */
export function isMissingBusinessNameColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error?.message) {
    return false
  }
  const msg = error.message.toLowerCase()
  return (
    error.code === 'PGRST204'
    || error.code === '42703'
    || msg.includes('business_name')
    || (msg.includes('column') && (msg.includes('does not exist') || msg.includes('schema cache')))
  )
}

export async function insertPartnerLead(
  admin: SupabaseClient,
  input: PartnerLeadInsertInput,
): Promise<{ data: PartnerLead | null, error: { message: string; code?: string } | null }> {
  const base = {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    phone: input.phone,
    email: input.email,
    otp_verified: input.otpVerified ?? false,
    source_page: 'become-a-partner',
    status: 'NEW' as const,
    ...(input.authUserId ? { auth_user_id: input.authUserId } : {}),
  }

  const withBusinessColumn = {
    ...base,
    business_name: input.businessName.trim(),
    notes: input.whatsappOptIn ? 'WhatsApp updates: opted in' : null,
  }

  let result = await admin
    .from('partner_leads')
    .insert(withBusinessColumn)
    .select()
    .single()

  if (result.error && isMissingBusinessNameColumn(result.error)) {
    result = await admin
      .from('partner_leads')
      .insert({
        ...base,
        notes: buildPartnerNotes(input.businessName, input.whatsappOptIn),
      })
      .select()
      .single()
  }

  return result
}
