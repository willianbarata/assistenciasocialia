############################################
# Base
############################################
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app


############################################
# Dependencies
############################################
FROM base AS deps

COPY package.json package-lock.json* ./

RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi


############################################
# Builder
############################################
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


############################################
# Runner (produção)
############################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache openssl

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Arquivos públicos
COPY --from=builder /app/public ./public

# Diretórios usados pelo Next
RUN mkdir -p .next \
 && chown -R nextjs:nodejs .next public

# Next standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Prisma CLI fixada (evita breaking change)
RUN npm install -g prisma@5.22.0

USER nextjs

# Em produção:
# - aplica schema no banco
# - sobe o Next
CMD ["/bin/sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
