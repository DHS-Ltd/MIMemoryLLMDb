---
name: mevislab-tubulartracking-reference
description: "Soft flag to check MeVisLab's TubularTracking algorithm against Slicer's ExtractCenterline when vessel-analysis dev phase starts"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4c4bcfa7-bdfa-4040-9782-952910e3ba21
  modified: 2026-07-27T16:04:26.114Z
---

MeVisLab ships a module called `TubularTracking` — a tubular-template-model centerline
tracker (outputs XMarkers: centerline points + local vessel-orientation vectors), paired with
`SoVascularSystem` (vessel-specific rendering) and Hessian/vesselness/diffusion/morphology
filters for tubular-structure enhancement ahead of tracing. Module reference:
`https://mevislabdownloads.mevis.de/docs/current/FMEwork/ReleaseMeVis/Documentation/Publish/ModuleReference/TubularTracking.html`.

**Why:** Found while evaluating whether MeVisLab (a Fraunhofer MEVIS / MeVis Medical Solutions
rapid-prototyping platform) was worth adopting — it wasn't (non-commercial license forbids
redistribution/shipping, so it can't be part of DHDicomAnalyzer; see the "MeVisLab — Fit
Assessment" artifact from 2026-07-27 for the full writeup). But `TubularTracking`'s algorithmic
approach is real prior art specifically for the vessel-centerline problem, worth a read (not an
install) for comparison.

**How to apply:** Per [[scope-current-position]], the vessel/aneurysm workflow already maps
~1:1 onto existing `DHStenosisVMTK` modules (`QuickArterySegmentation` → `ExtractCenterline` →
`CrossSectionAnalysis` → `EditCenterline`) and is filed as **v2 vascular backlog** — zero missing
algorithms, just a Bucket-2 guided-panel wrapper needed. When that backlog item is actually
picked up for implementation, look at `TubularTracking`'s tubular-template approach (module docs
and any published papers, not the installed app) as a correctness/quality reference against
Slicer's VMTK-based `ExtractCenterline` — a point of comparison, not a replacement candidate.
