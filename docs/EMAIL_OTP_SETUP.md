# Email OTP & 2FA Setup

## Root cause (why codes were not arriving)

The waitlist flow used **Supabase Auth `signInWithOtp`**, which depends entirely on Supabase’s email stack:

1. **No custom SMTP** — Supabase’s built-in mail is rate-limited, often lands in spam, and on some plans only delivers reliably to team addresses.
2. **Magic Link vs OTP** — If the project email template is configured for magic links, users receive a link instead of a 6-digit code (the UI expected 6 digits).
3. **Auth settings** — Email provider must be enabled; Site URL / redirect URLs must match your app or delivery can fail silently.
4. **No app-owned delivery** — There was no Resend/SMTP fallback, so production email was never guaranteed.

## Fix applied

A **server-side email OTP system** now sends branded 6-digit codes via **Resend** (recommended), **SMTP** (SendGrid, etc.), with a Supabase Auth fallback only when neither is configured.

| Flow | Behavior |
|------|----------|
| **Waitlist** | `POST /api/waitlist/send-otp` → email → `POST /api/waitlist/verify-otp` → row in `waitlist_subscribers` |
| **Admin** | Password sign-in → `POST /api/admin/auth/send-otp` → verify → httpOnly cookie + `app_metadata.email_2fa_verified_at` |

Features: 6-digit OTP, 10-minute expiry, resend cooldown (60s), rate limits, attempt limits, HTML email template, dev debug mode.

## 1. Run database migration (required)

If you see **"Could not find the table public.email_otp_challenges"**, the migration was not applied.

**Fastest fix:** open **Supabase Dashboard → SQL Editor**, paste and run:

`supabase/QUICK_FIX_email_otp.sql`

Or run all migrations:

```bash
npm run db:migrate
# or: cd backend && npm run db:migrate
```

(Requires `SUPABASE_DB_PASSWORD` or `SUPABASE_ACCESS_TOKEN` in `backend/.env`.)

Also ensure `20250601000003_waitlist.sql` is applied.

## 2. Configure email provider (choose one)

### Option A — Resend (recommended)

1. Create an account at [resend.com](https://resend.com).
2. Add and verify your domain (or use `onboarding@resend.dev` for testing).
3. Create an API key.

Add to `backend/.env`:

```env
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Pirttrip <noreply@yourdomain.com>
OTP_SECRET=generate_a_long_random_string_at_least_32_chars
```

### Option B — SMTP (SendGrid, Mailgun, etc.)

SendGrid example:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=Pirttrip <noreply@yourdomain.com>
OTP_SECRET=your_long_random_secret
```

### Option C — Supabase built-in SMTP

**Dashboard → Project Settings → Authentication → SMTP Settings**

Enable custom SMTP (SendGrid/Resend SMTP credentials), then set in `backend/.env` either SMTP vars above **or** rely on fallback `signInWithOtp` (not recommended for production deliverability).

For Supabase Auth emails (phone/partner if used), also set:

- **Authentication → Providers → Email** → Enabled
- **Email Templates → Magic Link** → include `{{ .Token }}` if using OTP style
- **Site URL** → `http://localhost:3000` (dev) or production URL
- **Redirect URLs** → add your app origins

## 3. Local development debug

To log OTP codes in the server console (never in production):

```env
OTP_DEBUG=true
```

## 4. Test plan

### Waitlist

1. Open `/`, click **Join Waitlist Now**.
2. Enter email → **Join Now** — check inbox (and spam) for “Verify your email” from Pirttrip.
3. Enter 6-digit code within 10 minutes → success screen.
4. Submit same email again → “already on the waitlist”.
5. Wait for timer → **Resend code** disabled for 60s, then works.
6. Enter wrong code 5 times → locked; request new code.

### Admin 2FA

1. Ensure user exists in `auth.users` + `admin_users` (see `supabase/seed.sql`).
2. Go to `/admin/login`, sign in with email/password.
3. OTP step appears; check email for code.
4. Verify → redirect to `/admin` dashboard.
5. Sign out; sign in again → OTP required again.
6. Try `/admin` without completing OTP → redirected to login.

### API smoke test

```bash
curl -X POST http://localhost:3000/api/waitlist/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

## Environment reference

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Recommended | Resend API key |
| `EMAIL_FROM` | Yes with Resend | Sender, e.g. `Pirttrip <noreply@domain.com>` |
| `OTP_SECRET` | Recommended | HMAC secret for hashing codes |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Alt to Resend | SMTP delivery |
| `OTP_DEBUG` | Dev only | Returns `debugCode` in API responses |
