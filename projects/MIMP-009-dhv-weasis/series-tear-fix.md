---
name: series-tear-fix
description: The 2026-08-25 Viewer fix for Philips Enhanced MR studies arriving scattered across too many thumbnails (SITE015 Mirpur); introduced the Study Assembly context and ADR-0022.
metadata: 
  node_type: memory
  type: project
  originSessionId: 161771c1-9a3f-44a4-aa74-9337e61c329b
  modified: 2026-08-25T12:55:28.382Z
---

SITE015 (Popular, Mirpur) reported a dorsal-spine MR reading as scattered: Receiver held 19 series /
47 instances, Viewer drew **63 thumbnails**. Root cause was two independent upstream Weasis
mechanisms, both fixed 2026-08-25 in the DHV tree (uncommitted, targeted at **v2.0.2** / bundle
v1.0.2):

1. `Tag.StackID` as a multi-frame splitting rule — Philips writes one stack per angled slice group,
   so a 19-frame axial angled to each of 12 dorsal disc levels became 12 thumbnails. Removed from
   `SplittingRules.initDefault()` for **all** modalities.
2. `LoadLocalDicom.calculateSamplingRateFor4d` sampled only the *leading run* of the position-sorted
   list. Since `SlicePosition` projects onto each image's own normal, a collision across
   non-parallel slices is a coincidence — it would have silently re-torn whatever fix 1 merged.
   Now requires one shared orientation plus a whole-series phase pattern, via the new
   `ImageOrientation.hasConsistentOrientation` (tolerance 1e-2, matching the MPR module).

**Why this matters beyond the bug:** it was NOT a branding or ADR-0019 regression. `StackID` has
been a splitting rule since 2016; `EnhancedMRImageStorage` was already in the Retrievable Set. The
tearing always happened at Mirpur — the ADR-0019 fix just removed the bigger problem hiding it.

**Verified before building**, not after: a PowerShell model replaying both pipelines over the
Receiver's real instance tags reproduced today's 63 exactly, and predicts **17** after the fix. That
control-first pattern is what made the fix trustworthy — the first two diagnostic scripts each had a
wrong assumption (`Rows` as a proxy for `PixelData`; `@(Invoke-RestMethod ...)` collapsing an array
in PS 5.1) that only the 63-match exposed.

**Also corrected en route:** an earlier draft added a geometry guard to `DicomSeries.isSuitableFor3d()`
on the belief that merging exposed MPR/VR to incoherent volumes. Wrong — `OriginalStack` +
`MPRGenerator`/`DicomVolTextureFactory` already raise a blocking *"Slice orientations are not
parallel!"* confirmation. That change was dropped. Separately, `SplittingRules`' `extend` XML
attribute was dead code (looked the parent up, then returned null) and is now fixed, because the
XML is the documented field escape hatch.

**Where things live:** [[film-composer-module]] and [[dh-pacs-standalone-site]] for the surrounding
work. New bounded context `docs/StudyAssembly/CONTEXT.md` (Sub-series, Series tear, Stack, Phase
set, Parallel, Renderable instance), ADR-0022, and the build+reinstall guide at
`docs/StudyAssembly/SHIP_v2.0.2_SERIES_TEAR_FIX.md`.

**BUILT 2026-08-25 19:11.** `DHDicomViewer_Setup_v2.0.2.exe` (52 MB) + bundle
`DHPACSWorkstation_Setup_v1.0.2.exe` (87.3 MB). Receiver NOT rebuilt (unchanged since 12:58) — the
bundle still embeds `dh-pacs-receiver-setup-v0.4.0.exe`. Tests came in at exactly the predicted
**17 codec + 49 explorer, 0 failures**. The widened gate verified 165/165 resource files
byte-identical; codec and explorer jars in the app-image hash-identical to Maven's; `app\bundle\`
free of mcp/filmcomposer (ADR-0018); both licence fixtures VALID. The whole-folder hash is now the
standing gate 2b in `01_BUILD_THE_INSTALLERS.md`, not just advice in the ship guide, and that runbook
carries a v2.0.2 build log. **INSTALLED + LIVE-VERIFIED at SITE015 2026-08-25.** Viewer reports 2.0.2 and the ADR-0022
comment is present in the on-box `series-splitting-rules.xml`. A re-derived model of the shipped
rules (`Predict-Thumbs`, full single-frame + multi-frame rule sets, not the per-instance
approximation used pre-build) predicts **17** for Hafiza, and every drawable series comes back
`THUMBS 1` — series 601 `T2W_TSE_TRA`, which used to tear into twelve, is one thumbnail. The
operator walked every thumbnail on screen and confirmed all carry pixel data, ruling out the
"two pixel-less series are being drawn" failure mode behind an initial 19 count. **63 -> 17
confirmed.** Still uncommitted.

**Install path gotcha:** the `.iss` has no `ArchitecturesInstallIn64BitMode`, so `{autopf}`
resolves to `C:\Program Files (x86)\DH Solutions Limited\DH DICOM Viewer` — that is where every
release has gone. Accept the wizard default; redirecting to `C:\Program Files\` creates a second
install. Verification commands must use the `(x86)` path.

**MRCP control (Saidul Islam, ID 71322923, 38 series):** model predicts **41** thumbnails —
36 series at 1, plus `1601 mDIXON_T1` and `1701 mDIXON-Quant_BH` splitting into 4 each. Those
two are *correct* (mDIXON emits in-phase/out-phase/water/fat, which differ by `ImageType`), not
a tear. GUI count not yet reconciled. Also noted: `1902 MIP - BTFE_portal` holds one instance
with no PixelData — odd for a MIP series, unexplained, low priority.

**Open:** `RawDataStorage` objects are discarded by the Viewer on arrival (no `PixelData`), so why
adding that SOP class fixed the missing series may not be what ADR-0019 assumes. Storage Commitment
still ON at the Philips console. Clean-VM test of the bundle still outstanding.
