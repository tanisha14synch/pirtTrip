# Admin panel — Railway deploy (fix build failures)

## Error: `"/backend/package.json": not found`

The **admin** service is using the **backend** Dockerfile. Fix in Railway → **admin** service → **Settings**.

---

## ✅ Recommended setup (Nixpacks — easiest)

| Setting | Value |
|---------|--------|
| **Root Directory** | `admin` |
| **Builder** | `Nixpacks` (or leave default; `admin/railway.json` sets this) |
| **Dockerfile Path** | *(leave empty / clear any custom path)* |

Then **Redeploy**.

---

## Alternative A — Docker from `admin/` folder

| Setting | Value |
|---------|--------|
| **Root Directory** | `admin` |
| **Builder** | `Dockerfile` |
| **Dockerfile Path** | `Dockerfile` |

---

## Alternative B — Docker from repo root

| Setting | Value |
|---------|--------|
| **Root Directory** | `.` (empty) |
| **Builder** | `Dockerfile` |
| **Dockerfile Path** | `Dockerfile.admin` |

---

## Alternative C — Shared root Dockerfile

| Setting | Value |
|---------|--------|
| **Root Directory** | `.` (empty) |
| **Dockerfile Path** | `Dockerfile` |
| **Variable** | `BUILD_TARGET` = `admin` *(enable for build)* |

---

## Required variables

```env
NUXT_PUBLIC_SUPABASE_URL=https://fvkwophzzyaukacuiszv.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
API_URL=https://api.pirttrip.com
NUXT_PUBLIC_MAIN_SITE_URL=https://business.pirttrip.com

**Required:**
- `API_URL` → `https://api.pirttrip.com`
- `NUXT_PUBLIC_SUPABASE_URL` + `NUXT_PUBLIC_SUPABASE_ANON_KEY` — same values as the frontend service (login calls Supabase Auth after OTP verify). Without the anon key, verify succeeds but session save fails with "Failed to fetch".
```

## Health check

Path: `/login`

## After changing settings

1. Save settings
2. Click **Deploy** → **Redeploy**
3. Open build logs — you should see `npm ci` / `nuxt build`, **not** `COPY backend/`
