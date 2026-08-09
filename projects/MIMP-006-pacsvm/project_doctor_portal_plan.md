---
name: project-doctor-portal-plan
description: "Doctor portal feature decisions — scope, auth, access model, future radiology report requirement"
metadata: 
  node_type: memory
  type: project
  originSessionId: dc36e067-b754-4f66-b127-5467b8ee3ecb
aliases: [project-doctor-portal-plan]
---

# Doctor Portal — Design Decisions (grill session 2026-06-13)

## Confirmed decisions so far

- **User type:** `doctor_users` — new role, distinct from admin/MT/patient
- **Site access:** many-to-many via junction table `app.doctor_sites(doctor_id, site_pk)` — admin assigns which sites each doctor can see
- **Auth:** email + password (httpOnly cookie `doctor_jwt`), matching JWT pattern of admin/MT
- **Phase 1 actions:** view only — browse site's patient list, open studies in OHIF viewer

## IMPORTANT deferred feature — Formal Radiology Report

Doctor portal must eventually support **structured radiology reports** per study. This is explicitly flagged as important by the user and must be treated as a first-class future feature, not an afterthought.

**Why:** Doctors are consultants who need to record findings formally. A view-only portal is the MVP; the report layer is the clinical value-add.

**How to apply:** When designing the doctor DB schema, leave room for a `doctor_reports` table (study_id, doctor_id, report_text/structured JSON, signed_at, status). Don't design in a way that makes adding reports painful later.

## All decisions FINAL (grill-with-docs 2026-06-13)

- **Portal delivery** — separate repo `dh-pacs-doctor`, served at `/doctor/`, container `pacs-doctor-ui`
- **Viewer** — reuse existing `pacs-ohif-dhs` (DHV) instance at `/`; doctor portal calls `/api/doctor/studies/:uid/open` → temp URL → opens DHV
- **Doctor ID** — `DHDR-YYMMDDNN`, same daily-counter logic as `nextDhmtId` in `idGenerators.js`
- **Notifications** — none in phase 1
- **Patient PII** — full identity: name, DOB, gender, mobile, NID, DHP-ID, external_patient_id (site MRN)
- **Audit** — `action = 'doctor_view'` in `app.audit_log`
- **Password reset** — admin only
- **Search fields** — name + external_patient_id + DHP-ID
- **Mobile** — responsive (reuse `useBreakpoint` pattern from ADR 0005)
- **Repo name** — `dh-pacs-doctor`

## Documentation written

- CONTEXT.md — new "### Doctor portal" section (Doctor, DHDR-ID, Doctor Portal, Doctor View, Doctor Sites)
- ADR 0007 — Doctor portal as separate repository
- ADR 0008 — Multi-site doctor access via junction table
- CLAUDE.md — status row + companion project section added
