# GradGrid Product Requirements Document (PRD)

**Document Version:** 1.0
**Status:** Draft
**Document Type:** Product Requirements Document (PRD)
**Author:** Product Team
**Last Updated:** 2026-07-13
**Governed By:** GradGrid Documentation Constitution v1.0

**Change Log**

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-07-13 | Initial PRD compiled from FR/NFR requirements and RBAC/Permission Matrix | Product Team |

---

# 1. Purpose

This Product Requirements Document (PRD) defines the functional and non-functional scope, target users, roles, permissions, and phased roadmap for GradGrid. It translates the platform vision defined in the GradGrid Documentation Constitution into concrete product requirements that will drive the Software Requirements Specification (SRS), Domain Model, Database Design, and downstream engineering artifacts.

This PRD complies with, and must be read alongside, the **GradGrid Documentation Constitution v1.0**. Where any ambiguity exists, the Constitution takes precedence.

---

# 2. Product Identity

## 2.1 Product Name
**GradGrid**

## 2.2 Product Category
Cloud-Native Multi-Tenant Education ERP SaaS Platform

## 2.3 Product Vision
To become the digital operating system for educational institutions by providing a secure, scalable, modular, and intelligent platform that simplifies institutional operations while enabling long-term growth.

## 2.4 Target Customers
* Schools
* Colleges
* Universities
* Coaching Institutes
* Training Centers
* Educational Trusts
* Educational Societies
* Multi-Campus Educational Organizations

---

# 3. Product Scope

GradGrid is a multi-tenant SaaS platform, **not** a single-school ERP. All requirements in this document assume long-term support for:

* Independent Institutions
* Educational Groups
* Multi-Campus Organizations
* Multiple Academic Sessions
* Multiple User Types
* Future Platform Expansion

## 3.1 Organizational Hierarchy

```text
GradGrid Platform
        │
        ▼
Organization
(Education Group / Trust / Society)
        │
        ▼
Institution
(School / College / Coaching / University)
        │
        ▼
Academic Session
        │
        ▼
Users
```

## 3.2 Core Terminology

| Term | Meaning |
|---|---|
| Platform | Entire GradGrid SaaS |
| Organization | Education Group, Trust, Society, or Parent Entity managing one or more institutions |
| Institution | School, College, University, Coaching Institute, or Training Center |
| Academic Session | Annual academic cycle (e.g., 2026–27) |
| User | Any authenticated identity |
| Identity | Login-capable entity (current or future) |
| Owner | Primary administrator of an Institution |
| Platform User | Internal GradGrid employee |
| Tenant | Internal logical isolation boundary; not exposed to business users in documentation |

---

# 4. Core Product Principles

Every requirement in this PRD is evaluated against these principles, in priority order (per Constitution §18):

1. Security
2. Data Privacy
3. Simplicity
4. Scalability
5. Maintainability
6. Extensibility
7. Reliability
8. User Experience
9. Performance
10. Development Velocity

Supporting principles: Security by Design, Scalability by Default, Simplicity First, Modularity, Extensibility, Reliability, Transparency, Privacy First.

---

# 5. User Roles & Personas

Roles are grouped into **Platform Roles** (internal GradGrid staff) and **Institution Roles** (customer-side users). A **Custom Role** capability allows institutions to define roles beyond this baseline set.

## 5.1 Platform Roles

| Role | Description |
|---|---|
| Platform Super Admin | Complete control over the GradGrid platform |
| Platform Admin | Platform operations without full ownership |
| Support Executive | Institution support and troubleshooting |
| Customer Success | Customer onboarding and training |
| Sales Executive | Organization onboarding and CRM |
| Finance Manager | Subscription and billing (future) |
| Developer | Internal engineering access |
| DevOps Engineer | Infrastructure management |
| Security Auditor | Read-only access to platform security and audit information |

## 5.2 Institution Roles

