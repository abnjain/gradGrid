# GradGrid Information Architecture

**Document Version:** 1.0
**Status:** Draft
**Document Type:** Information Architecture
**Author:** Product Team
**Last Updated:** 2026-07-13
**Governed By:** GradGrid Documentation Constitution v1.0

**Change Log**

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-07-13 | Initial Information Architecture for MVP scope | Product Team |

---

# 1. Purpose

The Information Architecture (IA) document defines the structural organization of the GradGrid platform: how content, features, and navigation are organized across all user-facing portals. It establishes the hierarchy of pages, the naming of navigation elements, the grouping logic of features, and the routing structure that the frontend will implement.

This document serves as the authoritative source for:

* Navigation structure across all portals
* Page hierarchy and naming
* Module-to-role visibility mapping
* URL structure conventions
* Entry points, empty states, and system boundaries

---

# 2. Portals Overview

GradGrid serves two distinct portal contexts, with distinct authentication boundaries:

| Portal | Audience | Access Boundary |
|---|---|---|
| Institution Portal | Institution Owner, Admin, Teachers, Accountants, Librarians, Receptionists, HR | Scoped to a single Institution and Academic Session |
| Platform Admin Portal | Platform Super Admins, Platform Admins, Support, DevOps, Security Auditors | Platform-wide |

**Future portals (not in MVP):**

* Student Portal
* Parent Portal
* Organization Dashboard (aggregated multi-institution view)

---

# 3. URL Structure Conventions

URLs follow a consistent hierarchical pattern:

```
/{portal}/{module}/{resource}/{id}/{action}
```

**Examples:**

```
/app/students                      → Student list
/app/students/new                  → Create student
/app/students/{id}                 → Student profile
/app/students/{id}/edit            → Edit student
/app/students/import               → Bulk import
/app/finance/fees                  → Fee list
/app/finance/fees/{id}/receipt     → Fee receipt
/app/attendance/mark               → Today's attendance entry
/admin/organizations               → Platform: organization list
/admin/organizations/{id}          → Organization detail
/admin/institutions/{id}           → Institution detail
```

**Conventions:**

* `/app` prefix — Institution Portal
* `/admin` prefix — Platform Admin Portal
* Kebab-case for multi-word paths (`/academic-sessions`, `/audit-logs`)
* Resource IDs are UUIDs internally; slugs may be used for human-readable contexts
* Version prefix for API routes: `/api/v1/`

---

# 4. Platform Admin Portal — Information Architecture

**Access:** Platform Super Admins and assigned platform roles only.

```
Platform Admin Portal
│
├── Dashboard
│   ├── Platform health metrics
│   ├── Active organizations
│   ├── Active institutions
│   ├── Recent provisioning activity
│   └── System alerts
│
├── Organizations
│   ├── Organization List
│   │   ├── Search & filter
│   │   └── Create Organization
│   └── Organization Detail
│       ├── Overview
│       ├── Institutions (list within org)
│       ├── Subscription & License (Future)
│       └── Audit Trail
│
├── Institutions
│   ├── Institution List
│   │   ├── Search & filter
│   │   └── Create Institution
│   └── Institution Detail
│       ├── Overview & Branding
│       ├── Academic Sessions
│       ├── Users
│       ├── Feature Flags
│       └── Audit Trail
│
├── Platform Users
│   ├── User List
│   ├── Invite User
│   └── User Detail
│       ├── Profile
│       ├── Role Assignment
│       └── Access Log
│
├── Platform Audit Logs
│   ├── Log Stream (all events)
│   ├── Filter (by org, institution, user, event type, date)
│   └── Export
│
├── System Configuration
│   ├── Feature Flags
│   ├── Email Configuration
│   └── Environment Settings
│
└── Account
    ├── My Profile
    ├── Change Password
    └── Active Sessions
```

---

# 5. Institution Portal — Information Architecture

**Access:** All Institution roles, scoped to their institution and session.
**Session Context:** Every page operates within the selected Academic Session.

