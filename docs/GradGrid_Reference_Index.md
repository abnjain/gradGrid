# GradGrid Reference Documentation Index

**Document Version:** 1.0  
**Status:** Internal Reference (Agent / Engineering)  
**Document Type:** Documentation Registry & Update Tracker  
**Last Updated:** 2026-08-17  
**Governed By:** [GradGrid_Constitution_Documentation.md](./GradGrid_Constitution_Documentation.md)

> **Usage note:** This index and linked reference documents are maintained for engineering/agent context. They live only under `docs/` and are not required to be pushed to the remote repository unless explicitly requested.

---

## 1. Purpose

This document is the **single entry point** for all GradGrid reference documentation. It:

1. Catalogs every document in `docs/` with purpose and relationships.
2. Tracks **what changed, when, and why** across reference updates.
3. Provides cross-reference maps so agents and engineers can navigate without re-scanning the codebase.

When updating any reference document listed in §3, **add a row to the Master Update Log (§4)** and bump that document's version + revision history.

---

## 2. Document Categories

| Category | Purpose | Update Frequency |
|----------|---------|------------------|
| **Governance** | Standards, ADR registry, generation instructions | Rare |
| **Product** | PRD, personas, journeys, IA | Per product milestone |
| **Architecture** | Security, infrastructure, database, ERD | Per architecture decision |
| **Implementation Reference** | Repo status, ideation, gap analysis | Per codebase review / sprint |
| **Design** | Design system artifacts | Per UI milestone |

---

## 3. Document Registry

### 3.1 Governance

| Document | Version | Last Updated | Purpose |
|----------|---------|--------------|---------|
| [GradGrid_Constitution_Documentation.md](./GradGrid_Constitution_Documentation.md) | 1.0 | 2026-07 | Documentation standards and hierarchy |
| [GradGrid_ADR_TDR_INDEX.md](./GradGrid_ADR_TDR_INDEX.md) | 1.0 | 2026-07 | Architecture & technical decision registry |
| [Instructions.md](./Instructions.md) | — | 2026-07 | AI-assisted documentation generation rules |

### 3.2 Product

| Document | Version | Last Updated | Purpose |
|----------|---------|--------------|---------|
| [GradGrid_PRD.md](./GradGrid_PRD.md) | 1.0 | 2026-07-13 | Functional/non-functional requirements, phased roadmap |
| [GradGrid_User_Personas.md](./GradGrid_User_Personas.md) | 1.0 | 2026-07 | MVP + future user personas |
| [GradGrid_User_Journey_Maps.md](./GradGrid_User_Journey_Maps.md) | 1.0 | 2026-07 | End-to-end user journeys |
| [GradGrid_Information_Architecture.md](./GradGrid_Information_Architecture.md) | 1.0 | 2026-07-13 | Portals, navigation, URL structure |

### 3.3 Architecture

| Document | Version | Last Updated | Purpose |
|----------|---------|--------------|---------|
| [GradGrid_Database_Design.md](./GradGrid_Database_Design.md) | 1.0 | 2026-07 | PostgreSQL schema design rationale |
| [GradGrid_ERD.mermaid](./GradGrid_ERD.mermaid) | 1.0 | 2026-07 | Visual entity-relationship diagram |
| [GradGrid_Security_Architecture.md](./GradGrid_Security_Architecture.md) | 1.0 | 2026-07 | Auth, RBAC, encryption, audit design |
| [GradGrid_Infrastructure_Architecture.md](./GradGrid_Infrastructure_Architecture.md) | 1.0 | 2026-07 | Docker, K8s, deployment, monitoring |

### 3.4 Implementation Reference *(agent-maintained)*

| Document | Version | Last Updated | Purpose |
|----------|---------|--------------|---------|
| [GradGrid_Repository_Status_Report.md](./GradGrid_Repository_Status_Report.md) | 1.0 | 2026-08-17 | Point-in-time codebase snapshot |
| [GradGrid_Implementation_Ideation.md](./GradGrid_Implementation_Ideation.md) | 1.0 | 2026-08-17 | Prioritized next steps and engineering ideas |
| **This document** | 1.0 | 2026-08-17 | Index, cross-references, master update log |

### 3.5 Design

| Document | Version | Last Updated | Purpose |
|----------|---------|--------------|---------|
| [GradGrid_Design_System_v2.html](./GradGrid_Design_System_v2.html) | 2.0 | 2026-07 | Interactive design system reference |

---

## 4. Master Update Log

All changes to implementation reference documents (and significant cross-doc updates) are recorded here **in reverse chronological order**.

