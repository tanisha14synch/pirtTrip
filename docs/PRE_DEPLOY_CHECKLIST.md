# Pre-Deployment Checklist — pirttrip Partner Backend

Provide or complete each item before going to production.

## Supabase project

- [ ] **Supabase Project URL** — `https://xxxx.supabase.co`
- [ ] **Supabase Anon Key** — Project Settings → API → `anon` `public`
- [ ] **Supabase Service Role Key** — Project Settings → API → `service_role` (server only, never commit)
- [ ] Run SQL migrations in `supabase/migrations/` (SQL Editor or CLI)
- [ ] Run `supabase/seed.sql` after creating admin auth user

## Phone OTP (choose one)

### Option A — Supabase Phone Auth (recommended)

- [ ] Enable **Phone** provider: Authentication → Providers → Phone
- [ ] Configure **SMS provider** (Twilio, MessageBird, etc.) in Supabase
- [ ] Add India (`+91`) to allowed countries if needed
- [ ] Test OTP send/verify on staging with a real device

### Option B — MSG91 (if Supabase Phone unavailable in your region)

- [ ] MSG91 account + **Auth Key**
- [ ] **Template ID** approved for OTP
- [ ] **Sender ID**
- [ ] Custom Edge Function or server integration (not included by default)

## Admin access

- [ ] Create admin user in Supabase Auth (email + password)
- [ ] Insert row into `admin_users` with that user's UUID (`supabase/seed.sql`)
- [ ] Store admin credentials in a password manager (do not commit)

## Hosting / Nuxt

- [ ] Production **environment variables** set on host (see `.env.example`)
- [ ] **Custom domain** DNS + SSL configured
- [ ] `npm run build` succeeds
- [ ] `/become-a-partner` registration flow tested end-to-end
- [ ] `/admin/login` and lead management tested

## Security

- [ ] `SUPABASE_SERVICE_ROLE_KEY` only on server/runtime, not `NUXT_PUBLIC_*`
- [ ] RLS enabled on all tables (migrations apply policies)
- [ ] Rate limiting on OTP (configure in Supabase Auth settings)

## Optional

- [ ] Supabase Storage bucket for future partner documents
- [ ] Error monitoring (Sentry, etc.)
- [ ] Backup policy for PostgreSQL
