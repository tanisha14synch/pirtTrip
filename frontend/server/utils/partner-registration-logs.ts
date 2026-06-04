import type { SupabaseClient } from '@supabase/supabase-js'

export async function logPartnerRegistrationSideEffects(
  admin: SupabaseClient,
  leadId: string,
  phone: string,
): Promise<void> {
  const { error: otpError } = await admin.from('otp_logs').insert({
    phone,
    verified_at: null,
    is_verified: false,
  })
  if (otpError) {
    console.warn('[partner/register-direct] otp_logs insert failed:', otpError.message)
  }

  const { error: activityError } = await admin.from('lead_activity_logs').insert({
    lead_id: leadId,
    action: 'LEAD_CREATED',
    old_value: null,
    new_value: 'NEW',
    admin_id: null,
  })
  if (activityError) {
    console.warn('[partner/register-direct] lead_activity_logs insert failed:', activityError.message)
  }
}
