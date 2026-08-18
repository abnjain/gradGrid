# GradGrid deployment infrastructure (Phase 1)

Aligned with `docs/GradGrid_Infrastructure_Architecture.md` and Implementation Ideation §2.4.

## Stack

| Service    | Image / Build      | Role                          |
|------------|--------------------|-------------------------------|
| `postgres` | PostgreSQL 16      | Primary database              |
| `redis`    | Redis 7            | Cache, rate limits, sessions  |
| `api`      | `backend/Dockerfile` | Node.js API (Express)       |
| `frontend` | `frontend/Dockerfile` | Next.js standalone         |
| `caddy`    | Caddy 2            | Reverse proxy + TLS           |
| `prometheus` | Prometheus (profile) | Metrics scaffold          |

## Quick start (full stack)

```bash
cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD and all JWT/encryption secrets (32+ chars)

docker compose up -d --build
```

Open **http://localhost** — Caddy routes `/api/*` to the API and all other paths to Next.js.

### First-time database seed (optional)

With dev infra running (`docker compose -f docker-compose.dev.yml up -d`):

```bash
cd backend
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gradgrid?schema=public
npm run prisma:migrate:prod
npm run prisma:seed
```

## Local development (host apps + Docker infra)

```bash
docker compose -f docker-compose.dev.yml up -d
cd backend && npm run dev    # :4000
cd frontend && npm run dev     # :3000
```

## Production on DigitalOcean / AWS VM

1. Provision a VM (4 GB RAM minimum for full stack).
2. Install Docker Engine + Compose plugin.
3. Clone repo, configure `.env` with production secrets and `SITE_URL`.
4. For TLS with Caddy, set `SITE_ADDRESS=gradgrid.example.com` and open ports 80/443.
5. `docker compose up -d --build`
6. Point DNS (Cloudflare recommended) to the VM.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **ci.yml** — lint, typecheck, Prisma migrate, Playwright e2e
- **docker.yml** — build and verify container images

## Kubernetes (future)

Phase 3 per infra roadmap. Current images are compatible with K8s Deployments when you add manifests.
