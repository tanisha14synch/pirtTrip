# Railway deployment (backend + frontend + business)

This monorepo has **three deployable apps**. Use **separate Railway services** so the marketing site, partner page, and API do not conflict.

| Service | Stack | Root directory | Health check |
|---------|--------|----------------|--------------|
| **API** | Nitro (Node) | `backend` | `GET /api/health` |
| **Web** | Nuxt 3 (Node) | `frontend` | `GET /` |
| **Business** | Nuxt 3 (Node) | `business` | `GET /` |

**Do not** expect the backend URL to serve the Nuxt homepage. Users visit the **frontend** URL; the partner page lives on the **business** service (`/` = same UI as `/business` on the main site).

## Architecture

```
Browser → https://www.pirttrip.com/                 (Nuxt frontend)
Browser → https://business.pirttrip.com/          (Nuxt business — partner page at /)
              ↓ $fetch('/api/...')  (proxied)
          https://api.pirttrip.com/api/...          (Nitro backend)
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
   | `OTP_SECRET` | Required (32+ chars) |
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
7. Optional: set `NUXT_PUBLIC_BUSINESS_URL` (build-time) to your business service URL so `/business` redirects there (301).

## 3. Business service (Partner page)

1. **New service** → same repo.
2. **Root Directory** → `business`.
3. **Build:** `business/Dockerfile` — see `business/railway.json`.
4. **Runtime variables:**

   | Variable | Value |
   |----------|--------|
   | `API_URL` | Same backend URL as frontend (`https://api.pirttrip.com`) |
   | `NUXT_PUBLIC_MAIN_SITE_URL` | Main web app URL (`https://www.pirttrip.com`) for legal links & logo |
   | `HOST` | `0.0.0.0` |

5. Public URL example: `https://business.pirttrip.com` — root `/` is the full partner landing (hero, trust, how we work, footer).

See `business/README.md` for local dev on port `3002`.

### Vercel (optional)

Nuxt 3 works well on Vercel. Use Vercel for `frontend/` and Railway for `backend/` if you prefer edge hosting for static/SSR. Set `NUXT_PUBLIC_API_URL` in Vercel project settings to your Railway API URL.

## 4. Local development

```bash
cd frontend && npm install && npm run dev
```

- Frontend: `http://localhost:3000` (includes `/business`)
- Business only: `npm run dev:business` → `http://localhost:3002`
- Backend: `http://localhost:3001`
- Leave `NUXT_PUBLIC_API_URL` empty — Nuxt proxies `/api` → `127.0.0.1:3001`.

## 5. Build / start commands (reference)

| Location | Build | Start |
|----------|-------|-------|
| `backend/` | `npm run build` | `npm run start` → `node .output/server/index.mjs` |
| `frontend/` | `npm run build` | `npm run start` → `node .output/server/index.mjs` |
| `business/` | `npm run build` | `npm run start` → `node .output/server/index.mjs` |

From repo root:

```bash
npm run build:backend
npm run build:frontend
npm run build:business
```

## 6. URL configuration examples

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

**Business (Railway service 3)**

```env
API_URL=https://api.pirttrip.com
NUXT_PUBLIC_MAIN_SITE_URL=https://www.pirttrip.com
HOST=0.0.0.0
```

Public URL: `https://business.pirttrip.com` (custom domain recommended)

**Frontend redirect to business (optional)**

```env
NUXT_PUBLIC_BUSINESS_URL=https://business.pirttrip.com
```

Rebuild the frontend after setting this so `/business` redirects to the dedicated service.

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| Healthcheck fails on API | Routes not in bundle | Use `backend/api/`, redeploy from `backend/` root |
| `Cannot find any route matching /` on API URL | Opening backend expecting Nuxt | Deploy **frontend** service; use its URL for `/` |
| CORS errors | Wrong API URL | Set `NUXT_PUBLIC_API_URL` to backend origin (no trailing slash) |
| OTP / DB errors | Missing env on backend | Copy `backend/.env` vars to Railway |

## Config files

- `backend/railway.json` — API Docker build + `/api/health`
- `frontend/railway.json` — Nuxt Docker build + `/`
- `business/railway.json` — Partner page Nuxt app + `/`
- Root `railway.json` — legacy single-service API from root `Dockerfile` only

Railway reads `railway.json` in each service’s root directory.
