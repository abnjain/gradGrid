# GradGrid User Personas

**Document Version:** 1.0
**Status:** Draft
**Document Type:** User Personas
**Author:** Product Team
**Last Updated:** 2026-07-13
**Governed By:** GradGrid Documentation Constitution v1.0

**Change Log**

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-07-13 | Initial personas compiled from PRD roles and platform scope | Product Team |

---

# 1. Purpose

This document defines the primary user personas for GradGrid. Each persona represents a realistic, research-grounded archetype of the people who will use, administer, or depend on the platform.

Personas inform product decisions, UX design, feature prioritization, and onboarding flows. Every significant design or product decision should be evaluated against at least one persona.

---

# 2. Persona Index

| ID | Persona Name | Role | Phase |
|---|---|---|---|
| P-01 | Rajesh Malhotra | Institution Owner | MVP |
| P-02 | Anita Sharma | Institution Admin / Academic Coordinator | MVP |
| P-03 | Vikram Nair | Teacher | MVP |
| P-04 | Priya Iyer | Accountant | MVP |
| P-05 | Meena Pillai | Receptionist | MVP |
| P-06 | Suresh Kadam | HR Manager | MVP |
| P-07 | Deepak Joshi | Platform Super Admin (Internal) | MVP |
| P-08 | Neha Agarwal | Parent | Future |
| P-09 | Arjun Singh | Student | Future |

---

# 3. Personas

---

## P-01 — Rajesh Malhotra · Institution Owner

> *"I need to know everything is running — without having to be in every room."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 48 |
| Role | Owner and Director, St. Francis International School |
| Education | MBA, former government school principal |
| Tech Comfort | Moderate — uses smartphone and email fluently; prefers guided dashboards over raw data |
| Institution Type | Multi-section English-medium CBSE school, 1,200 students |

### Context

Rajesh founded the school 18 years ago and manages all strategic decisions. He oversees finance, admissions, HR, and academics — but delegates daily operations to admins and department heads. He has previously used two different ERP systems and is frustrated with both: one required extensive IT support; the other had a poor mobile experience and no audit trail.

He onboards GradGrid as a fresh start. His biggest concern is losing control as the school grows.

### Goals

* Complete visibility into institution health from a single dashboard
* Confidence that fee collection, attendance, and admissions are running correctly
* Ability to control who sees what — especially sensitive financial and student data
* Branding that reflects his institution's identity
* Simple onboarding for his staff, who are not especially technical

### Pain Points

* Previous ERP required IT calls to reset user access; wasted hours
* No audit trail when things went wrong — could not trace who changed what
* Finance and attendance were in separate tools; reconciliation was manual
* Staff kept using WhatsApp for documents, which was not secure

### Behaviours

* Checks dashboards at 8 AM and 5 PM on a tablet
* Reviews monthly financial summaries; does not enter data himself
* Will personally configure roles and permissions for senior staff
* Expects notifications for critical events (e.g., fee defaults, admission approvals)

### Needs from GradGrid

* Role & Permission management
* Owner dashboard with key metrics
* Audit log access
* Institution branding configuration
* Academic session management
* Approval flows for admissions and documents

### Success Metric

> Rajesh can verify the health of his institution, trace any administrative action, and control staff access — without requiring IT involvement.

---

## P-02 — Anita Sharma · Institution Admin / Academic Coordinator

> *"I'm the one who actually makes the school run. I just need the system to keep up with me."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 36 |
| Role | Head Administrator and Academic Coordinator |
| Education | B.Ed., M.A. Education |
| Tech Comfort | High — power user, manages multiple tasks simultaneously on desktop |
| Institution Type | Large coaching institute, 800+ enrolled students across 12 batches |

### Context

Anita is the operational backbone of her institution. She manages student records, teacher assignments, class schedules, admission workflows, and report generation — often simultaneously. She works across every module in GradGrid and is the primary trainer for other staff. She has no tolerance for slow systems or workflows that require more than three steps.

### Goals

