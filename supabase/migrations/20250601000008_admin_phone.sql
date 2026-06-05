-- Admin phone login support

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_phone
  ON public.admin_users (phone)
  WHERE phone IS NOT NULL;
