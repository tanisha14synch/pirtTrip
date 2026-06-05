# Deployment Guide — pirttrip (Email OTP)

This project uses:
- `frontend/` Nuxt 3 app
- `backend/` Nitro API
- Supabase (DB + Auth users)
- Email OTP via Resend/SMTP (phone OTP is not used in current flow)

## 1. Supabase setup

1. Create a Supabase project.
2. Capture:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run backend migrations:

```bash
cd backend
npm run db:migrate
```

## 2. Create admin auth user

1. Supabase Dashboard → Authentication → Users → Add user (email + password).
2. Use `supabase/seed.sql` (or `backend/supabase/seed.sql`) to insert matching row into `public.admin_users`.

## 3. Configure backend env (required)

Create `backend/.env` from `backend/.env.example`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OTP_SECRET=

# Email provider (choose one)
RESEND_API_KEY=
EMAIL_FROM=
# or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS
```

`SUPABASE_SERVICE_ROLE_KEY` must never be placed in frontend public env.

## 4. Configure frontend env

Create `frontend/.env` from `frontend/.env.example`:

```env
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
NUXT_PUBLIC_API_URL=https://your-backend-domain
```

## 5. Railway deploy

Use separate services:
- Backend service root: `backend/` (reads `backend/railway.json`)
- Frontend service root: `frontend/` (reads `frontend/railway.json`)

See [RAILWAY.md](./RAILWAY.md) for exact variables and health checks.

## 6. Verify production flows

- Waitlist OTP: `/api/waitlist/send-otp` + `/api/waitlist/verify-otp`
- Partner OTP: `/api/partner/send-otp` + `/api/partner/resend-otp` + `/api/partner/verify-otp` (SMS via AquaSMS; without `AQUASMS_API_KEY` the OTP is logged on the backend console)
- Admin 2FA OTP: `/api/admin/auth/send-otp` + `/api/admin/auth/verify-otp`

## 7. Troubleshooting

| Issue | Fix |
|--------|-----|
| OTP send returns 500 | Check backend env (`SUPABASE_*`, `OTP_SECRET`, email provider vars) |
| OTP delayed/not delivered | Configure Resend/SMTP; avoid production fallback-only mode |
| 401/403 admin | Ensure auth user exists and is mapped in `admin_users` |
| Migration failures | Set `SUPABASE_DB_PASSWORD` or `SUPABASE_ACCESS_TOKEN` in `backend/.env` |
