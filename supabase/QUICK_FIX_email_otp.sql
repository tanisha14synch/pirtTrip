-- Run this in Supabase Dashboard → SQL Editor if waitlist/partner OTP fails with
-- "Could not find the table public.email_otp_challenges"

CREATE TABLE IF NOT EXISTS public.email_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('waitlist', 'admin_login', 'partner_registration')),
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  resend_count INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_otp_email_purpose
  ON public.email_otp_challenges (email, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_otp_expires
  ON public.email_otp_challenges (expires_at);

ALTER TABLE public.email_otp_challenges ENABLE ROW LEVEL SECURITY;