| Date | Document(s) Updated | Version | Author | Summary of Changes |
|------|---------------------|---------|--------|-------------------|
| 2026-08-17 | `GradGrid_Reference_Index.md` | 1.0 | Engineering | **Created.** Master index, document registry, cross-reference map, update log system |
| 2026-08-17 | `GradGrid_Implementation_Ideation.md` | 1.0 | Engineering | **Created.** Prioritized engineering backlog, phase alignment, risk mitigations |
| 2026-08-17 | `GradGrid_Repository_Status_Report.md` | 1.0 | Engineering | **Created.** Full repo analysis: stack, API surface, frontend scale, security, maturity matrix |

---

## 5. Cross-Reference Map

### 5.1 Implementation Reference → Product Docs

| Status Report Section | Related Product Doc | Relationship |
|----------------------|---------------------|--------------|
| §11 Maturity Matrix | [GradGrid_PRD.md](./GradGrid_PRD.md) §Phased Roadmap | Maps code state to PRD phases |
| §7 Frontend routes | [GradGrid_Information_Architecture.md](./GradGrid_Information_Architecture.md) | IA defines URLs; status report tracks implementation |
| §6 Database | [GradGrid_Database_Design.md](./GradGrid_Database_Design.md), [GradGrid_ERD.mermaid](./GradGrid_ERD.mermaid) | Schema in code vs design doc |
| §10 Security | [GradGrid_Security_Architecture.md](./GradGrid_Security_Architecture.md) | Intended vs actual security posture |
| §9 DevOps | [GradGrid_Infrastructure_Architecture.md](./GradGrid_Infrastructure_Architecture.md) | Planned infra vs repo reality |

### 5.2 Implementation Reference → Ideation

| Gap (from Status Report) | Ideation Section |
|--------------------------|------------------|
| RBAC not wired | [Ideation §2.1](./GradGrid_Implementation_Ideation.md#21-rbac--permission-engine) |
| No route guards | [Ideation §2.2](./GradGrid_Implementation_Ideation.md#22-frontend-auth-hardening) |
| No seed data | [Ideation §2.3](./GradGrid_Implementation_Ideation.md#23-database-seed--local-dev) |
| No Docker/CI | [Ideation §2.4](./GradGrid_Implementation_Ideation.md#24-devops--production-parity) |
| Domain APIs missing | [Ideation §3](./GradGrid_Implementation_Ideation.md#3-domain-implementation-order) |

### 5.3 Product → Implementation (traceability)

| PRD Phase | Current State (Status Report) | Next Actions (Ideation) |
|-----------|------------------------------|-------------------------|
| Phase 0 — Product & Architecture | ~ Complete (docs); code foundation started | §1 Foundation hardening |
| Phase 1 — Platform Foundation | Auth ✅; RBAC ❌; Orgs ❌ | §2.1, §3.1 |
| Phase 2 — Admission & Institution Mgmt | Schema ✅; API/UI stubs | §3.2 |
| Phase 3+ | Schema only | Deferred in ideation |

---

## 6. How to Update Reference Docs

When the codebase changes materially, follow this workflow:

1. **Re-scan** affected areas (backend modules, frontend routes, config, tests).
2. **Update** [GradGrid_Repository_Status_Report.md](./GradGrid_Repository_Status_Report.md):
   - Bump document version (e.g. 1.0 → 1.1).
   - Add row to its §14 Revision History.
   - Update `Last Updated` date in header.
3. **Update** [GradGrid_Implementation_Ideation.md](./GradGrid_Implementation_Ideation.md) if priorities shift.
4. **Add a row** to §4 Master Update Log in this document.
5. **Do not** modify product/architecture docs unless a deliberate product or architecture decision changed.

### Triggers for Re-scan

| Trigger | Sections to Update |
|---------|-------------------|
| New backend module implemented | Status §5.2, §11 |
| New frontend pages / integration | Status §7, §11 |
| Auth/security changes | Status §5.3–5.5, §10; Ideation §2 |
| New migration / schema change | Status §6; cross-ref Database Design |
| DevOps files added | Status §9; Ideation §2.4 |
| Phase completed | Status §2, §11; Ideation §1 |

---

## 7. Quick Lookup — Current State (Snapshot)

*Last synced: 2026-08-17. See [Status Report](./GradGrid_Repository_Status_Report.md) for full detail.*

| Area | State |
|------|-------|
| Phase | Late Phase 0 / early Phase 1 |
| Backend APIs live | Auth (+ partial SEO) |
| Frontend pages | 157 total; ~80+ placeholders |
| DB models | 57 (Prisma); 2 migrations |
| Integrated vertical slice | Auth + account management |
| Production blockers | RBAC, route guards, seed, DevOps, domain APIs |

---

## 8. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-17 | Engineering | Initial index, registry, update log, cross-reference map |
