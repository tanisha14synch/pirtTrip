# Deployment Guide — pirttrip + Supabase

## 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Note **Project URL**, **anon key**, and **service_role key**.

## 2. Run database migrations

In **SQL Editor**, run in order:

1. `supabase/migrations/20250601000001_initial_schema.sql`
2. `supabase/migrations/20250601000002_rls_policies.sql`

Or with Supabase CLI:

```bash
supabase link --project-ref YOUR_REF
supabase db push
```

## 3. Enable phone authentication

1. **Authentication → Providers → Phone** → Enable
2. Connect your SMS provider (Twilio recommended for production)
3. Set OTP length and expiry under Auth settings

## 4. Create admin user

1. **Authentication → Users → Add user** — email + password
2. Copy the user UUID
3. Run in SQL Editor (replace UUID and email):

```sql
INSERT INTO public.admin_users (id, full_name, email, role)
VALUES (
  'YOUR_AUTH_USER_UUID',
  'Super Admin',
  'admin@pirttrip.com',
  'SUPER_ADMIN'
);
```

## 5. Configure Nuxt environment

Copy `frontend/.env.example` to `frontend/.env`:

```env
NUXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 6. Build and deploy frontend

```bash
cd frontend
npm install
npm run build
```

Deploy `.output` to your host (Vercel, Netlify, Node server, etc.) and set the same env vars in the hosting dashboard.

### Vercel

- Framework: Nuxt
- Root: `frontend`
- Env: add all three Supabase variables; mark service role as sensitive

### Node (preview)

```bash
node .output/server/index.mjs
```

## 7. Verify production flows

| Route | Check |
|--------|--------|
| `/become-a-partner` | Submit form → receive OTP → verify → success |
| `/admin/login` | Admin email login |
| `/admin` | Leads list, search, filter, export CSV |
| `/admin/leads/:id` | Update status, notes, view OTP & activity |

## 8. Registration flow (reference)

```
User fills form → signInWithOtp(phone)
→ User enters OTP → verifyOtp
→ POST /api/partner/register (Bearer token)
→ Row in partner_leads (status NEW, otp_verified true)
→ Activity log LEAD_CREATED
```

## 9. MSG91 fallback

If Supabase Phone Auth is not available:

1. Disable phone provider or use Edge Function to send OTP via MSG91 API
2. Replace `usePartnerRegistration.sendOtp` / `verifyOtp` with MSG91 + custom verify endpoint
3. Still call `/api/partner/register` after verification with a signed server token

Contact your SMS provider for DLT/template compliance in India.

## 10. Troubleshooting

| Issue | Fix |
|--------|-----|
| OTP not received | Check SMS provider credits, Supabase Auth logs, +91 format |
| 401 on register | OTP not verified; session missing |
| 403 on admin | User not in `admin_users` table |
| 409 duplicate phone | Lead already exists for that number |
| RLS errors | Ensure service role used on server routes only |
