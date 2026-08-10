---
name: workspace-containment
description: Keep everything for this project inside e:\DH-Advanced-Viewer — don't create or wire in repos elsewhere on E:
metadata:
  type: feedback
---

Everything for this project lives inside `e:\DH-Advanced-Viewer`. Do **not** create new
repos or working folders elsewhere on `E:\`, and do not wire in stray Slicer-related
folders found on the drive just because they exist.

Specifically discarded (2026-07-28): `E:\Slicer_Source_Code\Slicer` — a Slicer source
clone from February 2026, referenced by no doc or memory in this project. The user's
instruction was to *"ignore this completely… discard it. For this project I didn't build
the code repo yet."* Don't resurrect it as a reference path.

Known, sanctioned exceptions — these are outside the workspace **by design**, not drift:
- `E:\Slicer.org\3D Slicer 5.11.0-...` — the reconnaissance install (see
  [[dhdicomanalyzerpro-rescaffold]])
- `E:\DHDAPro\Src` / `Build` — the product checkout, a separate repo (not yet created)
- `E:\Archive\DHDicomAnalyzer`, `D:\Inobitec_Video_Repo` — logged in `CONTEXT-MAP.md`
- `~/.slicerrc.py` — has to be in the home directory; that's where Slicer looks for it

**Why:** the user is actively guarding against this workspace sprawling across drives,
having already spent a session consolidating it. Extra roots make the context map lie.

**How to apply:** before proposing a path outside `e:\DH-Advanced-Viewer`, check
`CONTEXT-MAP.md` for whether it's already a sanctioned external location. If it isn't,
put the artifact inside the workspace instead — and if something genuinely must live
outside, say so explicitly and why, rather than doing it quietly.
