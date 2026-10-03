---
name: pending-cleanup-dav-unredacted-figures
description: "Three unredacted patient captures (f05, f09, f10) sit in DH-Advanced-Viewer's customer-facing figures folder — found 2026-10-03, not yet moved"
metadata:
  node_type: memory
  type: project
  originSessionId: 0dfc7013-829f-41a5-ac90-3a6215f4a002
  modified: 2026-10-03T04:12:21.166Z
---

`E:\DH-Advanced-Viewer\Inobitec\Client_Facing_Docs\figures\` — the folder that repo treats as **shippable** — holds three 2560×1334 full-screen captures that were never redacted: `f05-stenotic-cross-section.png`, `f09-mip-slab-vessels.png` (patient name, ID, DOB, "IBN SINA HOSPITAL"), `f10-curved-reformat-panoramic.png` (same). Their redacted crops exist under other numbers (e.g. f06, f07). Found 2026-10-03 while building the Popular post-processing brochure; left in place because they look like redaction sources and that repo is not this session's to restructure.

**Why:** anyone picking figures by filename from that folder ships PHI — the folder name says "safe".

**How to apply:** before using any figure from that folder, view it at full size. Proposed fix (needs Maidul's OK): move the three out to an unshipped `_raw/` folder or the archive. Related: [[project-popular-diagnostic-deal]], [[pending-cleanup-ibnsina-patient-card-pdf]].
