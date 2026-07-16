# GradGrid Database Design

**Document Version:** 1.0
**Status:** Draft
**Document Type:** Database Design
**Author:** Product Team / Architecture Team
**Last Updated:** 2026-07-13
**Governed By:** GradGrid Documentation Constitution v1.0

**Change Log**

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-07-13 | Initial Database Design derived from PRD, Domain Model, and RBAC Matrix | Architecture Team |
| 1.1 | 2026-07-16 | Extended students table with family, previous school, RTE, scholarship, and bank fields; enriched parents table | Architecture Team |

---

# 1. Purpose

This document defines the complete relational database schema for GradGrid. It specifies every table, column, data type, constraint, index, and relationship required to support the MVP scope defined in the PRD.

This document serves as the authoritative source for:

* Table definitions and column specifications
* Primary and foreign key constraints
* Index strategy
* Encryption column conventions
* Soft delete and audit timestamp conventions
* Multi-tenant isolation rules
* Permission registry design

---

# 2. Database Engine & ORM

| Concern | Decision |
|---|---|
| Database Engine | PostgreSQL 16 |
| ORM | Prisma |
| Migration Tool | Prisma Migrate |
| UUID Generation | `gen_random_uuid()` (PostgreSQL native) |
| Timestamps | `TIMESTAMPTZ` (timezone-aware) |
| JSON columns | `JSONB` (indexed, binary JSON) |
| Encrypted columns | `TEXT` — ciphertext stored as base64; IV stored in paired column |

---

# 3. Global Conventions

## 3.1 Naming

* All table names: **snake_case, plural** (e.g., `students`, `fee_payments`)
* All column names: **snake_case** (e.g., `created_at`, `institution_id`)
* Foreign keys: `{referenced_table_singular}_id` (e.g., `student_id`, `institution_id`)
* Boolean columns: prefixed `is_` or `has_` (e.g., `is_active`, `is_system_role`)
* Encrypted columns: suffixed `_enc`; paired IV column suffixed `_iv`

## 3.2 Mandatory Columns (all tables)

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary key, default `gen_random_uuid()` |
| `created_at` | `TIMESTAMPTZ` | Set on insert, never updated |
| `updated_at` | `TIMESTAMPTZ` | Updated on every write |

## 3.3 Soft Delete

All major entity tables include:

```sql
deleted_at TIMESTAMPTZ NULL
```

A record with `deleted_at IS NOT NULL` is considered soft-deleted. Hard deletion is not performed on these tables. Application queries must always filter `WHERE deleted_at IS NULL` unless explicitly viewing archived/deleted records.

## 3.4 Tenant Isolation

Every institution-scoped table carries:

```sql
institution_id UUID NOT NULL REFERENCES institutions(id)
```

Every query against an institution-scoped table **must** include `WHERE institution_id = :institution_id`. This is enforced at the service layer, not via Row Level Security (RLS) in MVP, but the schema is RLS-compatible for future enforcement.

## 3.5 Encrypted Column Convention

Sensitive fields (Aadhaar, PAN, APAAR ID, Samagra ID, bank account numbers) are encrypted at the application layer using AES-256-GCM before storage. Each encrypted value has a paired IV column.

```sql
aadhaar_number_enc  TEXT NULL   -- base64(AES-256-GCM ciphertext)
aadhaar_number_iv   TEXT NULL   -- base64(12-byte GCM nonce)
```

The application never stores plaintext sensitive values. The database stores only ciphertext. Decryption occurs in the application service layer only when the requesting user holds the `reveal_sensitive` permission and the action is audit-logged.

---

# 4. Domain Groups

The schema is organized into 15 domain groups:

1. Platform Layer
2. Identity & Authentication
3. RBAC & Permission Registry
4. People — Students
5. People — Staff & Teachers
6. Academic Structure
7. Admissions
8. Attendance
9. Examination
10. Finance
11. Library
12. Communication
13. Documents & Templates
14. File Storage
15. Audit Logs & Notifications

---

# 5. Schema Definitions

---

## 5.1 Platform Layer

### `organizations`

Represents an educational group, trust, or society that owns one or more institutions.

```sql
CREATE TABLE organizations (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255)    NOT NULL,
    type                VARCHAR(50)     NOT NULL,       -- school_group | trust | society | university | independent
    contact_email       VARCHAR(255)    NULL,
    contact_phone       VARCHAR(20)     NULL,
    address             TEXT            NULL,
    city                VARCHAR(100)    NULL,
    state               VARCHAR(100)    NULL,
    pincode             VARCHAR(10)     NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_organizations_is_active ON organizations(is_active) WHERE deleted_at IS NULL;
```

---

### `institutions`

A single school, college, coaching institute, or university. The primary tenant unit in GradGrid.

```sql
CREATE TABLE institutions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID            NOT NULL REFERENCES organizations(id),
    name                VARCHAR(255)    NOT NULL,
    type                VARCHAR(50)     NOT NULL,       -- school | college | university | coaching | training
    contact_email       VARCHAR(255)    NULL,
    contact_phone       VARCHAR(20)     NULL,
    address             TEXT            NULL,
    city                VARCHAR(100)    NULL,
    state               VARCHAR(100)    NULL,
    pincode             VARCHAR(10)     NULL,
    logo_file_id        UUID            NULL REFERENCES file_uploads(id),
    primary_color       VARCHAR(7)      NULL,           -- hex e.g. #1A73E8
    secondary_color     VARCHAR(7)      NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_institutions_organization_id ON institutions(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_institutions_is_active ON institutions(is_active) WHERE deleted_at IS NULL;
```

---

### `academic_sessions`

An annual academic cycle within an institution (e.g., 2026–27).

```sql
CREATE TABLE academic_sessions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    name                VARCHAR(100)    NOT NULL,       -- e.g. "2026-27"
    start_date          DATE            NOT NULL,
    end_date            DATE            NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_academic_sessions_institution_name UNIQUE (institution_id, name)
);
```

**Indexes:**
```sql
CREATE INDEX idx_academic_sessions_institution_id ON academic_sessions(institution_id);
CREATE INDEX idx_academic_sessions_is_active ON academic_sessions(institution_id, is_active);
```

**Business Rule:** Only one session per institution may have `is_active = TRUE` at a time. Enforced at the service layer.

