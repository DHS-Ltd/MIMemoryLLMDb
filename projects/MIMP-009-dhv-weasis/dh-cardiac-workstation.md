---
name: dh-cardiac-workstation
description: "DH Cardiac Workstation = new cath-lab-only site workstation, same DHV source as a 2nd product (ADR-0025, 2026-11-12); Nexus SITE024 is its first site; distinct from the OHIF web Cardiac Viewer."
metadata:
  node_type: memory
  type: project
  originSessionId: a3d66c9c-62e2-4e32-bca1-cd8d1eb5ef9a
  modified: 2026-11-25T17:10:51.077Z
---

Decided 2026-11-12 in a grill-with-docs session: DH builds a **DH Cardiac Workstation** (a cath-lab-only site
workstation). It is built from the **DHV repo as a second product** with its own installer and Commercial Build,
not as a fork and not as a new code base. Recorded in DHV `docs/adr/0025-dh-cardiac-workstation-shares-the-dhv-source.md`
and the DHV `CONTEXT-MAP.md` (where Commercial Build is now "one per product").

- **DHV** stays the CT/MR site workstation.
- The July 2026 OHIF **Cardiac Viewer** (web, DH PACS, MIMP-005, LV Analysis) stays as planned and is a different
  product. The two must never share a name.
- "Optimex" was a typo for "optimised". It is never a name.

**Why:** Nexus [[nexus-cardiac-site024]] is DH's first commercial cath lab. Its data (178 Coro + 10 LV runs of 198)
also contains the LV runs the OHIF Cardiac Viewer was blocked on.

**v1 scope (user agreed, 2026-11-12): "cath lab reading done right."**
- A study's runs shown as a strip.
- Each run plays at its own fps, loops, steps frame by frame, and lets the reader pick a best frame.
- Two runs side by side.
- A patient CD.
- Key-frame export for the report.

QCA (stenosis %) and LV Analysis (EF) come in v2. Nexus's cardiologists choose which one, after using v1.

**Next session (user, 2026-11-12): grill the UI design, then plan the build.** Resume point and agenda:
DHV `docs/CardiacWorkstation/README.md`. The speed baseline is measured: 4.3 s / 1,239 MB for the 57-run study
with JPEG-LS end to end.

**Update 2026-11-25 (grill-with-docs, committed DHV `cd9a635a3`):** Run strip fully decided (per object incl. Stills
and Exam Protocol, recording order, left side, tile = middle frame + run no. + LAO/RAO CRAN/CAUD angle + frame count) and
branding planned (name "DH Cardiac Workstation", short form DHC: `DHCardiac.exe`, `.dhclicense`; red-C DHV-family logo
drawn via an Antigravity prompt in `E:\Handover\`; DHV Dark unchanged; DICOM AET stays `DHV_SCU` on purpose; DHC runs
beside DHV at Nexus for two weeks). Non-obvious: Siemens "Exam Protocol" objects are multi-frame burned-in text pages
(ImageType `EXAM PROTOCOL`, series #999), so frame count alone cannot tell a Run from a document. **Next: UI agenda
item 2 (cine controls); logo owed by the user.** Repo now has `PROGRESS.md`.

**How to apply:** for cath lab features, plan against the DH Cardiac Workstation, not DHV. Start the next session
from that README, not from this memory. Still open: the build-time split mechanism, the licence format, and
whether JPEG-LS-first ships as the default.
