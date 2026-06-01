-- Row Level Security policies

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins read admin_users" ON public.admin_users;
CREATE POLICY "Admins read admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins read own profile" ON public.admin_users;
CREATE POLICY "Admins read own profile"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ---------------------------------------------------------------------------
-- partner_leads — no direct public read/write (use server API after OTP)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins select partner_leads" ON public.partner_leads;
CREATE POLICY "Admins select partner_leads"
  ON public.partner_leads
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update partner_leads" ON public.partner_leads;
CREATE POLICY "Admins update partner_leads"
  ON public.partner_leads
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete partner_leads" ON public.partner_leads;
CREATE POLICY "Admins delete partner_leads"
  ON public.partner_leads
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Partners read own lead" ON public.partner_leads;
CREATE POLICY "Partners read own lead"
  ON public.partner_leads
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- otp_logs
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated insert otp_logs" ON public.otp_logs;
CREATE POLICY "Authenticated insert otp_logs"
  ON public.otp_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins select otp_logs" ON public.otp_logs;
CREATE POLICY "Admins select otp_logs"
  ON public.otp_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- lead_activity_logs
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins select activity logs" ON public.lead_activity_logs;
CREATE POLICY "Admins select activity logs"
  ON public.lead_activity_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert activity logs" ON public.lead_activity_logs;
CREATE POLICY "Admins insert activity logs"
  ON public.lead_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());