```
Institution Portal
│
├── [Global Header]
│   ├── Institution Logo & Name
│   ├── Academic Session Selector
│   ├── Global Search
│   ├── Notifications Bell
│   └── User Menu (Profile, Settings, Logout)
│
├── Dashboard (role-specific)
│   ├── Owner Dashboard
│   ├── Admin Dashboard
│   ├── Teacher Dashboard
│   ├── Accountant Dashboard
│   ├── Receptionist Dashboard
│   └── HR Dashboard
│
├── ── PEOPLE ──
│
├── Students
│   ├── Student List
│   │   ├── Search & Advanced Filter
│   │   ├── Class/Section Filter
│   │   ├── Status Filter (Active, Archived, Deleted)
│   │   └── Bulk Actions (Assign, Archive, Export)
│   ├── Student Profile
│   │   ├── Personal Details
│   │   ├── Parent & Guardian Details
│   │   ├── Academic Details
│   │   │   ├── Enrolled Classes
│   │   │   ├── Attendance Summary
│   │   │   └── Exam Results
│   │   ├── Finance Summary
│   │   ├── Documents
│   │   ├── Activity Timeline
│   │   └── Sensitive Data (masked; Reveal requires permission)
│   ├── Import Students
│   │   ├── Download Template
│   │   ├── Upload & Validate
│   │   ├── Error Report
│   │   └── Confirm & Import
│   └── Export Students
│
├── Teachers
│   ├── Teacher List
│   │   ├── Search & Filter (Dept, Designation, Status)
│   │   └── Bulk Actions (Export)
│   ├── Teacher Profile
│   │   ├── Personal Details
│   │   ├── Employment Details
│   │   ├── Qualifications & Experience
│   │   ├── Assigned Classes & Subjects
│   │   ├── Salary Summary (HR / Owner only)
│   │   ├── Documents (Aadhaar, PAN — masked)
│   │   └── Activity Timeline
│   ├── Import Teachers
│   └── Export Teachers
│
├── Parents *(managed; no login in MVP)*
│   ├── Parent List
│   ├── Parent Profile
│   │   ├── Contact Details
│   │   ├── Linked Students
│   │   └── Communication History
│   └── Export Parents
│
├── Users (Platform Access Management)
│   ├── User List (staff with GradGrid access)
│   ├── Invite User
│   ├── User Profile
│   │   ├── Role Assignment
│   │   ├── Permission Override
│   │   └── Active Sessions
│   └── Roles & Permissions
│       ├── Default Roles (read-only)
│       └── Custom Roles
│           ├── Create Role
│           ├── Assign Permissions
│           └── Assign Users
│
├── ── ADMISSIONS ──
│
├── Admissions
│   ├── Enquiry Pipeline
│   │   ├── Kanban view by status
│   │   ├── List view with filters
│   │   └── New Enquiry
│   ├── Enquiry Detail
│   │   ├── Student & Parent Info
│   │   ├── Status & Notes
│   │   ├── Documents
│   │   └── Activity Timeline
│   ├── Convert to Student
│   │   ├── Map to Class/Section
│   │   ├── Generate Admission Number
│   │   └── Admin Approval (if configured)
│   └── Admission Reports
│
├── ── ACADEMICS ──
│
├── Academic Structure
│   ├── Academic Sessions
│   │   ├── Session List
│   │   ├── Create / Edit Session
│   │   └── Set Active Session
│   ├── Classes & Sections
│   │   ├── Class List
│   │   ├── Create Class & Sections
│   │   ├── Assign Class Teacher
│   │   └── Section Detail (students in section)
│   ├── Subjects
│   │   ├── Subject List
│   │   ├── Create Subject
│   │   └── Assign to Classes
│   ├── Departments
│   │   ├── Department List
│   │   └── Create / Edit Department
│   └── Houses *(optional)*
│       ├── House List
│       └── Create / Edit House
│
├── Attendance
│   ├── Mark Attendance
│   │   ├── Select Class / Section / Date
│   │   ├── Student Attendance Form
│   │   │   └── Present / Absent / Late + Remark
│   │   └── Submit & Confirm
│   ├── Attendance Register
│   │   ├── Class-wise monthly view
│   │   └── Student-wise calendar view
│   ├── Teacher Attendance
│   │   ├── Mark Teacher Attendance
│   │   └── Teacher Attendance Register
│   └── Attendance Reports
│       ├── Class Summary
│       ├── Student Summary
│       └── Export
│
├── Examination
│   ├── Exam Configuration *(Admin only)*
│   │   ├── Exam Types (Unit Test, Half-Yearly, Annual)
│   │   ├── Grade Rules
│   │   └── Max Marks Configuration
│   ├── Marks Entry
│   │   ├── Select Exam / Class / Subject
│   │   ├── Marks Entry Form
│   │   │   ├── Per-student marks input
│   │   │   └── Auto-validation against max marks
│   │   ├── Import Marks (Excel)
│   │   └── Submit for Review
│   ├── Results
│   │   ├── Class-wise Result Summary
│   │   ├── Student-wise Result Detail
│   │   └── Rankings
│   └── Document Generation
│       ├── Admit Cards
│       │   ├── Template Selection
│       │   ├── Bulk Generate
│       │   └── Download / Share
│       └── Report Cards
│           ├── Template Selection
│           ├── Bulk Generate
│           └── Download / Share
│
├── ── FINANCE ──
│
├── Finance
│   ├── Fee Management
│   │   ├── Fee Structures
│   │   │   ├── Structure List (by class / session)
│   │   │   ├── Create Fee Structure
│   │   │   └── Installment Configuration
│   │   ├── Scholarships & Discounts
│   │   │   ├── Scholarship List
│   │   │   ├── Create Scholarship
│   │   │   └── Apply to Students
│   │   ├── Fee Collection
│   │   │   ├── Pending Fees (by class / student)
│   │   │   ├── Record Payment
│   │   │   ├── Receipt Generation
│   │   │   └── Share Receipt (WhatsApp / Email)
│   │   └── Fee Reports
│   │       ├── Collection Summary
│   │       ├── Outstanding Report
│   │       ├── Scholarship Report
│   │       └── Export
│   └── Salary Management
│       ├── Salary Records
│       │   ├── Staff Salary List
│       │   ├── Record Salary Disbursement
│       │   └── Payslip Generation
│       └── Salary Reports
│           ├── Monthly Salary Summary
│           └── Export
│
├── ── LIBRARY ──
│
├── Library *(Librarian primary)*
│   ├── Books / Catalogue
│   │   ├── Book List
│   │   ├── Add Book
│   │   └── Book Detail
│   ├── Issue & Return
│   │   ├── Issue Book to Student
│   │   ├── Issue Book to Staff
│   │   └── Return & Fine Management
│   ├── Library Cards
│   │   ├── Generate Library Card
│   │   └── Download / Share
│   └── Library Reports
│
├── ── COMMUNICATION ──
│
├── Communication
│   ├── Compose Message
│   │   ├── Channel Selection (Email / WhatsApp)
│   │   ├── Recipient Selection (Class, Group, Individual)
│   │   ├── Template Selection
│   │   ├── Message Editor
│   │   └── Schedule / Send
│   ├── Message History
│   │   ├── Sent Messages
│   │   └── Message Detail (status, recipients)
│   ├── Templates
│   │   ├── Template List
│   │   ├── Create Template
│   │   └── Edit Template
│   └── Notifications Settings
│
├── ── DOCUMENTS ──
│
├── Documents
│   ├── Templates
│   │   ├── ID Card Templates
│   │   ├── Library Card Templates
│   │   ├── Admission Form Templates
│   │   ├── Admit Card Templates
│   │   ├── Report Card Templates
│   │   └── Certificate Templates *(Future)*
│   └── Generated Documents
│       ├── Document History
│       └── Re-download / Re-share
│
├── ── WEBSITE ──  *(Phase 6)*
│
├── Website *(Coming Soon)*
│   ├── Pages (CMS)
│   ├── Gallery
│   ├── Blog
│   ├── Faculty Pages
│   ├── Admissions Page
│   ├── SEO Settings
│   └── Custom Domain
│
├── ── REPORTS ──
│
├── Reports
│   ├── Attendance Reports
│   ├── Admission Reports
│   ├── Student Reports
│   ├── Teacher Reports
│   ├── Fee Reports
│   ├── Salary Reports
│   ├── Examination Reports
│   └── Export Centre
│
├── ── ADMIN & SETTINGS ──
│
├── Audit Logs
│   ├── Log Stream
│   │   ├── Filter (Module, User, Action, Date)
│   │   ├── Event Detail (field-level changes)
│   │   └── User Profile shortcut from entry
│   └── Export Audit Logs
│
├── Settings
│   ├── Institution Settings
│   │   ├── General (Name, Address, Contact)
│   │   ├── Branding (Logo, Colors)
│   │   ├── Academic Defaults
│   │   └── Security Settings
│   ├── Roles & Permissions
│   │   ├── Default Roles (view only)
│   │   └── Custom Roles (manage)
│   ├── Communication Settings
│   │   ├── Email Configuration
│   │   └── WhatsApp Configuration
│   └── Data Management *(Future)*
│       ├── Retention Policies
│       └── Export All Data
│
└── Account (per-user)
    ├── My Profile
    ├── Change Password
    ├── Active Sessions
    └── My Audit Log (own actions)
```

