---
name: nexus-cardiac-site024
description: "Nexus Cardiac Hospital Mymensingh = SITE024, DH first cath lab site; installed + receiving 2026-11-12; JPEG-LS lossless compression live end to end 2026-11-12 (ADR-0022)."
metadata:
  node_type: memory
  type: project
  originSessionId: 14ff631a-a87b-477f-891f-f7c15e88081d
  modified: 2026-11-12T17:16:09.757Z
---

New site, started 2026-11-10. Record: `01_Pacs_File/01_Pacs_File/docs/Nexus_Cardiac_Mymensingh_System_Onboarding/` (README "Resume here").

First **cath lab** (XA cine) customer; user expects it to need "different optimization" than CT/MR. Standalone Site, bundle v1.0.4. Licence `SITE024_Nexus_Hospital.dhvlicense` bound to `2Q5H-N1G1-K0ST-8AYE`; signed expiry 2037-11-10 although 1 year was agreed (open).

**Why:** the user is running a grill-with-docs session for this install; the first on-PC step is the read-only survey.

**Update 2026-11-12:** reception is proven, and Nexus is now the first site of the new [[dh-cardiac-workstation]].
- Format, volume and compression results are in the site README and SITE_FACTS.
- The lossy-JPEG gap is closed: the console sends uncompressed data.
- The Ingest Compression term is in `01_Pacs_File/orthanc/CONTEXT.md`.

**Compression LIVE 2026-11-12 (~23:24-23:35), 01_Pacs_File ADR-0022.** That number clashes with DHV's own ADR-0022, the series tear.
- All three parts were switched on together: `IngestTranscoding` .4.80 in `90-site-local.json` (backup `.bak-20261112-232426`); the 9 stored studies reconstructed in place, 13,273 to 3,961 MB, 228 objects before and after; and JPEG-LS first on the Viewer's XA line (backup `.bak-dhtest`). The test copy was deleted.
- Proof on the real 57-run study after a fresh Viewer start: 1,239 MB, all received +4.3 s (uncompressed baseline 13.2 s), raw cache 0.
- **A Viewer reinstall reverts the XA order.** It still works, but slowly (about 41 s). Re-run `viewer-xa-order.ps1` after any Viewer install.
- **Not yet seen:** a *new* case arriving stored as .4.80. Run receive-check after the first case. Also ask whether the console's send got slower.
- Thumbnail count for the 57-run study: parked. The Viewer's thumbnail cache held 29 files, but that is a clue, not the answer.

**How to apply:** guide one step at a time, per [[feedback-one-step-at-a-time-on-site-pcs]]; reuse [[site-onboarding-docs-pattern]]. Rollback steps are in the site README.