---

## 5.2 Identity & Authentication

### `users`

Unified identity table for all login-capable users: platform staff and institution staff. Students and Parents do not have login records in MVP.

```sql
CREATE TABLE users (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NULL REFERENCES institutions(id),  -- NULL for platform users
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL,
    phone               VARCHAR(20)     NULL,
    avatar_file_id      UUID            NULL REFERENCES file_uploads(id),
    user_type           VARCHAR(30)     NOT NULL,   -- platform | institution
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    email_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT uq_users_email UNIQUE (email)
);
```

**Indexes:**
```sql
CREATE INDEX idx_users_institution_id ON users(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type) WHERE deleted_at IS NULL;
```

---

### `user_passwords`

Stores bcrypt-hashed passwords. One active record per user; previous hashes are retained for password history enforcement if needed.

```sql
CREATE TABLE user_passwords (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    password_hash       TEXT            NOT NULL,   -- bcrypt hash
    is_current          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_user_passwords_user_id ON user_passwords(user_id) WHERE is_current = TRUE;
```

---

### `refresh_tokens`

Rotating refresh tokens. Implements the token family pattern to detect token reuse.

```sql
CREATE TABLE refresh_tokens (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    token_hash          TEXT            NOT NULL,   -- SHA-256 of the actual token
    family              UUID            NOT NULL,   -- groups a rotation chain; revoke entire family on reuse
    is_revoked          BOOLEAN         NOT NULL DEFAULT FALSE,
    expires_at          TIMESTAMPTZ     NOT NULL,
    ip_address          VARCHAR(45)     NULL,
    user_agent          TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family);
CREATE UNIQUE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

---

### `user_sessions`

Tracks active device sessions. Supports multiple active sessions per user (configurable).

```sql
CREATE TABLE user_sessions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    ip_address          VARCHAR(45)     NOT NULL,
    user_agent          TEXT            NOT NULL,
    device_label        VARCHAR(100)    NULL,       -- e.g. "Chrome on Windows"
    last_active_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ     NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
