# PirtTrip Business (Partner Page)

Standalone Nuxt app for the **Become a Partner / business** landing page. Deploy separately on Railway (same pattern as `backend/` and `frontend/`).

| | |
|---|---|
| **Local URL** | `http://localhost:3002` (when using `npm run dev` from repo root) |
| **Production** | e.g. `https://business.pirttrip.com` — root `/` is the partner page |
| **API** | Same Nitro backend as the main site (`API_URL` / `/api` proxy) |

## Develop

From repo root:

```bash
npm run dev:business
```

Or from this folder (API must be running on port 3001):

```bash
cd business && npm install && npm run dev -- --port 3002
```

## Railway

1. **New service** → connect repo.
2. **Root Directory** → `business`.
3. **Variables:** `API_URL` (backend URL), `NUXT_PUBLIC_MAIN_SITE_URL` (main web app, for legal links).
4. **Health check:** `/`.

Point `www.pirttrip.com/business` to this service via redirect on the main frontend (`NUXT_PUBLIC_BUSINESS_URL`) or DNS/subdomain.

See [docs/RAILWAY.md](../docs/RAILWAY.md) for the full three-service setup.
