# GradGrid Repository Status Report

**Document Version:** 1.1
**Status:** Internal Reference (Agent / Engineering)  
**Document Type:** Implementation Snapshot  
**Last Updated:** 2026-08-20
**Scope:** Full repository analysis — backend, frontend, database, DevOps, security, testing  
**Index:** [GradGrid_Reference_Index.md](./GradGrid_Reference_Index.md)  
**Next Steps:** [GradGrid_Implementation_Ideation.md](./GradGrid_Implementation_Ideation.md)

> **Usage note:** Maintained under `docs/` for agent/engineering reference. Update this document and the [Master Update Log](./GradGrid_Reference_Index.md#4-master-update-log) when the codebase changes materially. Not pushed to remote unless explicitly requested.

> **Current-state addendum (2026-08-20):** The original sections below are retained as historical analysis from 2026-08-17. The current implementation has since completed the Phase 1 foundation and the tracked Phase 2 people/admissions slice. Current authoritative status is [GradGrid_Implementation_Ideation.md §7](./GradGrid_Implementation_Ideation.md#7-completion-tracker): RBAC fallback/service/seed, Next proxy and portal split, Docker/CI/rate limiting, organization/institution/session management, platform/institution user management, student and parent APIs, learner portal scoping, admissions pipeline, teacher/staff CRUD, and admission-enquiry document storage flows are implemented. Academic operations, attendance, examinations, finance, library, communication, and reports remain deferred. The default document storage adapter is local filesystem storage; durable object storage remains an operational follow-up for production deployments.

---

## 1. Purpose

This document captures a point-in-time assessment of the GradGrid codebase. It exists as an internal engineering reference to track what is implemented, what is scaffolded, and what remains before production readiness.

It supplements (does not replace) the PRD, Database Design, Information Architecture, and Security/Infrastructure Architecture documents.

**Document relationships:**

| This Section | Product / Architecture Doc |
|--------------|---------------------------|
| §2 Executive Summary | [GradGrid_PRD.md](./GradGrid_PRD.md) phased roadmap |
| §6 Database | [GradGrid_Database_Design.md](./GradGrid_Database_Design.md), [GradGrid_ERD.mermaid](./GradGrid_ERD.mermaid) |
| §7 Frontend | [GradGrid_Information_Architecture.md](./GradGrid_Information_Architecture.md) |
| §9 DevOps | [GradGrid_Infrastructure_Architecture.md](./GradGrid_Infrastructure_Architecture.md) |
| §10 Security | [GradGrid_Security_Architecture.md](./GradGrid_Security_Architecture.md) |
| §11 Maturity Matrix | [GradGrid_Implementation_Ideation.md](./GradGrid_Implementation_Ideation.md) §3 |

---

## 2. Executive Summary

GradGrid is a **multi-tenant education ERP SaaS** in **late Phase 0 / early Phase 1**. The repository has:

| Strength | Gap |
|----------|-----|
| Comprehensive product documentation (13+ docs) | README outdated vs actual code |
| Full Prisma schema (57 models, 2 migrations) | Domain APIs beyond auth are stubs |
| Production-oriented auth backend | RBAC tables exist but resolution logic is missing |
| Polished Next.js UI shell (157 pages) | ~80+ pages are placeholders (`EmptyState`) |
| Playwright E2E for auth/settings/landing | No backend unit tests; vitest script broken |
| SEO-rich marketing pages | No Docker, CI/CD, or seed data in repo |

**Maturity verdict:** Documentation and schema are ahead of implementation. One real vertical slice exists (auth + account management). ERP business logic is not yet wired end-to-end.

---

## 3. Repository Layout

```
gradgrid/
├── backend/          # Express API, Prisma ORM, domain modules
├── frontend/         # Next.js App Router (institution + platform admin portals)
├── docs/             # Product & technical documentation
├── README.md         # Product overview (partially outdated)
└── .gitignore        # Minimal (node_modules, .env, dist)
```

**Git state (as of 2026-08-17):** 10 commits on `main`, 8 ahead of `origin/main`.

**Not present in repo:** Docker, Kubernetes manifests, GitHub Actions, `docker-compose.yml`, monitoring configs (described in docs only).

---

## 4. Technology Stack

### 4.1 Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | ≥ 18 LTS (target 22) |
| Framework | Express | ^4.21.0 |
| Language | TypeScript | ^7.0.0 |
| ORM | Prisma | ^7.0.0 |
| Database driver | pg + @prisma/adapter-pg | ^8.22 / ^7.8 |
| Auth | JWT + rotating refresh tokens | jsonwebtoken ^9.0.2 |
| Password hashing | bcryptjs | ^3.0.3 |
| Validation | Zod | ^3.23.8 |
| Logging | Pino | ^10.0.0 |
| Email | Resend HTTPS API | API-based |
| Cache | ioredis | ^5.11.1 (scaffolded) |
| Security headers | Helmet | ^7.1.0 |

**Entry points:** `backend/src/server.ts`, `backend/src/app.ts`

### 4.2 Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.10 |
| UI library | React | 19.2.4 |
| Styling | Tailwind CSS | ^4 |
| Icons | lucide-react | ^1.25.0 |
| Utilities | clsx, tailwind-merge, cva | — |
| E2E testing | Playwright | ^1.49.0 |
| Unit testing | Vitest | **Not installed** (script exists) |

**State management:** React Context only (`auth-context.tsx`, `ToastProvider`). No Redux, Zustand, or TanStack Query.

---

## 5. Backend Architecture

### 5.1 Layer Pattern

Each domain module follows:

```
routes → controller → service → repository → Prisma
```

Shared layers:

| Path | Responsibility |
|------|----------------|
| `backend/src/config/` | Typed env-based configuration |
| `backend/src/middleware/` | Auth, authorization, validation, error handling, request ID |
| `backend/src/shared/errors/` | Structured error types |
| `backend/src/shared/utils/` | Logger, password, email, encryption, cache |
| `backend/src/modules/_template.ts` | Module scaffolding reference |

### 5.2 API Surface (`/api/v1`)

| Module | Mount Path | Status | Notes |
|--------|-----------|--------|-------|
| Health | `/health` | ✅ Live | Liveness check |
| Auth | `/auth` | ✅ Implemented | Full auth lifecycle (see §5.3) |
| SEO | `/seo` | ~ Partial | Sitemap generation from DB |
| Platform | `/platform` | Stub | Health only; RBAC guard will fail |
| Institution | `/institutions` | Stub | No route handlers |
| Student | `/students` | Stub | Auth middleware only |
| Academic | `/academic` | Stub | — |
| Attendance | `/attendance` | Stub | — |
| Examination | `/exams` | Stub | — |
| Finance | `/finance` | Stub | — |
| Communication | `/communication` | Stub | — |
| Reports | `/reports` | Stub | — |

### 5.3 Auth Module (Implemented)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login` | POST | Public | Email/password login |
| `/auth/register` | POST | Public | User registration |
| `/auth/refresh` | POST | Cookie | Rotate access token |
| `/auth/forgot-password` | POST | Public | Send reset email (enumeration-safe) |
| `/auth/reset-password` | POST | Public | Exchange token for new password |
| `/auth/me` | GET | Bearer | Full user profile + sessionId |
| `/auth/logout` | POST | Bearer | Revoke session |
| `/auth/profile` | PATCH | Bearer | Update name, phone |
| `/auth/change-password` | POST | Bearer | Verify current, set new; revoke other sessions |
| `/auth/sessions` | GET | Bearer | List active sessions |
| `/auth/sessions/:sessionId` | DELETE | Bearer | Revoke a session (not current) |

**Token strategy:**
- Access token: short-lived, in-memory on client (Bearer header)
- Refresh token: httpOnly cookie, rotating with family-based reuse detection
- Session tracking via `user_sessions` table

**Email:** Resend HTTPS API integration (`backend/src/shared/utils/email.ts`). This avoids Render Free's blocked SMTP ports. In development, an absent `RESEND_API_KEY` logs the email instead of sending; production requires the Resend key and a verified `EMAIL_FROM` address.

### 5.4 Authorization (Scaffolded, Not Functional)

`backend/src/middleware/authorization.ts` defines a permission resolution cascade:

1. Redis cache (if enabled)
2. Database fallback — **not implemented** (throws `ForbiddenError`)

RBAC tables exist in Prisma (`roles`, `permission_registry`, `role_permissions`, `role_assignments`) but no service/repository resolves them. Platform routes using `requirePermissions` without `loadPermissions` will always fail.

### 5.5 Configuration

Key environment variables (`backend/.env.example`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signing |
| `ENCRYPTION_KEY`, `ENCRYPTION_SALT` | AES-256-GCM for sensitive fields |
| `CORS_ORIGIN` | Allowed frontend origin (default: `localhost:5173` — **mismatch with Next on 3000**) |
| `REDIS_URL` | Permission cache |
| `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email through Resend HTTPS API |
| `FRONTEND_URL` | Password reset link base |
| Rate limit vars | Defined but **not applied** in `app.ts` |

**Risk:** Dev fallback secrets exist in `config/index.ts` if env vars are unset.

---

## 6. Database

### 6.1 Overview

- **Engine:** PostgreSQL 16
- **ORM:** Prisma 7
- **Schema:** `backend/prisma/schema.prisma` — **57 models**
- **Migrations:** 2 (`init`, `add_user_fields`)
- **Seed:** `prisma:seed` configured in `package.json` but **`prisma/seed.ts` does not exist**

### 6.2 Domain Coverage

| Domain | Models (representative) |
|--------|------------------------|
| Platform | `organizations`, `institutions`, `academic_sessions` |
| Identity | `users`, `user_passwords`, `refresh_tokens`, `user_sessions`, `password_resets`, `email_verifications` |
| RBAC | `roles`, `permission_registry`, `role_permissions`, `role_assignments` |
| People | `students`, `parents`, `student_parent_links`, `staff` |
| Academic structure | `departments`, `houses`, `classes`, `sections`, `subjects`, `section_subject_assignments`, `student_section_enrollments` |
| Admissions | `admission_enquiries`, status logs, notes, documents |
| Attendance | `attendance_sessions`, `student_attendance_records`, `teacher_attendance_records` |
| Examination | `exam_types`, `exams`, `exam_subjects`, `marks`, `grade_rules`, `grade_rule_items` |
| Finance | `fee_structures`, `fee_payments`, `salary_records`, discounts |
| Library | `books`, `book_copies`, `library_cards`, `book_issues` |
| Communication | `message_templates`, `messages`, `message_recipients` |
| Documents | `document_templates`, `generated_documents`, `file_uploads` |
| Audit | `audit_logs`, `platform_audit_logs`, `notifications` |

**Conventions:** UUID PKs, soft deletes (`deleted_at`), `institution_id` scoping, snake_case table names.

---

## 7. Frontend Architecture

### 7.1 Scale

| Metric | Count |
|--------|-------|
| Total `page.tsx` files | 157 |
| Pages using `EmptyState` (placeholder) | ~80+ |
| UI components | ~36 |
| Playwright E2E spec files | 4 |

### 7.2 Route Groups

| Area | Path Pattern | Status |
|------|-------------|--------|
| Marketing | `/`, `/about`, `/contact`, `/privacy`, `/terms` | ✅ Complete (SEO-rich) |
| Auth | `/(auth)/login`, `/signup`, `/forgot-password`, `/reset-password` | ✅ API-backed |
| Institution portal | `/app/*` | UI shell; auth + account integrated |
| Platform admin | `/platform/*` (legacy `/admin/*` redirects) | UI shell; wired for orgs/institutions/users |
| Institution staff | `/app/*` | UI shell; students/parents/admissions APIs shipping |
| Student / Parent | `/portal/*` | Scoped learner portal: own institute only |
| Account | `/app/account/*` | ✅ API-backed (profile, password, sessions) |

### 7.3 Key Components

| Path | Role |
|------|------|
| `components/layout/app-shell.tsx` | Sidebar nav, theme toggle, notifications, user menu |
| `components/layout/notifications-dropdown.tsx` | Notification UI |
| `components/layout/quick-actions-menu.tsx` | Quick actions |
| `components/shared/settings-page-layout.tsx` | Shared settings page wrapper |
| `components/shared/module-hub.tsx` | Module landing cards |
| `components/ui/*` | Design system (button, input, table, modal, toast, etc.) |
| `lib/auth-context.tsx` | Auth state, silent refresh, profile/password/session APIs |
| `lib/api-client.ts` | Fetch wrapper with token refresh |
| `lib/notifications.ts` | Client-side notification utility |

### 7.4 Integration Status

| Category | API-integrated | Mock / placeholder |
|----------|:--------------:|:------------------:|
| Auth flows | ✅ | — |
| Account management | ✅ | — |
| Dashboards | — | ✅ Hardcoded stats |
| List pages (users, teachers, students, orgs) | — | ✅ `mockData` |
| Settings forms | — | ✅ Toast on save, no persistence |
| Module sub-pages (reports, library, finance, etc.) | — | ✅ `EmptyState` |
| CRUD forms (new/edit) | — | ✅ Mostly stubs |

### 7.5 Missing Frontend Protections

- **No `middleware.ts`** — `/app/*` and `/admin/*` are accessible without authentication at the Next.js layer
- Auth is enforced only client-side via `AuthProvider` redirect logic

---

## 8. Testing

| Type | Location | Status |
|------|----------|--------|
| E2E (Playwright) | `frontend/e2e/` | 4 specs: `auth`, `settings`, `static-pages`, `landing` |
| Playwright config | `playwright.config.ts`, `playwright.local.config.ts` | Spins up Next dev on port 3000 |
| Unit (Vitest) | — | Script in `package.json`, **dependency not installed** |
| Backend tests | — | None |

---

## 9. DevOps & Production Readiness

| Item | In Repo | In Docs |
|------|:-------:|:-------:|
| Docker / Compose | ❌ | ✅ |
| Kubernetes manifests | ❌ | ✅ |
| CI/CD (GitHub Actions) | ❌ | ✅ |
| Environment examples | ✅ | — |
| Prisma migrations | ✅ | — |
| Seed data | ❌ | — |
| Monitoring (Prometheus) | ❌ | ✅ |
| Rate limiting (enforced) | ❌ | ✅ |

**Target deployment:** Cloud-agnostic; DigitalOcean preferred, AWS as alternative. Containerization via Docker, orchestration via Kubernetes.

**Scale targets:** ~2K peak users, ~800 concurrent, ~150 DAU.

---

## 10. Security Posture

### 10.1 Strengths

- Helmet, CORS with credentials, structured error handling
- Rotating refresh tokens with family revocation
- Password hashing (bcrypt), reset tokens stored as SHA-256 hashes
- AES-256-GCM encryption utility for sensitive fields
- Audit log hooks on auth events
- `.env` correctly gitignored

### 10.2 Production Risks

| Risk | Severity | Detail |
|------|----------|--------|
| Dev secret fallbacks | High | JWT/encryption defaults if env vars missing |
| No frontend route guards | High | `/app/*`, `/admin/*` open without server-side auth |
| RBAC not wired | High | Permission middleware fails without Redis cache |
| CORS default mismatch | Medium | Default `localhost:5173` vs Next on `3000` |
| Rate limiting not applied | Medium | Config exists, not used in `app.ts` |
| Refresh token in response body | Medium | Weakens httpOnly-only strategy |
| Encryption not applied to PII | Medium | Utility exists, not integrated into student/staff fields |
| No MFA | Planned | Per security architecture doc |
| Google OAuth env vars | Low | Configured, no routes implemented |
| Thin `.gitignore` | Low | IDE/personal dotfiles can leak into repo root |

---

## 11. Implementation Maturity Matrix

| Layer | Designed | Schema | Backend API | Frontend UI | Integrated |
|-------|:--------:|:------:|:-----------:|:-----------:|:----------:|
| Auth & Sessions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Account Management | ✅ | ✅ | ✅ | ✅ | ✅ |
| SEO / Sitemaps | ✅ | ✅ | ~ | ✅ | ~ |
| RBAC / Permissions | ✅ | ✅ | ❌ | UI only | ❌ |
| Organizations | ✅ | ✅ | ❌ | UI shell | ❌ |
| Institutions | ✅ | ✅ | ❌ | UI shell | ❌ |
| Students / Teachers / Parents | ✅ | ✅ | ❌ | UI shell | ❌ |
| Admissions | ✅ | ✅ | ❌ | Placeholders | ❌ |
| Academics | ✅ | ✅ | ❌ | Placeholders | ❌ |
| Attendance | ✅ | ✅ | ❌ | Placeholders | ❌ |
| Examination | ✅ | ✅ | ❌ | Placeholders | ❌ |
| Finance | ✅ | ✅ | ❌ | Placeholders | ❌ |
| Library | ✅ | ✅ | ❌ | Placeholders | ❌ |
| Communication | ✅ | ✅ | ❌ | Placeholders | ❌ |
| Reports / Audit | ✅ | ✅ | ❌ | Placeholders | ❌ |
| DevOps / CI/CD | ✅ | — | ❌ | ❌ | ❌ |

---

## 12. Known Tech Debt

1. README describes backend/frontend as `.gitkeep` placeholders — code is substantial
2. 157 pages with ~50% placeholders — large surface before features land
3. Duplicate type definitions (nav types in `types/index.ts` and `app-shell.tsx`)
4. Generic `frontend/README.md` (create-next-app default)
5. Platform routes use `requirePermissions` without `loadPermissions`
6. Bleeding-edge versions (Prisma 7, TypeScript 7, Next 16) — monitor ecosystem compatibility
7. Personal dotfiles in repo root (`.bashrc`, `.vscode`, etc.) — not gitignored

---

## 13. Related Documents

| Document | Relevance |
|----------|-----------|
| [GradGrid_Reference_Index.md](./GradGrid_Reference_Index.md) | **Master index** — document registry, update log, cross-reference map |
| [GradGrid_Implementation_Ideation.md](./GradGrid_Implementation_Ideation.md) | Prioritized next steps, foundation hardening, domain order |
| [GradGrid_PRD.md](./GradGrid_PRD.md) | Product requirements and phased roadmap |
| [GradGrid_Database_Design.md](./GradGrid_Database_Design.md) | Full schema design rationale |
| [GradGrid_Information_Architecture.md](./GradGrid_Information_Architecture.md) | Page hierarchy and URL structure |
| [GradGrid_Security_Architecture.md](./GradGrid_Security_Architecture.md) | Auth, RBAC, encryption design |
| [GradGrid_Infrastructure_Architecture.md](./GradGrid_Infrastructure_Architecture.md) | Docker, K8s, deployment targets |
| [GradGrid_ADR_TDR_INDEX.md](./GradGrid_ADR_TDR_INDEX.md) | Architecture decision registry |

---

## 14. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-17 | Engineering | Initial repository status snapshot |
| 1.0.1 | 2026-08-17 | Engineering | Added cross-references to Reference Index and Implementation Ideation; usage note |
| 1.1 | 2026-08-20 | Engineering | Added current-state addendum covering verified Phase 1 and tracked Phase 2 implementation |

> **Update protocol:** On the next codebase review, bump the version, update §2–§12 as needed, add a row here, and log in [Master Update Log](./GradGrid_Reference_Index.md#4-master-update-log).
