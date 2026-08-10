---
name: totalsegmentator-extension-practice
description: "Hands-on TotalSegmentator extension evaluation in the new 5.12.3 Slicer install — scope, dataset, and documentation decisions locked 2026-08-08"
metadata: 
  node_type: memory
  type: project
  originSessionId: a0f30f35-c75f-44a6-8500-c3c75c56093c
  modified: 2026-08-08T19:07:32.247Z
---

Started 2026-08-08. **A third, separate thread** — not the [[slicer-learning-track]]
curriculum (that still starts its next session with manual bone removal on the lower-limb
CTA, untouched) and not [[slicer-knowledge-base]] catalog work.

## Why a new Slicer install exists

`E:\Slicer.org\` now holds **two coexisting copies**: the untouched
`3D Slicer 5.11.0-2026-02-10\` (reconnaissance install, see [[slicer-live-bridge]]) and a new
sibling `3D Slicer 5.12.3\`, installed 2026-08-08 specifically for extension practice. Neither
is the product's own 5.12.3 pin — that build doesn't exist yet. Confirmed running via
`nvidia-smi` (SlicerApp-real.exe from the 5.12.3 path in the GPU process list).

## Locked decisions (2026-08-08 grill session)

- **Scope:** one representative run per dataset — install the extension, run its default
  `total` task once per study, inspect output. Not an exhaustive task-preset × mode matrix.
- **Dataset:** several real patient studies, user-supplied across the session (not Slicer
  sample data) — user wanted to try the tool against their own varied cases.
- **Hardware:** NVIDIA GeForce RTX 2060, 6GB VRAM, driver 595.79 / CUDA 13.2 — confirmed via
  `nvidia-smi`. Sufficient for fast-mode inference; full-resolution mode is tighter on some
  tasks but workable.
- **Extension install status (as of session start):** not installed. Installing it via
  Extension Manager (+ restart + first-run PyTorch/model download) is step one of execution.
- **Documentation destination:** `3DSlicer_Research/Practise_Resoucres/` (new folder, created
  lazily on first real content — mirrors Inobitec's `Practise_Resoucres/` naming). **Not**
  wired into `/slicer-catalog` ingestion, **not** added to `Knowledge_Base/MODULES.md`.
  Reason: MODULES.md's Entry depth rule requires a `Sources:` citation to an official upstream
  Slicer doc; TotalSegmentator is a third-party extension (wasserth/TotalSegmentator on
  GitHub) with no such doc, so a standalone catalog entry would break the sourcing rule. The
  existing one-word mention of TotalSegmentator under the Segmentations module entry in
  MODULES.md is left as-is — deliberately not expanded.
- **PHI:** same rule as [[slicer-live-bridge]] — no patient identifiers copied into the
  practice write-up. Multiple real studies will be used; refer to them by anatomy/role, not
  name/MRN.

## Open mechanical step

MCP bridge was not connected at session start (no `slicer` tools registered) — needs
`startMCP()` run in the 5.12.3 instance's Python console, then `/mcp reconnect all`.

## Install saga (2026-08-08/09) — DONE, extension fully installed and working

TotalSegmentator + PyTorch + NNUnet extensions installed, `torch` (CUDA-enabled, RTX 2060
detected), `nnunetv2`, and `totalsegmentator` all import successfully. Took ~5 hours across
many Slicer restarts because of three distinct, now-understood problems on this machine —
worth reading before touching this extension (or installing any other Python-heavy Slicer
extension) again:

1. **`inspect.getmodule()`'s O(n) `sys.modules` fallback scan, amplified by this machine's
   antivirus real-time-scanning file-I/O interception**, made routine imports slow all
   session and caused a genuine multi-minute-plus hang on torch's custom-op registration
   (stuck on an op named "annotate", inside `torch._library.utils.get_source()`). Fixed with
   a process-wide monkeypatch of `inspect.getmodule` to skip the slow fallback (the only
   caller in the hot path uses it for cosmetic debug strings only). **Apply this patch first,
   before any torch-heavy import, if this ever needs redoing.**
2. **`PyTorchUtils.PyTorchUtilsLogic.torchInstalled()` (in the PyTorch extension, not
   TotalSegmentator) has a real inefficiency**: `[p for p in importlib.metadata.files('torch')
   if 'METADATA' in str(p)][0]` — a list comprehension that doesn't short-circuit, so it
   `.exists()`-checks all ~14,210 files in torch's RECORD (CUDA build, full headers) before
   taking the first match. Normally sub-second; on this AV-throttled machine it was
   1-2+ hours. Fixed by monkeypatching `torchInstalled` to just try `import torch` directly,
   since a successful import already proves what the check wants to know.
3. **The real blocker, found last: running `setupPythonRequirements()` in a background
   `threading.Thread` (done to allow progress-polling) caused a genuine cross-thread deadlock
   — not slowness — the very first time a not-yet-imported package (`scipy.ndimage`, then
   `dicom2nifti`) was imported from that thread.** Symptom was indistinguishable from a true
   freeze: `Get-Process ... .Responding` → `False`, MCP bridge HTTP timeout, near-zero CPU
   movement, identical memory footprint (~990MB) across repeat occurrences — a real deadlock
   signature, not I/O slowness (which left the bridge responsive throughout, confirmed
   separately during the torch RECORD-file-scan phase). Root cause not fully isolated (likely
   Python's per-module import lock contending with something on Slicer's main/Qt thread), but
   the fix was structural: **stop backgrounding the call. Run `setupPythonRequirements()`
   directly via a single synchronous call.** The MCP client-side call may itself time out
   before the (slow but real) install finishes server-side inside Slicer — that's fine, Slicer
   stays responsive (confirmed via `Get-Process .Responding` = `True` even after the client
   timeout), and a follow-up call to the same method picks up where it left off (TotalSegmentator's
   own logic checks what's already installed and skips it).

**If reinstalling from scratch**: apply patches 1 and 2 first, pre-import
`pandas`/`dicom2nifti`/`nibabel`/`scipy.ndimage.{filters,fourier,interpolation,measurements,morphology}`
synchronously (all fast once cached) to avoid rediscovering blocker 3 on those specific
packages, then call `TotalSegmentator.TotalSegmentatorLogic().setupPythonRequirements()`
directly (not backgrounded) and just accept the client call may need to be issued twice.
