# =====================================================================
# Stage 1 : DEPENDENCIES
# =====================================================================
FROM node:20-alpine AS deps

WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm ci

# =====================================================================
# Stage 2 : BUILD
# =====================================================================
FROM node:20-alpine AS builder

WORKDIR /build

COPY --from=deps /build/node_modules ./node_modules
COPY . .

RUN npm run build

# ======================================================================
# Stage 3 : RUNTIME
# ======================================================================
FROM node:20-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/dist ./dist
COPY --from=deps /build/node_modules ./node_modules
COPY package.json ./

LABEL maintainer="restauranthub" \ 
      service="service-notification" \ 
      version="1.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \ 
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/heath || exit 1

USER appuser

EXPOSE 3000

CMD [ "node", "dist/main" ]