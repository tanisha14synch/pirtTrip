# Environment variables — local & production

## Overview

| | **Local** (`npm run dev`) | **Production** (Railway) |
|---|---|---|
| Frontend URL | `http://localhost:3000` | `https://pirttrip-production.up.railway.app` (your domain) |
| Backend API | `http://127.0.0.1:3001` | `https://api.pirttrip.com` |
| Browser calls | Same-origin `/api/...` | Same-origin `/api/...` |
| Proxy target | `API_URL` → local backend | `API_URL` → `https://api.pirttrip.com` |

Browser always uses **relative** `/api/*` (no stale build-time API host).  
The frontend server proxies to `API_URL` at runtime.

---

## Local setup

### 1) Backend — `backend/.env`

```env
SUPABASE_URL=https://YOUR_REF.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OTP_SECRET=...
OTP_DEBUG=true
```

### 2) Frontend — copy templates

```bash
cp frontend/.env.example frontend/.env
cp frontend/.env.development.example frontend/.env.development
```

`frontend/.env` — Supabase public keys (shared)  
`frontend/.env.development` — `API_URL=http://127.0.0.1:3001`

### 3) Run

```bash
cd frontend && npm run dev
```

- UI: http://localhost:3000  
- API: http://127.0.0.1:3001  

---

## Production (Railway)

### Backend service (`backend/` root)

```env
SUPABASE_URL=https://fvkwophzzyaukacuiszv.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # required — fixes "service role is not configured"
OTP_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=Pirttrip <noreply@yourdomain.com>
HOST=0.0.0.0
OTP_DEBUG=false
```

Redeploy **backend** after adding `SUPABASE_SERVICE_ROLE_KEY`.

### Frontend service (`frontend/` root)

```env
NUXT_PUBLIC_SUPABASE_URL=https://fvkwophzzyaukacuiszv.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
API_URL=https://api.pirttrip.com
HOST=0.0.0.0
```

**Do not** set `NUXT_PUBLIC_API_URL` to an old Railway URL.  
Redeploy **frontend** after variable changes.

---

## Quick verify

```bash
# Backend health
curl https://api.pirttrip.com/api/health

# OTP (should NOT say "service role is not configured")
curl -X POST https://api.pirttrip.com/api/waitlist/send-otp \
  -H "content-type: application/json" \
  -d '{"email":"test@example.com"}'
```
