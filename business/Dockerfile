# Nuxt 3 business / partner page — deploy as its own Railway service (Root Directory: business)
FROM node:20-alpine AS builder

WORKDIR /app

ARG NUXT_PUBLIC_API_URL
ARG NUXT_PUBLIC_MAIN_SITE_URL

ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL
ENV NUXT_PUBLIC_MAIN_SITE_URL=$NUXT_PUBLIC_MAIN_SITE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV API_URL=
ENV NUXT_API_PROXY_ORIGIN=

COPY --from=builder /app/.output ./.output
WORKDIR /app/.output/server
RUN npm install --omit=dev

WORKDIR /app
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