* Fast, structured workflows for student and teacher management
* Bulk operations — imports, updates, archive, restore — done quickly
* Generate and share documents (ID cards, admission forms, report cards) in seconds
* Manage academic sessions and class structure cleanly
* Train Receptionist and HR staff without requiring them to understand the system deeply

### Pain Points

* Previous tools required individual record edits — no bulk operations
* Excel imports would fail silently; she could not identify which rows had errors
* Class and section management was disconnected from student records
* Generating a report card required five different steps across three screens

### Behaviours

* Primary desktop user; occasionally switches to a tablet for approvals
* Logs in first each morning; last to log out
* Uses search and filters constantly — rarely browses paginated lists
* Will use keyboard shortcuts if available

### Needs from GradGrid

* Student & Teacher Management (full access)
* Bulk Import with inline error reporting
* Academic Structure configuration
* Document generation (ID cards, report cards, admit cards)
* Global search and advanced filtering
* Activity timeline for tracking changes

### Success Metric

> Anita can onboard 200 new students, assign them to classes, and generate their ID cards within a single working session.

---

## P-03 — Vikram Nair · Teacher

> *"I want to focus on teaching. I just need to mark attendance and enter marks — nothing complicated."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 29 |
| Role | Mathematics Teacher and Class Teacher, Grade 8 |
| Education | B.Sc. Mathematics, B.Ed. |
| Tech Comfort | Moderate — comfortable with smartphones and basic web apps |
| Institution Type | Residential CBSE school, 900 students |

### Context

Vikram teaches four sections and is the class teacher for Grade 8-B. His primary GradGrid interactions are attendance marking, marks entry, and viewing student profiles for his assigned sections. He does not manage institution settings or financial records. He expects a simple, task-oriented interface.

### Goals

* Mark attendance quickly for his sections each morning
* Enter and view examination marks without navigating complex menus
* Access student profiles for contact information and academic history
* Receive notifications about schedule changes or administrative updates

### Pain Points

* Previous attendance tools required logging in via a browser on a shared desktop — inconvenient for classroom use
* Marks entry forms were slow and did not auto-save; losing data was common
* Had to ask the admin for basic student information that should be self-serve

### Behaviours

* Uses the platform briefly at the start and end of school hours
* Prefers minimal UI; ignores features he does not need
* Expects confirmation messages when his actions are saved
* Views his own salary slip occasionally

### Needs from GradGrid

* Attendance marking (assigned sections)
* Marks entry
* Student profile view (read-only for his sections)
* Own profile and salary view (self)
* Dashboard with class-relevant summaries

### Success Metric

> Vikram can mark attendance for all his sections and submit examination marks with fewer than five clicks per action.

---

## P-04 — Priya Iyer · Accountant

> *"The numbers have to be right. I need records, receipts, and reports — everything traceable."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 41 |
| Role | Accounts Officer, Central Finance Department |
| Education | B.Com, Tally-certified |
| Tech Comfort | Moderate-High — expert in financial tools; proficient with spreadsheets |
| Institution Type | Multi-campus educational trust with three schools |

### Context

Priya manages fee collection, salary processing, scholarship records, and financial reporting across three institutions under a single organization. She needs full access to the finance module but should not be able to touch student academic records or configure institution settings. She generates reports monthly for the trust management.

### Goals

* Manage fee structures and installments per academic session
* Record salary disbursements and generate payslips
* Apply scholarships and discounts accurately
* Export financial reports in structured formats
* Trace every payment and flag discrepancies

### Pain Points

* Fee structures in previous systems were global — could not be customized per class or student category
* Salary records and fee records were in separate tools; reconciliation required manual exports
* No searchable audit trail for financial transactions — disputes were impossible to resolve

### Behaviours

* Primarily a desktop user; works across multiple tabs
* Exports data frequently for external reporting and auditing
* Needs to view her own payslips and salary history
* Occasionally shares receipts via WhatsApp or email

### Needs from GradGrid

* Full Finance module access (Fees, Salary, Receipts, Reports)
* Per-class and per-student scholarship/discount management
* Export functionality (PDF and Excel)
* Own payslip view
* Audit log access for finance records (own scope)

### Success Metric

> Priya can close the monthly finance cycle — fees collected, salaries disbursed, reports exported — without leaving GradGrid or opening a spreadsheet.

