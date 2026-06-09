# Nuxt 3 admin panel — deploy as its own Railway service (Root Directory: admin)
FROM node:22-alpine AS builder

WORKDIR /app

ARG NUXT_PUBLIC_SUPABASE_URL
ARG NUXT_PUBLIC_SUPABASE_ANON_KEY
ARG NUXT_PUBLIC_MAIN_SITE_URL

ENV NUXT_PUBLIC_SUPABASE_URL=$NUXT_PUBLIC_SUPABASE_URL
ENV NUXT_PUBLIC_SUPABASE_ANON_KEY=$NUXT_PUBLIC_SUPABASE_ANON_KEY
ENV NUXT_PUBLIC_MAIN_SITE_URL=$NUXT_PUBLIC_MAIN_SITE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV API_URL=https://api.pirttrip.com
ENV NUXT_PUBLIC_SUPABASE_URL=https://fvkwophzzyaukacuiszv.supabase.co

COPY --from=builder /app/.output ./.output
WORKDIR /app/.output/server
RUN npm install --omit=dev

WORKDIR /app
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
