-- Live CSV shares: no snapshot expiry, optional stored CSV

ALTER TABLE public.admin_csv_shares
  ALTER COLUMN csv_content DROP NOT NULL,
  ALTER COLUMN expires_at DROP NOT NULL;
