# GradGrid User Journey Maps

**Document Version:** 1.0
**Status:** Draft
**Document Type:** User Journey Maps
**Author:** Product Team
**Last Updated:** 2026-07-13
**Governed By:** GradGrid Documentation Constitution v1.0

**Change Log**

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 2026-07-13 | Initial journey maps for MVP personas and core workflows | Product Team |

---

# 1. Purpose

User Journey Maps document the end-to-end experience of each primary persona as they interact with GradGrid to complete a meaningful goal. Each map captures the steps, touchpoints, emotional state, pain points, and product opportunities across the full interaction arc.

Journey maps are used to:

* Identify UX gaps and friction points before design begins
* Validate that the feature set supports real workflows end-to-end
* Prioritize features with the highest impact on user experience
* Guide screen-level design decisions

---

# 2. Journey Map Index

| ID | Persona | Journey | Phase |
|---|---|---|---|
| JM-01 | P-01 Institution Owner | Institution Setup & First Login | MVP |
| JM-02 | P-02 Institution Admin | Bulk Student Onboarding | MVP |
| JM-03 | P-02 Institution Admin | Student ID Card Generation & Distribution | MVP |
| JM-04 | P-03 Teacher | Daily Attendance Marking | MVP |
| JM-05 | P-03 Teacher | Examination Marks Entry | MVP |
| JM-06 | P-04 Accountant | Monthly Fee Collection Cycle | MVP |
| JM-07 | P-05 Receptionist | Admission Enquiry to Enrollment | MVP |
| JM-08 | P-06 HR Manager | New Teacher Onboarding | MVP |
| JM-09 | P-01 Institution Owner | Audit Log Review After Incident | MVP |
| JM-10 | P-07 Platform Admin | New Institution Provisioning | MVP |

---

# 3. Journey Maps

---

## JM-01 · Institution Owner — Institution Setup & First Login

**Persona:** P-01 Rajesh Malhotra, Institution Owner
**Trigger:** GradGrid Platform Admin (P-07) has provisioned the institution; Rajesh receives a welcome email.
**End State:** Institution is configured, roles are assigned, and the Owner is confident the platform is ready for staff.

---

### Journey Stages

#### Stage 1 — Receive & Access

| Element | Detail |
|---|---|
| Steps | Receives welcome email → clicks login link → sets password via email OTP → lands on Owner Dashboard |
| Touchpoints | Email, Login Page, OTP Verification, Dashboard |
| Emotion | 😐 Cautious — new platform, unsure what to expect |
| Pain Points | Welcome email clarity; OTP delivery speed |
| Opportunities | Branded welcome email with institution name; clear first-login checklist on dashboard |

---

#### Stage 2 — Configure Institution

| Element | Detail |
|---|---|
| Steps | Opens Institution Settings → uploads logo and branding → sets institution name, address, contact → configures academic session |
| Touchpoints | Institution Settings, File Upload, Academic Session Setup |
| Emotion | 😊 Engaged — making it feel like "his" platform |
| Pain Points | Logo upload size/format errors; unclear which fields are mandatory |
| Opportunities | Live branding preview; field-level validation with inline guidance; progress indicator |

---

#### Stage 3 — Set Up Roles & Staff Access

| Element | Detail |
|---|---|
| Steps | Opens User Management → invites Admin (Anita) → assigns Institution Admin role → reviews default permissions → customizes if needed |
| Touchpoints | User Management, Role Assignment, Permission Configuration |
| Emotion | 😊 Confident — knows who can access what |
| Pain Points | Permission matrix can feel overwhelming without guidance |
| Opportunities | Role templates with plain-English summaries; guided role setup for first-time owners |

---

#### Stage 4 — Review Dashboard & Confirm Readiness

| Element | Detail |
|---|---|
| Steps | Returns to dashboard → sees setup checklist progress → marks institution as ready → optionally sends test notification |
| Touchpoints | Owner Dashboard, Setup Checklist, Notifications |
| Emotion | 😄 Satisfied — clear sense of completion |
| Pain Points | Unclear what "done" looks like without a checklist |
| Opportunities | Onboarding checklist widget with completion percentage; contextual "Next Steps" prompts |

---

### Emotional Arc

```
Cautious → Engaged → Confident → Satisfied
```

### Key Opportunities Summary

* Branded, institution-specific welcome email
* First-login setup checklist on the dashboard
* Live branding preview in Institution Settings
* Role setup wizard with plain-English permission descriptions
* Clear "ready" state confirmation at end of setup

