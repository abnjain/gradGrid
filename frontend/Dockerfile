# syntax=docker/dockerfile:1
# GradGrid Frontend — Next.js standalone production image

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat wget

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG NEXT_PUBLIC_DIRECT_API_URL
ARG API_INTERNAL_URL
ARG DOCKER_BUILD_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_DIRECT_API_URL=$NEXT_PUBLIC_DIRECT_API_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV DOCKER_BUILD_API_URL=$DOCKER_BUILD_API_URL
ENV DOCKER_BUILD=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
# Render injects PORT at runtime — do not hardcode
ENV PORT=3000
RUN addgroup --system --gid 1001 gradgrid \
  && adduser --system --uid 1001 --ingroup gradgrid gradgrid

COPY --from=build /app/public ./public
COPY --from=build --chown=gradgrid:gradgrid /app/.next/standalone ./
COPY --from=build --chown=gradgrid:gradgrid /app/.next/static ./.next/static

USER gradgrid
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1

CMD ["node", "server.js"]
