# Nuxt 3 admin panel — deploy as its own Railway service (Root Directory: admin)
FROM node:22-alpine AS builder

WORKDIR /app

ARG NUXT_PUBLIC_MAIN_SITE_URL
ENV NUXT_PUBLIC_MAIN_SITE_URL=$NUXT_PUBLIC_MAIN_SITE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0
ENV API_URL=https://api.pirttrip.com

COPY --from=builder /app/.output ./.output
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
WORKDIR /app/.output/server
RUN npm install --omit=dev

WORKDIR /app
EXPOSE 3000

CMD ["sh", "start.sh"]
