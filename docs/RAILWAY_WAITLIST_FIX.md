# Waitlist error fix — “Supabase service role is not configured”

Code is deployed. **You must add secrets in Railway** (they are never stored in GitHub).

## Step 1 — Get keys from Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your **PirtTrip** project.
2. **Project Settings** (gear) → **API**.
3. Copy:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **service_role** key (click Reveal) — long secret starting with `eyJ...`  
     ⚠️ This is **secret**. Do not put it in `NUXT_PUBLIC_*` or commit to git.

## Step 2 — Backend service (Railway)

1. Railway → project → service with root **`backend`** (API / `api.pirttrip.com`).
2. **Variables** → add or update:

```env
SUPABASE_URL=https://YOUR_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret
```

3. **Deploy** → Redeploy latest.

4. Test:

```bash
curl https://api.pirttrip.com/api/health
```

Expected: `"supabase":"configured"` (not `missing`).

## Step 3 — Frontend service (Railway)

1. Railway → service with root **`frontend`** (`pirttrip.com`).
2. **Variables** → add the **same** server keys:

```env
SUPABASE_URL=https://YOUR_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret
NUXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
API_URL=https://api.pirttrip.com
```

3. **Deploy** → Redeploy latest.

## Step 4 — Waitlist table (once)

Supabase → **SQL Editor** → run file:

`supabase/migrations/20250601000003_waitlist.sql`

## Step 5 — Test on site

Open https://pirttrip.com → Join Waitlist → use a test email.

---

## Current status (if still broken)

| Check | Command / place |
|--------|------------------|
| Backend missing key | `curl https://api.pirttrip.com/api/health` shows `supabase: missing` |
| Frontend not redeployed | Railway → Frontend → Deployments → latest commit `c7146c5` or newer |
| Wrong API_URL | Frontend `API_URL` must be `https://api.pirttrip.com` (no `/api` suffix) |

After Step 2 + 3 + redeploy, waitlist should work without more code changes.
