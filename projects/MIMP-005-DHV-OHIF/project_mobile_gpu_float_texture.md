---
name: project-mobile-gpu-float-texture
description: A large share of DH patient phones (ARM Mali-G52 class) lack OES_texture_float_linear and EXT_texture_norm16 — any image whose pixel range falls outside ±2048 rendered blank until the 2026-08-26 half-float fallback; MONOCHROME2 hid it as a black screen for years
metadata: 
  node_type: memory
  type: project
  originSessionId: c5205dbe-8fcc-4c7e-81b8-db225d95167d
  modified: 2026-08-26T14:42:24.878Z
---

A meaningful share of the phones DH patients actually use — ARM **Mali-G52 MC2**
class, Android 10, 4 GB — expose neither `OES_texture_float_linear` nor
`EXT_texture_norm16`. Qualcomm **Adreno 610** class devices expose both. Confirmed
2026-08-26 by running a WebGL capability probe on three real testers' phones.

**Why:** this splits the patient base into two rendering classes, and the broken
class fails *silently*. vtk.js only picks a half-float texture when an image's
pixel range fits inside ±2048; anything wider gets an `R32F` texture, which
needs `OES_texture_float_linear` to be filterable. Without it the upload
succeeds with **no GL error** and every sample reads back as zero. MONOCHROME1
(DX/CR) inverts that to a **white** screen — loud and obvious. MONOCHROME2
(CT/MR) renders it **black**, indistinguishable from "still loading" against a
black viewport, which is why this went unreported until the first DX study
arrived on 2026-08-26. Most of the CT/MR archive exceeds ±2048, so those had
been quietly broken on Mali phones all along.

**How to apply:** for any mobile rendering bug, establish the GPU capability
split *before* theorising — `OES_texture_float_linear`, `EXT_texture_norm16`
and `MAX_TEXTURE_SIZE` from the failing and a working device. Do not assume
core WebGL 2 is enough; float-texture *filtering* is not part of it. Never
conclude "only modality X is affected" from user reports alone when the other
modalities would fail to black. Fixed by a capability-gated half-float fallback
in `extensions/cornerstone/src/utils/dhsFilterableTextures.ts` (commit
`b1ed7ecce`, shipped as `pacs-ohif-dhs:v2`); the mechanism and its 65504
ceiling are documented in that file.

**Still owed:** OHIF never passes `isMobile` to `cs3DInit`, so Cornerstone
keeps its desktop default of **7** eagerly-created offscreen WebGL2 contexts on
phones instead of the 1 it intends (`config.rendering.webGlContextCount`).
Confirmed by reading the code, never demonstrated to cause harm — the probe row
that tested it was invalid. One-line fix in
`extensions/cornerstone/src/init.tsx`, deliberately deferred to keep the
2026-08-26 deploy attributable to a single change.

Related: [[project-dhs-pacs-viewer]], [[project-phase-b-complete]],
[[feedback-build-deploy-ops]]
