# Railway deployment (frontend + backend)

This monorepo has **two deployable apps**. Deploy them as **separate Railway services** so the marketing site (`/`) and the API (`/api/*`) do not conflict.

| Service | Stack | Root directory | Health check |
|---------|--------|----------------|--------------|
| **API** | Nitro (Node) | `backend` | `GET /api/health` |
| **Web** | Nuxt 3 (Node) | `frontend` | `GET /` |
| **Admin** | Nuxt 3 (Node) | `admin` | `GET /login` |

**Do not** expect the backend URL to serve the Nuxt homepage. Users visit the **frontend** URL; the UI calls the **backend** via `NUXT_PUBLIC_API_URL`.

## Architecture

```
Browser → https://your-app.up.railway.app/          (Nuxt frontend)
              ↓ $fetch(apiUrl('/api/...'))
          https://your-api.up.railway.app/api/...   (Nitro backend)
```

## 1. Backend service (API)

1. Railway project → **New service** → connect `pirtTrip` repo.
2. **Settings → Root Directory** → `backend`.
3. **Build:** Dockerfile (`backend/Dockerfile`) — configured in `backend/railway.json`.
4. **Variables** (from `backend/.env.example`):

   | Variable | Notes |
   |----------|--------|
   | `SUPABASE_URL` | Required |
   | `SUPABASE_ANON_KEY` | Required |
   | `SUPABASE_SERVICE_ROLE_KEY` | Required |
   | `OTP_SECRET` | Required (32+ chars); falls back to `SUPABASE_SERVICE_ROLE_KEY` if unset |
   | `AQUASMS_API_KEY` | Partner registration SMS OTP |
   | `AQUASMS_USERNAME` | `pirttrip` |
   | `AQUASMS_SENDER_NAME` | `MARSTP` |
   | `RESEND_API_KEY` | Email OTP |
   | `EMAIL_FROM` | With Resend |
   | `HOST` | `0.0.0.0` (optional; Nitro respects it) |
   | `PORT` | **Do not set** — Railway injects `PORT` |

5. **Networking** → generate domain, e.g. `https://pirttrip-production.up.railway.app`.
6. Verify:

   ```bash
   curl -s https://YOUR-API.up.railway.app/api/health
   ```

   Root `/` returns a small JSON status object (API only), not the marketing site.

## 2. Frontend service (Nuxt)

1. **New service** → same repo.
2. **Root Directory** → `frontend`.
3. **Build:** `frontend/Dockerfile` — set **build args** or variables before build:

   | Variable | Example |
   |----------|---------|
   | `NUXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
   | `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |

4. **Runtime variables:**

   | Variable | Value |
   |----------|--------|
   | `HOST` | `0.0.0.0` |
   | `PORT` | Leave unset (Railway sets it) |
   | `API_URL` | `https://api.pirttrip.com` (server proxy target; required) |
   | `NUXT_PUBLIC_API_URL` | Leave **unset** at build (browser uses `/api` on frontend domain) |

5. Health check path: `/` (see `frontend/railway.json`).
6. Open the frontend domain in a browser — homepage should load.

## 3. Admin service (Nuxt)

Use **one** of these setups (pick A or B).

### Option A — Root Directory `admin` (recommended)

1. **New service** → same repo.
2. **Settings → Root Directory** → `admin`
3. **Dockerfile Path** → `Dockerfile` (uses `admin/Dockerfile` via `admin/railway.json`)

### Option B — Repo root (if you cannot change Root Directory)

1. **Settings → Root Directory** → leave empty / `.`
2. **Dockerfile Path** → `Dockerfile.admin` (repo root file — **not** `Dockerfile`)
3. Copy config from `railway.admin.json` or set health check to `/login`

### Variables (both options)

| Variable | Value |
|----------|--------|
| `NUXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `API_URL` | `https://api.pirttrip.com` (backend origin; no `/api` suffix) |
| `NUXT_PUBLIC_MAIN_SITE_URL` | `https://business.pirttrip.com` |

