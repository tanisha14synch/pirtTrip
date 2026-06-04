-- Run in Supabase Dashboard → SQL Editor if partner registration returns 500
-- (missing column: business_name on partner_leads)

ALTER TABLE public.partner_leads
  ADD COLUMN IF NOT EXISTS business_name TEXT;

CREATE INDEX IF NOT EXISTS idx_partner_leads_business_name
  ON public.partner_leads (business_name);
