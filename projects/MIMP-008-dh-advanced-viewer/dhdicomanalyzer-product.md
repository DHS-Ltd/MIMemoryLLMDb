---
name: dhdicomanalyzer-product
description: "What DHDicomAnalyzer is, its strategy, and where the source-of-truth planning docs live"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7e74d688-a15a-475f-91b0-384878641c92
  modified: 2026-07-27T18:41:16.023Z
---

**Renamed as of 2026-07-27**: DHDicomAnalyzer → **DHDicomAnalyzerPro** ("Direct Hospital Dicom
Analyzer Pro"), via a full re-scaffold (new repo, fresh SlicerCustomAppTemplate generation), not
an in-place rename. See [[dhdicomanalyzerpro-rescaffold]] for why and the execution plan. The
description below still accurately describes the *retired* DHDicomAnalyzer repo/build as
historical reference for Phase 2 module porting.

**DHDicomAnalyzer** (retired name) = DH Solutions' commercial, DH-branded desktop 3D medical imaging app, built from
open-source **3D Slicer** via SlicerCustomAppTemplate. It already exists as a working Windows superbuild
(VS2022 / Qt 5.15.2, CPack/NSIS installer), with DH branding, a custom `Home` module, and bundled
extensions `DHStenosisVMTK` (renamed VMTK), `SlicerExtraMarkups`, `SlicerSegmentEditorExtraEffects`.
Source lives at `e:\DH-Advanced-Viewer\DHDicomAnalyzer\`.

Positioning (locked): **commercial product now**, **Bangladesh domestic** market (DGDA regulator, not
CE/FDA), sold on a **sequenced moat** — Phase-1 = packaging + Bengali localization + local support (land);
Phase-2 = ecosystem integration / web→desktop handoff (expand). The binary itself is never the moat
(open-source). Ships as a **non-diagnostic aid** (visualization/measurement/planning) while DGDA
registration is pursued in parallel. It's one node of the **DH stack** (OHIF/DHViewer web viewer, Weasis
desktop viewer, Orthanc PACS `DHVIEWER`, PyTorch AI server).

**Inobitec** DICOM Viewer Pro is NOT an interop target — it's DH's **reference standard**: a certified
(ISO-13485/ANVISA) comparator for validating accuracy in the DGDA dossier, and a source of feature/workflow
ideas (never code).

**Source of truth for all decisions** (D1–D16) and glossary:
- `DHDicomAnalyzerPro-Planning\docs\Product-Strategy-Decisions.md` (decision log)
- `DHDicomAnalyzerPro-Planning\docs\CONTEXT.md` (glossary)
Read those before planning. See [[inobitec-scope-loop]] and [[scope-current-position]].
