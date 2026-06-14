---
name: project-report-feature
description: "Radiologist report panel: file-based (PDF/JPEG/PNG), desktop right sidebar + mobile FAB; MT uploads via admin, viewer fetches /api/studies/:uid/reports"
metadata:
  node_type: memory
  type: project
  originSessionId: 523b212b-8608-453d-971b-6bf6b2002b19
---

**Status: LIVE as of 2026-06-14.**

## Source of truth
Reports are files uploaded by MTs from the admin UI. They live in the backend's report store (MinIO or local disk). **Not** DICOM SR, not a RIS — simple file attachments per study.

## Backend endpoints (in `deploy/backend/src/routes/legacy.js`)
- `GET /api/studies/:studyUid/reports` — returns `[{ id, filename, mime_type, byte_size }]`. Public, no auth required (studyUID as implicit credential, same pattern as `/api/study-context`).
- `GET /api/studies/:studyUid/reports/:reportId` — streams the file inline (`Content-Disposition: inline`). Public. Supports PDF, JPEG, PNG.

The admin upload endpoint is in `admin-reports.js` (separate route file, admin-auth gated).

## Desktop — ReportPanel (right sidebar tab)
**File:** `extensions/default/src/Panels/ReportPanel.tsx`

- Registered as `@ohif/extension-default.panelModule.dhsReports` in `getPanelModule.tsx`
- Added to `rightPanels` array in `modes/basic/src/index.tsx` and `modes/segmentation/src/index.tsx`
- Fetches reports on mount; shows empty state "No reports uploaded yet" if none
- Click a report name → previews inline: PDF via `<iframe>`, images via `<img>`
- Tab always visible (empty state rather than hidden tab)

## Mobile — MobileReportFAB
**File:** `extensions/default/src/ViewerLayout/MobileReportFAB.tsx`

- Blue pill FAB positioned `absolute bottom-[68px] right-4 z-10` (above the Share FAB)
- Only renders when reports exist (fetches on mount; returns `null` if list is empty)
- Bottom sheet via `ReactDOM.createPortal(_, document.body)` — escapes ResizablePanelGroup stacking context
- Rendered in `ViewerLayout/index.tsx` guarded with `{isMobileViewport && <MobileReportFAB />}`

## Key gotcha
The bottom sheet MUST use `ReactDOM.createPortal(content, document.body)` — a `position: fixed` element inside `ResizablePanelGroup` gets trapped in its stacking context and appears behind the thumbnail strip. Any future modal/overlay in the viewer area needs the same pattern.

## How to apply
- If MT workflow changes (reports moved to DICOM SR, RIS, etc.), both backend endpoints and `ReportPanel.tsx`/`MobileReportFAB.tsx` need updating.
- If desktop panel needs reordering, edit the `rightPanels` array in the two mode `index.tsx` files.
