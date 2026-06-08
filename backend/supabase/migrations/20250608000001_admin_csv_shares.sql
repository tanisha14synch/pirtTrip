-- Password-protected shareable CSV exports for admin

CREATE TABLE IF NOT EXISTS public.admin_csv_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  csv_content TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  label TEXT,
  created_by UUID REFERENCES public.admin_users (id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_csv_shares_token ON public.admin_csv_shares (token);
CREATE INDEX IF NOT EXISTS idx_admin_csv_shares_expires ON public.admin_csv_shares (expires_at);

ALTER TABLE public.admin_csv_shares ENABLE ROW LEVEL SECURITY;
