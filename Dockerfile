# Monorepo Railway Dockerfile (repo root)
# Backend (default): no extra vars
# Admin service: set Railway variable BUILD_TARGET=admin (available at build time)
# Or use Dockerfile.admin / Root Directory admin instead
ARG BUILD_TARGET=backend

FROM node:20-alpine AS builder

WORKDIR /app

ARG BUILD_TARGET
ARG NUXT_PUBLIC_SUPABASE_URL
ARG NUXT_PUBLIC_SUPABASE_ANON_KEY
ARG NUXT_PUBLIC_MAIN_SITE_URL
ARG NUXT_PUBLIC_API_URL

ENV NUXT_PUBLIC_SUPABASE_URL=$NUXT_PUBLIC_SUPABASE_URL
ENV NUXT_PUBLIC_SUPABASE_ANON_KEY=$NUXT_PUBLIC_SUPABASE_ANON_KEY
ENV NUXT_PUBLIC_MAIN_SITE_URL=$NUXT_PUBLIC_MAIN_SITE_URL
ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL

COPY ${BUILD_TARGET}/package.json ${BUILD_TARGET}/package-lock.json ./
RUN npm ci

COPY ${BUILD_TARGET}/ .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV API_URL=
ENV NUXT_API_PROXY_ORIGIN=

COPY --from=builder /app/.output ./.output
WORKDIR /app/.output/server
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

WORKDIR /app
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
