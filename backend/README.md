# Pirt Trip — Backend API

Standalone [Nitro](https://nitro.build/) server for all `/api/*` routes (waitlist OTP, partner registration, admin leads).

## Structure

```
backend/
  server/api/     # HTTP routes
  server/utils/   # Supabase, mailer, OTP
  lib/            # validation, phone helpers
  types/          # shared DB types
  supabase/       # SQL migrations
```

## Setup

```bash
cp .env.example .env
# Add Supabase + Resend keys (copy from frontend/.env if you had one)
npm install
```

## Run

```bash
npm run dev          # http://localhost:3001
```

From repo root (frontend + backend together):

```bash
npm install          # installs concurrently
npm run dev          # backend :3001 + frontend :3000
```

## Migrations

```bash
npm run db:migrate
```

Frontend proxies `/api` → backend in dev (`frontend/nuxt.config.ts`).
