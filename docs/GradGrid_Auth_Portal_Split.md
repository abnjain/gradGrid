# Auth & Portal Scope (engineering note)

**Last updated:** 2026-08-19

## Frontend trees

| Portal | Paths | Login |
|--------|-------|-------|
| Platform | `/platform/**` | `/platform/login` |
| Institution staff | `/app/**` | `/login` (+ `/signup`) |
| Student / Parent | `/portal/**` | `/portal/login` |

`/admin/*` permanently redirects to `/platform/*`.

## Backend auth

| Audience | Prefix | Allowed `user_type` |
|----------|--------|---------------------|
| platform | `/api/v1/auth/platform` | `platform` |
| institution | `/api/v1/auth/institution` | `institution` |
| portal | `/api/v1/auth/portal` | `parent`, `student` |

JWT includes `aud` (`platform` \| `institution` \| `portal`). Refresh cookies are audience-specific (`refreshToken_*`).

## Learner portal rules

- Portal login binds session `institutionId` from `students.user_id` / `parents.user_id`.
- Students (`GET /portal/me`, `/portal/me/id-card`): only their own record at that institution (class, admission no., ID card fields).
- Parents (`GET /portal/me/children`): only children in `student_parent_links` that belong to the same institution.
- Cross-institution access is rejected.

## Staff invite to portal

- `POST /students/:id/portal-invite` — creates `user_type=student`, links `students.user_id`.
- `POST /parents/:id/portal-invite` — creates `user_type=parent`, links `parents.user_id`.
