---
name: project_patient_context_banner
description: Patient name + site banner below toolbar — shipped 2026-06-13; how it fetches data and where it lives
metadata: 
  node_type: memory
  type: project
  originSessionId: 1c492293-f941-44aa-a9a7-1e0e41160529
---

Thin dark banner below the toolbar, above the DICOM viewport, on both desktop and mobile.  
Shows: `Patient: [name]  |  Site: [hospital_name]`  
Hidden entirely for unclaimed/pending studies (all fields must exist).

**Why:** User wanted DHPacs patient name and upload-site visible in the viewer without clicking into panels.

**How to apply:** Any future changes to patient info display start here.

### Frontend
- Component: `extensions/default/src/ViewerLayout/PatientContextBanner.tsx`
- Wired in: `extensions/default/src/ViewerLayout/index.tsx` — renders `<PatientContextBanner />` inside the `flex flex-col` column wrapper, before the viewport grid div
- Reads `StudyInstanceUIDs` from `window.location.search`, fetches `/api/study-context/:uid`, returns `null` on failure

### Backend
- Endpoint: `GET /api/study-context/:studyUid` in `deploy/backend/src/routes/legacy.js` (mounted at `/api`, no auth)
- Returns `{ patient_name, dh_patient_id, site_name }` for `claim_status = 'linked'` studies only
- `dh_patient_id` is in the API response but the frontend does NOT display it (removed by user request)

### Commits (dhs-main)
- `1c7735dcd` — feat(viewer): add patient context banner below toolbar
- `a7f279651` — fix(viewer): remove DHP ID from patient context banner (show name + site only)

### Deployment note
VM backend at `/srv/pacs/backend/` is NOT a git repo. Backend changes are deployed by file copy → `docker compose build --no-cache backend` → `--force-recreate backend` → `nginx -s reload`.
