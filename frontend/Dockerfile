# ============================================================
# Stage 1 : DEPENDENCIES
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Stage 2 : BUILD
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /build

COPY --from=deps /build/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================
# Stage 3 : RUNTIME (standalone output)
# ============================================================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /build/public ./public
COPY --from=builder --chown=appuser:appgroup /build/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /build/.next/static ./.next/static

LABEL maintainer="restauranthub" \
      service="frontend" \
      version="1.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

USER appuser

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
