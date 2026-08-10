---
name: corner-annotation-overlay-6g
description: "Named pointer: Film Composer Phase 6G (corner-annotation overlay) — done, built, and live-verified on-screen 2026-07-07; points to the authoritative code/docs and the false-alarm resolution."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6191d691-d6b1-4ed1-b96d-f41537cf933a
aliases: [corner_annotation_overlay_6g]
---

**Status: DONE, built and live-verified 2026-07-07.** Film Composer's four-corner
demographic/scale/W-L overlay (`FilmComposerInfoLayer`) was a no-op stub; reimplemented
this session, ported from `weasis-dicom-viewer2d`'s `InfoLayer` without a cross-bundle
dependency (ADR-0003). See [[film-composer-module]] for the full build narrative.

**Why this pointer exists:** mid-session the user reported the live Sheet Tray grid
showing zero annotations on any cell (screenshot), directly contradicting the
MCP-`getFilmSheetPreview` verification that had shown all four corners rendering
correctly. This looked like a live-vs-export code divergence. Investigation traced
`DefaultView2d.draw()` → `infoLayer.paint(g2d)` (weasis-core, ~line 823) and confirmed
it is the *same* `paint()` method the `ExportImage`-based preview path calls — so
architecturally there was no divergence to find. The user then re-checked the running
app directly and confirmed it was a stale look at the app from before the rebuild/
relaunch, not a real bug. **Resolution: false alarm, not a code defect.**

**How to apply:** if a similar "MCP preview looks right but the live on-screen view
doesn't" report comes up again for this module, check the Felix bundle cache
(`~/.weasis/cache-*`) and confirm the actually-running process's jar timestamp first —
per the project's recurring "stale Felix cache" gotcha (see
[[film-composer-module]] → "How bug findings go") — before assuming a code-level
live/export rendering split. There wasn't one here, and the code path is a single
shared method, so it's unlikely to reappear as a real bug in this area.

**Where the real docs live** (don't rely on this memory alone):
- `DHDicomViewer/dh-dicom-viewer/CLAUDE.md` — Phase 6G row (build/verify summary)
- `docs/Printing_module/film-composer-design-decisions.md` — 6G row (full detail,
  including this on-screen re-confirmation)
- Code: `weasis-dicom-filmcomposer/.../annotation/CornerAnnotationText.java` (pure,
  unit-tested) + `FilmComposerInfoLayer.java` (Swing paint glue, untested by design)
