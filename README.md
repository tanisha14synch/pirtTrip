# Pirt Trip

Monorepo layout:

| Folder | Role |
|--------|------|
| `frontend/` | Nuxt 3 marketing site (port **3000**) |
| `business/` | Nuxt 3 partner / business page (port **3002**) — deploy separately on Railway |
| `backend/` | Nitro API server (port **3001**) — all `/api/*` routes |
| `backend/supabase/` | Database migrations |

## Development

**Either folder** starts **both** backend (:3001) and frontend (:3000):

```bash
# From repo root
npm install && npm run dev

# OR from frontend (same thing)
cd frontend && npm install && npm run dev
```

Frontend-only or backend-only:

```bash
cd frontend && npm run dev:frontend
cd frontend && npm run dev:backend
```

## Environment

- **Frontend:** `frontend/.env` — see `frontend/.env.example`
  - `NUXT_PUBLIC_SUPABASE_*`
  - `NUXT_PUBLIC_API_URL` — backend URL in production; leave empty locally (proxy to :3001)
- **Backend:** `backend/.env` — see `backend/.env.example` (service role, Resend, OTP secret)

## Deploy (Railway)

Three services: **backend**, **frontend**, **business**. See [docs/RAILWAY.md](docs/RAILWAY.md) and [business/README.md](business/README.md).

```bash
npm run dev:business   # API :3001 + business app :3002
```

## Database

```bash
npm run db:migrate
```

## Push to GitHub

Secrets (`.env`) are **not** committed — only `.env.example` files.

```bash
gh auth login
npm run publish:github
# optional: npm run publish:github -- MyRepoName public
```
