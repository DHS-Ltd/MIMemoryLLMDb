---
name: Phase A OHIF Branding Complete
description: Phase A (OHIF fork + DH Solutions branding) shipped 2026-05-19. pacs-ohif-dhs:v1 deployed to VM, gold-path verified, DHS logo + title + favicon rendering.
type: project
originSessionId: 7afc5ebd-90fe-4259-b4da-af3266b241ea
---
Phase A of the OHIF customization plan completed 2026-05-19. `pacs-ohif-dhs:v1` is live on the central VM at 192.168.1.10.

**Why:** First of three customization phases per `docs/DicomViewer/OHIF_CUSTOMIZATION_PLAN.md`. Phase A unblocks all subsequent customizations by standing up the fork repo, the build pipeline, and the deploy mechanic. Future Phase B (mobile-first) and Phase C (extension features) will iterate on this base.

**How to apply:** Treat the OHIF viewer as a forked, in-house build going forward — not `ohif/app:latest`. Every viewer change is now a fork commit + `docker compose build ohif` cycle. Defer to Phase B/C plans (see `docs/DicomViewer/NEXT_STEPS.md`) for what comes next.

## What shipped in v1

- Image: `pacs-ohif-dhs:v1` built from `DHS-Ltd/ohif-viewer-dhs` (branch `dhs-main`, off OHIF tag `v3.12.0`).
- Branded title bar: "DH Solutions Imaging Viewer".
- DHS logo in OHIF Header via `whiteLabeling.createLogoComponentFn` in `app-config.js` — zero React source edits, fully upstream-upgrade-safe.
- SVG favicon (`/assets/dhs-favicon.svg`) baked into the image; modern browsers display it.
- Rebranded outer landing page (`viewer.html`) — DHS logo, blue palette, Inter font.
- Source SVG used: `D:\Pacs_Viewer_Storage_Project\DHV_logo.svg` (existing file, gradient wordmark, viewBox 1870×884, ~10.5 KB).

## What was deferred from the original Phase A plan

- Toolbar trim (measurement/annotation tools still present) — user request to defer mid-execution.
- Tailwind color palette override — the 4-config chain (`app` → presets `[ui, ui-next]`) with CSS variables made it riskier than estimated.
- PNG favicons (16×16, 32×32, apple-touch-icon set) — SVG favicon covers modern browsers; PNG variants need a square icon-only mark from design.

All deferrals are catalogued in `BRAND_TODO.md` at the fork root.

## Verification

Gold-path study confirmed: AYESHA AKTER, MRN E1027809, token `7729128b-13f7-4db4-ab4c-c041ce045f81` — patient info renders, study list populates, viewer loads at `/viewer?StudyInstanceUIDs=...`. Phase 1 DICOMweb plumbing unaffected.
