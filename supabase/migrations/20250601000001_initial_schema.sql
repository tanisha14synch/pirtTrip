-- pirttrip partner leads & admin schema
-- Run in Supabase SQL Editor or via: supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.lead_status AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'ONBOARDED',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.admin_role AS ENUM ('SUPER_ADMIN', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role public.admin_role NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partner_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  source_page TEXT NOT NULL DEFAULT 'become-a-partner',
  status public.lead_status NOT NULL DEFAULT 'NEW',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT partner_leads_phone_unique UNIQUE (phone)
);

CREATE TABLE IF NOT EXISTS public.otp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  auth_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  otp_sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.partner_leads (id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  admin_id UUID REFERENCES public.admin_users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_partner_leads_status ON public.partner_leads (status);
CREATE INDEX IF NOT EXISTS idx_partner_leads_created_at ON public.partner_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_leads_phone ON public.partner_leads (phone);
CREATE INDEX IF NOT EXISTS idx_otp_logs_phone ON public.otp_logs (phone);
CREATE INDEX IF NOT EXISTS idx_otp_logs_created_at ON public.otp_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activity_logs_lead_id ON public.lead_activity_logs (lead_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_leads_updated_at ON public.partner_leads;
CREATE TRIGGER partner_leads_updated_at
  BEFORE UPDATE ON public.partner_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin helper (security definer)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_role()
RETURNS public.admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.admin_users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Log lead changes from triggers (status / notes)
CREATE OR REPLACE FUNCTION public.log_lead_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.lead_activity_logs (lead_id, action, old_value, new_value, admin_id)
      VALUES (NEW.id, 'STATUS_CHANGED', OLD.status::TEXT, NEW.status::TEXT, auth.uid());
    END IF;
    IF OLD.notes IS DISTINCT FROM NEW.notes THEN
      INSERT INTO public.lead_activity_logs (lead_id, action, old_value, new_value, admin_id)
      VALUES (NEW.id, 'NOTES_UPDATED', OLD.notes, NEW.notes, auth.uid());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_leads_activity ON public.partner_leads;
CREATE TRIGGER partner_leads_activity
  AFTER UPDATE ON public.partner_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_changes();

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