---

## P-05 — Meena Pillai · Receptionist

> *"Students come to me for everything. I need to find any record quickly without making them wait."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 32 |
| Role | Front Desk Receptionist and Admissions Assistant |
| Education | B.A., Diploma in Office Management |
| Tech Comfort | Moderate — comfortable with web forms and basic searches |
| Institution Type | Private school with 600 students, active admissions season |

### Context

Meena manages the front desk. She processes admission enquiries, assists with student registration, issues library cards, and is the first point of contact for parents. She uses GradGrid primarily for search, admissions, and document sharing. She has limited permission scope — she cannot access financial records or configure the system.

### Goals

* Quickly search for students and parents by name, admission number, or contact
* Process admissions and track their status
* Issue and share documents (ID cards, library cards) on request
* Record parent visits and follow-ups in the activity timeline
* Avoid having to contact the admin for routine lookups

### Pain Points

* Previous system had no global search — she had to know which section a student was in to find their record
* Generating an ID card required involving the admin; there was no self-serve option for her role
* Admissions were tracked on paper and Excel in parallel — data was frequently inconsistent

### Behaviours

* Works at a fixed desktop terminal; peak usage during school hours
* Uses search constantly — the search bar is her primary navigation
* Needs to work quickly, especially during morning rush

### Needs from GradGrid

* Global search (students, parents, teachers)
* Admission Management (receive and track enquiries, update status)
* Student profile view
* Document generation and sharing (ID cards, library cards)
* Activity timeline view for students
* Academic session view (read-only)

### Success Metric

> Meena can locate a student, check their admission status, and share their ID card — all within a single interaction at the front desk.

---

## P-06 — Suresh Kadam · HR Manager

> *"I manage people. I need employment records, documents, and compliance — and nothing should slip through the cracks."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 44 |
| Role | Human Resources Manager |
| Education | MBA (HR), PGDHRM |
| Tech Comfort | Moderate — uses HRMS tools professionally |
| Institution Type | University with 300+ faculty and administrative staff |

### Context

Suresh manages onboarding, employment records, document verification, and staff compliance for a large institution. He works closely with the Accountant on salary records but independently manages teacher and admin profiles. He handles sensitive documents — Aadhaar, PAN, qualifications — and needs precise access control over sensitive data.

### Goals

* Maintain complete teacher and staff profiles with document records
* Manage employment lifecycle — joining, role changes, exits
* Verify and store sensitive staff documents securely
* Collaborate with the Accountant on salary data without having full finance access
* Generate HR reports for compliance

### Pain Points

* Sensitive documents were stored in shared drives with no access tracking
* No clear lifecycle management — departing staff records were simply deleted, losing history
* Could not generate a consolidated staff report with employment history

### Behaviours

* Desktop-primary user; works during business hours
* Frequently onboards new staff at the start of academic sessions
* Needs to export staff reports for HR audits

### Needs from GradGrid

* Teacher Management (full, within HR scope)
* Sensitive data access (Aadhaar, PAN) with audit logging
* Staff profile archive and restore (not delete)
* Salary view (read-only, coordinated with Accountant)
* HR-scoped audit logs
* Staff reports and exports

### Success Metric

> Suresh can onboard a new teacher, verify and securely store their documents, and generate a compliance report — fully within GradGrid.

---

## P-07 — Deepak Joshi · Platform Super Admin (Internal GradGrid)

> *"I keep the platform running. I need full visibility and fast controls — without touching customer data unnecessarily."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 31 |
| Role | Platform Super Admin, GradGrid Internal Operations |
| Education | B.Tech Computer Science |
| Tech Comfort | Expert |
| Team | GradGrid Engineering / Operations |

### Context

Deepak is an internal GradGrid employee with platform-wide access. He manages organization and institution onboarding, resolves support escalations, manages platform users, and monitors system health. He does not manage day-to-day institution operations — his role is to configure, maintain, and support the platform layer.

### Goals

* Onboard new organizations and institutions quickly
* Manage platform users and their roles
* Access platform-level audit logs for compliance and incident response
* Monitor system health and error reports
* Enable or disable feature flags for phased rollouts

