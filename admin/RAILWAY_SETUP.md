# Admin panel — Railway deploy

## Fix 502 Bad Gateway

502 on `https://admin.pirttrip.com` means Cloudflare cannot reach a running admin container on Railway.

**Check:** response headers should include `x-railway-edge`. If they do not, DNS or the Railway service is wrong.

See [docs/CLOUDFLARE_ADMIN_SUBDOMAIN.md](../docs/CLOUDFLARE_ADMIN_SUBDOMAIN.md) for DNS + SSL steps.

## Railway settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `admin` |
| **Builder** | `Dockerfile` (`admin/railway.json`) |
| **Dockerfile Path** | `Dockerfile` |
| **Health check** | `/api/health` |

**Required variable:**

```env
API_URL=https://api.pirttrip.com
```

Optional:

```env
NUXT_PUBLIC_MAIN_SITE_URL=https://business.pirttrip.com
```

## Health check

```bash
curl -s https://admin.pirttrip.com/api/health
# {"ok":true,"service":"pirttrip-admin",...}
```

## After deploy

1. Railway URL: `https://<service>.up.railway.app/api/health` → `ok: true`
2. Custom domain: `https://admin.pirttrip.com/api/health` → `ok: true` + `x-railway-edge` header
3. Open `https://admin.pirttrip.com/login`

## Wrong setup (causes 502 or build failure)

| Mistake | Result |
|---------|--------|
| Root Directory = repo root + default `Dockerfile` | Builds **backend**, not admin |
| No admin Railway service | Cloudflare 502 (no origin) |
| CNAME points to frontend/API service | Wrong app or connection failure |
| Cloudflare SSL = Flexible | 502/525 to Railway |

## Repo-root alternative

| Root Directory | Dockerfile Path |
|----------------|-----------------|
| `admin` | `Dockerfile` |
| `.` (repo root) | `Dockerfile.admin` |

Use `railway.admin.json` for health check settings when deploying from repo root.
