---
name: qr-dialog-auto-load
description: "Named pointer — Import DICOM's Query/Retrieve dialog now defaults to Search Criteria and auto-loads the last 20 recent arrivals; shipped as Viewer v2.0.4; first field install was SITE018 Shantinagar 2026-09-01."
metadata: 
  node_type: memory
  type: project
  originSessionId: ec029a82-8be4-4917-b882-6ebd745810ca
  modified: 2026-08-26T10:16:09.705Z
---

Radiologist-requested UX fix for `DicomQrView` (weasis-dicom-qr): the "Import DICOM → DICOM
Query/Retrieve" dialog opened on the wrong tab and stayed empty until manually searched, costing an
extra click and a wait every time it was opened during a shift.

Grilled via `/grill-with-docs` (11 questions, all resolved before implementation), implemented, and
code-reviewed via the `java-reviewer` agent same session. Full rationale, considered options and
consequences: `DHDicomViewer/dh-dicom-viewer/docs/adr/0024-qr-dialog-defaults-to-search-and-auto-loads-recent-arrivals.md`.
Build/reinstall/verification runbook: `DHDicomViewer/dh-dicom-viewer/docs/SHIP_v2.0.4_QR_AUTO_LOAD.md`.

**What it does:** Search Criteria tab opens first (was DICOM Source). The last 20 studies examined
in the past 7 days on the selected C-FIND archive auto-load with no click, sorted client-side by
Study Date+Time (DICOM C-FIND has no `ORDER BY`, so a plain `limit=20` can't be trusted to return
the true latest 20). Results cache in-memory for the Viewer process's lifetime — a fresh
`DicomQrView` is constructed every dialog open, so the cache is a `static` field keyed by archive
(AET@host:port); reopening the dialog replays it with no PACS round-trip, a manual search replaces
it, restarting the Viewer clears it. Scoped to `DefaultDicomNode` (C-FIND) archives only —
DICOMWeb/QIDO-RS is untouched since no DH deployment uses it.

**Status: first field install was SITE018 Popular Shantinagar, 2026-09-01** — via the **bundle**
`DHPACSWorkstation_Setup_v1.0.4.exe` (so v1.0.4 *did* ship, contrary to the earlier note here), not
the Viewer-only `DHDicomViewer_Setup_v2.0.4.exe`. Reception is live-verified against a Philips MRI.
The Q/R **auto-load itself is still not confirmed working against real data**: install day was
consumed by a port-4242 collision ([[shantinagar-port-4242-collision]]), and the only Q/R evidence
so far is the *pre-fix* failure — which did confirm one design point, that ADR-0024's quiet-failure
path holds (the error box came from a manual Search, never from the auto-load). Mirpur (SITE015) is
still on the older build and the reinstall there is still pending. `SHIP_v2.0.4_QR_AUTO_LOAD.md` has
the reinstall steps and the 6-point verification checklist — run it at Shantinagar next visit and
update this memory with the result.