---

---

## JM-02 · Institution Admin — Bulk Student Onboarding

**Persona:** P-02 Anita Sharma, Institution Admin
**Trigger:** New academic session begins; 300 new students must be onboarded.
**End State:** All students are imported, assigned to classes, and their profiles are verified.

---

### Journey Stages

#### Stage 1 — Prepare Import

| Element | Detail |
|---|---|
| Steps | Downloads import template from Student Management → fills template in Excel with student data → prepares photo files (optional) |
| Touchpoints | Student Management module, Template download |
| Emotion | 😐 Methodical — this is a routine but high-stakes task |
| Pain Points | Template format ambiguity; unclear which columns are mandatory |
| Opportunities | Annotated template with column descriptions and example rows; downloadable validation guide |

---

#### Stage 2 — Upload & Validate

| Element | Detail |
|---|---|
| Steps | Uploads Excel file → system validates rows → sees validation report with errors highlighted by row and column → corrects errors in Excel → re-uploads |
| Touchpoints | Import Wizard, Validation Report |
| Emotion | 😤 Frustrated if errors are vague → 😊 Relieved if errors are clear and fixable |
| Pain Points | Silent failures; bulk rejection with no row-level detail; having to re-upload the entire file for one error |
| Opportunities | Row-level error report with downloadable summary; partial import for valid rows; re-upload for error rows only |

---

#### Stage 3 — Assign to Classes

| Element | Detail |
|---|---|
| Steps | Selects imported students → uses bulk assign to map them to classes and sections → confirms assignments |
| Touchpoints | Student Management, Class & Section Assignment |
| Emotion | 😊 Efficient — if bulk operations work smoothly |
| Pain Points | Assigning students one-by-one defeats the purpose of bulk import |
| Opportunities | Multi-select with batch class assignment; import template column for class/section to automate this step |

---

#### Stage 4 — Verify & Publish

| Element | Detail |
|---|---|
| Steps | Reviews student list → spot-checks profiles → checks for missing fields → marks session as active |
| Touchpoints | Student list, Individual profile view, Academic session status |
| Emotion | 😊 Confident after spot checks |
| Pain Points | No summary view of incomplete profiles |
| Opportunities | "Profile completeness" indicator per student; bulk view of students with missing mandatory fields |

---

### Emotional Arc

```
Methodical → Frustrated (errors) → Relieved (clarity) → Efficient → Confident
```

### Key Opportunities Summary

* Annotated import template with examples
* Row-level error reporting with downloadable error file
* Partial import support — valid rows proceed, error rows flagged
* Bulk class/section assignment post-import
* Profile completeness indicator on student list

---

---

## JM-03 · Institution Admin — Student ID Card Generation & Distribution

**Persona:** P-02 Anita Sharma
**Trigger:** New students have been onboarded; ID cards are needed for the start of the academic year.
**End State:** All students have received their ID cards via PDF or WhatsApp.

---

### Journey Stages

#### Stage 1 — Configure ID Card Template

| Element | Detail |
|---|---|
| Steps | Opens Template Management → selects ID Card template → configures layout (logo, fields, QR code) → previews output → saves template |
| Touchpoints | Template Management, Live Preview |
| Emotion | 😊 Creative — visual output is satisfying |
| Pain Points | No live preview forces repeated generate-check cycles |
| Opportunities | Real-time template preview with sample student data |

---

#### Stage 2 — Generate in Bulk

| Element | Detail |
|---|---|
| Steps | Selects all students in a class or session → triggers bulk ID card generation → waits for PDF batch processing |
| Touchpoints | Student list (multi-select), Generate action, Processing indicator |
| Emotion | 😐 Waiting — anxious if there is no progress indicator |
| Pain Points | Long wait with no feedback; partial failures not surfaced |
| Opportunities | Background processing with progress bar; email notification when batch is ready |

---

#### Stage 3 — Review & Distribute

| Element | Detail |
|---|---|
| Steps | Downloads batch PDF → reviews → shares individual cards via WhatsApp or email to students/parents |
| Touchpoints | Document download, WhatsApp share, Email share |
| Emotion | 😄 Satisfied — tangible output delivered |
| Pain Points | Sharing 300 cards individually via WhatsApp is impractical without bulk send |
| Opportunities | Bulk WhatsApp dispatch; per-student share button; QR code verification support |

