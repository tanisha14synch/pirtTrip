# Admin panel — Railway deploy

## Fix 502 Bad Gateway

502 means the admin container is not running. Use this setup:

| Setting | Value |
|---------|--------|
| **Root Directory** | `admin` |
| **Builder** | `Nixpacks` (default from `admin/railway.json`) |
| **Dockerfile Path** | *(leave empty)* |

**Required variable:**

```env
API_URL=https://api.pirttrip.com
```

Optional:

```env
NUXT_PUBLIC_MAIN_SITE_URL=https://business.pirttrip.com
```

Supabase keys are **not** required on the admin service (auth tokens are stored locally after OTP verify; backend handles Supabase).

## Health check

`GET /api/health` → `{"ok":true}`

## After deploy

1. Open `https://admin.pirttrip.com/api/health` — must return `ok: true`
2. Then open `https://admin.pirttrip.com/login`

## Wrong setup (causes 502)

- Root Directory = repo root with backend `Dockerfile` → builds wrong app
- Missing `API_URL` on admin service → API proxy errors (not 502, but login fails)

## Docker alternative

| Root Directory | Dockerfile Path |
|----------------|-----------------|
| `admin` | `Dockerfile` |
| `.` (repo root) | `Dockerfile.admin` |
