# Cloudflare: `admin.pirttrip.com` DNS + Railway

A **502 Bad Gateway** on `admin.pirttrip.com` with **no** `x-railway-edge` response header means Cloudflare cannot reach a healthy Railway origin. Fix DNS and the admin Railway service together.

## 1. Railway admin service (required)

Create or open the **admin** service (separate from API and frontend).

| Setting | Value |
|---------|--------|
| **Root Directory** | `admin` |
| **Builder** | `Dockerfile` (from `admin/railway.json`) |
| **Dockerfile path** | `Dockerfile` (inside `admin/`) |
| **Start command** | `sh start.sh` (default from `railway.json`) |
| **Health check** | `GET /api/health` |

**Do not** use the repo-root `Dockerfile` (that builds the **backend API**).

### Variables

```env
API_URL=https://api.pirttrip.com
NUXT_PUBLIC_MAIN_SITE_URL=https://business.pirttrip.com
```

Supabase keys are **not** required on the admin service.

### Verify Railway domain first

Before custom DNS, open the generated Railway URL, e.g.:

```text
https://YOUR-ADMIN-SERVICE.up.railway.app/api/health
```

Must return:

```json
{"ok":true,"service":"pirttrip-admin",...}
```

Then open `/login` on the same Railway URL.

## 2. Cloudflare DNS

**Cloudflare → pirttrip.com → DNS → Records**

| Type | Name | Content | Proxy |
|------|------|---------|--------|
| **CNAME** | `admin` | `YOUR-ADMIN-SERVICE.up.railway.app` (from Railway Networking) | **DNS only** (grey cloud) until verified |
| TXT | `_railway-verify.admin` | (from Railway) | — |

- **Name** = `admin`, not `admin.pirttrip.com`.
- Copy the CNAME target from **Railway → admin service → Networking → Custom domain**.

### SSL/TLS (Cloudflare)

**SSL/TLS → Overview** → **Full** (not Flexible).

Railway terminates HTTPS on the origin; Flexible mode often causes 502/525 errors.

## 3. Verify

```bash
# After grey-cloud CNAME propagates (may take 5–30 min)
curl -sI https://admin.pirttrip.com/api/health | grep -E 'HTTP|x-railway'
```

Healthy response includes:

- `HTTP/2 200`
- `x-railway-edge: railway/...`

```bash
curl -s https://admin.pirttrip.com/api/health
```

## 4. Redeploy

After DNS is green in Railway, **Redeploy** the admin service.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| 502, no `x-railway-edge` | Wrong/dead DNS origin or service not running | Fix CNAME; redeploy admin with Root Directory `admin` |
| Build: `backend/package.json not found` | Wrong Dockerfile / root | Root Directory = `admin`, or Dockerfile path = `Dockerfile.admin` from repo root |
| Health check failed | App not listening on `PORT` | `start.sh` binds `0.0.0.0:$PORT` (Railway sets `PORT`) |
| Login works, API 502 | Missing `API_URL` on admin | Set `API_URL=https://api.pirttrip.com` |
| 525 SSL handshake | Cloudflare Flexible SSL | Set SSL mode to **Full** |
