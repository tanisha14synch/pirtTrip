-- Partner/vendor phone OTP verification

CREATE TABLE IF NOT EXISTS public.phone_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone_number
  ON public.phone_otps (phone_number);

CREATE INDEX IF NOT EXISTS idx_phone_otps_expires_at
  ON public.phone_otps (expires_at);

DROP TRIGGER IF EXISTS phone_otps_updated_at ON public.phone_otps;
CREATE TRIGGER phone_otps_updated_at
  BEFORE UPDATE ON public.phone_otps
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- No public policies; backend uses service role only