### Pain Points

* (Inferred from platform context) Lack of centralized platform admin tooling forces using direct database access — too risky
* No clear separation between platform audit logs and institution audit logs in previous tools

### Behaviours

* Power user; comfort with complex admin interfaces
* Accesses the platform across environments (staging and production)
* Needs read access to institution data for troubleshooting without ability to modify it unilaterally

### Needs from GradGrid

* Super Admin Portal
* Organization and Institution Management
* Platform User Management
* Platform Audit Logs
* Feature Flag controls (internal)
* System Configuration
* Health monitoring access

### Success Metric

> Deepak can onboard a new institution, configure its initial settings, and verify audit log integrity — without requiring direct database access.

---

## P-08 — Neha Agarwal · Parent *(Future Phase)*

> *"I just want to know how my child is doing — attendance, fees, results — without having to call the school."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 38 |
| Role | Parent of two students enrolled in the same institution |
| Tech Comfort | Moderate — smartphone-first |
| Phase | Future (Parent Portal) |

### Goals

* View attendance records for her children
* Pay fees online and download receipts
* View examination results and report cards
* Receive notifications for school events and communications
* Raise enquiries without visiting the school

### Pain Points

* Currently receives attendance and fee updates only via WhatsApp from teachers — informal and unreliable
* Cannot access her children's academic records without calling the school office
* Fee payment requires a physical visit or bank transfer — no digital record

### Needs from GradGrid *(Future)*

* Parent Portal (self-service)
* Attendance and result view (own children)
* Fee payment and receipt download
* School communication inbox
* Profile management

---

## P-09 — Arjun Singh · Student *(Future Phase)*

> *"I want to see my results and timetable without asking a teacher."*

### Profile

| Attribute | Detail |
|---|---|
| Age | 16 |
| Role | Grade 11 student |
| Tech Comfort | High — smartphone native |
| Phase | Future (Student Portal) |

### Goals

* View own academic records, results, and attendance
* Download admit cards and report cards
* Receive notifications about exams and events
* View fee status and payment history

### Needs from GradGrid *(Future)*

* Student Portal (self-service)
* Own academic record view
* Document downloads (admit card, report card)
* Notifications

---

# 4. Persona × Module Coverage

| Module | P-01 Owner | P-02 Admin | P-03 Teacher | P-04 Acct. | P-05 Recept. | P-06 HR | P-07 Platform |
|---|---|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Organization Mgmt | — | — | — | — | — | — | ✅ |
| Institution Settings | ✅ | ⚙ | — | — | — | — | ✅ |
| User Management | ✅ | ⚙ | — | — | — | ◐ | ✅ |
| Student Management | ✅ | ✅ | ◐ | 👁 | ⚙ | — | ✅ |
| Teacher Management | ✅ | ✅ | 👁 | 👁 | — | ✅ | ✅ |
| Admissions | ✅ | ✅ | — | — | ✅ | — | ✅ |
| Academic Structure | ✅ | ✅ | 👁 | — | 👁 | — | ✅ |
| Attendance | ✅ | ✅ | ✅ | — | — | — | ✅ |
| Finance | 👁 | 👁 | — | ✅ | — | ⚙ | ✅ |
| Examination | ✅ | ✅ | ⚙ | — | — | — | ✅ |
| Document Generation | ✅ | ✅ | — | ✅ | ✅ | — | ✅ |
| Communication | ✅ | ✅ | ⚙ | — | ⚙ | — | ✅ |
| Reports | ✅ | ✅ | ⚙ | ✅ | ⚙ | ✅ | ✅ |
| Audit Logs | ✅ | ⚙ | 👁 Own | 👁 Own | 👁 Own | 👁 Own | ✅ |
| Sensitive Data | ⚙ | ⚙ | — | — | — | ⚙ | ⚙ |

---

# 5. References

* GradGrid Documentation Constitution v1.0
* GradGrid PRD v1.0
* ADR/TDR Index v1.0 (ADR-017 RBAC Architecture, ADR-020 Sensitive Data Masking)
