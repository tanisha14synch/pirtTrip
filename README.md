# Pirt Trip

Monorepo layout:

| Folder | Role |
|--------|------|
| `frontend/` | Nuxt 3 UI (port **3000**) |
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

- **Frontend:** `frontend/.env` — `NUXT_PUBLIC_SUPABASE_*` only
- **Backend:** `backend/.env` — service role, Resend, OTP secret (see `backend/.env.example`)

Copy keys from the old single `.env` into `backend/.env` if you had everything in `frontend/.env` before.

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
