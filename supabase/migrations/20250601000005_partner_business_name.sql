-- Partner registration: business name (replaces email on business landing form)
ALTER TABLE public.partner_leads
  ADD COLUMN IF NOT EXISTS business_name TEXT;

CREATE INDEX IF NOT EXISTS idx_partner_leads_business_name
  ON public.partner_leads (business_name);
