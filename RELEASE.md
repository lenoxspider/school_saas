# RELEASE: ScholarGrid v0.1.0 — Academic Results MVP

**Release Date:** 2026-08-31  
**Status:** Feature-Frozen  
**Core Objective:** High-speed, commercially usable academic results compilation, spreadsheet-style scoring, and instant terminal PDF report cards and broadsheets.

---

## 1. Frozen Feature Scope (v0.1.0 MVP)

The v0.1.0 feature set is strictly frozen. The following core academic results engine is finalized and verified:

* **Authentication & Multi-Tenancy**:
  * School onboarding with automatic academic calendar initialization.
  * Role-based access control: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`.
  * Server-side tenant isolation enforcing non-negotiable `schoolId` boundaries.
* **Academic Calendar & Structure**:
  * Academic years and configurable terms (Term 1, Term 2, Term 3, Semester 1, etc.).
  * Class arms and subject definitions (Core vs. Elective).
  * Teacher assignment matrix (Class Teacher vs. Subject Teacher permissions).
* **Student Registry & Historical Enrollment**:
  * Student profiles with unique admission numbers.
  * Preserved historical enrollments across academic years.
  * 4-step CSV student import wizard with column mapping, duplicate detection, and validation reporting.
* **Configuration-Driven Grading & Ranking Engine**:
  * Dynamic assessment component weighting (e.g. CA 40% + Exam 60%, or custom 3+ components).
  * Configurable grade boundaries and qualitative remarks.
  * Standard competition ranking ($1, 2, 2, 4$) handling ties correctly.
* **Rapid Spreadsheet Score Entry Grid**:
  * Keyboard navigation (Arrow keys Up/Down/Left/Right, Tab, Shift-Tab, Enter).
  * Real-time boundary validation (max score rejection, negative score rejection).
  * Draft autosaving, missing score alerts, and submission states.
* **Approval Workflow & Frozen Snapshots**:
  * State transitions: $\text{DRAFT} \rightarrow \text{SUBMITTED} \rightarrow \text{UNDER\_REVIEW} \rightarrow \text{APPROVED} \rightarrow \text{PUBLISHED}$.
  * Immutable `ResultSnapshot` freezing historical report cards permanently upon publication.
* **Reporting & Exports**:
  * Server-rendered official PDF report cards with school branding, signatures, and remarks.
  * Styled class broadsheets with Excel (`.xlsx`) export.
  * Deterministic bulk ZIP downloads (`001_ACC-2025-001_John_Mensah.pdf`).
* **Platform Administration & Security**:
  * Super Admin platform console with tenant telemetry and plan tiers.
  * Immutable tenant audit trail logging all sensitive events.

---

## 2. Explicit Out-of-Scope Exclusions (Do Not Build in v0.1.0)

The following modules are **explicitly excluded** from the MVP:
* ❌ Fee collection, billing invoices, accounting, or payroll.
* ❌ Student attendance tracking and biometric logs.
* ❌ Parent portals and student self-service apps.
* ❌ AI chatbots, LLM assistants, or speculative AI summaries.
* ❌ Native iOS / Android mobile applications.
* ❌ Library, transport, or hostel management.

---

## 3. Maintenance & Release Guarantee
No new product modules will be introduced until the security audit, exhaustive mathematical testing, load benchmarking, and disaster recovery procedures are completed and certified.
