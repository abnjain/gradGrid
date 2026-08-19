# GradGrid Implementation Ideation

**Document Version:** 1.3  
**Status:** Internal Reference (Agent / Engineering)  
**Document Type:** Engineering Backlog & Ideation  
**Last Updated:** 2026-08-19  
**Governed By:** [GradGrid_Constitution_Documentation.md](./GradGrid_Constitution_Documentation.md)

**Related Documents:**
- [GradGrid_Repository_Status_Report.md](./GradGrid_Repository_Status_Report.md) — current codebase snapshot
- [GradGrid_Reference_Index.md](./GradGrid_Reference_Index.md) — document registry & update log
- [GradGrid_PRD.md](./GradGrid_PRD.md) — phased product roadmap
- [GradGrid_Security_Architecture.md](./GradGrid_Security_Architecture.md) — auth/RBAC design target
- [GradGrid_Infrastructure_Architecture.md](./GradGrid_Infrastructure_Architecture.md) — deployment target

> **Usage note:** Ideas here are engineering proposals, not approved ADRs. Promote decisions to [GradGrid_ADR_TDR_INDEX.md](./GradGrid_ADR_TDR_INDEX.md) before implementation when they affect architecture.

---

## 1. Purpose

This document captures **prioritized engineering ideas** derived from the [Repository Status Report](./GradGrid_Repository_Status_Report.md). It bridges the gap between product docs (what we want) and code reality (what exists).

Update this document when:
- A priority is completed (mark done, reference commit if known).
- New gaps are discovered during implementation.
- Phase boundaries shift.

---

## 2. Foundation Hardening (Phase 1 Prerequisites)

These items block safe production deployment and must precede domain feature work.

### 2.1 RBAC & Permission Engine

