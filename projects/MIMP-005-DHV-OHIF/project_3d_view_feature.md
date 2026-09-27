---
name: project_3d_view_feature
description: 3D View toolbar button (Volume3DDH) shipped to production 2026-08-20 — volume-rendered fourUp layout in Patient + Doctor Viewer; next planned work is MIP preset + 3D load-speed optimization
metadata: 
  node_type: memory
  type: project
  originSessionId: ba2929c3-7139-4953-aaab-0553896fd3a9
  modified: 2026-08-20T13:25:46.618Z
---

**SHIPPED to production 2026-08-20, commit `17aeb4783`.** A `3D View` toolbar button (id `Volume3DDH`) sits next to `MPRDHLayout`/`FilmViewDH` in the shared `modes/basic` toolbar — present in both Patient Viewer and Doctor Viewer (`longitudinal` spreads `...basicMode` wholesale, so it inherited automatically; no separate edit needed there). Clicking it runs `setHangingProtocol` → `fourUp`, an **existing upstream protocol** (`extensions/cornerstone/src/hps/fourUp.ts`, already registered, `isPreset: true`) — axial MPR / 3D volume-render / coronal MPR / sagittal MPR in four equal panes. `mobileHidden: true`. Deliberately excluded from `tmtv` (separate oncology toolbar) and `modes/segmentation` (unused demo mode, not deployed).

**Why this shape:** grilled down from an open "improve the 3D segmentation structure" ask. Confirmed via code that Cornerstone3D's segmentation engine (`SegmentationService.ts`) already auto-converts labelmap→Surface representation when a viewport is `VOLUME_3D` (line ~314), and that 5 volume3d-capable hanging protocols (`primary3D`, `only3D`, `main3D`, `fourUp`, `mprAnd3DVolumeViewport`) were already registered upstream with dedicated icons — but **nothing in any deployed mode's toolbar ever triggered them**. The gap was pure UI wiring, not missing capability. User picked plain volume rendering (not segmentation-creation, which would be Tier 4 extension territory) and the `fourUp` 4-pane layout specifically.

**Verified before deploy** with Playwright (chromium-cli unavailable in this environment; installed via `npx playwright install chromium`) against a real 295-instance CT series (not the `PID_SR` synthetic 1-instance-per-series fixture, which produces degenerate MPR/3D output — good gotcha for next time). Confirmed: button renders desktop-only, correct 4-pane switch, properly rendered 3D skull/soft-tissue volume, zero console errors.

**Separate, bigger finding (not acted on):** `modes/segmentation` (unused in production) already wires a full segmentation toolset — `SphereBrush`/`SphereEraser`/`ThresholdSphereBrush` (true multi-slice 3D painting), `CircleScissors`/`RectangleScissors`/`SphereScissors`, Livewire/Spline/Freehand contour tools — none of it reachable from Patient Viewer, Doctor Viewer, or tmtv. That's a real "possibility to improve," but creating segmentations is new capability → Tier 4 (extension) territory per this fork's own discipline, not a fork toolbar edit. Flagged, not built.

**Next session (explicitly requested by user):** two follow-on 3D items —
1. **MIP preset** — likely either a new toolbar/dropdown option near `AdvancedRenderingControls` (`opacityMenu`, `thresholdMenu` already live there) or a rendering-mode toggle on the existing `volume3d` viewport, rather than a whole new hanging protocol. Not yet scoped.
2. **3D data faster-loading optimization** — perf work on volume construction/streaming for the `fourUp`/3D pane. Possibly relevant: `preclinical-4d` mode already pulls in `@ohif/extension-cornerstone-dynamic-volume`, which may have applicable progressive-loading patterns worth checking first.

See [[reference_toolbar_and_hanging_protocol]] for the exact recipe used (updated with this button's "reuse an existing isPreset:true protocol, skip protocol-file/registration steps" variant) and [[feedback_build_deploy_ops]] for the SSH/verification gotchas hit during this deploy.