---

### Emotional Arc

```
Creative → Waiting → Satisfied
```

### Key Opportunities Summary

* Live ID card template preview
* Bulk generation with progress indicator and background processing
* Notification when batch generation is complete
* Bulk WhatsApp / email dispatch for ID card distribution

---

---

## JM-04 · Teacher — Daily Attendance Marking

**Persona:** P-03 Vikram Nair, Teacher
**Trigger:** Start of school day; Vikram needs to mark attendance for Grade 8-B.
**End State:** Attendance is submitted and recorded; absentees are flagged.

---

### Journey Stages

#### Stage 1 — Access Attendance

| Element | Detail |
|---|---|
| Steps | Logs in → sees Today's Attendance widget on dashboard → selects Grade 8-B → attendance list loads |
| Touchpoints | Teacher Dashboard, Attendance module |
| Emotion | 😊 Efficient — wants this to take under two minutes |
| Pain Points | Having to navigate deep into menus to find today's attendance |
| Opportunities | "Mark Today's Attendance" shortcut on the Teacher Dashboard; class pre-selected |

---

#### Stage 2 — Mark Attendance

| Element | Detail |
|---|---|
| Steps | Reviews alphabetical student list → marks each student Present / Absent / Late → adds optional remark for absences |
| Touchpoints | Attendance form |
| Emotion | 😊 Quick — if UI is fast and responsive |
| Pain Points | Slow page loads; accidental mark with no undo; no default state |
| Opportunities | Default to "Present" with one-tap override to Absent/Late; undo last action; auto-save |

---

#### Stage 3 — Submit & Confirm

| Element | Detail |
|---|---|
| Steps | Reviews summary (X present, Y absent, Z late) → submits → sees confirmation message |
| Touchpoints | Attendance summary, Submit confirmation |
| Emotion | 😄 Done — clear confirmation of success |
| Pain Points | Uncertainty about whether the submission was received |
| Opportunities | Clear success state with timestamp; today's attendance widget on dashboard updates |

---

### Emotional Arc

```
Efficient → Quick → Done
```

### Key Opportunities Summary

* Dashboard shortcut for today's attendance
* Default-present model with one-tap override
* Auto-save to prevent data loss
* Clear submission confirmation with timestamp

---

---

## JM-05 · Teacher — Examination Marks Entry

**Persona:** P-03 Vikram Nair
**Trigger:** Examination is complete; Admin has opened marks entry for Mathematics, Grade 8.
**End State:** Marks are entered, saved, and locked for report card generation.

---

### Journey Stages

#### Stage 1 — Access Marks Entry

| Element | Detail |
|---|---|
| Steps | Logs in → navigates to Examination module → selects academic session → selects subject → selects class |
| Touchpoints | Examination module, subject-class selection |
| Emotion | 😐 Routine — expects a clean, fast form |
| Pain Points | Too many dropdowns before reaching the entry form |
| Opportunities | Pre-filter by teacher's assigned subjects; reduce navigation steps |

---

#### Stage 2 — Enter Marks

| Element | Detail |
|---|---|
| Steps | Sees alphabetical student list with marks columns → enters marks per student → system validates against max marks → saves row-by-row or in bulk |
| Touchpoints | Marks entry form |
| Emotion | 😐 Focused — data entry task |
| Pain Points | Exceeding max marks allowed without immediate feedback; losing all entries on accidental navigation |
| Opportunities | Inline max-marks validation; auto-save per row; tab-key navigation between cells |

---

#### Stage 3 — Review & Submit

| Element | Detail |
|---|---|
| Steps | Reviews class summary (averages, highest, lowest) → submits marks for Admin review |
| Touchpoints | Class summary, Submit for review |
| Emotion | 😊 Satisfied — useful summary gives sense of class performance |
| Pain Points | Submitting before reviewing is easy to do accidentally |
| Opportunities | Mandatory review step with class statistics before final submission |

---

### Emotional Arc

```
Routine → Focused → Satisfied
```

### Key Opportunities Summary

* Teacher-filtered view of subjects and classes
* Row-level auto-save during marks entry
* Inline validation against max marks
* Class performance summary before submission

---

---

## JM-06 · Accountant — Monthly Fee Collection Cycle

**Persona:** P-04 Priya Iyer, Accountant
**Trigger:** Monthly fee installment due date has passed; Priya needs to track collections and follow up.
**End State:** All payments recorded, receipts issued, defaulters identified, monthly report exported.

