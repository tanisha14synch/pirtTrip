# Admin panel — Railway deploy

## Error: `"/backend/package.json": not found`

Your admin service is building with the **backend** Dockerfile. Fix in Railway → **admin** service → **Settings**:

### Fix (choose one)

**A — Recommended**

| Setting | Value |
|---------|--------|
| Root Directory | `admin` |
| Dockerfile Path | `Dockerfile` |

**B — Repo root**

| Setting | Value |
|---------|--------|
| Root Directory | `.` (empty) |
| Dockerfile Path | `Dockerfile.admin` |

Click **Redeploy** after saving.

## Environment variables

```
NUXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
API_URL=https://api.pirttrip.com
NUXT_PUBLIC_MAIN_SITE_URL=https://business.pirttrip.com
```

## Health check

Path: `/login`