| Role | Description |
|---|---|
| Institution Owner | Full control of a single institution |
| Institution Admin | Administrative operations |
| Academic Coordinator | Academic management |
| Teacher | Teaching and assigned academic operations |
| Accountant | Fees and salary management |
| Librarian | Library operations |
| Receptionist | Admissions and front desk |
| HR | Staff management |
| Student *(Future)* | Student self-service |
| Parent *(Future)* | Parent portal |
| Custom Role | Institution-defined role |

## 5.3 Data Scope by Role

| Role | Default Data Scope |
|---|---|
| Platform Super Admin | Platform (all organizations and institutions) |
| Institution Owner | Institution |
| Institution Admin | Institution |
| Teacher | Assigned Classes + Self |
| Accountant | Finance Modules |
| Librarian | Library Module |
| Receptionist | Admissions |
| HR | Staff Records |
| Student | Self |
| Parent | Own Children |

Additional scopes recognized by the permission engine: **Organization** (all institutions under one organization) and **Department**.

---

# 6. Functional Requirements

Functional requirements are grouped by module. Each item is drawn from the platform requirement set; items explicitly marked *(Future)* are out of MVP scope and must appear in-product as **Coming Soon** per Constitution §12.

## FR-001 Platform & Organization Management
* Super Admin Portal
* Organization Management
* Institution Management
* Multi-Institution Organizations
* Independent Institutions
* Academic Session Management
* Institution Branding
* Organization Branding *(Future)*
* Custom Domains *(Phase 6)*
* White Label Support *(Future)*
* Subscription Management *(Future)*
* License Management *(Future)*

## FR-002 Authentication
* Email & Password Authentication (via Email OTP verification)
* Google Authentication with Google Captcha V3, falling back to V2 on low score
* Mobile OTP Authentication *(Future)*
* Secure Login / Logout
* Password Reset
* Email Verification
* Session Management
* Refresh Token Rotation
* Session Revocation
* Multiple Active Sessions (configurable)
* Remember Me *(Future)*
* MFA / 2FA *(Future)*

## FR-003 Authorization
* Role-Based Access Control (RBAC)
* Permission Engine
* Custom Roles
* Module Permissions
* Action Permissions
* Field-Level Permissions *(Future)*
* Dynamic Permission Assignment

## FR-004 User Management
Manages the following user types: Owners, Admins, Teachers, Students *(future login)*, Parents *(future login)*, Accountants, Librarians, Receptionists, HR, Platform Users, and Custom Users.

## FR-005 Student Management
* Manual Entry, Excel Import, Bulk Upload, Photo Import *(future)*
* Student Profiles, Parent Information, Guardian Information
* Student Status, Student Timeline
* Student Search & Filtering
* Bulk Updates, Soft Delete, Archive, Restore

Student profile fields: Admission Number, Enrollment Number, Scholar Number, Roll Number, APAAR ID, Samagra ID, Aadhaar Number, Blood Group, Address, Contact Details, Parent Information, Academic Information.

Future: Document Uploads, Student Login, Medical Records.

## FR-006 Teacher Management
* Manual Entry, Excel Import, Bulk Upload, Photo Import
* Teacher Profile, Department, Designation, Qualification, Experience
* Aadhaar, PAN, Driving Licence, Salary Information
* Teacher Timeline

Future: Document Repository, Teacher Portal.

## FR-007 Academic Structure
* Academic Sessions, Classes, Sections, Houses, Departments, Subjects
* Teacher Assignment, Class Teachers

Future: Multi-Campus Academic Mapping.

## FR-008 Admissions
* Admission Forms, Admission Workflow, Student Approval
* Admission Number Generation, Document Templates, Status Tracking

Future: Online Admissions.

## FR-009 Document Generation
Generates: ID Cards, Library Cards, Admission Forms, Admit Cards, Report Cards, Certificates *(future)*.
Supports: QR Codes, PDF Export, Email Sharing, WhatsApp Sharing.

## FR-010 Attendance
* Student Attendance, Teacher Attendance, Manual Attendance
* Attendance Reports for both

Future: Biometric, RFID, QR, and GPS Attendance.