**Gap reference:** [Status Report §5.4](./GradGrid_Repository_Status_Report.md#54-authorization-scaffolded-not-functional), [Security Architecture](./GradGrid_Security_Architecture.md)

| # | Idea | Rationale | Depends On |
|---|------|-----------|------------|
| R1 | Implement DB fallback in `authorization.ts` `resolvePermissions()` | Permission middleware currently throws without Redis | `roles`, `permission_registry`, `role_assignments` tables (exist) |
| R2 | Create `PermissionService` + repository methods | Centralize permission resolution logic | R1 |
| R3 | Seed default platform + institution roles with permissions | Enables testing RBAC without manual DB inserts | [§2.3 Seed](#23-database-seed--local-dev) |
| R4 | Wire `loadPermissions` before `requirePermissions` on all protected routes | Platform routes currently fail | R1 |
| R5 | Cache resolved permissions in Redis (optional, post-R1) | Performance at scale (~800 concurrent) | Redis running |

**Acceptance criteria:**
- Platform super admin can hit `/platform/health` with correct permissions.
- Institution-scoped permissions filter by `institution_id`.
- Permission changes take effect without token re-issue (per security doc).

### 2.2 Frontend Auth Hardening

**Gap reference:** [Status Report §7.5](./GradGrid_Repository_Status_Report.md#75-missing-frontend-protections)

| # | Idea | Rationale |
|---|------|-----------|
| F1 | Add Next.js proxy protecting `/app/*`, `/platform/*`, and `/portal/*` | Server-side route guard; prevents unauthenticated access to portal shells |
| F2 | Redirect unauthenticated users to `/login` with `returnUrl` | Standard UX; supports deep links post-login |
| F3 | Separate platform vs institution session context | IA defines distinct portal boundaries |
| F4 | Fix CORS default to `http://localhost:3000` (or env-driven) | Refresh cookie flow breaks with `5173` default |

**Acceptance criteria:**
- Direct navigation to `/app/dashboard` without token redirects to login.
- Refresh token cookie works in local dev (Next :3000 → API :4000).

### 2.3 Database Seed & Local Dev

**Gap reference:** [Status Report §6.1](./GradGrid_Repository_Status_Report.md#61-overview)

| # | Idea | Rationale |
|---|------|-----------|
| S1 | Create `backend/prisma/seed.ts` | Referenced in `package.json` but missing |
| S2 | Seed: 1 platform super admin, 1 org, 1 institution, 1 academic session | Minimum viable multi-tenant demo |
| S3 | Seed: default roles + permissions per [PRD permission matrix](./GradGrid_PRD.md) | Unblocks RBAC testing |
| S4 | Seed: 2–3 test users (owner, teacher, accountant) with role assignments | Supports journey map validation |

**Acceptance criteria:**
- `npm run prisma:seed` succeeds on fresh migrate.
- Login works for seeded users with correct role labels.

### 2.4 DevOps & Production Parity

**Gap reference:** [Status Report §9](./GradGrid_Repository_Status_Report.md#9-devops--production-readiness), [Infrastructure Architecture](./GradGrid_Infrastructure_Architecture.md)

| # | Idea | Rationale |
|---|------|-----------|
| D1 | `docker-compose.yml` — PostgreSQL 16, Redis, API, (optional) frontend | Reproducible dev; aligns with infra doc |
| D2 | `Dockerfile` for backend (multi-stage, non-root user) | Production containerization |
| D3 | GitHub Actions: lint + typecheck + `prisma migrate deploy` + Playwright e2e | CI gate before merge |
| D4 | Enforce env-only secrets — remove dev fallbacks in production `NODE_ENV` | [Status Report §10.2](./GradGrid_Repository_Status_Report.md#102-production-risks) |
| D5 | Apply rate limiting middleware in `app.ts` | Config exists but unused |
| D6 | Expand root `.gitignore` for IDE/personal dotfiles | Prevents accidental commits |

**Scale target (from product goals):** ~2K peak, ~800 concurrent, ~150 DAU — modular monolith + PostgreSQL + Redis is sufficient; no microservices yet.

---

## 3. Domain Implementation Order

After §2 foundation items, implement domains in this order (aligns with [PRD Phase 1–2](./GradGrid_PRD.md)):

### 3.1 Organizations & Institutions (Phase 1)

| # | Backend | Frontend | IA Reference |
|---|---------|----------|--------------|
| O1 | `GET/POST/PATCH` platform institutions CRUD | Wire `platform/institutions/list` | [IA §Platform Admin](./GradGrid_Information_Architecture.md) |
| O2 | `GET/POST/PATCH /organizations` CRUD | Wire `admin/organizations/list` | Same |
| O3 | Academic session management API | Wire `admin/institutions/[id]/academic-sessions` | [Database Design §sessions](./GradGrid_Database_Design.md) |
| O4 | Institution-scoped middleware (`institutionId` from JWT/header) | Pass institution context in API client | Security Architecture §tenant isolation |

### 3.2 User Management (Phase 1)

| # | Backend | Frontend |
|---|---------|----------|
| U1 | Invite user, assign role, deactivate | `app/users/invite`, `app/users/list` |
| U2 | Platform user management | `admin/users/list` |
| U3 | Role assignment UI persistence | `app/settings/roles`, `admin/users/roles` |

### 3.3 Students & People (Phase 2)

| # | Backend | Frontend |
|---|---------|----------|
| P1 | Student CRUD + institution scope | `app/students/*` (replace `EmptyState` pages) |
| P2 | Teacher CRUD | `app/teachers/*` |
| P3 | Parent CRUD + student links | `app/parents/*` |
| P4 | CSV import/export endpoints | `app/students/export`, import flow (import page was removed; consolidate in hub) |

### 3.4 Admissions Pipeline (Phase 2)

| # | Backend | Frontend |
|---|---------|----------|
| A1 | Enquiry CRUD + status transitions | `app/admissions/pipeline`, `[id]` |
| A2 | Convert enquiry → student | `app/admissions/convert` |
| A3 | Document upload for enquiries | `admission_enquiry_documents` model exists |

### 3.5 Deferred (Phase 3+)

Academics, attendance, examination, finance, library, communication, reports — schema exists; implement after Phase 2 stabilizes. Frontend placeholders (`EmptyState`) are acceptable until then per [PRD](./GradGrid_PRD.md) "Coming Soon" guidance.

---

## 4. Testing Strategy Ideas

**Gap reference:** [Status Report §8](./GradGrid_Repository_Status_Report.md#8-testing)

| # | Idea | Priority |
|---|------|----------|
| T1 | Install vitest + add unit tests for `auth.service.ts`, `authorization.ts` | High |
| T2 | Backend integration tests with test DB (supertest) | Medium |
| T3 | Expand Playwright: institution settings save (once API exists) | Medium |
| T4 | CI: run e2e against docker-compose stack | After D1 |

---

## 5. Documentation Sync Ideas

| # | Idea | Target Doc |
|---|------|------------|
| DOC1 | Update root `README.md` — remove `.gitkeep` references, add real setup steps | `README.md` (outside docs; do only when requested) |
| DOC2 | Add API specification doc when first domain APIs ship | New `GradGrid_API_Specification.md` |
| DOC3 | Refresh Status Report after each foundation item completes | [Status Report](./GradGrid_Repository_Status_Report.md) |
| DOC4 | Register new ADRs for RBAC resolution, middleware auth, Docker | [ADR Index](./GradGrid_ADR_TDR_INDEX.md) |

---

## 6. Risk Register (Ideation)

| Risk | Mitigation (from §2) | Owner Phase |
|------|---------------------|-------------|
| RBAC blocks all protected APIs | R1–R4 | Phase 1 |
| Unauthenticated portal access | F1–F2 | Phase 1 |
| No reproducible dev environment | S1–S4, D1 | Phase 1 |
| 157 placeholder pages create false completeness | Mark `comingSoon` in nav (done); don't build CRUD until API exists | Ongoing |
| Bleeding-edge deps (Prisma 7, TS 7, Next 16) | Pin versions; monitor changelogs; test before upgrades | Ongoing |
| Dev secrets in production | D4 | Before any deploy |

---

## 7. Completion Tracker

Update this table as items ship. Link to [Master Update Log](./GradGrid_Reference_Index.md#4-master-update-log) when marking complete.

| ID | Item | Status | Completed |
|----|------|--------|-----------|
| R1 | RBAC DB fallback | Done | 2026-08-19 |
| R2 | PermissionService + repository | Done | 2026-08-19 |
| R3 | Seed roles + permissions | Done | 2026-08-19 |
| R4 | loadPermissions on protected routes | Done | 2026-08-19 |
| R5 | Redis permission cache (optional) | Done | 2026-08-19 |
| F1 | Next.js middleware / proxy | Done | 2026-08-18 |
| F2 | Login redirect with returnUrl | Done | 2026-08-18 |
| F3 | Platform vs institution portal context | Done | 2026-08-18 |
| F4 | CORS default localhost:3000 | Done | 2026-08-18 |
| S1 | Prisma seed script | Done | 2026-08-18 |
| S2 | Platform admin + org + institutions + sessions | Done | 2026-08-19 |
| S3 | PRD permission matrix seed | Done | 2026-08-19 |
| S4 | Owner / teacher / accountant seed users | Done | 2026-08-19 |
| D1 | docker-compose.yml | Done | 2026-08-18 |
| D2 | Backend Dockerfile | Done | 2026-08-18 |
| D3 | GitHub Actions CI | Done | 2026-08-18 |
| D4 | Env-only secrets in production | Done | 2026-08-18 |
| D5 | Rate limiting middleware | Done | 2026-08-19 |
| D6 | Expand .gitignore | Done | 2026-08-18 |
| O1 | Institutions CRUD API + platform list/new (`/platform`) | Done | 2026-08-19 |
| O2 | Organizations CRUD API + platform list/new (`/platform`) | Done | 2026-08-19 |
| O3 | Academic session management API + platform UI | Done | 2026-08-19 |
| O4 | Institution-scoped middleware (JWT) | Done | 2026-08-19 |
| U1 | Invite / assign / deactivate users | Done | 2026-08-19 |
| U2 | Platform user management | Done | 2026-08-19 |
| U3 | Role assignment UI persistence | Done | 2026-08-19 |
| AUTH-SPLIT | Separate auth APIs + FE trees: `/platform`, `/app`, `/portal` | Done | 2026-08-19 |
| P1 | Students CRUD + portal invite (institution-scoped) | Done | 2026-08-19 |
| P2 | Teachers / staff CRUD | Not started | — |
| P3 | Parents CRUD + child links + portal invite | Done | 2026-08-19 |
| P4 | Student CSV export | Done | 2026-08-19 |
| A1 | Enquiry list/create + status transitions | Done | 2026-08-19 |
| A2 | Convert enquiry → student + parent link | Done | 2026-08-19 |
| A3 | Enquiry document upload | Not started | — |
| PORTAL | Student/parent login: own institute only; student ID card/class; parent linked children only | Done | 2026-08-19 |
| Auth slice | Login, register, reset, account | Done | 2026-08-17 |
| App shell UX | Sidebar, theme, notifications | Done | 2026-08-17 |

---

## 8. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-17 | Engineering | Initial ideation: foundation hardening, domain order, testing, risks, tracker |
| 1.1 | 2026-08-19 | Engineering | Marked Phase 1 foundation + O1–O4/U3 complete; Phase 2 still open |
| 1.2 | 2026-08-19 | Engineering | Phase 1 complete: U1/U2 user invite, role assign, deactivate + platform users |
| 1.3 | 2026-08-19 | Engineering | Auth split (`/platform` `/app` `/portal`); learner portal scope; Phase 2 students/parents/admissions APIs |
