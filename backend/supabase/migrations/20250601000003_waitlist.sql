-- Traveler waitlist (email + OTP verified)

CREATE TABLE IF NOT EXISTS public.waitlist_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  source_page TEXT NOT NULL DEFAULT 'home',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT waitlist_subscribers_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_subscribers_created_at
  ON public.waitlist_subscribers (created_at DESC);

ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins select waitlist" ON public.waitlist_subscribers;
CREATE POLICY "Admins select waitlist"
  ON public.waitlist_subscribers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