## FR-011 Finance
* Fee Structures, Installments, Scholarships, Discounts
* Receipts, Salary Records, Payslips, Financial Reports

Future: Payment Gateway Integration, Online Payments, Auto Reconciliation.

## FR-012 Examination
* Marks Entry, Excel Upload, Photo Upload
* Grade Rules, Result Generation, Report Cards, Admit Cards, Rankings

Future: Exam Creation, Online Exams, Question Bank.

## FR-013 Website
* Website Builder, CMS, Gallery, Faculty Pages, Admissions Pages
* Blogs, SEO, Custom Domain Support

Future: Theme Marketplace.

## FR-014 Communication
* Email, WhatsApp, Templates, Bulk Messages, Scheduled Messages

Future: SMS, Push Notifications, In-App Notifications, Automation.

## FR-015 Reports
Attendance, Fee, Salary, Admission, Student, and Teacher Reports; Custom Reports; Exports.

## FR-016 Dashboard
Role-specific dashboards for Owner, Admin, Teacher, Platform Admin, and *(future)* Student and Parent.

## FR-017 Audit Logs
Authentication Logs, CRUD Logs, Permission Changes, Exports, Sensitive Data Access, PDF Generation, Sharing, Settings Changes, Website Changes, Audit Search.

## FR-018 Search
Global Search, Module Search, Advanced Filters, Saved Filters *(future)*.

## FR-019 Notifications
System, Email, and WhatsApp Notifications.
Future: In-App Notifications, Push Notifications, SMS.

## FR-020 Settings
Institution Settings, Academic Settings, Branding, Roles, Permissions, Security, Communication.
Future: Integrations.

## FR-021 Platform Administration
Super Admin manages: Organizations, Institutions, Platform Users, Support Team, System Configuration, Platform Audit Logs, Feature Flags (internal).
Future: Billing.

## FR-022 Data Import & Export Framework
Centralized: Data Import, Data Export, Bulk Upload Processing, Import Validation, Error Reporting for Failed Records, Template-Based Imports, Module-Specific Export Formats.

## FR-023 File & Media Management
Common abstraction for File Uploads, Image Uploads, Document Uploads, Media Storage, File Preview, File Download, File Validation, Size/Type Restrictions.

## FR-024 Template Management
Centralized templates for ID Cards, Report Cards, Admit Cards, Certificates, Emails, PDFs, and future document templates.

## FR-025 Activity Timeline
Timeline coverage for User, Student, Teacher, Admission, Finance, and Attendance activities, plus audit-relevant events.

## FR-026 Search & Indexing Framework
Fast, filtered, indexed search across modules with ranked results and paginated listing, built for scalability.

## FR-027 Data Retention & Archival
Archiving, Restoring, Retention Policies, Soft Delete Policies, Purge Policies, Historical Record Preservation.

## FR-028 Feature Visibility & Coming Soon Framework
Centralized handling of Future Features, Coming Soon Labels, Feature Flags, Module Visibility Rules, Phase-Based Feature Rollout.

---

# 7. Non-Functional Requirements

## NFR-001 Security
AES-256-GCM encryption for protected fields; Google Captcha V3 (disabled in dev environments); envelope encryption architecture; bcrypt password hashing; HTTPOnly refresh token cookies; access tokens stored only in application memory; RBAC enforcement on every protected endpoint; sensitive values masked by default; security headers; rate limiting; input validation; audit logging.

## NFR-002 Scalability
Support for multiple organizations and institutions, thousands of users per institution, future horizontal scaling, cloud-native deployment, and Kubernetes readiness.

## NFR-003 Performance
Fast dashboard loading, efficient pagination, optimized database queries, lazy loading where appropriate, and future background processing for heavy operations.

## NFR-004 Availability
High uptime target, graceful failure handling, health check endpoints, backup strategy, disaster recovery planning.

## NFR-005 Reliability
Transaction integrity, soft delete support, optimistic locking where appropriate, retry mechanisms for external services, data consistency.

