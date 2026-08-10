---
name: film-composer-module
description: "What the DHV Film Composer is, how it was built (phases/methodology), and the recurring bug-finding pattern — orientation + pointers to the authoritative repo docs."
metadata: 
  node_type: memory
  type: project
  originSessionId: 6895c065-c5bb-4ae3-8b97-098d836a47c2
---

The **Film Composer** is a filming/print-composition workspace for technologists
in DH DICOM Viewer, built as a new sibling OSGi bundle
`weasis-dicom-filmcomposer` on top of Weasis' inherited DICOM Print SCU
(`DicomPrint.java`) and local print (`ImagePrint`/`ExportLayout`) — not a
replacement for either. A technologist selects images from a study, arranges them
into one or more Film Sheets, and batch-prints to a DICOM printer or local/PDF.

**Authoritative docs (read these for detail — don't rely on this memory alone):**
- Glossary: `DHDicomViewer/dh-dicom-viewer/CONTEXT.md`
- Full design decisions + UX + build order: `docs/Printing_module/film-composer-design-decisions.md`
- Per-phase implementation notes + bug records: `CLAUDE.md` (Phase 5 section)
- ADRs 0001–0005: `docs/adr/`
- Curated as-built index: the `grill-film-composer` skill's `architecture-map.md` — see [[grill-film-composer-skill]]

## What's built (status)
**Current frontier (2026-07-08): Phase 7A — WYSIWYG Film Surface — DONE + live-verified**
(338/338 filmcomposer tests). The center pane is now a real letterboxed film:
`FilmSurfacePanel` wraps the inherited `grid` (only `setBounds`, never its
internals), aspect-locks to `filmSize × orientation` (default **14×17**, a
Composer-scoped default; global `DicomPrintOptions.DEF_FILM_SIZE` stays 8×10), dark
surround + film border, fit-to-viewport default + opt-in **Ctrl+wheel view-only
magnification** (magnifying glass; never mutates `CellDisplayState`/print). Live
job-level film-size dropdown + Fit button on the toolbar. Aspect follows film size,
not the print destination. Docs: build guide `7A-wysiwyg-film-surface-build-guide.md`,
ADR-0016, CONTEXT.md "Film Surface" term, design-decisions 7A row. **Next session =
branch B (Sheet Tray thumbnails): grill first, handoff at
`docs/Printing_module/Feature_Building_docs/7B-sheet-tray-thumbnails-handoff.md`**
(crux to grill: cheap caching/async thumbnail rendering for large 100+-sheet jobs
without the costly `selectSheet`-based rasterize per row). Branch C (proof-dialog
rework) deferred further.

Phases **5A–5G3 done**, **5H (vendor conformance validation) pending**.
5A protocol refactor (multi-Film-Box session) · 5B bundle skeleton + factory ·
5C model + editing canvas + Series Rail + Sheet Tray · 5D image assignment
(auto-fill/drag/swap/clear) · 5E output + preview gate + submit + audit log ·
5F templates · 5G worklist entry (DicomExplorer context menu) · 5G2 toolbar +
open-study launch + template-apply fix · 5G3 mouse-action wiring.

**Field-study phases (6A+, ongoing via `/grill-film-composer`), all done and
manually verified:**
- **6A** (2026-07-05) — grid grow/shrink toolbar (+row/-row/+col/-col), bounds
  1-8 rows/cols, clears merges first with a one-time notice.
- **6B** (2026-07-06) — cell merge/un-merge, Merge-Right/Merge-Left/Unmerge
  toolbar buttons via `MergedCellsBuilder`; merges the **entire target column**
  (corrected from an initial same-row-neighbor read of the field feedback).
  Found + fixed a real `FilmSheet.setGrid` bug during this build: cell
  preservation must match old↔new cells by (x,y) coordinate, never by
  `MigCell.position()` (which renumbers per-grid once any merge exists) —
  retroactively fixed a latent 6A bug too.
- **6C** (2026-07-06) — "Series import": dragging a series with zero images
  placed anywhere in the current Film Job now auto-paginates its whole image
  set into the active sheet's remaining empty cells + newly appended sheets,
  never overwriting an existing placement regardless of which cell the drag
  landed on; a series already loaded elsewhere in the job keeps the old
  single-cell replace (`FilmComposerContainer.isSeriesAlreadyLoaded`/
  `importSeriesIntoFilmJob`, branched in `FilmCellTransferHandler`). 184/184
  filmcomposer tests pass; manually verified working on a live rebuild.
  Independent code review flagged two HIGH findings that were both checked
  against the actual code and rejected as false positives — worth remembering
  the two facts that resolved them: (1) `assignSeriesToCell`/`swapCells`/
  `clearCell` all mutate the live canvas only and rely on
  `serializeActiveSheetFromCanvas()` at the next natural sync point (documented
  in `isPristine()`'s javadoc) — this is deliberate, not a gap; (2)
  `MediaSeriesGroupNode.equals()` (inherited by `Series`/`DicomSeries`) is
  already series-UID-identifier-based, so `Objects.equals` for series-identity
  checks is *more* robust than plain reference equality, not less.
- **6D** (locked 2026-07-06, corrected + built 2026-07-07) — **auto-refill on
  clear**, redefined mid-flight from a single-cell same-series backfill
  (planned but never built) to a **job-wide cascading compaction**: clearing a
  cell flattens every cell in the job (sheet order, then grid (row,col)
  coordinate) into one sequence, removes the cleared slot, and shifts every
  following slot's content (image + `CellDisplayState`, so per-cell display
  adjustments travel with the image) back one position, **job-wide and
  regardless of series** — deliberately broader than 6E's same-series-boundary
  cascade, per explicit field feedback that industry practice compacts the
  whole job. The last slot in the whole job ends up empty; a sheet left with
  zero cells is silently removed (never the job's last sheet). Replaced the
  old `clearCell` + 6 tests; 232/232 filmcomposer + 102/102 weasis-mcp tests
  pass; code review clean (one MEDIUM coverage gap closed). **Live-verified**
  against a real 432-image CT series (108 auto-filled sheets) — confirmed via
  `getFilmJobState`/`listFilmSheets`/a rasterized `getFilmSheetPreview` that
  the shift crosses sheet boundaries correctly and the trailing cell empties.
  **Found + fixed a real bug during live verification:** `weasis-mcp`'s
  `ClearCellTool.apply` resolved the target `ViewCanvas` *before* calling
  `clearCell` and reused that same reference afterward — safe for the old
  single-cell design (which only ever mutated one `ViewCanvas` in place), but
  wrong once `clearCell` can rebuild the active sheet's grid via
  `hydrateActiveSheetToCanvas()` (which produces a *new* `ViewCanvas` at that
  position). The tool reported the just-cleared cell as empty even though the
  cascade had correctly refilled it on-screen. Fixed by re-resolving the cell
  by position *after* the call. **General lesson, added to the
  `grill-film-composer` architecture map:** any container method using the
  model-write-then-`hydrateActiveSheetToCanvas()` pattern invalidates
  previously-resolved `ViewCanvas` references for the active sheet — callers
  (especially MCP tools) must re-resolve by position afterward, not reuse a
  pre-call object. This class of bug is invisible to unit tests (a
  test/mock doesn't distinguish "same object" from "different object, same
  content") and was only caught by live-testing the real running app.
- **6F** (2026-07-07) — a **second, distinct black-cell bug** (root-caused
  2026-07-06, fixed 2026-07-07): `CellDisplayState.applyTo` rebuilt a cell's
  display-op pipeline from copied nodes but never re-attached the live source
  image or re-ran the pipeline (bare `repaint()`), so returning to any
  already-visited sheet, or a grid-grow's pre-existing cells, rendered
  permanently black (inverse symptom of the 2026-07-03 bug below — new cells
  fine, pre-existing ones black). Fix: capture `getFirstNodeInputImage()`
  before clearing, `setFirstNode(source)` after rebuild,
  `updateDisplayOperations()` before `repaint()` — one method,
  `CellDisplayState.applyTo`, per
  `docs/Printing_module/black-cell-rehydrate-fix-build-guide.md`. New
  `CellDisplayStateTest` (Mockito interaction-order test — this bug class
  can't be pixel-asserted in plain JUnit). 207/207 filmcomposer tests pass;
  code review clean; **live-verified** on a real `-Pmcp` build with real
  patient data (return-nav 7→1→5→3, `+row` grow, rotation/W-L persistence
  across leave/return — all confirmed rendering correctly). **A second,
  separate bug found during the same live-QA pass:**
  `FilmComposerContainer.selectSheet(int)` never called
  `sheetTrayPanel.refresh()` — invisible on the human click path (Swing's own
  `JList` updates its selection as part of the click), but left the Sheet
  Tray's highlighted row stale whenever `selectSheet` was called
  programmatically (the MCP `selectSheet` tool, see [[mcp-ai-control-surface]]).
  Confirmed via `getFilmJobState` that the canvas/model were always correct —
  only the tray highlight lagged. Fixed by adding `sheetTrayPanel.refresh()`
  to the end of `selectSheet`, matching the convention every other
  sheet-lifecycle method already follows; no re-entrancy risk (the existing
  `index == filmJob.getActiveIndex()` guard short-circuits any re-entrant
  call the refresh's `JList` selection change might trigger). Full writeup:
  `docs/Printing_module/black-cell-rendering-bug-handover.md`'s "SECOND
  black-cell bug" section.
- **6G** (2026-07-07) — **corner-annotation overlay**, live + print. `FilmComposerInfoLayer`
  had been a no-op stub since it was first created (its own Javadoc falsely claimed
  annotations "already" burned in via the print path — traced and disproven:
  `ExportImage` clones whatever `InfoLayer` subclass the source view has and calls its
  `paint()`, so a no-op stub meant zero annotation ever printed, contradicting a stale
  line in `film-composer-design-decisions.md` that was corrected this session too).
  Fresh implementation (can't import viewer2d's `InfoLayer` directly, ADR-0003) in a
  new `org.weasis.dicom.filmcomposer.annotation.CornerAnnotationText` (pure, unit-tested
  string/geometry logic) + `FilmComposerInfoLayer.paint()` (thin, deliberately untested
  glue, matching `InfoLayer`'s own zero-test precedent). No new visibility-toggle needed
  — the existing `FilmJobOutputOptions.isShowingAnnotations()`/MCP `setFilmJobOutputOptions`
  toggle already worked structurally, it just had nothing to suppress until now. Code
  review caught a real regression before merge: the ported corner-loop dropped
  `InfoLayer`'s MIN_ANNOTATIONS ("minimal mode" — top-left shows only PatientName,
  top-right only SeriesDate) — restored via a `CornerAnnotationText.buildCornerLines`
  overload. Also fixed a pre-existing, unrelated bug found while in this code:
  `FilmComposerInfoLayer.getLayerCopy` silently ignored its `useGlobalPreferences`
  parameter. 230/230 filmcomposer tests pass. **Live-verified** via `weasis-mcp`'s
  `getFilmSheetPreview` against a real chest CT (AMENA BEGUM, series 6): all four
  corners render correctly matching the 2D viewer's own layout; `showAnnotations:false`
  confirmed to suppress the overlay in rasterized output only, live cell unaffected.
  Originated from a hospital screenshot the user marked up (four corner regions) via
  `/grill-film-composer`, same session. Also directly visually confirmed on-screen by
  the user in the live Sheet Tray grid after a clean rebuild + Felix-cache clear +
  relaunch — see [[corner-annotation-overlay-6g]].
- **6H** (2026-07-07) — default auto-fill grid raised from 2×2 to 4×6
  (`AUTO_FILL_DEFAULT_LAYOUT` in `FilmComposerContainer` — the grid a pristine
  Film Job's first sheet reshapes to before the seed series auto-paginates).
  Pristine-tab placeholder (1×1) and toolbar layout-picker dropdown (capped
  2×4) explicitly out of scope. 232/232 filmcomposer tests pass.
- **6I** (2026-07-07) — **grid shrink cascade**, the mirror of 6E. Field
  report: shrinking a sheet (toolbar -row/-col) silently dropped overflow into
  the private `unplacedCells` bucket (images vanish, sheet count doesn't grow to
  compensate — the opposite of grow). Fix: `resizeActiveSheetGrid`'s shrink
  branch now drains the just-bumped cells (new `FilmSheet.drainUnplacedCells()`,
  returns-and-clears) and cascades them forward through the contiguous run of
  dominant-series-qualifying downstream sheets (6E's stopping rule, reversed),
  pooling overflow + every qualifying sheet's own images and redistributing
  back across those same sheets at their existing shapes; any true remainder is
  packaged into new trailing sheet(s) sized to the active sheet's new (smaller)
  shape, spliced in via `addSheet`+`moveSheet` immediately after the last
  qualifying sheet — never appended past an unrelated later sheet. Also
  extracted `findDominantSeriesOnActiveSheet()` as a shared helper now used by
  both 6E (grow) and 6I (shrink). Deliberately scoped to the toolbar
  ±row/±col actions only; layout-picker dropdown + MCP `setActiveSheetLayout`
  keep the old unaffected-shrink contract (mirrors 6E's auto-fill being
  toolbar-only too). 241/241 filmcomposer tests pass; code review clean (no
  CRITICAL/HIGH). **One test-assertion correction during build:** the
  `…_shrinkRedistributionEmptiesADownstreamSheet_removesIt` test miscounted
  the pool (a qualifying sheet's images join the pool per the spec, so the
  emptied sheet's former image lands in the prior sheet's spare cell, not left
  empty) — production code was correct, test assertion was wrong, fixed to
  match. **Live click-through still outstanding** (toolbar buttons are
  human-click-only, no MCP wrapper) — same open live-verification item as 6E's
  own dedicated cascade pass.
**Key architecture calls:** two-bundle wall (ADR-0003 — filmcomposer depends on
explorer, never on/from viewer2d; cross-bundle reach goes through
`SeriesViewerFactory` hooks); **Way-2 flatten** (each sheet → one composited
8-bit raster → one Film Box; preview and printout share the exact
`ExportLayout`→`rasterize` path so WYSIWYG is structural); workstation-level audit
log with no user identity (ADR-0002).

## How it was built (methodology)
- **Dependency-ordered, TDD-friendly phases.** Protocol/model logic unit-tested
  before any UI. Hardest unknown (the print protocol) de-risked first (5A);
  local/PDF path verified before DICOM inside 5E.
- **"Data model + container method now, UI/entry-point wiring later."** Recurring
  seam: every phase built logic as plain container methods first, then wired the
  toolbar/menu in a later phase. Plans should follow this.
- **Reuse-first, but check the actual dependency wall first.** Leaned on existing
  Weasis: `ExportImage`/`DisplayOpManager` (per-cell rendering), `LoadSeries`/
  `DownloadManager` (retrieval), `AbstractDicomNode` XML pattern (persistence).
  `InfoLayer` (viewer2d's annotation painter) looked reusable but wasn't — ADR-0003
  blocks the cross-bundle dependency, so 6G had to freshly re-implement the same
  *behavior* against `weasis-dicom-codec`'s already-shared tag-config classes
  (`ModalityView`/`CornerInfoData`/`TagView`), not the class itself.
- **Each phase ends with a full regression run** (`mvn -pl ... test -o`) and its
  own detailed implementation note appended to `CLAUDE.md`.

## How bug findings go (the recurring pattern)
- **Verification is split:** unit-test everything that doesn't need a real mouse
  (logic, bindings, modifier checks, menu wiring); then **manually click-test
  gestures on a real running build** — the dev environment is headless-constrained,
  so gesture "feel" can't be unit-verified. This split is deliberate and repeats
  every phase.
- **Manual QA reliably surfaces bugs unit tests miss** — e.g. the 5E black-cell
  rendering bug (0×0-component race on hydrate, fixed via a
  `registerDefaultListeners()` override — ADR-0004), and four separate 5G3 bugs
  (missing WINLEVEL special case, no-op `updateComponentsListener` stub leaving
  actions disabled, `repaint()` vs `updateAffineTransform()`).
- **Environment gotcha, suspect it first:** a **stale Felix OSGi bundle cache**
  (`~/.weasis/cache-*`) silently shadows rebuilds — delete it before
  re-diagnosing code when a rebuild "doesn't take."
- **Headless test seams:** dialogs hang tests; use package-private
  functional-interface seams (e.g. `setAutoFillOverflowDecisionForTesting`)
  instead of forcing `-Djava.awt.headless=true` (which breaks `SynchView` init).
- **Known open bug:** Ctrl+drag cell-to-cell swap is built + unit-tested but
  manually confirmed NOT working on a live build; root cause undiagnosed (leading
  suspect: WINLEVEL `SliderChangeListener` swallowing the drag before
  `dragGestureRecognized`). Deferred by explicit user sign-off.
- Full investigation records live alongside the code:
  `docs/Printing_module/black-cell-rendering-bug-plan.md` and
  `black-cell-rendering-bug-handover.md`.

## MCP M3 will touch this module's code (planned, not yet built)
`weasis-mcp`'s M3 (see [[mcp-ai-control-surface]]) plans a small number of gap-fixes
*inside* this module itself, approved 2026-07-05: input validation on
`FilmSheet.setOrientation`, `applyTemplate` throwing instead of silently returning
`false`, a `FilmJobSubmitter` refactor splitting EDT-required rasterization from
off-EDT DICOM network I/O, and a timeout guard on `LocalFilmPrintJob`'s OS print
dialog. These are AI-exposure correctness fixes, not part of the deferred 5H/
Ctrl+drag-bug core-hardening work above, which stays untouched and separately
tracked.