---

# 6. Dashboard Architecture (Role-Specific)

Each role lands on a dashboard tailored to their primary responsibilities. Widgets are read-only summaries with deep-link navigation.

## 6.1 Institution Owner Dashboard

| Widget | Data |
|---|---|
| Institution Health Score | Setup completeness |
| Total Students (Active) | With session filter |
| Fee Collection Summary | Current month: collected vs outstanding |
| Attendance Overview | Today's institution-wide rate |
| Pending Approvals | Admissions, document requests |
| Recent Audit Events | Last 5 significant actions |
| Quick Links | Settings, Users, Reports |

## 6.2 Institution Admin Dashboard

| Widget | Data |
|---|---|
| Students by Class | Breakdown and totals |
| Upcoming Exam Events | Scheduled exams |
| Attendance Summary | Today, by class |
| Pending Admissions | Enquiries awaiting action |
| Document Generation Queue | Recent / pending |
| Quick Actions | Import Students, Mark Attendance, Generate IDs |

## 6.3 Teacher Dashboard

| Widget | Data |
|---|---|
| Today's Attendance | My sections — mark or view |
| My Classes | Assigned sections with student counts |
| Upcoming Exams | Marks entry windows |
| Recent Marks Entry | Status of pending submissions |
| My Profile | Quick access |