---

### Journey Stages

#### Stage 1 — Review Pending Fees

| Element | Detail |
|---|---|
| Steps | Opens Finance module → views fee dashboard → filters by current installment → sees collected vs pending by class |
| Touchpoints | Finance Dashboard, Filters |
| Emotion | 😐 Methodical — wants clear numbers upfront |
| Pain Points | No summary view; having to count records manually |
| Opportunities | Finance dashboard with collection summary: total due, collected, outstanding, by class |

---

#### Stage 2 — Record Payments

| Element | Detail |
|---|---|
| Steps | Searches for student → opens fee profile → records payment (amount, date, mode) → system generates receipt → optionally shares via WhatsApp |
| Touchpoints | Student fee profile, Payment entry, Receipt generation, WhatsApp share |
| Emotion | 😊 Efficient — clear workflow |
| Pain Points | Entering the same payment mode repeatedly for bulk cash collections |
| Opportunities | Default payment mode setting; bulk payment recording for groups |

---

#### Stage 3 — Apply Scholarships & Discounts

| Element | Detail |
|---|---|
| Steps | Identifies scholarship students → opens their fee profile → applies scholarship or discount → system recalculates outstanding → saves |
| Touchpoints | Scholarship/Discount management |
| Emotion | 😐 Detail-oriented — errors here cause disputes |
| Pain Points | Scholarship applied after payment causes reconciliation issues |
| Opportunities | Scholarship flag on student profile with warning if payment already received; audit log for all discount applications |

---

#### Stage 4 — Export Monthly Report

| Element | Detail |
|---|---|
| Steps | Opens Reports → selects Finance Report → sets date range → filters by session → exports PDF and Excel |
| Touchpoints | Reports module, Export |
| Emotion | 😄 Satisfied — clean, exportable report |
| Pain Points | Report format does not match the trust management's template |
| Opportunities | Configurable report columns; multiple export formats; scheduled monthly exports |

---

### Emotional Arc

```
Methodical → Efficient → Detail-oriented → Satisfied
```

### Key Opportunities Summary

* Fee collection summary dashboard by class and installment
* Default payment mode; bulk payment recording
* Scholarship conflict warnings with audit logging
* Multi-format report export with configurable columns

---

---

## JM-07 · Receptionist — Admission Enquiry to Enrollment

**Persona:** P-05 Meena Pillai, Receptionist
**Trigger:** A parent walks in or calls to enquire about admission.
**End State:** The student is enrolled, assigned to a class, and their ID card is issued.

---

### Journey Stages

#### Stage 1 — Capture Enquiry

| Element | Detail |
|---|---|
| Steps | Opens Admissions module → creates new enquiry → enters parent and student details → sets enquiry status → saves |
| Touchpoints | Admissions module, Enquiry form |
| Emotion | 😊 Helpful — wants to make a good first impression |
| Pain Points | Long forms slow down face-to-face interaction |
| Opportunities | Progressive form — collect essential fields first, optional details later; quick-save mode |

---

#### Stage 2 — Follow Up & Process

| Element | Detail |
|---|---|
| Steps | Filters enquiries by status → contacts parent via WhatsApp or phone → updates status to "In Progress" or "Document Pending" |
| Touchpoints | Admissions list, Status workflow, WhatsApp |
| Emotion | 😐 Organized — managing multiple enquiries simultaneously |
| Pain Points | No reminder or follow-up scheduling; statuses not clearly differentiated |
| Opportunities | Kanban-style status workflow; follow-up reminder (future); activity timeline per enquiry |

---

#### Stage 3 — Complete Admission

| Element | Detail |
|---|---|
| Steps | Parent submits documents → Meena uploads and verifies → creates student record from enquiry → Admin approves → admission number generated |
| Touchpoints | Document upload, Student record creation, Admin approval workflow |
| Emotion | 😊 Satisfied — enquiry converted to enrollment |
| Pain Points | Approval waiting state is opaque; Meena does not know if Admin has seen the request |
| Opportunities | Approval status indicator; notification to Admin on new approval request; notification to Meena on approval |

---

#### Stage 4 — Issue Documents

| Element | Detail |
|---|---|
| Steps | Generates ID card and Library card → shares with parent via WhatsApp → marks enquiry as Completed |
| Touchpoints | Document generation, WhatsApp share |
| Emotion | 😄 Proud — visible outcome of the workflow |
| Pain Points | Having to navigate to a separate module to generate documents |
| Opportunities | Document generation shortcut on the student profile within Admissions; one-click WhatsApp share |