```

---

### `email_verifications`

OTP-based email verification codes.

```sql
CREATE TABLE email_verifications (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    otp_hash            TEXT            NOT NULL,   -- bcrypt hash of OTP
    expires_at          TIMESTAMPTZ     NOT NULL,
    is_used             BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

### `password_resets`

Secure tokens for password reset flows.

```sql
CREATE TABLE password_resets (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    token_hash          TEXT            NOT NULL,
    expires_at          TIMESTAMPTZ     NOT NULL,
    is_used             BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

## 5.3 RBAC & Permission Registry

### Design Principle

**Permissions are enforced entirely in backend application code.** The database stores only:

1. The **registry** of all permission keys the system recognizes
2. Which **roles** are granted which **permission keys**
3. Which **users** are assigned which **roles** (scoped to an institution)

No runtime permission computation happens in the database. The backend loads role-permission mappings at startup (or from cache) and evaluates access in middleware/service guards.

---

### `roles`

System-defined and institution-custom roles.

```sql
CREATE TABLE roles (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NULL REFERENCES institutions(id),  -- NULL = platform role
    name                VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    is_system_role      BOOLEAN         NOT NULL DEFAULT FALSE,  -- TRUE = cannot be deleted
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT uq_roles_institution_name UNIQUE (institution_id, name)
);
```

**Seeded system roles (is_system_role = TRUE):**

| Name | Scope |
|---|---|
| platform_super_admin | Platform |
| platform_admin | Platform |
| support_executive | Platform |
| customer_success | Platform |
| sales_executive | Platform |
| developer | Platform |
| devops_engineer | Platform |
| security_auditor | Platform |
| institution_owner | Institution |
| institution_admin | Institution |
| academic_coordinator | Institution |
| teacher | Institution |
| accountant | Institution |
| librarian | Institution |
| receptionist | Institution |
| hr | Institution |

**Indexes:**
```sql
CREATE INDEX idx_roles_institution_id ON roles(institution_id) WHERE deleted_at IS NULL;
```

---

### `permission_registry`

The authoritative catalog of every permission key the GradGrid backend recognizes. Populated via seed/migration — not writable by users.

```sql
CREATE TABLE permission_registry (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    module              VARCHAR(60)     NOT NULL,   -- e.g. students, fees, audit_logs
    action              VARCHAR(60)     NOT NULL,   -- e.g. view, create, reveal_sensitive
    key                 VARCHAR(120)    NOT NULL,   -- e.g. students.view, fees.export
    description         TEXT            NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_permission_registry_key UNIQUE (key)
);
```

**Full Permission Key Catalog (seeded):**

| Module | Action | Key |
|---|---|---|
| students | view | students.view |
| students | create | students.create |
| students | update | students.update |
| students | delete | students.delete |
| students | restore | students.restore |
| students | archive | students.archive |
| students | export | students.export |
| students | import | students.import |
| students | reveal_sensitive | students.reveal_sensitive |
| students | export_sensitive | students.export_sensitive |
| teachers | view | teachers.view |
| teachers | create | teachers.create |
| teachers | update | teachers.update |
| teachers | delete | teachers.delete |
| teachers | restore | teachers.restore |
| teachers | export | teachers.export |
| teachers | import | teachers.import |
| teachers | reveal_sensitive | teachers.reveal_sensitive |
| admissions | view | admissions.view |
| admissions | create | admissions.create |
| admissions | update | admissions.update |
| admissions | approve | admissions.approve |
| admissions | convert | admissions.convert |
| admissions | export | admissions.export |
| attendance | view | attendance.view |
| attendance | mark | attendance.mark |
| attendance | update | attendance.update |
| attendance | export | attendance.export |
| examination | view | examination.view |
| examination | configure | examination.configure |
| examination | enter_marks | examination.enter_marks |
| examination | approve_marks | examination.approve_marks |
| examination | generate | examination.generate |
| examination | export | examination.export |
| fees | view | fees.view |
| fees | create | fees.create |
| fees | update | fees.update |
| fees | record_payment | fees.record_payment |
| fees | apply_discount | fees.apply_discount |
| fees | export | fees.export |
| fees | generate | fees.generate |
| salary | view | salary.view |
| salary | view_own | salary.view_own |
| salary | manage | salary.manage |
| salary | export | salary.export |
| library | view | library.view |
| library | manage | library.manage |
| library | issue | library.issue |
| library | generate | library.generate |
| users | view | users.view |
| users | invite | users.invite |
| users | update | users.update |
| users | deactivate | users.deactivate |
| roles | view | roles.view |
| roles | create | roles.create |
| roles | update | roles.update |
| roles | delete | roles.delete |
| roles | assign | roles.assign |
| communication | view | communication.view |
| communication | send | communication.send |
| communication | manage_templates | communication.manage_templates |
| documents | view | documents.view |
| documents | generate | documents.generate |
| documents | share | documents.share |
| reports | view | reports.view |
| reports | export | reports.export |
| audit_logs | view | audit_logs.view |
| audit_logs | export | audit_logs.export |
| audit_logs | view_own | audit_logs.view_own |
| settings | view | settings.view |
| settings | update | settings.update |
| settings | configure_branding | settings.configure_branding |
| organization | view | organization.view |
| organization | manage | organization.manage |
| institution | view | institution.view |
| institution | manage | institution.manage |
| platform_users | view | platform_users.view |
| platform_users | manage | platform_users.manage |
| platform_audit | view | platform_audit.view |
| platform_audit | export | platform_audit.export |
| feature_flags | manage | feature_flags.manage |

---

### `role_permissions`

Junction table linking roles to their permitted keys from the registry.

```sql
CREATE TABLE role_permissions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id             UUID            NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id       UUID            NOT NULL REFERENCES permission_registry(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_role_permissions UNIQUE (role_id, permission_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
```

---

### `role_assignments`

Associates a user with a role, scoped to an institution.

```sql
CREATE TABLE role_assignments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    role_id             UUID            NOT NULL REFERENCES roles(id),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    assigned_by         UUID            NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT uq_role_assignments UNIQUE (user_id, role_id, institution_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_role_assignments_user_id ON role_assignments(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_role_assignments_institution_id ON role_assignments(institution_id) WHERE deleted_at IS NULL;
```

---

## 5.4 People — Students

### `students`

Core student record. Sensitive identity fields are AES-256-GCM encrypted at the application layer.

```sql
CREATE TABLE students (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    -- Identity
    first_name              VARCHAR(100)    NOT NULL,
    last_name               VARCHAR(100)    NOT NULL,
    date_of_birth           DATE            NULL,
    gender                  VARCHAR(10)     NULL,       -- male | female | other
    blood_group             VARCHAR(5)      NULL,
    religion                VARCHAR(50)     NULL,
    caste                   VARCHAR(50)     NULL,
    category                VARCHAR(30)     NULL,       -- general | obc | sc | st | ews | other
    handicapped             BOOLEAN         NOT NULL DEFAULT FALSE,
    photo_file_id           UUID            NULL REFERENCES file_uploads(id),
    -- Enrollment identifiers
    admission_number        VARCHAR(50)     NOT NULL,
    enrollment_number       VARCHAR(50)     NULL,
    scholar_number          VARCHAR(50)     NULL,
    roll_number             VARCHAR(20)     NULL,
    student_type            VARCHAR(20)     NULL,       -- new | old
    date_of_admission       DATE            NULL,
    -- Academic placement
    class_id                UUID            NULL REFERENCES classes(id),
    section_id              UUID            NULL REFERENCES sections(id),
    stream                  VARCHAR(50)     NULL,       -- science | commerce | arts | vocational | NULL
    medium                  VARCHAR(30)     NULL,       -- hindi | english | urdu | bilingual
    house_id                UUID            NULL REFERENCES houses(id),
    route                   VARCHAR(100)    NULL,
    stoppage_landmark       VARCHAR(200)    NULL,
    -- Contact
    phone                   VARCHAR(20)     NULL,
    alternate_phone         VARCHAR(20)     NULL,
    email                   VARCHAR(255)    NULL,
    -- Address (current)
    address                 TEXT            NULL,
    city                    VARCHAR(100)    NULL,
    district                VARCHAR(100)    NULL,
    state                   VARCHAR(100)    NULL,
    pincode                 VARCHAR(10)     NULL,
    -- Previous school
    prev_school_name        VARCHAR(255)    NULL,
    prev_school_city        VARCHAR(100)    NULL,
    last_class              VARCHAR(50)     NULL,
    last_result             VARCHAR(20)     NULL,       -- passed | failed | promoted | n/a
    -- Encrypted sensitive identity fields (AES-256-GCM)
    aadhaar_number_enc      TEXT            NULL,
    aadhaar_number_iv       TEXT            NULL,
    samagra_child_id_enc    TEXT            NULL,        -- Samagra Child ID (MP)
    samagra_child_id_iv     TEXT            NULL,
    samagra_family_id_enc   TEXT            NULL,        -- Samagra Family ID (MP)
    samagra_family_id_iv    TEXT            NULL,
    apaar_id_enc            TEXT            NULL,
    apaar_id_iv             TEXT            NULL,
    -- RTE (Right to Education — MP specific)
    is_rte                  BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Bank details (for scholarship disbursement)
    bank_name               VARCHAR(100)    NULL,
    bank_account_enc        TEXT            NULL,
    bank_account_iv         TEXT            NULL,
    bank_ifsc               VARCHAR(20)     NULL,
    account_holder_name     VARCHAR(150)    NULL,
    scholarship_name        VARCHAR(200)    NULL,
    admitted_class          VARCHAR(50)     NULL,       -- class in which admitted under RTE
    -- Status
    status                  VARCHAR(20)     NOT NULL DEFAULT 'active',  -- active | archived | transferred
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ     NULL,

    CONSTRAINT uq_students_admission_number UNIQUE (institution_id, admission_number)
);
```

**Indexes:**
```sql
CREATE INDEX idx_students_institution_id ON students(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_academic_session_id ON students(academic_session_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_status ON students(institution_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_name ON students(institution_id, last_name, first_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_category ON students(institution_id, category) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_is_rte ON students(institution_id, is_rte) WHERE deleted_at IS NULL;
```

---

### `parents`

Parent or guardian records. Linked to students via junction table. Stores complete family information including both father's and mother's details. No login in MVP.

```sql
CREATE TABLE parents (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    -- Primary contact (defaults to father / first guardian)
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    relation            VARCHAR(30)     NOT NULL,   -- father | mother | guardian | other
    date_of_birth       DATE            NULL,
    qualification       VARCHAR(100)    NULL,
    occupation          VARCHAR(100)    NULL,
    phone               VARCHAR(20)     NOT NULL,
    alternate_phone     VARCHAR(20)     NULL,
    email               VARCHAR(255)    NULL,
    address             TEXT            NULL,
    -- Spouse / other parent details (stored on same record for convenience)
    spouse_name         VARCHAR(200)    NULL,
    spouse_dob          DATE            NULL,
    spouse_qualification VARCHAR(100)   NULL,
    spouse_occupation   VARCHAR(100)    NULL,
    spouse_phone        VARCHAR(20)     NULL,
    -- Family
    date_of_anniversary DATE            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

---

### `student_parent_links`

Many-to-many between students and parents.

```sql
CREATE TABLE student_parent_links (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID            NOT NULL REFERENCES students(id),
    parent_id           UUID            NOT NULL REFERENCES parents(id),
    is_primary          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_parent_links UNIQUE (student_id, parent_id)
);
```

---

## 5.5 People — Staff & Teachers

### `staff`

Employment record for all institution staff (teachers, accountants, HR, reception, librarians). Linked to a `users` record once platform access is granted.

```sql
CREATE TABLE staff (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    user_id                 UUID            NULL REFERENCES users(id),  -- NULL until login created
    department_id           UUID            NULL REFERENCES departments(id),
    employee_code           VARCHAR(50)     NULL,
    first_name              VARCHAR(100)    NOT NULL,
    last_name               VARCHAR(100)    NOT NULL,
    date_of_birth           DATE            NULL,
    gender                  VARCHAR(10)     NULL,
    phone                   VARCHAR(20)     NOT NULL,
    email                   VARCHAR(255)    NOT NULL,
    address                 TEXT            NULL,
    city                    VARCHAR(100)    NULL,
    state                   VARCHAR(100)    NULL,
    pincode                 VARCHAR(10)     NULL,
    designation             VARCHAR(100)    NULL,
    qualification           TEXT            NULL,
    experience_years        INTEGER         NULL,
    photo_file_id           UUID            NULL REFERENCES file_uploads(id),
    -- Encrypted sensitive fields
    aadhaar_number_enc      TEXT            NULL,
    aadhaar_number_iv       TEXT            NULL,
    pan_number_enc          TEXT            NULL,
    pan_number_iv           TEXT            NULL,
    driving_licence_enc     TEXT            NULL,
    driving_licence_iv      TEXT            NULL,
    bank_account_enc        TEXT            NULL,
    bank_account_iv         TEXT            NULL,
    bank_ifsc               VARCHAR(20)     NULL,
    bank_name               VARCHAR(100)    NULL,
    -- Employment
    employment_status       VARCHAR(20)     NOT NULL DEFAULT 'active',  -- active | inactive | resigned | terminated
    joining_date            DATE            NULL,
    leaving_date            DATE            NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ     NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_staff_institution_id ON staff(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_user_id ON staff(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_staff_department_id ON staff(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_employment_status ON staff(institution_id, employment_status) WHERE deleted_at IS NULL;
```

---

## 5.6 Academic Structure

### `departments`

```sql
CREATE TABLE departments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    name                VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    head_staff_id       UUID            NULL REFERENCES staff(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT uq_departments_institution_name UNIQUE (institution_id, name)
);
```

---

### `houses`

Optional house/team groupings for students.

```sql
CREATE TABLE houses (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    name                VARCHAR(100)    NOT NULL,
    color               VARCHAR(7)      NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT uq_houses_institution_name UNIQUE (institution_id, name)
);
```

---

### `classes`

A grade or year level within an academic session.

```sql
CREATE TABLE classes (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    name                    VARCHAR(50)     NOT NULL,   -- e.g. "Grade 1", "Class 10", "Batch A"
    sort_order              INTEGER         NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ     NULL,

    CONSTRAINT uq_classes_institution_session_name UNIQUE (institution_id, academic_session_id, name)
);
```

---

### `sections`

A division within a class (e.g., Grade 8-A, Grade 8-B).

```sql
CREATE TABLE sections (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    class_id            UUID            NOT NULL REFERENCES classes(id),
    name                VARCHAR(20)     NOT NULL,   -- e.g. "A", "B", "Morning"
    class_teacher_id    UUID            NULL REFERENCES staff(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT uq_sections_class_name UNIQUE (class_id, name)
);
```

---

### `subjects`

```sql
CREATE TABLE subjects (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    department_id       UUID            NULL REFERENCES departments(id),
    name                VARCHAR(100)    NOT NULL,
    code                VARCHAR(20)     NULL,
    type                VARCHAR(20)     NOT NULL DEFAULT 'theory',  -- theory | practical | language
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL,

    CONSTRAINT uq_subjects_institution_code UNIQUE (institution_id, code)
);
```

---

### `section_subject_assignments`

Maps which subjects are taught in which section, and by which teacher. Named distinctly from `student_section_enrollments` to avoid confusion between the two junction tables in this domain.

```sql
CREATE TABLE section_subject_assignments (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    section_id          UUID            NOT NULL REFERENCES sections(id),
    subject_id          UUID            NOT NULL REFERENCES subjects(id),
    teacher_id          UUID            NULL REFERENCES staff(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_section_subject_assignments UNIQUE (section_id, subject_id)
);
```

---

### `student_section_enrollments`

Enrolls a student into a specific section for an academic session. Named distinctly from `section_subject_assignments` to avoid confusion between the two junction tables in this domain.

```sql
CREATE TABLE student_section_enrollments (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    section_id              UUID            NOT NULL REFERENCES sections(id),
    student_id              UUID            NOT NULL REFERENCES students(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    enrolled_at             DATE            NOT NULL DEFAULT CURRENT_DATE,
    left_at                 DATE            NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_section_enrollments UNIQUE (student_id, academic_session_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_student_section_enrollments_section_id ON student_section_enrollments(section_id);
CREATE INDEX idx_student_section_enrollments_student_id ON student_section_enrollments(student_id);
```

---

## 5.7 Admissions

### Enquiry Origin & Flow

Admission enquiries enter GradGrid from three sources, tracked via the `source` column:

| Source | Description |
|---|---|
| `walk_in` | Parent visits the school; Receptionist creates the record at the front desk (primary MVP channel — JM-07) |
| `phone` | Parent calls; Receptionist logs the enquiry during or after the call |
| `online` | Future phase — enquiry submitted via the institution's public website (FR-008: Online Admissions, marked Future) |

Once captured, an enquiry moves through a Kanban-style pipeline. Each status transition and every follow-up note is recorded in child tables (`admission_enquiry_status_logs` and `admission_enquiry_notes`) so the full activity history is preserved — not overwritten.

**Status pipeline:**

```
new → contacted → in_progress → document_pending → approved → enrolled
                                                 ↘ rejected
                                                 ↘ cancelled
```

---

### `admission_enquiries`

The root record for a prospective student. Captures intake information and the current pipeline position. Follow-up notes and status history are stored in child tables.

```sql
CREATE TABLE admission_enquiries (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    -- Enquiry origin
    source                  VARCHAR(20)     NOT NULL DEFAULT 'walk_in',
    -- source enum: walk_in | phone | online (online = Future)
    -- Prospective student details
    student_first_name      VARCHAR(100)    NOT NULL,
    student_last_name       VARCHAR(100)    NOT NULL,
    date_of_birth           DATE            NULL,
    applying_for_class      VARCHAR(50)     NULL,
    -- Primary contact (parent / guardian at enquiry time)
    parent_name             VARCHAR(200)    NOT NULL,
    parent_phone            VARCHAR(20)     NOT NULL,
    parent_email            VARCHAR(255)    NULL,
    -- Pipeline state
    status                  VARCHAR(30)     NOT NULL DEFAULT 'new',
    -- status enum: new | contacted | in_progress | document_pending | approved | rejected | enrolled | cancelled
    assigned_to             UUID            NULL REFERENCES staff(id),
    -- Conversion
    converted_student_id    UUID            NULL REFERENCES students(id),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ     NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_admission_enquiries_institution_id ON admission_enquiries(institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_admission_enquiries_status ON admission_enquiries(institution_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_admission_enquiries_source ON admission_enquiries(institution_id, source) WHERE deleted_at IS NULL;
```

---

### `admission_enquiry_status_logs`

Immutable log of every status transition on an enquiry. Answers "who moved this from `document_pending` to `approved`, and when?" — which the flat `status` column on the parent table cannot.

```sql
CREATE TABLE admission_enquiry_status_logs (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id          UUID            NOT NULL REFERENCES admission_enquiries(id) ON DELETE CASCADE,
    from_status         VARCHAR(30)     NULL,       -- NULL for the initial 'new' entry
    to_status           VARCHAR(30)     NOT NULL,
    changed_by          UUID            NOT NULL REFERENCES users(id),
    reason              TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_enquiry_status_logs_enquiry_id ON admission_enquiry_status_logs(enquiry_id);
```

---

### `admission_enquiry_notes`

Chronological follow-up notes on an enquiry — one row per interaction. Replaces the flat `notes TEXT` column from the parent table, which would have been overwritten on each update and provided no history.

```sql
CREATE TABLE admission_enquiry_notes (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id          UUID            NOT NULL REFERENCES admission_enquiries(id) ON DELETE CASCADE,
    note                TEXT            NOT NULL,
    noted_by            UUID            NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_enquiry_notes_enquiry_id ON admission_enquiry_notes(enquiry_id);
```

---

### `admission_enquiry_documents`

```sql
CREATE TABLE admission_enquiry_documents (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id          UUID            NOT NULL REFERENCES admission_enquiries(id) ON DELETE CASCADE,
    file_id             UUID            NOT NULL REFERENCES file_uploads(id),
    document_type       VARCHAR(50)     NOT NULL,   -- birth_certificate | transfer_cert | photo | id_proof
    uploaded_by         UUID            NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

## 5.8 Attendance

### `attendance_sessions`

One record per section per day — the "roll call" session.

```sql
CREATE TABLE attendance_sessions (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    section_id              UUID            NOT NULL REFERENCES sections(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    attendance_date         DATE            NOT NULL,
    marked_by               UUID            NOT NULL REFERENCES staff(id),
    status                  VARCHAR(20)     NOT NULL DEFAULT 'draft',  -- draft | submitted
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_attendance_sessions UNIQUE (section_id, attendance_date)
);
```

**Indexes:**
```sql
CREATE INDEX idx_attendance_sessions_section_date ON attendance_sessions(section_id, attendance_date);
CREATE INDEX idx_attendance_sessions_institution_date ON attendance_sessions(institution_id, attendance_date);
```

---

### `student_attendance_records`

Individual student mark within an attendance session.

```sql
CREATE TABLE student_attendance_records (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_session_id   UUID            NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id              UUID            NOT NULL REFERENCES students(id),
    status                  VARCHAR(10)     NOT NULL,   -- present | absent | late | holiday | excused
    remark                  TEXT            NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_attendance_records UNIQUE (attendance_session_id, student_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_student_attendance_records_student_id ON student_attendance_records(student_id);
```

---

### `teacher_attendance_records`

```sql
CREATE TABLE teacher_attendance_records (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    staff_id            UUID            NOT NULL REFERENCES staff(id),
    attendance_date     DATE            NOT NULL,
    status              VARCHAR(10)     NOT NULL,   -- present | absent | late | on_leave | holiday
    remark              TEXT            NULL,
    marked_by           UUID            NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_teacher_attendance UNIQUE (staff_id, attendance_date)
);
```

---

## 5.9 Examination

### `exam_types`

```sql
CREATE TABLE exam_types (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    name                VARCHAR(100)    NOT NULL,   -- Unit Test | Half-Yearly | Annual
    description         TEXT            NULL,
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

---

### `exams`

```sql
CREATE TABLE exams (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    exam_type_id            UUID            NOT NULL REFERENCES exam_types(id),
    name                    VARCHAR(150)    NOT NULL,
    start_date              DATE            NULL,
    end_date                DATE            NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'draft',
    -- status enum: draft | marks_open | marks_closed | published
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ     NULL
);
```

---

### `exam_subjects`

Configuration for a specific subject within an exam, per class.

```sql
CREATE TABLE exam_subjects (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id                 UUID            NOT NULL REFERENCES exams(id),
    subject_id              UUID            NOT NULL REFERENCES subjects(id),
    class_id                UUID            NOT NULL REFERENCES classes(id),
    max_marks               NUMERIC(6,2)    NOT NULL,
    passing_marks           NUMERIC(6,2)    NOT NULL,
    exam_date               DATE            NULL,
    marks_entry_status      VARCHAR(20)     NOT NULL DEFAULT 'pending',
    -- status: pending | open | submitted | approved
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_exam_subjects UNIQUE (exam_id, subject_id, class_id)
);
```

---

### `marks`

Individual student marks for an exam subject.

```sql
CREATE TABLE marks (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_subject_id         UUID            NOT NULL REFERENCES exam_subjects(id),
    student_id              UUID            NOT NULL REFERENCES students(id),
    marks_obtained          NUMERIC(6,2)    NULL,
    grade                   VARCHAR(5)      NULL,
    is_absent               BOOLEAN         NOT NULL DEFAULT FALSE,
    is_exempted             BOOLEAN         NOT NULL DEFAULT FALSE,
    remarks                 TEXT            NULL,
    entered_by              UUID            NOT NULL REFERENCES users(id),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_marks UNIQUE (exam_subject_id, student_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_marks_student_id ON marks(student_id);
CREATE INDEX idx_marks_exam_subject_id ON marks(exam_subject_id);
```

---

### `grade_rules` and `grade_rule_items`

```sql
CREATE TABLE grade_rules (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    name                VARCHAR(100)    NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);

CREATE TABLE grade_rule_items (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_rule_id       UUID            NOT NULL REFERENCES grade_rules(id) ON DELETE CASCADE,
    grade               VARCHAR(5)      NOT NULL,   -- A+, A, B, C, D, F
    description         VARCHAR(50)     NULL,       -- Excellent, Good, etc.
    min_percentage      NUMERIC(5,2)    NOT NULL,
    max_percentage      NUMERIC(5,2)    NOT NULL,
    color               VARCHAR(7)      NULL,
    sort_order          INTEGER         NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

## 5.10 Finance

### `fee_structures`

A fee plan for a class in a session.

```sql
CREATE TABLE fee_structures (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    class_id                UUID            NULL REFERENCES classes(id),  -- NULL = applies to all classes
    name                    VARCHAR(150)    NOT NULL,
    description             TEXT            NULL,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ     NULL
);
```

---

### `fee_structure_items`

Installments within a fee structure.

```sql
CREATE TABLE fee_structure_items (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_structure_id        UUID            NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    label                   VARCHAR(100)    NOT NULL,   -- e.g. "Tuition Fee - Q1"
    amount                  NUMERIC(10,2)   NOT NULL,
    installment_number      INTEGER         NOT NULL,
    due_date                DATE            NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

### `student_fee_assignments`

Links a student to a fee structure for a session.

```sql
CREATE TABLE student_fee_assignments (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id              UUID            NOT NULL REFERENCES students(id),
    fee_structure_id        UUID            NOT NULL REFERENCES fee_structures(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_fee_assignments UNIQUE (student_id, fee_structure_id, academic_session_id)
);
```

---

### `fee_discounts`

Scholarship or discount definitions.

```sql
CREATE TABLE fee_discounts (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150)    NOT NULL,
    type                VARCHAR(20)     NOT NULL,   -- percentage | fixed
    value               NUMERIC(10,2)   NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

---

### `student_fee_discounts`

Application of a discount to a specific fee installment for a student.

```sql
CREATE TABLE student_fee_discounts (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id              UUID            NOT NULL REFERENCES students(id),
    fee_discount_id         UUID            NOT NULL REFERENCES fee_discounts(id),
    fee_structure_item_id   UUID            NOT NULL REFERENCES fee_structure_items(id),
    applied_amount          NUMERIC(10,2)   NOT NULL,
    applied_by              UUID            NOT NULL REFERENCES users(id),
    reason                  TEXT            NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

### `fee_payments`

Individual payment receipts.

```sql
CREATE TABLE fee_payments (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    student_id              UUID            NOT NULL REFERENCES students(id),
    fee_structure_item_id   UUID            NOT NULL REFERENCES fee_structure_items(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    receipt_number          VARCHAR(50)     NOT NULL,
    amount_paid             NUMERIC(10,2)   NOT NULL,
    payment_date            DATE            NOT NULL,
    payment_mode            VARCHAR(30)     NOT NULL,   -- cash | cheque | bank_transfer | dd
    reference_number        VARCHAR(100)    NULL,
    notes                   TEXT            NULL,
    collected_by            UUID            NOT NULL REFERENCES users(id),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_fee_payments_receipt UNIQUE (institution_id, receipt_number)
);
```

**Indexes:**
```sql
CREATE INDEX idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX idx_fee_payments_institution_date ON fee_payments(institution_id, payment_date);
```

---

### `salary_records`

Monthly salary disbursement per staff member.

```sql
CREATE TABLE salary_records (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID            NOT NULL REFERENCES institutions(id),
    staff_id                UUID            NOT NULL REFERENCES staff(id),
    academic_session_id     UUID            NOT NULL REFERENCES academic_sessions(id),
    month                   INTEGER         NOT NULL,   -- 1–12
    year                    INTEGER         NOT NULL,
    gross_salary            NUMERIC(12,2)   NOT NULL,
    deductions              NUMERIC(12,2)   NOT NULL DEFAULT 0,
    net_salary              NUMERIC(12,2)   NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'pending',  -- pending | processed | paid
    disbursement_date       DATE            NULL,
    payment_mode            VARCHAR(30)     NULL,
    processed_by            UUID            NULL REFERENCES users(id),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_salary_records UNIQUE (staff_id, month, year)
);
```

---

## 5.11 Library

### `books`

```sql
CREATE TABLE books (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    title               VARCHAR(255)    NOT NULL,
    author              VARCHAR(255)    NULL,
    isbn                VARCHAR(20)     NULL,
    publisher           VARCHAR(150)    NULL,
    publication_year    INTEGER         NULL,
    subject             VARCHAR(100)    NULL,
    category            VARCHAR(50)     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

---

### `book_copies`

Physical copies of a book title.

```sql
CREATE TABLE book_copies (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id             UUID            NOT NULL REFERENCES books(id),
    accession_number    VARCHAR(50)     NOT NULL,
    condition           VARCHAR(20)     NOT NULL DEFAULT 'good',   -- good | fair | poor | damaged
    status              VARCHAR(20)     NOT NULL DEFAULT 'available',  -- available | issued | lost
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_book_copies_accession UNIQUE (book_id, accession_number)
);
```

---

### `library_cards`

```sql
CREATE TABLE library_cards (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    card_number         VARCHAR(50)     NOT NULL,
    member_type         VARCHAR(10)     NOT NULL,   -- student | staff
    student_id          UUID            NULL REFERENCES students(id),
    staff_id            UUID            NULL REFERENCES staff(id),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    issued_date         DATE            NOT NULL,
    expiry_date         DATE            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_library_cards_number UNIQUE (institution_id, card_number),
    CONSTRAINT chk_library_cards_member CHECK (
        (member_type = 'student' AND student_id IS NOT NULL AND staff_id IS NULL) OR
        (member_type = 'staff'   AND staff_id   IS NOT NULL AND student_id IS NULL)
    )
);
```

---

### `book_issues`

```sql
CREATE TABLE book_issues (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    book_copy_id        UUID            NOT NULL REFERENCES book_copies(id),
    library_card_id     UUID            NOT NULL REFERENCES library_cards(id),
    issued_by           UUID            NOT NULL REFERENCES users(id),
    issue_date          DATE            NOT NULL,
    due_date            DATE            NOT NULL,
    return_date         DATE            NULL,
    fine_amount         NUMERIC(8,2)    NOT NULL DEFAULT 0,
    fine_paid           BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

## 5.12 Communication

### `message_templates`

```sql
CREATE TABLE message_templates (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150)    NOT NULL,
    channel             VARCHAR(20)     NOT NULL,   -- email | whatsapp
    subject             VARCHAR(255)    NULL,       -- email only
    body                TEXT            NOT NULL,   -- supports {{variables}}
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

---

### `messages`

```sql
CREATE TABLE messages (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    template_id         UUID            NULL REFERENCES message_templates(id),
    channel             VARCHAR(20)     NOT NULL,
    subject             VARCHAR(255)    NULL,
    body                TEXT            NOT NULL,
    recipient_group     VARCHAR(50)     NULL,   -- class | section | all | individual
    sent_by             UUID            NOT NULL REFERENCES users(id),
    status              VARCHAR(20)     NOT NULL DEFAULT 'draft',  -- draft | queued | sent | failed
    scheduled_at        TIMESTAMPTZ     NULL,
    sent_at             TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

### `message_recipients`

```sql
CREATE TABLE message_recipients (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id          UUID            NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    recipient_type      VARCHAR(20)     NOT NULL,   -- student | parent | staff | user
    recipient_id        UUID            NOT NULL,
    phone_or_email      VARCHAR(255)    NOT NULL,
    delivery_status     VARCHAR(20)     NOT NULL DEFAULT 'pending',  -- pending | sent | delivered | failed
    delivered_at        TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

## 5.13 Documents & Templates

### `document_templates`

```sql
CREATE TABLE document_templates (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    type                VARCHAR(30)     NOT NULL,
    -- type enum: id_card | library_card | admission_form | admit_card | report_card | certificate
    name                VARCHAR(150)    NOT NULL,
    config              JSONB           NOT NULL DEFAULT '{}',   -- layout, field mappings, styling
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ     NULL
);
```

---

### `generated_documents`

Audit record of every document generated by the platform.

```sql
CREATE TABLE generated_documents (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    template_id         UUID            NULL REFERENCES document_templates(id),
    entity_type         VARCHAR(30)     NOT NULL,   -- student | staff | exam
    entity_id           UUID            NOT NULL,
    document_type       VARCHAR(30)     NOT NULL,
    file_id             UUID            NOT NULL REFERENCES file_uploads(id),
    generated_by        UUID            NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_generated_documents_entity ON generated_documents(entity_type, entity_id);
CREATE INDEX idx_generated_documents_institution ON generated_documents(institution_id);
```

---

## 5.14 File Storage

### `file_uploads`

Abstraction layer for all stored files. Actual storage is provider-agnostic (MinIO in dev, S3/GCS in production). The `storage_key` and `bucket` are the only storage-provider-specific values.

```sql
CREATE TABLE file_uploads (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NULL REFERENCES institutions(id),  -- NULL for platform assets
    uploaded_by         UUID            NOT NULL REFERENCES users(id),
    original_name       VARCHAR(255)    NOT NULL,
    storage_key         TEXT            NOT NULL,   -- path/key in object storage
    bucket              VARCHAR(100)    NOT NULL,
    mime_type           VARCHAR(100)    NOT NULL,
    size_bytes          BIGINT          NOT NULL,
    entity_type         VARCHAR(50)     NULL,   -- students | staff | documents | branding | etc.
    entity_id           UUID            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_file_uploads_storage_key UNIQUE (bucket, storage_key)
);
```

---

## 5.15 Audit Logs & Notifications

### `audit_logs`

Institution-scoped immutable audit trail. Visible to Institution Owner and authorized Admins only.

```sql
CREATE TABLE audit_logs (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID            NOT NULL REFERENCES institutions(id),
    user_id             UUID            NOT NULL REFERENCES users(id),
    role_name           VARCHAR(100)    NOT NULL,   -- snapshot of role at time of action
    module              VARCHAR(60)     NOT NULL,
    action              VARCHAR(60)     NOT NULL,   -- matches permission_registry.action values
    entity_type         VARCHAR(60)     NULL,
    entity_id           UUID            NULL,
    before_state        JSONB           NULL,       -- field-level snapshot before change
    after_state         JSONB           NULL,       -- field-level snapshot after change
    ip_address          VARCHAR(45)     NULL,
    user_agent          TEXT            NULL,
    reason              TEXT            NULL,       -- for sensitive reveals, optional justification
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_audit_logs_institution_id ON audit_logs(institution_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_module_action ON audit_logs(institution_id, module, action);
```

**Important:** Audit logs are **never updated or deleted**. No `updated_at` or `deleted_at` columns exist on this table. INSERT only.

---

### `platform_audit_logs`

Platform-scoped audit trail visible only to internal GradGrid platform users.

```sql
CREATE TABLE platform_audit_logs (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    role_name           VARCHAR(100)    NOT NULL,
    module              VARCHAR(60)     NOT NULL,
    action              VARCHAR(60)     NOT NULL,
    entity_type         VARCHAR(60)     NULL,
    entity_id           UUID            NULL,
    before_state        JSONB           NULL,
    after_state         JSONB           NULL,
    ip_address          VARCHAR(45)     NULL,
    user_agent          TEXT            NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_platform_audit_logs_user_id ON platform_audit_logs(user_id);
CREATE INDEX idx_platform_audit_logs_created_at ON platform_audit_logs(created_at DESC);
```

---

### `notifications`

```sql
CREATE TABLE notifications (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    institution_id      UUID            NULL REFERENCES institutions(id),
    type                VARCHAR(50)     NOT NULL,
    -- type enum: approval_request | approval_result | document_ready | system_alert | comm_status
    title               VARCHAR(200)    NOT NULL,
    body                TEXT            NOT NULL,
    link                VARCHAR(500)    NULL,
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ     NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read, created_at DESC);
```

---

# 6. Index Strategy Summary

| Table | Index Purpose |
|---|---|
| `institutions` | Filter by organization, active state |
| `users` | Lookup by email (auth), by institution |
| `students` | Filter by institution + session, name search, status |
| `staff` | Filter by institution, department, status |
| `student_section_enrollments` | Lookup by section or student |
| `attendance_sessions` | Daily lookup by section and date |
| `student_attendance_records` | Historical lookup by student |
| `marks` | Result lookup by student or exam subject |
| `fee_payments` | Payment history by student, date range |
| `audit_logs` | Filter by institution + date, entity, module/action |
| `notifications` | Unread inbox by user |

All indexes on soft-deletable tables include a `WHERE deleted_at IS NULL` partial index condition to reduce index size and improve query performance.

---

# 7. Sensitive Data Handling Summary

| Table | Encrypted Fields | IV Columns |
|---|---|---|
| `students` | `aadhaar_number_enc`, `samagra_child_id_enc`, `samagra_family_id_enc`, `apaar_id_enc`, `bank_account_enc` | `*_iv` per field |
| `staff` | `aadhaar_number_enc`, `pan_number_enc`, `driving_licence_enc`, `bank_account_enc` | `*_iv` per field |

**Rules:**
* Encrypted fields are never returned in list queries — only on single-record fetch with `reveal_sensitive` permission check
* Every decryption event must produce an `audit_logs` entry with `action = reveal_sensitive`
* IV columns are stored alongside ciphertext and are not secret; they ensure uniqueness per encryption operation
* The encryption key (DEK) is managed by the application, not stored in the database

---

# 8. RBAC Data Flow

```
Request
  ↓
Middleware: extract user_id from access token (memory only — never DB)
  ↓
Load from cache/DB:
  role_assignments WHERE user_id = ? AND institution_id = ? AND deleted_at IS NULL
  → role_id list
  ↓
Load from cache/DB:
  role_permissions JOIN permission_registry WHERE role_id IN (...)
  → Set of permission keys (e.g. { "students.view", "fees.record_payment" })
  ↓
Service guard checks:
  if (!permissions.has("students.create")) throw Forbidden()
  ↓
Business logic executes
```

**Permission keys are strings defined in the backend codebase** (e.g., `PermissionKey.STUDENTS_CREATE = "students.create"`). The `permission_registry` table is the single source of truth for which keys exist and is populated via seed migrations. No permission logic is computed in SQL.

---

# 9. Multi-Tenant Isolation Rules

| Rule | Implementation |
|---|---|
| Every institution-scoped table has `institution_id` | Schema constraint — column is `NOT NULL` |
| All service-layer queries include `institution_id` filter | Enforced in repository/service classes |
| Users cannot cross institution boundaries | `role_assignments.institution_id` scopes access |
| Platform users have no `institution_id` on their `users` row | `user_type = 'platform'` gates platform routes |
| Audit logs are separated by institution | `audit_logs` vs `platform_audit_logs` |
| File uploads are institution-scoped | `file_uploads.institution_id` is set on all institution files |

---

# 10. Migration Strategy

* All schema changes are managed via **Prisma Migrate** and committed as versioned migration files
* Migrations run automatically on deployment via CI/CD pipeline
* Destructive migrations (column drops, type changes) require a multi-step safe migration process:
  1. Add new column / table
  2. Deploy application code that writes to both old and new
  3. Backfill data
  4. Remove old column in a subsequent migration
* No migration may truncate or permanently delete data from production without an explicit, reviewed data retention decision

---

# 11. Future Considerations

| Area | Future Work |
|---|---|
| Row-Level Security (RLS) | Enable PostgreSQL RLS on institution-scoped tables as an additional defense-in-depth layer |
| Field-Level Permissions | Extend `permission_registry` with a `field` column for field-level access control (FR-003) |
| Read Replicas | Route report queries to a read replica as data grows |
| Table Partitioning | Partition `audit_logs` and `student_attendance_records` by `institution_id` + date range |
| Full-Text Search | Add `tsvector` columns and GIN indexes to `students`, `staff`, and `books` for fast global search (FR-026) |
| Event Sourcing | Replace `before_state/after_state` JSONB with a dedicated event store for high-volume audit trails |

---

# 12. References

* GradGrid Documentation Constitution v1.0
* GradGrid PRD v1.0 (FR-001–FR-028, NFR-001–NFR-018)
* GradGrid RBAC & Permission Matrix
* GradGrid Information Architecture v1.0
* ADR-009 PostgreSQL as Primary Database
* ADR-010 Prisma ORM
* ADR-011 Tenant Isolation Strategy
* ADR-012 Database Migration Strategy
* ADR-013 Soft Delete Strategy
* ADR-014 JWT Authentication Strategy
* ADR-019 AES-256-GCM Envelope Encryption
* ADR-020 Sensitive Data Masking
* ADR-021 Audit Logging Strategy
