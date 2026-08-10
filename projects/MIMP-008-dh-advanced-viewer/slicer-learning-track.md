---
name: slicer-learning-track
description: The hands-on stock-Slicer learning track — next session starts with bone removal on a lower-limb CTA to isolate vessels
metadata: 
  node_type: memory
  type: project
  originSessionId: 64bb8465-991b-4f39-9a63-acea2f1b844c
  modified: 2026-07-28T13:45:28.243Z
---

Started 2026-07-28, immediately after the live bridge was wired ([[slicer-live-bridge]]).
The user's stated goal: *"I don't know many of the functions in 3D Slicer that are available
to use — I want to learn these skills by taking the AI guidance directly."* The curriculum
was **deliberately left undesigned** ("tooling first"); it is emerging from real work
instead.

## Next session's task (user-stated, 2026-07-28)

**Bone removal on the loaded lower-limb CTA, to see vessels only.** The user will drive;
guidance should favour naming the module and control and verifying they found it over
silently executing Python.

## The study that's loaded (no identifiers — see [[slicer-live-bridge]])

A **peripheral (lower-limb) CT angiography runoff**, two phases of the same patient:

| Series | Slices | Spacing |
|---|---|---|
| 2 — non-contrast | 1446 | 0.757 × 0.757 × **1.0** mm |
| 5 — arterial phase | 1607 | 0.757 × 0.757 × **0.9** mm |

State as found: volume rendering on both, only the arterial one visible, ROI-cropped to the
legs. **No segmentations, no models** — nothing built from it yet.

## Two findings that will matter next session

1. **The visible render had `MR-Angio` applied to CT data**, which is why the 3D view was an
   opaque skeleton with no vessel tree — that transfer function is calibrated for MR
   intensity, not Hounsfield Units, so everything above its ceiling saturates and bone wins.
   CT-appropriate presets are **`CT-Angio`** / `CT-AAA`. Not yet changed.
2. **Bone subtraction is available but not free.** Non-contrast + arterial of the same
   anatomy is the classic runoff setup (`Subtract Scalar Volumes`), but the two series are
   **not aligned** — different slice counts *and* different slice spacing (1.0 vs 0.9 mm).
   A naive subtract will fail or produce garbage; one must be resampled onto the other's
   geometry first, and realistically registered too (patient moves between phases). Slicer's
   error message will not explain this.

Worth knowing there are **two routes to "vessels only"** and they are not the same skill:
preset/threshold-based rendering (fast, display-only) vs. true subtraction or segmentation
(produces data you can measure and export). Establish which one is actually wanted before
committing to a path.

## How this relates to the product work

This study is **vascular**, so it maps onto the **v2 vessel/aneurysm backlog**, *not* the
D12 biomodeling slice that is the first shippable target ([[scope-current-position]]).
Progress here is Slicer literacy and reconnaissance — do not mistake it for D12 progress.
It does feed Bucket 1/2/3 triage, which is exactly what the reconnaissance install is for.

Note also: `vtkvmtk` **failed to instantiate** in this install (seen in the Slicer console
at startup). Unimportant now, but VMTK is the backbone of the v2 vascular port, so this will
need fixing before centerline work — see [[mevislab-tubulartracking-reference]].