## NFR-006 Maintainability
SOLID principles, Clean Architecture, modular codebase, feature-based organization, comprehensive documentation, API versioning.

## NFR-007 Extensibility
Future support without significant redesign for: Mobile Applications, LMS, Parent Portal, Student Portal, AI Modules, Marketplace, Public APIs, Theme Engine, Event-Driven Architecture, Queue Processing.

## NFR-008 Usability
Responsive design, accessible interfaces, Light/Dark/System themes, guided navigation, helpful empty states, consistent UI patterns, confirmation for destructive actions.

## NFR-009 Privacy
Tenant isolation, organization-level data segregation, least-privilege access, compliance-ready architecture, configurable data retention, secure export controls.

## NFR-010 Observability
Structured logging, audit logging, health monitoring, metrics collection, distributed tracing readiness, error reporting.

## NFR-011 Portability
Dockerized deployment, cloud-agnostic architecture, environment-based configuration, storage abstraction, email provider abstraction.

## NFR-012 Compatibility
Modern browsers, desktop-first responsive layouts, tablet compatibility, mobile web compatibility.

## NFR-013 Internationalization & Localization Readiness
Future multi-language support, locale-specific formatting, region-specific date/number formats, translation-ready UI text.

## NFR-014 Accessibility
WCAG 2.1 AA compliance target, keyboard navigation, screen reader compatibility, sufficient color contrast, accessible form controls.

## NFR-015 Testability
Unit, integration, and end-to-end testing; mockable external services; testable business logic; automated regression testing.

## NFR-016 Data Integrity
Foreign key consistency, transactional consistency, referential integrity, auditability of critical changes, validation at application and database levels.

## NFR-017 Upgradeability
Database migrations, backward-compatible API evolution, safe schema changes, versioned contracts, controlled feature rollout.

## NFR-018 Vendor Independence
Abstraction layers for storage, messaging, email, infrastructure, and deployment providers to minimize lock-in.

---

# 8. Roles, Permissions & Access Control

GradGrid enforces access control at four levels:

| Level | Description |
|---|---|
| Module | Can the user access this module? |
| Action | What can they do (View, Create, Update, Delete, Export, Approve, etc.)? |
| Data Scope | Which records can they access (Own, Assigned, Institution, Organization, Platform)? |
| Sensitive Data Scope | Can they view masked values, reveal encrypted data, or export it? |

## 8.1 Permission Actions (reusable across all modules)

| Action | Description |
|---|---|
| View | View records |
| Create | Create new records |
| Update | Modify existing records |
| Delete | Soft delete records |
| Restore | Restore deleted records |
| Archive | Archive records |
| Export | Export data |
| Import | Bulk import data |
| Share | Email/WhatsApp sharing |
| Approve | Approval workflow |
| Reject | Reject requests |
| Assign | Assign users/resources |
| Configure | Module configuration |
| Reveal Sensitive | View decrypted sensitive data |
| Generate | Generate PDFs, cards, reports |
| Audit View | View audit logs |
| Audit Export | Export audit logs |

## 8.2 Permission Matrix

Legend: ✅ Full Access · ◐ Limited Access · 👁 View Only · ❌ No Access · ⚙ Configurable