## 6.4 Accountant Dashboard

| Widget | Data |
|---|---|
| Fee Collection This Month | Total vs outstanding |
| Today's Payments | Count and amount |
| Pending Salary Disbursements | Month status |
| Scholarship Utilization | Applied vs budget |
| Quick Actions | Record Payment, Generate Payslips, Export Report |

## 6.5 Receptionist Dashboard

| Widget | Data |
|---|---|
| Today's Enquiries | New and pending follow-ups |
| Admission Pipeline | Kanban status summary |
| Student Search | Prominent, always visible |
| Recent Documents Issued | ID cards, library cards shared today |

## 6.6 HR Dashboard

| Widget | Data |
|---|---|
| Total Staff | Active, inactive |
| Onboarding Queue | Incomplete profiles |
| Document Compliance | Profiles with missing sensitive docs |
| Staff by Department | Breakdown |
| Quick Actions | Add Teacher, Import Staff |

---

# 7. Global Navigation Conventions

## 7.1 Primary Navigation (Sidebar)

Visible and role-filtered — users only see modules they have access to. Modules with no access are hidden entirely (not greyed out).

**Navigation group order:**

1. Dashboard
2. People (Students, Teachers, Parents, Users)
3. Admissions
4. Academics (Structure, Attendance, Examination)
5. Finance
6. Library
7. Communication
8. Documents
9. Website *(Phase 6)*
10. Reports
11. Audit Logs *(visible to authorized roles)*
12. Settings

## 7.2 Global Search

* Accessible from the header on every page (keyboard shortcut: `/` or `Cmd+K`)
* Searches across: Students, Teachers, Parents, Users, Classes, Subjects
* Results grouped by entity type
* Respects the user's data scope — a Teacher sees only their assigned students
* No results state: "No records found matching '{query}'" with a suggested action

## 7.3 Academic Session Selector

* Displayed prominently in the header
* All data views are scoped to the selected session
* Default: current active session
* Changing session reloads the active module with the new context
* Warning displayed when viewing a past session: "You are viewing data from 2024–25. Changes may be restricted."

## 7.4 Notifications