---

### Emotional Arc

```
Helpful → Organized → Satisfied → Proud
```

### Key Opportunities Summary

* Progressive admission form — essential fields first
* Kanban-style status pipeline for enquiries
* Approval status indicator and two-way notifications
* Document generation embedded in student profile within Admissions

---

---

## JM-08 · HR Manager — New Teacher Onboarding

**Persona:** P-06 Suresh Kadam, HR Manager
**Trigger:** A new teacher is joining at the start of the academic session.
**End State:** Teacher profile is complete, documents are stored, and the teacher has received their login credentials.

---

### Journey Stages

#### Stage 1 — Create Teacher Profile

| Element | Detail |
|---|---|
| Steps | Opens Teacher Management → creates new teacher record → enters personal, contact, and employment details → assigns department and designation |
| Touchpoints | Teacher Management, Profile form |
| Emotion | 😐 Routine — high-accuracy task |
| Pain Points | Many mandatory fields with no save-draft option; losing progress on accidental navigation |
| Opportunities | Auto-save draft; progress indicator showing profile completeness |

---

#### Stage 2 — Upload & Secure Documents

| Element | Detail |
|---|---|
| Steps | Opens Documents section on teacher profile → uploads Aadhaar, PAN, qualification certificates → system encrypts sensitive fields → Suresh confirms |
| Touchpoints | Document upload, Sensitive data fields |
| Emotion | 😐 Careful — aware of compliance implications |
| Pain Points | Unclear which fields are encrypted vs plain; no confirmation that upload was secured |
| Opportunities | Visual indicator for encrypted fields; confirmation message: "Aadhaar stored securely and masked"; audit log entry for upload |

---

#### Stage 3 — Assign Platform Access

| Element | Detail |
|---|---|
| Steps | Requests User Management to create login (or has permission to do so) → assigns Teacher role → system sends invite email to teacher |
| Touchpoints | User Management, Role Assignment, Email |
| Emotion | 😊 Efficient — clear handoff |
| Pain Points | HR has to ask Admin separately if they do not have User Management access |
| Opportunities | Configurable HR permission to create staff logins; one-click "Invite to Platform" from teacher profile |

---

#### Stage 4 — Verify Onboarding

| Element | Detail |
|---|---|
| Steps | Reviews teacher profile completeness → checks that login was activated → adds onboarding note to teacher timeline |
| Touchpoints | Teacher profile, Activity timeline |
| Emotion | 😄 Satisfied — complete record, clear history |
| Pain Points | No onboarding checklist; easy to miss a step |
| Opportunities | Teacher onboarding checklist embedded in profile; timeline entry for each completed step |

---

### Emotional Arc

```
Routine → Careful → Efficient → Satisfied
```

### Key Opportunities Summary

* Auto-save draft on teacher profile creation
* Visual indicators for encrypted/sensitive fields with confirmation messaging
* "Invite to Platform" action directly from teacher profile
* Onboarding checklist with timeline tracking

---

---

## JM-09 · Institution Owner — Audit Log Review After Incident

**Persona:** P-01 Rajesh Malhotra, Institution Owner
**Trigger:** A teacher reports that student grades appear to have been changed without authorization.
**End State:** Rajesh has traced the change, identified the actor, and taken action.

---

### Journey Stages

#### Stage 1 — Access Audit Logs

| Element | Detail |
|---|---|
| Steps | Opens Audit Logs from navigation → sees log stream → applies filters: Module = Examination, Date range = last 7 days |
| Touchpoints | Audit Logs, Filter interface |
| Emotion | 😤 Stressed — needs answers quickly |
| Pain Points | Unfiltered log stream is overwhelming; slow search |
| Opportunities | Pre-built filter presets ("Recent examination changes", "Sensitive data access"); fast full-text search |

---

#### Stage 2 — Identify the Event

| Element | Detail |
|---|---|
| Steps | Finds log entries for the affected student record → expands entry → sees: User ID, Role, Action (Update), Field changed, Old value, New value, Timestamp, IP Address |
| Touchpoints | Audit log detail view |
| Emotion | 😐 Focused — reading evidence |
| Pain Points | Log entries that show only "record updated" without field-level detail are useless |
| Opportunities | Field-level change tracking in audit entries: before/after values for every changed field |