| Module | Platform Super Admin | Institution Owner | Institution Admin | Teacher | Accountant | Librarian | Receptionist | HR | Student* | Parent* |
|---|---|---|---|---|---|---|---|---|---|---|
| Organization Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Institution Settings | ✅ | ✅ | ⚙ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| User Management | ✅ | ✅ | ⚙ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ | ❌ |
| Role & Permissions | ✅ | ✅ | ⚙ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Academic Session | ✅ | ✅ | ⚙ | 👁 | ❌ | ❌ | 👁 | ❌ | 👁 | 👁 |
| Student Management | ✅ | ✅ | ⚙ | ◐ | 👁 | 👁 | ⚙ | ❌ | 👁 | 👁 |
| Teacher Management | ✅ | ✅ | ⚙ | 👁 | 👁 | ❌ | ❌ | ⚙ | ❌ | ❌ |
| Parent Management | ✅ | ✅ | ⚙ | 👁 | ❌ | ❌ | ⚙ | ❌ | ❌ | 👁 |
| Admissions | ✅ | ✅ | ⚙ | ❌ | ❌ | ❌ | ⚙ | ❌ | ❌ | ❌ |
| Classes & Sections | ✅ | ✅ | ⚙ | 👁 | ❌ | ❌ | ❌ | ❌ | 👁 | 👁 |
| Attendance | ✅ | ✅ | ⚙ | ⚙ | ❌ | ❌ | ❌ | ❌ | 👁 | 👁 |
| Fees | ✅ | 👁 | 👁 | ❌ | ✅ | ❌ | ❌ | ❌ | 👁 | 👁 |
| Salary | ✅ | 👁 | 👁 | 👁 (Own) | ✅ | ❌ | ❌ | ⚙ | ❌ | ❌ |
| Library | ✅ | 👁 | ⚙ | ⚙ | ❌ | ✅ | ❌ | ❌ | 👁 | 👁 |
| Examination | ✅ | ✅ | ⚙ | ⚙ | ❌ | ❌ | ❌ | ❌ | 👁 | 👁 |
| Reports | ✅ | ✅ | ⚙ | ⚙ | ⚙ | ⚙ | ⚙ | ⚙ | 👁 | 👁 |
| Website CMS | ✅ | ✅ | ⚙ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Communication | ✅ | ✅ | ⚙ | ⚙ | ❌ | ❌ | ⚙ | ❌ | 👁 | 👁 |
| Audit Logs | ✅ | ⚙ | ⚙ | 👁 (Own) | 👁 (Own) | 👁 (Own) | 👁 (Own) | 👁 (Own) | ❌ | ❌ |
| Sensitive Data | ⚙ | ⚙ | ⚙ | ❌ | ❌ | ❌ | ❌ | ⚙ | ❌ | ❌ |
| Platform Analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

*Student and Parent access is planned for a future phase.*

## 8.3 Data Scope Definitions

| Scope | Description |
|---|---|
| Platform | All organizations and institutions (internal GradGrid roles only) |
| Organization | All institutions belonging to the same organization |
| Institution | All records within a single institution |
| Department | Records for a department (e.g., HR, Accounts) |
| Assigned | Only records explicitly assigned to the user |
| Class | Students and activities for assigned classes |
| Self | Only the user's own profile and related information |

## 8.4 Sensitive Data Permissions

Sensitive fields (Aadhaar, PAN, APAAR ID, Samagra ID, bank details, etc.) require permissions beyond normal module access:

| Permission | Description |
|---|---|
| View Masked | Default access; displays masked values (e.g., XXXX-XXXX-1234) |
| Reveal Sensitive | Temporarily decrypt and display the value; requires explicit permission and generates an audit log |
| Export Sensitive | Include sensitive fields in exports; requires higher privilege and audit logging |
| Edit Sensitive | Modify encrypted values; restricted to authorized administrators |
| Delete Sensitive | Remove sensitive information where policy permits; fully audited |

Every reveal, export, or modification of sensitive data must be logged with: User ID, Role, Timestamp, Institution, IP Address, Device/User Agent, Reason (optional but recommended), and Resource Accessed.

**Implementation Note:** Roles must not be hardcoded. A Permission Registry must exist where every module declares its permissions (e.g., `students.view`, `students.create`, `students.reveal_sensitive`, `fees.export`).

---

# 9. Audit Logging Requirements

Two independent audit systems are required:

**Platform Audit Logs** — visible only to internal GradGrid platform users; tracks platform administration activity.

**Institution Audit Logs** — visible only to the Institution Owner and Authorized Administrators; tracks CRUD Operations, Authentication, Imports, Exports, Sensitive Data Access, Permission Changes, Document Generation, Communication, and Configuration Changes.

Audit logs are immutable and searchable.

---

# 10. Product Roadmap Alignment

