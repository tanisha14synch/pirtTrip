# Pre-Deployment Checklist — pirttrip OTP (Nuxt + Nitro)

Provide or complete each item before going to production.

## Supabase project

- [ ] **Supabase Project URL** — `https://xxxx.supabase.co`
- [ ] **Supabase Anon Key** — Project Settings → API → `anon` `public`
- [ ] **Supabase Service Role Key** — Project Settings → API → `service_role` (server only, never commit)
- [ ] Run SQL migrations in `supabase/migrations/` (SQL Editor or CLI)
- [ ] Run `supabase/seed.sql` after creating admin auth user

## Email OTP provider (required for production)

- [ ] Configure **Resend** (`RESEND_API_KEY`, `EMAIL_FROM`) on backend service
  - or configure SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`)
- [ ] Set strong `OTP_SECRET` on backend service
- [ ] Keep `OTP_DEBUG` disabled in production

## Admin access

- [ ] Create admin user in Supabase Auth (email + password)
- [ ] Insert row into `admin_users` with that user's UUID (`supabase/seed.sql`)
- [ ] Store admin credentials in a password manager (do not commit)

## Hosting / Nuxt

- [ ] Backend variables set on backend service only (never in frontend public env)
- [ ] Frontend variables set on frontend service (`NUXT_PUBLIC_*`)
- [ ] **Custom domain** DNS + SSL configured
- [ ] `npm run build` succeeds
- [ ] `/` waitlist OTP flow tested end-to-end
- [ ] `/become-a-partner` registration flow tested end-to-end
- [ ] `/admin/login` and lead management tested

## Security

- [ ] `SUPABASE_SERVICE_ROLE_KEY` only on server/runtime, not `NUXT_PUBLIC_*`
- [ ] RLS enabled on all tables (migrations apply policies)
- [ ] OTP resend/attempt limits validated via API responses

## Optional

- [ ] Supabase Storage bucket for future partner documents
- [ ] Error monitoring (Sentry, etc.)
- [ ] Backup policy for PostgreSQL
