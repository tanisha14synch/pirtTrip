# Railway build from repo root → API backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

COPY --from=builder /app/.output ./.output
WORKDIR /app/.output/server
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

WORKDIR /app
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
