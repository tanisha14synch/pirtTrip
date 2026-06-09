# Admin panel — Railway deploy (fix build failures)

## Error: `"/backend/package.json": not found`

The **admin** service is using the **backend** Dockerfile. Fix in Railway → **admin** service → **Settings**.

---

## ✅ Recommended setup (Dockerfile)

| Setting | Value |
|---------|--------|
| **Root Directory** | `admin` |
| **Builder** | `Dockerfile` (`admin/railway.json` sets this) |
| **Dockerfile Path** | `Dockerfile` |

Then **Redeploy**. Health check: `GET /api/health`

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
API_URL=https://api.pirttrip.com
NUXT_PUBLIC_MAIN_SITE_URL=https://business.pirttrip.com
```

**Required:** `API_URL` → `https://api.pirttrip.com` (backend has Supabase keys; admin panel does not need them).

## Health check

Path: `/api/health` (returns `{"ok":true}`)

## After changing settings

1. Save settings
2. Click **Deploy** → **Redeploy**
3. Open build logs — you should see `npm ci` / `nuxt build`, **not** `COPY backend/`
