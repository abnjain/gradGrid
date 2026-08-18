# Deploy GradGrid on Render (Free Tier)

One-click Blueprint deploy for **PostgreSQL + API + Frontend** using Docker.

## Prerequisites

- [Render](https://render.com) account (free)
- GitHub repo with this code pushed to `main`

## Deploy steps

### 1. Create Blueprint

1. Open [Render Dashboard](https://dashboard.render.com)
2. **New +** → **Blueprint**
3. Connect your GitHub repo and select the branch (`main`)
4. Render reads [`render.yaml`](../../render.yaml) at the repo root
5. Click **Apply**

This creates:

| Resource | Name | Purpose |
|----------|------|---------|
| PostgreSQL | `gradgrid-db` | Database (free) |
| Web Service | `gradgrid-api` | Express API (Docker) |
| Web Service | `gradgrid-web` | Next.js frontend (Docker) |

Secrets (`ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, encryption keys) are **auto-generated** by the Blueprint.

### 2. Wait for builds

First Docker build takes **5–15 minutes**. Check logs for:

- `gradgrid-api` — `Running database migrations...` then `GradGrid API server started`
- `gradgrid-web` — Next.js standalone server listening

**If API fails with `DATABASE_URL is not set` or `datasource.url property is required`:**

1. Open **gradgrid-api → Environment** in Render Dashboard
2. Confirm `DATABASE_URL` exists (auto-wired from `gradgrid-db` via Blueprint)
3. If missing: **gradgrid-db → Connect → Internal Database URL** → paste as `DATABASE_URL` on `gradgrid-api`
4. **Manual Deploy** `gradgrid-api` again

### 3. Re-deploy if URLs are missing (first time only)

Blueprint links `CORS_ORIGIN` and `API_INTERNAL_URL` across services. If the first deploy fails linking URLs:

1. Wait until **both** web services show a URL
2. **Manual Deploy** → **Deploy latest commit** on `gradgrid-api` and `gradgrid-web`

### 4. Seed the database (one time)

Get **External Database URL** from `gradgrid-db` → **Connect** in Render Dashboard.

From your machine (with repo cloned):

```bash
cd backend
# Use External Database URL from gradgrid-db → Connect, with SSL:
export DATABASE_URL="postgresql://USER:PASS@HOST/gradgrid?sslmode=require"
npm run prisma:seed
```

Default credentials after seed:

| Role | Email | Password |
|------|-------|----------|
| Platform admin | `admin@gradgrid.app` | `Admin@12345` |
| Demo accountant | `accountant@demo.edu` | `Accountant@12345` |

### 5. Open the app

Visit the **`gradgrid-web`** service URL, e.g. `https://gradgrid-web.onrender.com`.

Flow: **Login → Choose organization → Choose campus → Dashboard**

## Optional: SMTP email

In **gradgrid-api → Environment**, add variables from [`render.env.example`](../../render.env.example):

- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.

Without SMTP, emails are logged server-side (password reset, OTP).

## How auth works on Render

```text
Browser → gradgrid-web (/api/v1/* same origin)
              ↓ runtime proxy
         gradgrid-api (internal Render URL)
```

- Frontend proxies `/api/*` to the API service ([`frontend/src/app/api/[[...path]]/route.ts`](../../frontend/src/app/api/[[...path]]/route.ts))
- Refresh cookies use `path=/` and `SameSite=lax` for same-origin proxying
- `NEXT_PUBLIC_API_URL=/api/v1` (no separate API subdomain needed)

## Free tier limitations

- **Cold starts** — services spin down after ~15 min idle (~30–60s wake time)
- **Postgres** — free database may expire after 90 days; export or upgrade before expiry
- **No Redis** — app runs without `REDIS_URL` (DB fallback for permissions)
- **750 hours/month** per workspace — enough for demo/staging

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 502 on login | Check `API_INTERNAL_URL` on `gradgrid-web` points to `gradgrid-api` URL |
| CORS errors | Re-deploy after both services have URLs; verify `CORS_ORIGIN` on API |
| Migration failed | Check `gradgrid-db` is running; view API deploy logs |
| Login redirects loop | Re-deploy web + api; clear browser cookies for the Render domain |

## Local parity

For local Docker Compose (Caddy stack), see [`infra/README.md`](../README.md).

For local dev with host-run apps:

```bash
docker compose -f docker-compose.dev.yml up -d
cd backend && npm run dev
cd frontend && npm run dev
```
