---
name: project_liver_volumetry_llv
description: LLV liver & lesion volumetry product — planned; separate repo scaffolded D:\ohif-extension-dhs-liver; rides in longitudinal viewer; SEG+SR output
metadata: 
  node_type: memory
  type: project
  originSessionId: 9bf2b1f9-728b-4c49-9ed4-5d41a7c0e219
---

**Liver & Lesion Volumetry (LLV)** — 3rd Doctor Viewer capability, for reporting
radiologists + specialists measuring liver + lesion volumes and tumor-burden % on
contrast **CT abdomen**. Planned/scaffold-only as of 2026-07-01. Sibling to LVA
([[project_cardiac_viewer]]) but voxel labelmaps (SEG), not SCOORD contours.

**Shape (grilled + pinned 2026-07-01):**
- **NOT** a new viewer/route — rides INSIDE the existing DH Dicom Viewer
  (`longitudinal`) as an opt-in **panel + toolbar button**. So **one extension
  package, NO mode package** (unlike cardiac).
- Separate repo **`D:\ohif-extension-dhs-liver`** (`@dhsolutions/extension-liver-volumetry`),
  git-initialized, scaffolded (package.json, CLAUDE.md, CONTEXT.md, README, src stubs:
  index.tsx, id.ts, LiverVolumetryService.ts, getCommandsModule.ts). Bundled into the
  one `pacs-ohif-dhs` image via `pluginConfig.json` — ADR-0002 pattern. Self-contained;
  **no shared package with cardiac** (the spec's "share SEG/SR utils with LVA" is a
  false overlap — LVA emits no SEG). See [[project_multi_repo_architecture]].

**Key insight — most of it is UPSTREAM:** the fork already has brush/threshold
segmentation, per-segment cm³ (`getStatistics` via `updateSegmentationStats.ts`),
DICOM SEG export (`cornerstone-dicom-seg`), SR round-trip (`cornerstone-dicom-sr`).
Net-new = thin layer: liver/lesion **role model**, **burden calculator**, **report
panel**, **SR burden-shaping**, + Phase-3 AI client.

**Locked decisions (fork ADR-0004 = SEG+SR source of truth; ADR-0005 = AI boundary, proposed):**
- Explicit per-segment `role` (liver|lesion), NOT index convention. Liver SNOMED
  `10200004` hardcoded; lesion finding-code optional (default "Neoplasm, NOS").
- **SNOMED codes hardcoded → no license needed** (store/forward codes ≠ redistribute
  terminology; also covered by DICOM). Only a full SNOMED picker UI would need a license.
- Single **non-overlapping labelmap** → burden can't double-count. **Whole/gross**
  lesion volume in v1 (viable-only/mRECIST is later). Confirm necrosis Q with radiologist.
- **SEG = masks (authoritative), SR = signed numbers**; volumes **recompute from SEG
  on reopen**; explicit **Finalize** (no autosave); immutable **supersession**.
- Provenance via standard `SegmentAlgorithmType` (MANUAL/SEMIAUTO/AUTO); review-status
  **session-only** (never persist "unreviewed"); no draft/resume in v1.
- Lesion identity from v1: **Tracking UID + Tracking Identifier** (+ optional Couinaud)
  for longitudinal readiness without future migration.
- **Validate spacing, warn** on irregular/missing (never silent wrong cm³). CT-first.
- **Phase 3 (AI) is the sellable milestone**; manual Phases 1–2 are scaffolding + the
  AI-mask correction surface. AI = reference-in / DICOM-SEG-out / async / server pulls
  from Orthanc (shared RTX 2060 host, [[project_doctor_viewer_oncology]] infra sibling).

**Docs:** spec + build order in fork `Docs/LiverVolume_Development/`
(`LLV_Liver_Lesion_Volumetry_Spec.md`, `LLV_V1_Build_Roadmap.md`). CONTEXT.md gained
LLV + Tumor Burden terms. **Prereqs before build:** radiologist necrosis confirmation;
one real contrast CT abdomen to inspect spacing tags.
