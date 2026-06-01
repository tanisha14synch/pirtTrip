# Deploy on Railway

This repo is a **monorepo**. Railway must build the **backend** or **frontend** folder — not the repo root alone.

## Fix: "Failed to build an image"

### Option A — Backend API (recommended first)

1. Railway → your service → **Settings**
2. **Root Directory** → `backend`
3. **Redeploy**

The repo includes `backend/Dockerfile` and `backend/railway.toml`.

### Option B — Keep root directory empty

Root `railway.toml` uses `backend/Dockerfile` with Docker context. Redeploy after pulling latest `main`.

## Environment variables (backend service)

Set in Railway → **Variables**:

| Variable | Required |
|----------|----------|
| `SUPABASE_URL` | Yes |
| `SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `OTP_SECRET` | Yes |
| `RESEND_API_KEY` | For email OTP |
| `EMAIL_FROM` | With Resend |
| `PORT` | Railway sets automatically |

Use the same values as `backend/.env` locally.

## Frontend (second service)

1. **New service** → same GitHub repo
2. **Root Directory** → `frontend`
3. Variables:
   - `NUXT_PUBLIC_SUPABASE_URL`
   - `NUXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NUXT_PUBLIC_API_BASE_URL` = your backend Railway URL (e.g. `https://pirttrip-production.up.railway.app`)

## Verify

```bash
curl https://YOUR-BACKEND.up.railway.app/api/health
# {"ok":true,"service":"pirt-trip-api",...}
```
