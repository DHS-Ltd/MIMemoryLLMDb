# Film Composer — Architecture Map

Curated pointer list for priming `grill-film-composer`. Read this first, then
open only the specific files a given finding touches. Paths are relative to the
project root `e:\DHV-Weasis`; the module lives under
`DHDicomViewer/dh-dicom-viewer/`.

> Keep this map current. When a grill session has to read code this map doesn't
> point at, add the pointer here before finishing (see the skill's `<self-growth>`).

## The two bundles (and the wall between them)

- **`weasis-dicom-filmcomposer`** — the module. Depends on
  `weasis-dicom-explorer` + `weasis-dicom-codec` (both `provided`).
  **Must never depend on `weasis-dicom-viewer2d`, and viewer2d must never depend
  on it** — forbidden in *both* directions. **ADR-0003.**
- **`weasis-dicom-explorer`** — holds the DICOM Print SCU protocol and the PACS
  study browser. The protocol extension for multi-sheet printing lives *here*,
  not in the filmcomposer bundle.
- **The cross-bundle trick:** when explorer/viewer2d needs to launch or reach the
  Composer without importing it, dispatch through interface hooks on
  `SeriesViewerFactory` (`getFilmComposerAction`, `getSeriesContextAction`) —
  pure-interface, zero compile-time dependency. This is how both the
  `DicomExplorer` context menu (5G) and the `View2dContainer` Print submenu (5G2)
  reach the Composer.

## Core classes (what already exists — reuse before building)

**Protocol / output (in `weasis-dicom-explorer`, `.../print/`)**
- `DicomPrint` — `openSession()` → `printFilmBox()` (×N, one per sheet, N-ACTION
  per box) → `closeSession()`; multi-Film-Box in one session; partial-failure
  retry. Static `rasterize(ExportLayout, DicomPrintOptions)` is the **Way-2
  flatten** (WYSIWYG, 8-bit, film-native resolution = FilmSize × DPI). Each Film
  Sheet → one flattened raster → one Film Box.
- `DicomPrintOptions` — Film-Box-level attributes (film size, orientation,
  magnification, density…); has `copy()` for per-sheet snapshots.

**Plugin / launch (filmcomposer bundle)**
- `FilmComposerFactory implements SeriesViewerFactory` — `canReadMimeType`→false
  (never the default handler); static `getFilmComposerAction(MediaSeries)` opens
  a tab; `getSeriesContextAction(series)` gated by `isReadyToFilm` (series loaded
  + not still downloading + non-empty).
- `FilmComposerContainer extends DicomViewerPlugin`/`ImageViewerPlugin` — owns
  one `FilmJob` per tab. Key methods: `addSheet`/`removeSheet`/`moveSheet`/
  `selectSheet`/`setActiveSheetLayout`/`setActiveSheetOrientation`;
  `assignSeriesToCell`/`swapCells`/`clearCell`; `autoFillFromSeries`;
  `isPristine`/`applyTemplate`/`resetToPristine`;
  `rasterizeSheet`/`rasterizeAllSheets`. Only the **active** sheet is a live
  `ViewCanvas` grid; switching serializes-out / hydrates-in.
- `FilmComposerView extends DefaultView2d` — one cell. Context menu
  (Clear + Rotate/Flip); `rotateBy`/`setRotation`/`toggleFlip` write
  `actionsInView` directly + call `updateAffineTransform()`. Overrides
  `registerDefaultListeners()` for the resize-race fix (**ADR-0004**).
- `FilmComposerEventManager extends ImageViewerEventManager` — mirrors the small
  `weasis-base-viewer2d` EventManager (673 lines), **not** viewer2d's 2140-line
  one. Registers WINDOW/LEVEL/ZOOM/ROTATION/PAN/FLIP. **Fixed** mouse bindings
  (ignores the operator's global mouse prefs): `left=WINLEVEL, middle=PAN,
  right=CONTEXTMENU, wheel=ZOOM`.

**Model (`.../filmcomposer/model/`)**
- `FilmJob` — mutable aggregate root (deliberate exception to immutability):
  ordered `FilmSheet`s + active index.
- `FilmSheet` — a `MigLayoutModel` grid + `CellAssignment` per position +
  `orientation` (independent of the grid; survives `setGrid`). `setGrid`
  grow/shrink is non-destructive (overflow → `unplacedCells`, never deleted).
- `CellAssignment` (record: position/series/image/`CellDisplayState`, null =
  empty), `CellDisplayState` (W/L, zoom, pan, rotation, flip, LUT — clones the
  display-op pipeline like `ExportImage` does).

**UI panels (filmcomposer bundle)**
- `SeriesRailPanel` (left — drag source, reuses `SeriesPane`/`SeriesThumbnail`),
  `SheetTrayPanel` (right — `JList` add/remove/move/select),
  `FilmComposerToolBar` (a dedicated `WtoolBar`, not the shared `ViewerToolBar`:
  layout dropdown, orientation toggle, Preview/Print, Template Manager),
  `FilmProofSheetPreviewDialog` (the required preview→confirm gate),
  `FilmCellTransferHandler` (drop target + Ctrl-drag swap source).

**Output pkg (`.../filmcomposer/output/`)**
- `FilmJobOutputOptions` (job-level: film size, copies, medium, annotations,
  destination — `dicomNode == null` means local/PDF),
  `SheetOutcome`/`FilmJobSubmitResult`, `LocalFilmPrintJob implements Printable`
  (one multi-page OS job — "PDF" = the OS's registered PDF printer, no PDF lib),
  `FilmJobAuditLog` (workstation + timestamp, **no** user identity — **ADR-0002**),
  `FilmJobSubmitter` (orchestrates submit + stop-on-first-failure + retry).

**Template pkg (`.../filmcomposer/template/`)**
- `FilmTemplate` (record: name + `List<SheetShape>`; grid shape only — never
  images, never orientation), `FilmTemplateStore` (XML in the bundle data folder,
  `AbstractDicomNode` persistence pattern), `FilmTemplateManagerDialog`.

## The ADRs — read the one your finding touches

- **0001** — Film Composer built from scratch (not a reused OSS composer).
- **0002** — audit log is workstation-level, no per-technologist identity.
- **0003** — bundle placement + the no-cross-bundle-with-viewer2d rule.
- **0004** — the film cell mirrors View2d's lifecycle (resize-race listener).
- **0005** — worklist entry point is `DicomExplorer`, not `WorklistDialog`
  (acquisition MWL) or `DicomQrView` (the Q/R search dialog).

## Reuse surface (Weasis parts to lean on, not rebuild)

Per-image rendering: `ExportImage` / `DisplayOpManager`. Annotation burn-in:
`InfoLayer` / `DicomPrintOptions.isShowingAnnotations()`. Retrieval:
`LoadSeries` / `DownloadManager`. Local/paper print: `ImagePrint` /
`ExportLayout` / `PrintDialog`. Persistence pattern:
`BundlePreferences.getFileInDataFolder` + `AbstractDicomNode` XML streaming.

**Corner-annotation overlay (`InfoLayer`/`FilmComposerInfoLayer`) — mapped in
full 2026-07-07, field study.** `FilmComposerInfoLayer`
(`.../filmcomposer/FilmComposerInfoLayer.java`, top-level package) has existed
since early phases but its `paint()` is a literal no-op stub — **do not trust
its own Javadoc**, which claims annotations are "already" burned in via the
print path; that's false (see below). The real corner-painting reference is
`weasis-dicom-viewer2d/.../InfoLayer.java` (`AbstractInfoLayer<DicomImageElement>`
subclass, ~950 lines) — **cannot be imported directly** (ADR-0003: no
filmcomposer→viewer2d dependency), must be freshly re-implemented. What
`InfoLayer` actually depends on, and where each piece lives:
- **Already a shared dependency (`weasis-dicom-codec`), reuse as-is:**
  `ModalityView.getModlatityInfos(Modality)` / `CornerInfoData.getCornerInfo
  (CornerDisplay.TOP_LEFT|TOP_RIGHT|BOTTOM_RIGHT)` / `TagView` — the
  per-modality "which DICOM tag goes in which corner" table (IHE BIR RAD
  TF-2 §4.16.4.2.2.5.8-driven). Zero duplication needed for this part.
- **viewer2d-only, must be dropped (dead for a film cell, not worth writing):**
  the two `instanceof MprView` branches (`paintMprTransformationMessage`,
  `paintPlanIndicator`) — a `FilmComposerView` can never be an `MprView`.
- **viewer2d-only, must be simplified:** `PRManager.getPrDicomObject(...)`
  (used only by the "W/L outside recommended levels" red-warning check) —
  Film Composer has no Presentation-State support anywhere today, so a fresh
  port passes `null` instead, same as a view with no loaded PR.
- **Already available via the existing explorer dependency:** `DicomModel
  .getParent`/`getRejectionKoSpecialElement` (`weasis-dicom-explorer`,
  already a filmcomposer dependency per ADR-0003) — port these call sites
  unchanged.
- **`AbstractInfoLayer.visible` defaults to `true`** (`weasis-core`) — so once
  `FilmComposerInfoLayer.paint()` is real, live cells show the overlay with
  *zero* new visibility wiring.
- **The print-time toggle already works structurally, just had nothing to
  hide:** `ExportImage`'s constructor does `sourceView.getInfoLayer()
  .getLayerCopy(this, false)` and its `draw()` calls `infoLayer.paint(g2d)` —
  so the *cloned* copy used for rasterize/print already inherits whatever
  `paint()` does. `DicomPrint.formatImage()` already forces that cloned
  copy's `setVisible(false)` when `DicomPrintOptions.isShowingAnnotations()`
  is false (already wired end-to-end to MCP's `setFilmJobOutputOptions`) —
  this needed no new code, it was just suppressing a no-op.
- No test file exists for `InfoLayer.java` anywhere in the repo — painting
  code in this codebase is consistently left as thin, untested Swing glue
  (same precedent as every dialog-wiring class since 5E/5F); a fresh
  `FilmComposerInfoLayer.paint()` should follow the same split: port the
  *pure string-building* helpers (`getFormattedTag`/`buildFrameText`/
  `buildWindowLevelText`/etc. — all `Graphics2D`-free) into a separate,
  unit-tested class, and leave only the actual `Graphics2D` layout/painting
  untested.

**Grid grow/shrink/merge (`weasis-core/.../api/gui/layout/` +
`.../ui/editor/image/`)** — the v1 "Grid shape" deferral (uniform grids only,
no resize/merge) undersold how much already exists one layer up, in
`weasis-core` itself, unused by Film Composer:
- `MigCell` (record: `position`/`x`/`y`/`spanX`/`spanY`) + `MigLayoutModel`
  (`getGridSize`, `getCellCount`, `getCells`, `copy`, `setColumnConstraintSpecs`)
  — a merged/spanned cell is just a `MigCell` with `spanX`/`spanY` > 1; the grid
  is not required to be uniform at the model level, only Film Composer's own
  `LAYOUT_LIST` happens to only contain uniform presets so far.
- `MergedCellsBuilder` — fluent builder for a `MigLayoutModel` with one or more
  spanned cells. **Already used in production**, not experimental: base
  `ImageViewerPlugin`'s own `VIEWS_2x2_f2`/`VIEWS_2_f1x2` ("3 views
  (right/top merged)") and `MprContainer`'s 4 merge variants (left/right/
  top/bottom-merged 3-view layouts).
- `GridMouseHandler` — drag-to-resize-cell-borders by dragging near a cell
  boundary. **Already wired unconditionally** in `ImageViewerPlugin`'s
  constructor (`grid.addMouseListener`/`addMouseMotionListener`), so it is live
  on every `FilmComposerContainer` sheet today — there's just no toolbar
  affordance surfacing it yet (a separate, still-genuinely-deferred v2 item;
  don't confuse with cell-span merging, which 6A/6B do build).
- `LayoutCellManager`/`CellEntry` (`getPosition()`, `getCell()`, `getAllEntries()`,
  `getComponent(position)`) — how to find a `MigCell`'s x/y/span from a live
  `ViewCanvas`, needed to compute a merge's left/right neighbor position.
- `FilmSheet.setGrid`/`getCells` (filmcomposer bundle) is **already
  span-agnostic** — it works purely off `MigCell.position()`, so a merged
  `MigLayoutModel` round-trips through the existing non-destructive
  preserve/`unplacedCells` logic with zero model changes. A cell whose position
  disappears from the new grid (e.g. absorbed by a merge) already falls into
  `unplacedCells` for free.
- See `docs/Printing_module/film-composer-design-decisions.md`'s 2026-07-05
  field-study rows (grid grow/shrink, merge semantics) and Build order 6A/6B
  for the plan that reuses all of the above.

## Selection & keyboard focus mechanics — mapped in full 2026-07-07, field study (6L)

Researched while planning 6L (cell Arrow-key navigation + Series Rail
keyboard selection). None of this was previously in this map; add pointers
here rather than re-deriving it next time.

- **The Active cell's yellow-border highlight already exists and already
  works, unmodified since 5C/5G3 — not something 6L had to build.**
  `ImageViewerPlugin.setSelectedImagePane(ViewCanvas)` (`weasis-core`, public)
  calls `ViewCanvas.setSelected(Boolean)`; `DefaultView2d.setSelected`
  (`DefaultView2d.java:758-769`) directly swaps the cell's border between
  `viewBorder` (gray) and `focusBorder` (`IconColor.ACTIONS_YELLOW`,
  `ViewCanvas.java:92-94`). `FilmComposerView` never overrides either method —
  it inherits a working highlight for free. `getSelectedViewCanvas()`
  (`ImageViewerPlugin`, public) reads it back.
- **Every mouse click already sets the Active cell, regardless of which mouse
  action is bound.** `FocusHandler.mousePressed` (`weasis-core`) calls
  `requestFocusInWindow()` then `pane.setSelectedImagePane(viewCanvas)`
  unconditionally — this is why WINLEVEL/PAN/CONTEXTMENU/ZOOM (5G3's fixed
  bindings) never had to special-case "also select this cell."
- **Plain Swing Tab/Shift-Tab traversal across grid cells already works** —
  no custom `FocusTraversalPolicy` exists anywhere in `ImageViewerPlugin`'s
  grid construction, and `ViewCanvas.defaultKeyPressed` never consumes
  `VK_TAB`. Arrow-key 2D navigation, by contrast, does not exist anywhere —
  no `ID_VIEWER_*` `ShortcutManager` constant maps to a raw arrow key.
- **Resolving a `ViewCanvas`'s grid coordinates (for Arrow-key stepping) is a
  manual scan, not a built-in lookup — but the building blocks all already
  exist.** `LayoutCellManager.findPositionOfViewCanvas(ViewCanvas)` → `int`
  position (already used by `FilmCellTransferHandler`'s cell-swap code);
  `LayoutCellManager.getEntry(position)` → `CellEntry`; `CellEntry.getCell()`
  → `MigCell` with public `x()`/`y()`/`spanX()`/`spanY()` accessors
  (`weasis-core/.../gui/layout/MigCell.java`, a record). There is no "get cell
  at (x, y)" or "get neighbor in direction" helper — 6L's
  `moveSelectionInDirection` scans `getAllEntries()` computing whether each
  entry's `[x, x+spanX) × [y, y+spanY)` rectangle contains the target point,
  which is also how it resolves correctly into a 6B merged cell instead of
  missing it.
- **`weasis-dicom-explorer`'s `SeriesSelectionModel`
  (`.../explorer/main/SeriesSelectionModel.java`) is a complete, proven
  multi-select model — click/Ctrl/Shift + keyboard (`selectNext`/
  `selectPrevious`/`selectFirst`/`selectLast`/`selectAll`) + visual feedback
  (background/foreground color swap) — driving the main `DicomExplorer`'s own
  thumbnail selection via `ThumbnailMouseAndKeyAdapter`
  (`.../explorer/main/ThumbnailMouseAndKeyAdapter.java`).** **Deliberately not
  reused for the Series Rail** (6L): it is one global static instance
  (`ThumbnailMouseAndKeyAdapter.getSeriesSelectionModel()`) scanning real
  `StudyPane`/`SeriesPane` instances the rail can never construct (5C's
  thumbnail-theft hazard, see below) — reusing it verbatim would make
  selecting a series in the Composer's rail also change the main DICOM
  Explorer dock's own highlighted selection, an unwanted cross-panel side
  effect given both panels are already visibly showing the same study
  side-by-side (see `redundant_display_worklist` in the field findings
  backlog). 6L ports the *interaction algorithm* (single-select subset of it)
  into a new, rail-scoped selection instead of reusing this class or its
  static instance.
- **`SeriesThumbnail` (`weasis-core`, extends `Thumbnail`) has no selection
  state of its own anywhere in the codebase** — `SeriesSelectionModel`'s
  visual feedback is applied to the thumbnail's *parent* container
  (`updateThumbnailVisualState`), not the thumbnail itself. `SeriesRailPanel`
  (5C) already wraps each `SeriesThumbnail` in its own independent `JPanel`
  per `buildRailItem` — 6L's selection highlight is applied to that same
  wrapper panel (a border, for visual-language consistency with the Active
  cell's border, rather than `SeriesSelectionModel`'s background/foreground
  swap convention).

## Multi-select (Rail + Cell batch selection) — mapped in full 2026-07-07, field study (6M)

Researched while planning 6M (Rail batch selection + Cell batch selection,
via `/grill-with-docs`). A load-bearing constraint was found mid-grill that
overturned an already-locked answer — record it here so it's never
re-discovered the hard way.

- **`weasis-core.FocusHandler` is `final` and unconditionally moves the
  Active cell on every mouse click, Ctrl/Shift held or not — it cannot be
  intercepted, suppressed, or subclassed.** (`weasis-core/.../editor/image/
  FocusHandler.java`, registered in `DefaultView2d.registerDefaultListeners()`,
  which `FilmComposerView.registerDefaultListeners()` already calls via
  `super()` before adding its own listeners — see the 6K/ADR-0004 override.)
  This means "Ctrl-click toggles a cell into a batch *without* moving the
  Active cell" is not achievable: the Active cell will always jump to
  whatever was clicked. 6M's grid batch-selection design was corrected
  mid-session once this was confirmed against the actual class (not assumed) —
  see `film-composer-design-decisions.md`'s "Cell batch selection is
  architecturally independent of the Active cell" row for the full
  before/after. **Any future finding that wants a click modifier to *not*
  move the Active cell must design around this constraint from the start,
  not assume it's interceptable.**
- **Resolution pattern for the above:** track a *separate* `anchorPosition`
  (updated only on a plain, unmodified click/Arrow-key move) instead of
  reusing the Active cell as the anchor for a Shift-click/Shift+Arrow range —
  the Active cell can't serve that role once it's confirmed to move on every
  click including modified ones. Bulk actions target the batch set if
  non-empty, otherwise fall back to the Active cell alone (zero regression
  to today's single-cell behavior when no batch exists).
- **`GuiUtils.IconColor` enum (`weasis-core/.../api/gui/util/GuiUtils.java`)**
  already defines `ACTIONS_YELLOW` (used by the Active cell/Rail selection
  anchor), plus `ACTIONS_BLUE`/`ACTIONS_RED`/`ACTIONS_GREEN`/`ACTIONS_GREY` —
  reused as-is for 6M's batch-highlight color (`ACTIONS_BLUE`), no new color
  introduced anywhere.
- **Confirmed via a dedicated Explore pass: no multi-pane/multi-cell
  selection concept exists anywhere in `weasis-core` or any Weasis module.**
  `ImageViewerPlugin.selectedImagePane` is a single field, never a collection;
  `LayoutCellManager` holds zero selection state; no `ViewCanvas.setSelected`
  call anywhere sets more than one pane `true` at a time. 6M's Cell batch
  selection is therefore a green-field, Film-Composer-local model — same
  shape as how 6L's Rail selection was built fresh instead of reusing the
  global `SeriesSelectionModel`, just with no Weasis-wide precedent at all
  this time (not even a rejected-reuse candidate).
- **`SeriesRailPanel`'s current fields as of 6L** (relevant to extending it
  for 6M): `entries` (`List<RailEntry>`, ordered, parallel to on-screen
  items), `selectedIndex` (single int, the anchor) — 6M adds a second,
  independent `Set<Integer>` (or equivalent) for the batch, without touching
  `selectedIndex`'s existing semantics. `RailItemSelectListener`/
  `RailKeyListener` are the two existing listener classes that would need
  Ctrl/Shift-modifier branches added.
- **The anchor (Active cell / Rail selection) is never automatically a batch
  member — any bulk operation reading "what's selected" must explicitly union
  the anchor in, or it silently drops it.** Found live during 6M's own
  verification, twice (once per panel): `toggleBatchMember`/
  `toggleCellBatchMember` only ever add the *Ctrl-clicked* item to the batch;
  the plain-clicked anchor is tracked by a separate field entirely. The
  ordinary "plain-click A, then Ctrl-click B" gesture visually highlights
  both (anchor yellow + batch blue) but left the batch set at size 1 (just
  B), so any code gating on `batchSelection.size() >= 2` for "is this really
  a multi-selection" silently treated it as size-1/no-batch and dropped A
  entirely. Fixed on the Rail via a point-of-use union
  (`effectiveBatchSelectionForBulkAssign`); fixed on the grid by seeding
  `cellBatchSelection` with the anchor's own position at the moment it's set
  (`clearCellBatchSelectionWithAnchor`), so a following Ctrl-click naturally
  grows it to size 2. **Any new bulk-selection consumer must account for this
  — don't assume `size() >= 2` or "non-empty" alone means the anchor is
  included.**
- **A `MouseListener` added anywhere other than `iniDefaultMouseListener()`
  will be silently and completely removed the next time mouse-action
  bindings are (re)applied — this is not about listener *order*, it's
  removed entirely.** `ImageViewerPlugin.setMouseActions` (called whenever
  mouse bindings are set, e.g. per-cell during construction/hydration) calls
  `ViewCanvas.enableMouseAndKeyListener`, which calls
  `disableMouseAndKeyListener(Component c)` first — that method does
  `c.getMouseListeners()` and removes **every single one**, with no
  filtering for "was this one added by the framework." It then calls
  `iniDefaultMouseListener()` to reinstall `focusHandler` fresh. A listener
  added in a constructor, or in `registerDefaultListeners()` (`DefaultView2d`'s
  own `registerDefaultListeners()` only does `addFocusListener`/tooltip/
  layer-change wiring — `focusHandler` itself is added by
  `iniDefaultMouseListener()`, a *different* method, called from a
  *different* place: `ViewCanvas`'s own `enableMouseAndKeyListener` default
  method), survives only until the next `setMouseActions`/
  `enableMouseAndKeyListener` cycle, at which point it's gone completely —
  not just misordered relative to `FocusHandler`. This cost two wrong fix
  attempts during 6M's live verification (Ctrl-clicking a grid cell visibly
  never turned blue, with the listener registered in both the constructor
  and in `registerDefaultListeners()`) before the real fix was found:
  **override `iniDefaultMouseListener()` itself**, call
  `super.iniDefaultMouseListener()` first (reinstalls `FocusHandler`), then
  add the custom listener — this is the one hook guaranteed to re-fire
  alongside every wipe, and guarantees the custom listener's `mousePressed`
  always runs after `FocusHandler`'s own (which unconditionally moves the
  Active cell first, Ctrl/Shift held or not). **Any future finding that
  needs a custom mouse listener on a cell must register it this way, not via
  the constructor or `registerDefaultListeners()`.**

## Film Batch Display Sync (live W/L/zoom/pan batch sync) — mapped in full 2026-07-08, field study (6N, planned)

Researched while planning 6N (`/grill-with-docs`). Not built yet as of this
writing — see the backlog/design-decisions/build-guide for the locked design.
Record the API facts here so a future session doesn't have to re-derive them.

- **Every W/L/zoom/pan/rotate/flip mouse-drag tick funnels through exactly one
  choke point:** `ImageViewerEventManager`'s `newWindowAction()`/
  `newLevelAction()`/`newZoomAction()`/`newPanAction()` factories (`weasis-core`)
  each return a `SliderChangeListener`/`PannerListener` whose `stateChanged`/
  `pointChanged` does nothing but
  `firePropertyChange(ActionW.SYNCH.cmd(), null, new SynchEvent(getSelectedViewPane(), cmd, value))`
  — a single shared broadcast on the `FilmComposerEventManager` singleton. This
  is the *only* per-tick hook available; these mouse-action classes are not
  Film-Composer-subclassable per cell.
- **`DefaultView2d.propertyChange(SynchEvent)` (the method that actually
  mutates a cell's display-op pipeline in response to that broadcast) is
  `private`.** There is no way to hand a `SynchEvent` to an arbitrary
  `ViewCanvas` directly — the only way a cell ever sees a tick's value is by
  being a registered `PropertyChangeListener` for `ActionW.SYNCH.cmd()` on the
  eventManager itself.
- **`FilmComposerEventManager.updateComponentsListener` (5G3/M2d-era) registers
  only the currently-selected cell as that listener** — `clearAllPropertyChangeListeners()`
  then `addPropertyChangeListener(SYNCH, viewCanvas)` for exactly one view,
  every time selection changes — "Film Composer never wants view-to-view synch
  between cells," by design. 6N's batch-sync listener must be **additive**
  to this (registered alongside it, not replacing it), and — since
  `clearAllPropertyChangeListeners()` wipes on every selection change, the
  same "silently and completely removed" shape 6M already hit once for
  `MouseListener`s via `iniDefaultMouseListener()` — must be re-added inside
  `updateComponentsListener` itself on every call, positioned *after* the
  self-listener registration so `PropertyChangeSupport`'s registration-order
  dispatch guarantees the self-listener (which actually mutates the dragged
  cell's own pipeline) runs before the batch listener (which reads the
  dragged cell's *resulting* state to push onto others).
- **`weasis-core` already has a complete, working multi-pane live-sync
  mechanism for exactly this class of problem** — `SynchView`/`SynchData`/
  `SynchEvent` (`weasis-core/.../ui/editor/image/`), used by the standard 2D
  viewer's TILE-mode N-up sync. `DefaultView2d.propertyChange(SynchEvent)`
  already applies WINDOW/LEVEL/ZOOM as **absolute values**
  (`manager.setParamValue(WindowOp.OP_NAME, cmd, absoluteValue)`, `zoom(absoluteValue)`)
  and PAN as a **relative delta from each pane's own `startedDragPoint`**
  (`PanPoint`'s `DRAGGING` state, `moveOrigin`) — this is real, reusable prior
  art that resolves most of 6N's open questions for free. **Explicitly
  evaluated as a reuse candidate for 6N and explicitly rejected by the user**
  in favor of a separate, Film-Composer-local mechanism that leaves
  `updateComponentsListener`'s existing single-listener design completely
  untouched — see the design-decisions row. A future finding that wants
  cross-cell live sync should still consider this mechanism first; it was
  rejected here on the user's explicit preference, not because it doesn't work.
- **Already-public APIs directly useful for pushing an absolute value onto a
  cell that isn't the one being dragged** (all confirmed on `ViewCanvas`/
  `DefaultView2d`, no new accessors needed): `ViewCanvas.setCenter(Double, Double)`
  (interface-level, public — absolute pan), `DefaultView2d.zoom(Double)`
  (public, concrete class only — absolute zoom), `ViewCanvas.getDisplayOpManager()`
  (interface-level, public — reach `OpManager.setParamValue(WindowOp.OP_NAME, cmd, value)`
  for W/L). **Not on the interface, concrete-class-only:** `getImageLayer()`
  (needed for `updateDisplayOperations()` after a W/L change) and `zoom(Double)`
  itself — so container-side code pushing these values still needs the same
  `instanceof FilmComposerView` cast 6M's `rotateBatchOrActiveCell` already
  uses, not a raw `ViewCanvas` reference.
- **`CellBatchSelectListener.mousePressed`'s plain-`BUTTON1` branch (6M) originally
  had no "already a batch member" check** — it unconditionally collapsed the
  batch on every plain left-button press. Since WINLEVEL is bound to the
  plain left button, this would have silently destroyed the batch the
  instant a W/L drag started on any cell — found by reading the code during
  6N's grilling, before any live testing. PAN (middle button) and ZOOM
  (wheel) never hit this branch at all, only left-button W/L. **6N shipped,
  built 2026-07-08: the click-vs-drag decision is deferred to
  `mouseReleased`**, not decided immediately on `mousePressed` — see the next
  bullet for why the simpler immediate-decision version was rejected.
- **A "click on an already-selected item preserves the batch" fix that
  decides on `mousePressed` is not enough — real hospital UX needs a genuine
  click-and-release to still be able to collapse the batch, found only by
  live testing.** 6N's first cut (any plain press on a batch member
  unconditionally preserves it) built clean, passed its own unit tests, and
  passed the live-verification regression check for "click outside the
  batch still collapses it" — but the user, watching it work, rejected it:
  a technologist needs to be able to plain-click into one batch member to
  adjust it alone, and the unconditional-preserve version removed that
  entirely (no click-based way back to single-cell mode once inside a
  batch). Fixed by deferring to `mouseReleased`: record the press point,
  compare it to the release point against `java.awt.dnd.DragSource.getDragThreshold()`
  (Java's own platform drag-gesture threshold — reuse this rather than
  inventing a tolerance constant) — no real movement collapses the batch,
  real movement (a genuine WINLEVEL/PAN drag) preserves it. **Any future
  finding that wants to distinguish "a click" from "the start of a drag" on
  the same mouse button should use this exact `DragSource.getDragThreshold()`
  press/release-point-comparison pattern**, not a `mousePressed`-only
  decision.
- **A live report that a sync mechanism "looks relative instead of
  absolute" is not automatically a bug — check the final resting state, not
  just the motion, before assuming the math is wrong.** 6N's pan sync was
  reported as looking relative during a live test; temporary diagnostic
  logging (`LOGGER.warn` on each tick's source/target offsets, added then
  removed) proved every tick converged exactly, from the very first one.
  Once two cells are locked to an identical value, every subsequent tick
  moves both by the same visual amount together — which looks visually
  identical to relative panning unless you specifically catch the initial
  snap (easy to miss, happens within the first few pixels of drag movement)
  or check the cells' final position after release. **Before treating a
  live "looks wrong" report as a bug, ask the reporter to check the final
  state specifically, not just the in-motion feel** — this one turned out to
  be a perception artifact, not a defect, and cost a full diagnostic
  logging + rebuild + relaunch cycle to confirm.
- **Runtime `LOGGER.warn`/`.info` calls do not appear in `~/.weasis/log/boot.log`
  in this environment — only startup boilerplate does.** When launching the
  app in the background for a diagnostic session (e.g.
  `java -cp weasis-launcher.jar;felix.jar org.weasis.launcher.AppLauncher > some.log 2>&1 &`),
  check the **redirected stdout/stderr file**, not `boot.log`, for any
  logging added after the app has finished starting. Found while diagnosing
  6N's pan-sync report: `boot.log`'s last line stayed frozen at "Starting
  OSGI Bundles..." throughout, while the actual runtime `LOGGER.warn` output
  landed in the launch process's own redirected output file the whole time.

## AI Control Surface (`weasis-mcp`) — Film Composer tools

**CLAUDE.md's MCP section header still says M3 is "not yet built" — that's stale.**
Per memory and this file listing, M3a-M3f are fully built (only `submitFilmJob`'s
visual Confirm Gate stayed schema-only per the last status note) — don't trust
that one header line, check `weasis-mcp/src/main/java/org/weasis/mcp/tools/filmcomposer/`
directly. Key classes: `FilmComposerLookup` (live tab enumeration/`tabId`
resolution — untested glue), `FilmJobDescriber` (tested pure logic building MCP
response records from an already-obtained `FilmJob`), one class per tool
(`GetFilmJobStateTool`, `ListFilmSheetsTool`, `AddSheetTool`, `SelectSheetTool`,
`SetActiveSheetLayoutTool`, `AssignSeriesToCellTool`, `SwapCellsTool`,
`ClearCellTool`, template tools, `SubmitFilmJobTool`, etc.).

**Read-only state tools (`getFilmJobState`/`listFilmSheets`) are exposed to the
"live-vs-model" staleness class documented below, and weren't fixed for it until
the 2026-07-06 second-visit field study (6E).** `FilmJobDescriber` takes a
`FilmJob` and reads sheets' `getCells()` straight from the model — it has no
container reference, so it can't reach the live canvas itself. The caller
(`GetFilmJobStateTool`/`ListFilmSheetsTool`) must sync the active sheet
(`FilmComposerContainer`'s `serializeActiveSheetFromCanvas()`, previously
private) *before* calling `FilmJobDescriber`, mirroring the exact fix already
applied to `isPristine`/`isSeriesAlreadyLoaded`/`placedImagesForSeries` inside
the container itself. If a future MCP read tool takes a `FilmJob` and reports
per-cell/pagination detail, check it does this sync first.

**Sheet-index reporting convention:** `FilmJobState.activeSheetIndex`/
`FilmSheetSummary.sheetIndex` are 0-based (matches `FilmJob.getActiveIndex()`),
but `SheetTrayPanel` shows the operator `index + 1` ("Sheet N"). When relaying
MCP-read sheet state back to a human, always convert — reporting the raw
0-based number as "sheet N" reads as off-by-one to whoever is looking at the
screen.

## Recurring patterns & gotchas (save future pain)

- **`hydrateActiveSheetToCanvas()` invalidates any previously-resolved `ViewCanvas`
  reference for the active sheet — it calls `setLayoutModel`, which rebuilds the
  grid and produces fresh `ViewCanvas` instances even when the shape doesn't
  change.** Any container method that needs to touch cells *beyond* the one it
  was directly called with (i.e. anything cross-sheet/cross-cell, not the
  simple "mutate this one live view in place" shape `assignSeriesToCell`/
  `swapCells`/the original single-cell `clearCell` used) should go through the
  model-write-then-hydrate pattern (write every affected sheet's model via
  `FilmSheet.setCell`, then call `hydrateActiveSheetToCanvas()` once at the
  end) rather than trying to mutate live views directly mid-operation.
  **A caller holding a `ViewCanvas` resolved *before* such a call must
  re-resolve it by position *after* the call returns** — reusing the pre-call
  reference silently describes a stale, no-longer-live cell. This bit
  `weasis-mcp`'s `ClearCellTool` when `clearCell` (6D, 2026-07-07) was changed
  from single-cell mutation to a job-wide cascade that can rebuild the active
  sheet's grid — found only by live-testing against a real running app, not by
  any unit test (a mocked/unit-tested `ViewCanvas` doesn't distinguish "the
  same object" from "a different object with the same content").

- **"Data model + container method now, UI/entry-point wiring later."** Every
  phase built the logic first as a plain container method, then wired the
  toolbar/menu in a later phase. Plans should follow this seam.
- **Way-2 flatten is the rendering contract** — preview and printout share the
  exact `ExportLayout`→`rasterize` path, so WYSIWYG is structural. A finding that
  needs true 12-bit per-cell primary-diagnostic filming is *out of v1 scope* —
  flag it, don't casually absorb it.
- **Test bootstrap:** constructing any `ImageViewerEventManager` needs the JMX
  `ConfigData` MBean; the filtered `weasis-launcher/target/conf/base.json` must be
  built first. Run module tests offline: `mvn -pl
  weasis-dicom/weasis-dicom-filmcomposer test -o` (full reactor fails on
  pre-existing unrelated `weasis-core` test failures).
- **Headless dialogs hang tests** — use a package-private functional-interface
  seam (e.g. `setAutoFillOverflowDecisionForTesting(BooleanSupplier)`) instead of
  forcing `-Djava.awt.headless=true` (which breaks `SynchView` static init).
- **Stale Felix bundle cache** silently shadows rebuilds — if a rebuilt bundle
  "doesn't take," delete `~/.weasis/cache-*` before re-diagnosing the code.
- **Known open issue:** Ctrl+drag cell-to-cell swap is built + unit-tested but
  manually confirmed **not** working on a live build; root cause undiagnosed
  (leading suspect: the WINLEVEL `SliderChangeListener` swallowing the drag before
  `dragGestureRecognized`). A finding near cell drag interaction should account
  for this.
- **`MigCell.position()` is NOT a stable grid-coordinate ID — treat it as an
  opaque, renumbering value.** For a plain uniform `MigLayoutModel` (the
  `new MigLayoutModel(id, title, rows, cols, class)` constructor,
  `buildUniformLayout` in this bundle), `position() == y*cols+x` — stable only
  while `cols` doesn't change. For **any** `MergedCellsBuilder`-produced grid,
  `position()` is a sequential creation-order index instead (found reading
  `MigLayoutModel.createGridWithMergedCells`) — two cells at the exact same
  physical (x, y) spot can carry different `position()` numbers across two
  grid versions. `FilmSheet.setGrid` (the non-destructive preserve/`unplaced`
  contract every phase since 5C depends on) was fixed in the 2026-07-05 field
  study to match old↔new cells by `(x, y)` instead of by `position()` — do not
  reintroduce position-number matching in new code that reshapes a
  `FilmSheet`'s grid. If a finding needs to identify "the cell at grid
  coordinate (x, y)" from live UI state (e.g. a selected `ViewCanvas`), resolve
  it via `LayoutCellManager.CellEntry.getCell()` (`MigCell.x()`/`y()`) — never
  assume a `position()` number means the same thing before and after a reshape.

## Container top-level layout (`FilmComposerContainer`) — mapped in full 2026-07-07, field study

`ImageViewerPlugin` (the superclass) puts its own `grid` `JPanel` at `this`'s
`BorderLayout.CENTER` exactly twice: once in its own constructor
(`ImageViewerPlugin.java:169`), and once on cell-fullscreen exit
(`exitFullscreenMode`, `ImageViewerPlugin.java:785`) — `rebuildGridLayout()`
(the per-sheet-switch path) only ever mutates `grid`'s own children
(`grid.removeAll()`/`grid.add(...)`), it never re-parents `grid` itself, so
sheet switching alone is safe to build around. **Fullscreen is the hazard:**
`maximizedSelectedImagePane`/`enterFullscreenMode`/`exitFullscreenMode` forcibly
re-attach `grid` directly to `this`, unconditionally — anything else occupying
`BorderLayout.CENTER` (e.g. a `JSplitPane` wrapping the Series Rail + `grid`) gets
silently evicted the moment a cell is fullscreened and then un-fullscreened.
Fullscreen is reachable today via `ViewCanvas.defaultKeyPressed`'s
`ID_VIEWER_FULLSCREEN` handling, inherited unmodified by `FilmComposerView` since
5G3 — nothing in this bundle previously overrode or disabled it. 6K's resolution:
`FilmComposerContainer` overrides the public `maximizedSelectedImagePane` as a
no-op (fullscreen doesn't belong in this workspace per user sign-off), which also
makes the private hazardous methods unreachable. **If a future finding ever wants
fullscreen back in Film Composer, this collision must be re-solved, not just
re-enabled** — either patch the re-attachment (detect `grid` landed back as a
direct child of `this` and re-insert it into the split pane) or avoid a literal
`JSplitPane` for whatever new draggable UI prompted revisiting this.

**Reflow/resize reuse target:** `weasis-dicom-explorer`'s
`StudyPane.refreshLayout()` (`.../explorer/main/StudyPane.java:90-107`) is a
self-contained algorithm — no `DicomExplorer`/`DicomPaneManager` coupling in the
method itself — that recomputes a `flowx` MigLayout's `wrap N` from
`scrollPane.getViewport().getWidth() / (itemWidth + gap)` on every
`ComponentResizeHandler` callback. **Port the algorithm, never construct
`SeriesPane`/`StudyPane` instances directly in `weasis-dicom-filmcomposer`** —
`SeriesPane`'s constructor (`SeriesPane.java:94-103`) caches its thumbnail onto
the shared `DicomSeries` via `TagW.Thumbnail`; a second `SeriesPane` for the same
series silently steals the already-displayed component out of the main DICOM
Explorer sidebar (exactly the hazard `SeriesRailPanel`'s own 5C javadoc already
warns about for its `buildRailItem`/`SeriesPane.createThumbnail` approach).

**Open flag, parked 2026-07-07 - `redundant_display_worklist`:** live click-through
of 6K on a real `-Pmcp` build found that a widened `SeriesRailPanel` visibly
duplicates the same series thumbnails already shown in the ever-present global
DICOM Explorer dock, sitting side by side - a pre-existing trade-off from
`SeriesRailPanel`'s independent-panel design (5C), made visually obvious rather
than introduced by 6K. **Not grilled or fixed yet** - full detail, candidate
directions, and code pointers in
`docs/Printing_module/field-findings-backlog.md`'s `redundant_display_worklist`
entry. Any future fix here has to respect the same thumbnail-caching hazard
documented just above (no constructing real `SeriesPane`/`StudyPane` instances).

## Do-not-touch (hard constraints)

`org.weasis.*` package names; `"code"` fields in any JSON config; distribution
config = only *add* new `felix.auto.start.N` entries, never edit existing values;
anything under `target/`.

## Build / verify commands (from CLAUDE.md)

- Java changes: `mvn clean install -DskipTests` from project root.
- Config/asset changes: `mvn clean package -DskipTests` from `weasis-distributions/`.
- Module tests: `mvn -pl weasis-dicom/weasis-dicom-filmcomposer test -o`.
- Env: Java 25 (Temurin, `C:\java\Eclipse Adoptium\jdk-25.0.2.10-hotspot`),
  Maven 3.9.15.
- **Live (on-screen) verification** of a phase, once code+tests+review pass:
  `docs/MCP/live-verification-protocol.md` — the fixed, confirm-gated
  close-Weasis → full clean `-Pmcp` build → clear Felix cache → relaunch →
  MCP-handshake → walk-the-phase's-checklist sequence. `grill-film-composer`
  only *authors* the phase's checklist (Stage 5); this protocol is what
  *executes* it, later, during the build session — never run it from inside a
  grill session itself. Faster jar-hot-swap iteration during development (not
  for sign-off) is `docs/MCP/rebuild-and-relaunch-guide.md`.
