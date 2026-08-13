---
name: project_cardiac_viewer
description: Cardiac Viewer (LV Analysis) — planned 2nd Doctor Viewer instance; separate product repo at D:\ohif-extension-dhs-cardiac
metadata: 
  node_type: memory
  type: project
  originSessionId: 788c1a9f-17bd-4f9a-a408-5be784f1035a
---

**Cardiac Viewer** = planned 2nd Doctor Viewer instance for cardiologists doing
**LV Analysis (LVA)** on single-plane left-ventriculography (XA cine): mark ED/ES
frames, trace endocardial contour, derive EF/volumes/wall-motion.

Built as a **separate, sellable product repo** at `D:\ohif-extension-dhs-cardiac`
(packages `@dhsolutions/extension-cardiac` + `@dhsolutions/mode-cardiac`), bundled
into the shared `pacs-ohif-dhs` image, surfaced at `/viewer-cardiac`. Scaffold
committed (no LVA logic yet).

Key locked decisions: single-plane Area-Length; EF/wall-motion calibration-free,
mL calibration-gated (XA geometry tags → catheter fallback); DICOM SR source of
truth with contours round-tripping; explicit Portal routing + manual LV-gram run
selection; no AI in v1 (EchoNet is echo-trained, doesn't transfer to XA; needs a
labeled XA dataset that doesn't exist).

Docs in fork: `Docs/adr/0002-*`, `0003-*`, `Docs/Cardiac_Development/V1_Build_Roadmap.md`,
CONTEXT.md (Cardiac Viewer + LVA terms). These fork docs are **written but not yet
committed**. Relates to [[project_doctor_viewer_oncology]] (the 1st instance).