* Bell icon in header with unread count badge
* Notification types: Approvals, System Alerts, Document Ready, Communication Status
* Notification panel: list with timestamp, type icon, and deep link to relevant record

---

# 8. Empty States

Every list page must define an empty state. Empty states should be helpful, not blank.

| Page | Empty State Message | Action |
|---|---|---|
| Student List | "No students added yet. Start by importing or adding a student." | Import Students / Add Student |
| Teacher List | "No teachers found. Add your first teacher to get started." | Add Teacher |
| Admissions | "No enquiries yet. Record your first admission enquiry." | New Enquiry |
| Attendance (today) | "Attendance not yet marked for today." | Mark Attendance |
| Fee Structures | "No fee structures configured. Set up your first fee structure." | Create Fee Structure |
| Audit Logs | "No audit events found for the selected filters." | Clear Filters |
| Messages | "No messages sent yet. Start by composing a message." | Compose Message |
| Reports | "No reports generated yet." | Generate Report |

---

# 9. Coming Soon Module Handling

Modules outside MVP scope must be surfaced in navigation but marked clearly as Coming Soon. Behavior:

* Shown in the sidebar in correct hierarchy position with a "Coming Soon" badge
* Clicking opens a placeholder page: module name, brief description of upcoming functionality, and an optional "Notify Me" option
* Coming Soon modules are never navigable beyond their placeholder page
* Feature flag controls visibility — can be toggled per institution by Platform Admin

Modules in Coming Soon state for MVP:

* Website / CMS
* Student Portal
* Parent Portal
* Mobile Applications
* Biometric / RFID Attendance
* Payment Gateway
* SMS & Push Notifications
* Online Examinations
* White Label

---

# 10. Sensitive Data Interaction Pattern

Sensitive fields (Aadhaar, PAN, APAAR ID, Samagra ID, bank details) follow a consistent display pattern across all modules:

**Default State:** Field shown as masked — `XXXX-XXXX-1234`

**Reveal Flow:**

1. User clicks the "Reveal" icon (eye icon) next to the masked field
2. System checks permission: `reveal_sensitive` required
3. If authorized: field decrypts and displays for a configurable timeout (e.g., 30 seconds)
4. Audit log entry created immediately: User, Role, Field, Record, Timestamp, IP, User Agent
5. Field re-masks automatically after timeout
6. If unauthorized: tooltip — "You do not have permission to reveal this field."

This pattern applies consistently on Student Profiles, Teacher Profiles, and any other entity with sensitive fields.

---

# 11. Destructive Action Confirmation Pattern

All destructive or irreversible actions must follow this pattern:

1. User triggers action (Delete, Archive, Revoke, Bulk Remove)
2. Modal confirmation dialog appears with:
   * Action name in the title: "Archive this student?"
   * Impact description: "This will remove {Student Name} from active lists. Their record will be preserved and can be restored."
   * Confirm button (labelled with the action, not "OK"): "Archive Student"
   * Cancel button
3. Action executes only after explicit confirmation
4. Success notification appears with undo option where applicable (soft actions only)

---

# 12. Page Layout Conventions

| Element | Convention |
|---|---|
| Page Title | Module name + context (e.g., "Students — Grade 8-B") |
| Breadcrumb | Always visible on detail and sub-pages |
| Primary Action | Top-right of page header (e.g., "Add Student", "Import") |
| Filters | Collapsible filter bar below page header |
| Pagination | Bottom of list; default 25 records per page; configurable |
| Loading State | Skeleton screens (not spinners) for list and detail pages |
| Error State | Inline error message with retry option |
| Responsive | Desktop-first; tablet compatible; mobile web supported |

---

# 13. IA Scope Boundaries

The following are explicitly out of scope for this IA document and will be addressed in future phases:

* Organization-level aggregated dashboard (multi-institution view)
* Student Portal IA
* Parent Portal IA
* Mobile Application IA
* Public-facing Website IA (managed via CMS — Phase 6)
* Marketplace IA
* AI Module IA

---

# 14. References

* GradGrid Documentation Constitution v1.0
* GradGrid PRD v1.0
* GradGrid User Personas v1.0
* GradGrid User Journey Maps v1.0
* ADR/TDR Index v1.0 (ADR-024 Next.js, ADR-025 App Router, ADR-027 Design System)