| Phase | Focus |
|---|---|
| Phase 0 | Product & Architecture |
| Phase 1 | Platform Foundation |
| Phase 2 | Admission & Institution Management |
| Phase 3 | Finance |
| Phase 4 | Academic Operations |
| Phase 5 | Examination |
| Phase 6 | Website & CMS |
| Phase 7 | Communication |
| Phase 8 | Analytics & Reporting |
| Phase 9 | Expansion Modules |

Deferred infrastructure capabilities (Event Processing, Queue Management, Theme Engine, and similar enhancements) remain documented but are explicitly out of scope for MVP.

## 10.1 Feature Classification

Per Constitution §12, every feature must be classified as **MVP**, **Planned**, **Future**, or **Experimental**. Features outside current implementation scope must appear in the UI as **Coming Soon** where appropriate (see FR-028).

---

# 11. Data Principles

* Data belongs to the institution.
* Institutions are isolated from one another.
* Organizations may aggregate data across their own institutions when authorized.
* Sensitive information is encrypted.
* Soft deletion is preferred over permanent deletion where appropriate.
* Every significant change must be auditable.

---

# 12. Assumptions

* GradGrid is a multi-tenant SaaS platform; no requirement should assume a single-institution deployment.
* MVP architecture will be a Modular Monolith with future microservice readiness, per the platform's engineering principles.
* Features marked *(Future)* are acknowledged product direction but are not committed for the initial release.
* Student and Parent login/portal access ships as a scoped learner portal (`/portal`): students see only their own institution profile, class, and ID card; parents see only children linked via `student_parent_links` at that institution. Full self-service (fees, attendance) remains future.

---

# 13. Risks & Dependencies

| Risk / Dependency | Description |
|---|---|
| Sensitive data compliance | Handling Aadhaar, PAN, and similar government identifiers requires strict encryption, masking, and audit controls (NFR-001, §8.4) — non-compliance carries legal risk. |
| Multi-tenant isolation | Any weakness in tenant isolation could cause cross-institution data leakage (NFR-009). |
| Third-party dependencies | Google Captcha, WhatsApp, and Email providers are external dependencies affecting Authentication (FR-002) and Communication (FR-014). |
| Phased rollout discipline | Future-marked features must be clearly gated (FR-028) to avoid scope creep into MVP. |
| RBAC complexity | The four-level permission model (Module/Action/Data Scope/Sensitive Scope) is complex to implement correctly and must be centrally registry-driven, not hardcoded (§8.4). |

---

# 14. Out of Scope (MVP)

The following are explicitly deferred and must be marked **Coming Soon** or excluded from the MVP UI where referenced above:

* Mobile OTP Authentication, Remember Me, MFA/2FA
* Field-Level Permissions
* Student/Parent Login and Portals — **partial:** auth + home/ID card/children scope shipped; full product portal deferred
* Online Admissions
* Payment Gateway Integration, Online Payments, Auto Reconciliation
* Online Exams, Exam Creation, Question Bank
* Theme Marketplace
* SMS, Push Notifications, In-App Notifications, Communication Automation
* Biometric, RFID, QR, and GPS Attendance
* Billing (Platform Administration)
* Organization Branding, Custom Domains (pre-Phase 6), White Label Support, Subscription/License Management

---

# 15. References

* GradGrid Documentation Constitution v1.0
* GradGrid Architecture & Technical Decision Records (ADR/TDR) Index v1.0
* Functional & Non-Functional Requirements Source Set (FR-001–FR-028, NFR-001–NFR-018)
* RBAC & Permission Matrix Source Set

---

# 16. Next Documents in Sequence

Per Constitution §8, the following documents should follow this PRD:

1. Software Requirements Specification (SRS)
2. User Personas
3. User Journey Maps
4. Feature Prioritization (MoSCoW)
5. Information Architecture
6. Domain Model
7. Database Design
8. API Specification
9. RBAC & Permission Matrix *(formal, expanded version)*
10. UI/UX Design System
11. Security Architecture
12. Infrastructure Architecture
