---
name: scope-current-position
description: Where the technical-scope work stands as of 2026-07-10 and the next step to take
metadata: 
  node_type: memory
  type: project
  originSessionId: 7e74d688-a15a-475f-91b0-384878641c92
  modified: 2026-07-27T16:04:35.551Z
---

As of **2026-07-10**, strategy is locked and the feature-scoping pipeline is validated. Building the
actual implementation plan is **deferred** — user will return to it later.

**Locked scoping decisions:** D11 workflow-first · D12 **first slice = 3D Biomodeling** (segment → model
→ STL; v1, lightest DGDA load) · D13 implementable-spec depth · D14 two-layer output · D16 biomodeling
stays first (the vascular clip was only a pipeline test, not a re-prioritization).

**Done:** vessel/aneurysm workflow fully scoped as a **pipeline test** — maps ~1:1 onto existing
`DHStenosisVMTK` modules (`QuickArterySegmentation` → `ExtractCenterline` → `CrossSectionAnalysis` →
`EditCenterline`; export via `QuantitativeReporting`, not yet bundled). Zero missing algorithms; the only
build is one **Bucket-2** guided panel over the 2-point seed. This is **v2 vascular backlog** (needs
Phase-0 dossier D10 before marketing measurements). Docs: `Workflow-Scope-Vessel-Aneurysm-Analysis.md`
+ `VIdeo_Insights\vessel-aneurysm-analysis.md`.

**Next step (recommended path #1):** draft the **D12 Biomodeling Workflow Scope** doc from known Slicer
capabilities (Segment Editor → Surface Toolbox → STL export) + existing modules WITHOUT video; pull short
Inobitec clips only to settle specific UX gaps. Still-open: **D15** — biomodeling in/out boundaries
(multi-structure colored models? 3D-print prep: hollowing/wall-thickness/supports? model→DICOM
encapsulation?). See [[inobitec-scope-loop]] and [[dhdicomanalyzer-product]].

**Soft flag for when the v2 vascular backlog is picked up:** compare Slicer's `ExtractCenterline`
against MeVisLab's `TubularTracking` algorithm as a correctness reference — see
[[mevislab-tubulartracking-reference]].