---

#### Stage 3 — Act on the Finding

| Element | Detail |
|---|---|
| Steps | Identifies the acting user → navigates to User Management → reviews or revokes their permissions → optionally exports the audit log for HR purposes |
| Touchpoints | User Management, Permission management, Audit log export |
| Emotion | 😤 Resolute — has the evidence and the tools to act |
| Pain Points | Navigating from audit log to user profile requires too many steps |
| Opportunities | "View User Profile" shortcut from audit log entry; one-click permission revocation from User Management |

---

### Emotional Arc

```
Stressed → Focused → Resolute
```

### Key Opportunities Summary

* Pre-built audit filter presets for common investigations
* Field-level change tracking with before/after values
* Direct link from audit log entry to user profile
* Audit log export for HR and legal purposes

---

---

## JM-10 · Platform Super Admin — New Institution Provisioning

**Persona:** P-07 Deepak Joshi, Platform Super Admin
**Trigger:** A new institution has been contracted; GradGrid operations team needs to provision it.
**End State:** Institution is live, Owner has logged in, and the platform audit log confirms setup.

---

### Journey Stages

#### Stage 1 — Create Organization (if new group)

| Element | Detail |
|---|---|
| Steps | Logs into Super Admin Portal → navigates to Organization Management → creates new Organization → enters name, contact, type, and tier |
| Touchpoints | Super Admin Portal, Organization form |
| Emotion | 😊 Efficient — routine provisioning task |
| Pain Points | Duplicate organization detection is manual |
| Opportunities | Duplicate check on organization name; auto-suggest existing org if match found |

---

#### Stage 2 — Provision Institution

| Element | Detail |
|---|---|
| Steps | Inside the Organization → creates new Institution → enters name, address, type, branding defaults → assigns to Organization |
| Touchpoints | Institution Management |
| Emotion | 😐 Methodical |
| Pain Points | No template for common institution configurations |
| Opportunities | Institution type templates (School, College, Coaching) with sensible defaults |

---

#### Stage 3 — Configure Owner Access

| Element | Detail |
|---|---|
| Steps | Creates Platform User record for the Owner → assigns Institution Owner role → system sends welcome email with login link |
| Touchpoints | User Management, Role Assignment, Email |
| Emotion | 😊 Clear handoff — the ball is now in the client's court |
| Pain Points | Welcome email sends before institution is fully configured |
| Opportunities | "Send Welcome Email" is a deliberate manual trigger, not automatic on user creation |

---

#### Stage 4 — Verify via Platform Audit Log

| Element | Detail |
|---|---|
| Steps | Reviews Platform Audit Log → confirms: Organization created, Institution created, Owner access assigned, welcome email sent |
| Touchpoints | Platform Audit Logs |
| Emotion | 😄 Confident — complete audit trail |
| Pain Points | Platform and institution audit logs mixed together |
| Opportunities | Clearly separated Platform vs Institution audit log views; provisioning events tagged distinctly |

---

### Emotional Arc

```
Efficient → Methodical → Clear handoff → Confident
```

### Key Opportunities Summary

* Duplicate organization detection
* Institution type configuration templates
* Manual "Send Welcome Email" trigger (not automatic)
* Separated platform vs institution audit log views
* Provisioning events tagged distinctly in audit logs

---

# 4. Cross-Journey Opportunity Themes

Reviewing all journey maps, the following themes emerge as the highest-priority UX opportunities:

| Theme | Journeys Affected | Priority |
|---|---|---|
| Role-specific dashboards with contextual shortcuts | JM-01, JM-04, JM-05 | High |
| Inline validation and error clarity during imports | JM-02 | High |
| Auto-save / draft support for long forms | JM-08, JM-02 | High |
| Field-level audit logging with before/after values | JM-09 | High |
| Background processing with progress indicators | JM-03, JM-06 | High |
| WhatsApp / Email sharing embedded in workflow | JM-03, JM-07 | High |
| Two-way approval notifications | JM-07 | Medium |
| Pre-built audit filter presets | JM-09 | Medium |
| Institution type configuration templates | JM-10 | Medium |
| Manual welcome email trigger | JM-10 | Medium |

---

# 5. References

* GradGrid Documentation Constitution v1.0
* GradGrid PRD v1.0
* GradGrid User Personas v1.0
* ADR/TDR Index v1.0
