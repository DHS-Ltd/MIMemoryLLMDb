---
name: black-cell-rehydrate-fix
description: "Named pointer to the RESOLVED 'black cell on sheet re-hydrate' Film Composer bug (CellDisplayState.applyTo missing source re-attach + pipeline re-run) and its bundled Sheet Tray highlight fix — both fixed, tested, code-reviewed, and live-verified 2026-07-07. Call this by name to jump straight to the authoritative docs instead of re-diagnosing."
metadata:
  type: reference
  originSessionId: d4c1d434-e85f-4053-b7c7-c8246741c0ca
aliases: [black_cell_rehydrate_fix]
---

**Call this "the black-cell-rehydrate-fix"** — a two-bug fix landed 2026-07-07
in `weasis-dicom-filmcomposer`, distinct from the earlier 2026-07-03 black-cell
bug (that one's a different root cause — a missing `componentResized`
zoom-recovery listener, see ADR-0004; don't conflate the two).

**Bug 1 — the main one.** `CellDisplayState.applyTo(ViewCanvas)` rebuilt a
cell's display-op pipeline from copied nodes but never re-attached the live
source image or re-ran the pipeline (bare `repaint()`), so returning to any
already-visited Film Composer sheet, or a grid-grow's pre-existing cells,
rendered permanently black. Fix: capture `getFirstNodeInputImage()` before
`removeAllImageOperationAction()` clears it, `setFirstNode(source)` after the
rebuild, `updateDisplayOperations()` before `repaint()`.

**Bug 2 — found live during this fix's own QA.** `FilmComposerContainer
.selectSheet(int)` never called `sheetTrayPanel.refresh()`, so the Sheet
Tray's highlighted row went stale whenever `selectSheet` was called
programmatically (e.g. the MCP `selectSheet` tool) rather than by a human
JList click. Fix: added the `refresh()` call, matching every other
sheet-lifecycle method's existing convention.

**Where the full detail actually lives — read these, don't re-derive:**
- `docs/Printing_module/black-cell-rehydrate-fix-build-guide.md` — the
  self-contained build guide this fix was implemented from (root cause,
  exact before/after code, test plan, build/deploy/verify commands).
- `docs/Printing_module/black-cell-rendering-bug-handover.md` — the "SECOND
  black-cell bug" section, now flagged RESOLVED, with the live-QA writeup for
  both bugs.
- `CLAUDE.md`'s Film Composer phase table, row **6F**.
- Full narrative + reasoning: memory [[film-composer-module]] (its own 6F
  entry duplicates this in more depth, since that file is the module's
  running build log).

**Verification state:** 207/207 `weasis-dicom-filmcomposer` tests pass
(including new `CellDisplayStateTest`, a Mockito interaction-order test —
this bug class can't be pixel-asserted in plain JUnit); code review clean, no
CRITICAL/HIGH; live-verified on a real `-Pmcp` build with real patient data
(return-navigation, `+row` grid-grow, rotation/W-L persistence across
leave/return, and the tray-highlight fix, all confirmed rendering/behaving
correctly).