Custom domain: e.g. `admin.pirttrip.com`.

### Build error: `"/backend/package.json": not found`

The admin service is using the **backend** root `Dockerfile`. Fix:

1. **Root Directory** → `admin`, **or**
2. **Dockerfile Path** → `Dockerfile.admin` (not `Dockerfile`)

Then **Redeploy**.

### Partner subdomain (`business.pirttrip.com` → `/`)

The partner landing page lives in **`frontend/`** only (no separate `business/` app). Use **one** of these setups:

**Option A — same frontend service, extra custom domain (recommended)**

1. Railway **Networking** on the web service → add custom domain `business.pirttrip.com` (DNS CNAME to Railway).
2. Variables (optional; defaults include `business.pirttrip.com`):

   ```env
   NUXT_PUBLIC_PARTNER_HOSTS=business.pirttrip.com
   ```

3. On the **main** site service (or same service if both domains attach to one deploy), redirect old path:

   ```env
   NUXT_PUBLIC_PARTNER_SITE_URL=https://business.pirttrip.com
   ```

   Then `yoursite.com/business` → `https://business.pirttrip.com/`.

**Option B — second frontend service (partner-only build)**

1. Duplicate the frontend Railway service (root `frontend/`).
2. Custom domain `business.pirttrip.com` on that service only.
3. Variables:

   ```env
   NUXT_PUBLIC_SITE_VARIANT=business
   ```

   Root `/` serves the partner page; `/business` redirects to `/`.

**Local test:** add `127.0.0.1 business.localhost` to `/etc/hosts`, run `npm run dev` in `frontend`, open `http://business.localhost:3000/`.

**Cloudflare DNS (CNAME still yellow in Railway):** see [CLOUDFLARE_BUSINESS_SUBDOMAIN.md](./CLOUDFLARE_BUSINESS_SUBDOMAIN.md).

### Vercel (optional)

Nuxt 3 works well on Vercel. Use Vercel for `frontend/` and Railway for `backend/` if you prefer edge hosting for static/SSR. Set `NUXT_PUBLIC_API_URL` in Vercel project settings to your Railway API URL.

## 4. Local development

```bash
cd frontend && npm install && npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Leave `NUXT_PUBLIC_API_URL` empty — Nuxt proxies `/api` → `127.0.0.1:3001`.

## 4. Build / start commands (reference)

| Location | Build | Start |
|----------|-------|-------|
| `backend/` | `npm run build` | `npm run start` → `node .output/server/index.mjs` |
| `frontend/` | `npm run build` | `npm run start` → `node .output/server/index.mjs` |

From repo root:

```bash
npm run build:backend
npm run build:frontend
```

## 5. URL configuration examples

**Backend (Railway service 1)**

```env
# Railway Variables — backend service
SUPABASE_URL=https://fvkwophzzyaukacuiszv.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OTP_SECRET=...
RESEND_API_KEY=...
HOST=0.0.0.0
```

Public URL: `https://pirttrip-production.up.railway.app`

**Frontend (Railway service 2)**

```env
API_URL=https://api.pirttrip.com
NUXT_PUBLIC_SUPABASE_URL=https://fvkwophzzyaukacuiszv.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
HOST=0.0.0.0
```

Public URL: `https://pirttrip-web.up.railway.app` (your generated domain)

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| Healthcheck fails on API | Routes not in bundle | Use `backend/api/`, redeploy from `backend/` root |
| `Cannot find any route matching /` on API URL | Opening backend expecting Nuxt | Deploy **frontend** service; use its URL for `/` |
| CORS errors | Wrong API URL | Set `NUXT_PUBLIC_API_URL` to backend origin (no trailing slash) |
| OTP / DB errors | Missing env on backend | Copy `backend/.env` vars to Railway |

## Config files

- `backend/railway.json` — API Docker build + `/api/health`
- `frontend/railway.json` — Nuxt Docker build + `/`
- Root `railway.json` — legacy single-service API from root `Dockerfile` only

Railway reads `railway.json` in each service’s root directory.
