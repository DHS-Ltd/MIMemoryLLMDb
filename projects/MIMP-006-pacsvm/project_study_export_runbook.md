---
name: project-study-export-runbook
description: How to download a centrally-uploaded Study as ZIP+DICOMDIR for a patient - the reusable ops runbook to reach for instead of rebuilding this
metadata: 
  node_type: memory
  type: project
  originSessionId: 7d3a8be2-b17d-4a8a-bd37-e45b1629feca
  modified: 2026-09-05T18:49:10.338Z
---

**Study Export** is LIVE (built + verified end-to-end 2026-09-06) as the reusable way to pull a patient's original DICOM files out of central Orthanc as a ZIP with a proper DICOMDIR (media format), for CD-burning / import into another PACS / handing off to IT support. This was built via a `/grill-with-docs` design session, not invented ad hoc — see `CONTEXT.md`'s **Study Export** glossary entry and `docs/adr/0023-study-export-ops-script-bypasses-audit-log.md` for the reasoning already captured there (why it bypasses `app.audit_log`, why `/media` not `/archive`).

**How to use it (the normal path, one command from Windows):**
```powershell
cd d:\Pacs_Viewer_Storage_Project
.\deploy\scripts\download_study_export.ps1 -Search 'DHP-26090403'
```
`-Search` takes a DHP-ID (exact) or a patient name substring (matches both MT-registered patients and the DICOM identity snapshot of unclaimed DICOM-sourced patients). Output lands automatically in this repo at `exports/{identifier}_{PATIENT_NAME}/{identifier}_{study_date}.zip`.

Full runbook, including the interactive VM fallback for ambiguous searches (more than one matching patient, or a patient with more than one live study): `docs/tutorial/Download_Study_Archive_DICOMDIR.md`.

**Verified so far:** DHP-26090403 (PINGKY, CT 2026-08-27) and DHP-26090305 (ZAHERA BEGUM, CT 2026-09-03) — both exported successfully and are sitting in `exports/` in this repo.

**Do not rebuild this from scratch in a future session** — the scripts, docs, glossary entry, and ADR already exist. If a future request is "download a study" / "get me the DICOMDIR" / similar, point straight at `download_study_export.ps1`. Read [[feedback_ops_scripting_gotchas]] first if you're modifying either script — three real, non-obvious bugs were hit and fixed while building this and are easy to reintroduce.

**Not yet exercised:** an actually-ambiguous search (multiple patients or multiple live studies matching one term) — the wrapper's fallback-to-interactive messaging is implemented but has only been code-reviewed, not run against a real ambiguous case.
