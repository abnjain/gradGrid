# syntax=docker/dockerfile:1
# GradGrid API — multi-stage production image (non-root, health-checked)

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl wget

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts package.json package-lock.json tsconfig.json ./
COPY src ./src
# prisma.config.ts requires DATABASE_URL at generate time; not used to connect during build
ENV DATABASE_URL=postgresql://build:build@localhost:5432/gradgrid?schema=public
RUN npx prisma generate && npm run build

FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
# Reuse generated client from build — avoids prisma CLI / client version mismatch
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
# Prisma CLI needed at runtime for `prisma migrate deploy` in entrypoint
RUN npm install prisma@$(node -pe "require('@prisma/client/package.json').version") --no-save

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 gradgrid \
  && adduser --system --uid 1001 --ingroup gradgrid gradgrid

COPY --from=build --chown=gradgrid:gradgrid /app/dist ./dist
COPY --from=prod-deps --chown=gradgrid:gradgrid /app/node_modules ./node_modules
COPY --from=prod-deps --chown=gradgrid:gradgrid /app/prisma ./prisma
COPY --chown=gradgrid:gradgrid package.json prisma.config.ts docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app
USER gradgrid
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health > /dev/null || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
