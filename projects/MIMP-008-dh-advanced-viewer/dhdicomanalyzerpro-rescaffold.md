---
name: dhdicomanalyzerpro-rescaffold
description: "Why DHDicomAnalyzer was renamed/re-scaffolded to DHDicomAnalyzerPro, and the Phase 1/2 execution plan"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2de5aacc-d307-4d24-94a9-3db941cc4a4e
  modified: 2026-07-28T13:06:25.362Z
---

**2026-07-28**: repo layout rearranged to match the rename decision (was left inconsistent
on purpose 2026-07-27, doc-first). `DHDicomAnalyzer/` moved out of `DH-Advanced-Viewer`
entirely to `E:\Archive\DHDicomAnalyzer` (own git history/remote intact, read-only
reference for the Phase 2 module port). `Slicer_Inobitec_research/` renamed to
`DHDicomAnalyzerPro-Planning/` (all paths below updated accordingly). A same-day, previously
unmapped `3DSlicer_Research/` folder (scraped upstream Slicer dev+user docs) was briefly
folded into `DHDicomAnalyzerPro-Planning/docs/Slicer-Reference/`, then moved back to
top-level `3DSlicer_Research/` at the user's request the same day — its task is still
undefined, don't assume it's part of this context. Full log in this repo's `CONTEXT-MAP.md`.

**2026-07-27**: root cause of "every change takes 5 hours to compile" was identified —
DHDicomAnalyzer's SuperBuild was always being rebuilt from the *outer* SuperBuild directory
(re-verifying every `ExternalProject`: Slicer core, VMTK, the app), never the *inner*
`Slicer-build` tree that Slicer's SuperBuild architecture provides for fast incremental
rebuilds. That alone would have fixed the problem in-place, but the user chose instead to
retire the old repo and start fresh.

**Decision: full rename + re-scaffold, not in-place fix.** New product name
**DHDicomAnalyzerPro** ("Direct Hospital Dicom Analyzer Pro"), generated fresh via
[KitwareMedical/SlicerCustomAppTemplate](https://github.com/KitwareMedical/SlicerCustomAppTemplate)
(cookiecutter), pinned to Slicer stable `v5.12.3` (not the template's bleeding-edge `main`
default). New repo, new source tree at `E:\DHDAPro\Src`, build at `E:\DHDAPro\Build`. Full
reasoning in `DHDicomAnalyzerPro-Planning/docs/adr/0001-dhdicomanalyzer-rename-and-rescaffold.md`
and `0002-dhdicomanalyzerpro-build-toolchain.md`.

**Phased:**
- **Phase 1** (plan written, not yet executed as of 2026-07-27): bare scaffold + verify the
  corrected inner/outer build workflow actually fixes the rebuild-time problem. Step-by-step in
  `DHDicomAnalyzerPro-Planning/docs/DHDicomAnalyzerPro-Phase1-Dev-Environment.md`.
- **Phase 2** (future session): re-port `DHStenosisVMTK`, the VMTK `ExternalProject` wiring, and
  the `Home` module from the old (retired) DHDicomAnalyzer repo — now archived read-only at
  `E:\Archive\DHDicomAnalyzer` — into the proven scaffold, using its `DHDicomAnalyzerBuilding.md`
  as reference for already-solved VMTK Python-wrapper/CPack packaging gotchas.

**Rejected during the same session:** Linux/WSL2 as a faster dev environment (can't produce the
Windows NSIS installer that actually ships; risks Qt/VMTK behavioral drift) — see ADR-0002.
Also tabled for later: wiring `slicer-skill`'s `slicer-mcp-server.py` (live Claude Code ↔
running-Slicer-session bridge) into the dev loop — **no longer tabled, done 2026-07-28**, see
[[slicer-live-bridge]] — and customer-site diagnostics/support tooling (still open).

**Toolchain locked:** outer SuperBuild = official Visual Studio 17 2022 generator (used once,
rarely touched again). Inner build = Visual Studio "Open Folder" CMake integration pointed at
`Slicer-build` (defaults to Ninja internally — free speed bonus, not a separate toolchain
decision). No ccache/sccache (ccache unsupported on Windows for debug builds per Slicer's own
devs; sccache's payoff doesn't matter once full rebuilds are rare). "Official" 3D Slicer
(slicer.org download) is kept as a separate **reconnaissance install** only — used to see what a
capability looks like natively in stock Slicer for Bucket 1/2/3 triage, never to build/test
DHDicomAnalyzerPro's own code. See [[dhdicomanalyzer-product]] and [[scope-current-position]].
