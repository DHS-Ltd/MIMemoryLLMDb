---
name: project-frictionless-patient-list-live
description: "Patient list rows expand in place (accordion) instead of navigating to a detail page — designed via /grill-with-docs, built, deployed, committed, and pushed 2026-07-12"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1478aad1-3cdb-44d9-8cbe-a6620ea7ca88
---

The old doctor-portal flow required a full page navigation to act on a patient: list → click "View" → `PatientDetailPage` loads → click "Open in DHV" or scroll to the Doctor Report. That friction (clicks *and* page loads, not just clicks) is gone — clicking anywhere on a patient row (table row or mobile card, whole row is the click target) now expands it in place to show identity card + studies + reports, with no navigation. Single-expand accordion at every breakpoint.

**Why this shape:** resolved via `/grill-with-docs`, one fork at a time. The friction was specifically "clicks/page loads," not lost context or inability to act from the list — so the fix is expand-in-place, not row-level shortcut buttons (rejected even though most patients have exactly one study — consistency won over a marginal speed gain) and not a split-pane/master-detail layout. The identity card still shows in full on expand — misidentifying a patient was judged costlier than the extra scroll. The Doctor Report editor moved out of the expanded row into a `Modal` because the form is too long to embed inline without being unwieldy; that introduced a new risk (closing the modal mid-draft loses text), so an unsaved-changes confirm guard was added at the same time.

**Explicitly deferred:** no backend/API changes (reuses the existing `GET /patients/:id`), no status badges on collapsed rows (would need the list endpoint to return per-patient report status — a real API change, deferred), no URL sync on expand (refresh collapses back to the plain list; `/patients/:id` stays as the deep-link fallback), no split-pane layout.

**Files:** `components/Modal.tsx` (new, generic overlay w/ optional dirty-guard), `components/PatientDetailContent.tsx` (new — identity/studies/reports block extracted out of the old `PatientDetailPage.tsx` so it renders both inline and on the fallback route), `pages/DashboardPage.tsx` (accordion state), `pages/PatientDetailPage.tsx` (trimmed to a thin wrapper), `components/DoctorReportSection.tsx` (editor now opens in `Modal`).

**How to apply:** Full spec lives in this repo's `CLAUDE.md` § "Frictionless Patient List" and § Key Behaviors — read that first for anything touching the patient list or Doctor Report editor UI. See [[project_git_remote_live]] for how this got committed/pushed, and [[feedback-production-deploy-verification]] for the deploy-verification approach used (typecheck + build clean, but browser verification against real data was done by the user directly since no local backend proxy exists).
