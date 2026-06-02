# Nuxt 3 frontend — deploy as its own Railway service (Root Directory: frontend)
FROM node:20-alpine AS builder

WORKDIR /app

ARG NUXT_PUBLIC_API_URL
ARG NUXT_PUBLIC_SUPABASE_URL
ARG NUXT_PUBLIC_SUPABASE_ANON_KEY

ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL
ENV NUXT_PUBLIC_SUPABASE_URL=$NUXT_PUBLIC_SUPABASE_URL
ENV NUXT_PUBLIC_SUPABASE_ANON_KEY=$NUXT_PUBLIC_SUPABASE_ANON_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
# Runtime proxy target (set on Railway frontend service; not baked into client bundle)
ENV API_URL=
ENV NUXT_API_PROXY_ORIGIN=

COPY --from=builder /app/.output ./.output
WORKDIR /app/.output/server
RUN npm install --omit=dev

WORKDIR /app
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
