---
name: mcp-ai-control-surface
description: "The weasis-mcp subsystem — an in-process, dev-only MCP server that lets an AI observe and drive the live DHV viewer. M1, M2, and M3 (Film Composer surface, M3a-M3f) all fully closed: built, unit-tested, AND live-verified (2026-07-04/07-05) against a real -Pmcp build with real patient data, one tool at a time with human visual confirmation. Only exception: M3f's submitFilmJob Confirm Gate/print approval click was schema/code-review-verified but deliberately not live-triggered. Known non-bug finding: sheet orientation is print-time-only metadata, invisible in the live editor grid by design. Orientation + pointers to authoritative repo docs."
metadata: 
  node_type: memory
  type: project
  originSessionId: 9bbda442-24e3-4549-949b-54d24379e20d
aliases: [mcp_ai_control_surface]
---

**M3 (Film Composer surface) planned in full 2026-07-05, via `/grill-with-docs`.**
Scope deliberately narrowed first: M3 is the MCP tool surface only (apply the
M2-proven pattern to `weasis-dicom-filmcomposer`) — Film Composer's own deferred core
work (Phase 5H vendor conformance validation, the open Ctrl+drag cell-swap bug, see
[[film-composer-module]]) stays explicitly out of scope, not waived. Split into six
ordered sub-phases (M3a-M3f), full breakdown in `docs/MCP/mcp-design-decisions.md`
§6b. Two new ADRs: **ADR-0012** (addressing — tabId reused from the Tab concept +
plain sheet index + plain cell grid position, deliberately separate from ADR-0011's
View Handle since only the active `FilmSheet` ever has a live `ViewCanvas`;
cell-editing tools only ever target the active sheet) and **ADR-0013** (the Film Job
Confirm Gate shows a rasterized thumbnail gallery of the sheets, not text alone —
approving real multi-sheet clinical film/PDF output sight-unseen was judged a real
gap versus M1e's single-already-on-screen-view text-only precedent).

A code-grounded brainstorm (user asked explicitly: "what other gaps can we address")
surfaced five concrete AI-exposure gaps inside `weasis-dicom-filmcomposer` itself,
all approved for fixing as part of M3 (not deferred): (1) **thread-safety** —
`FilmJobSubmitter.submit` interleaves EDT-required rasterization with off-EDT-required
DICOM network I/O in one loop; the human path never notices since
`FilmProofSheetPreviewDialog.onConfirm` is itself already an EDT callback, but the AI
path has no such implicit context — needs a small refactor exposing the same
raster/submit split M1e's `printCurrentView` already uses. (2) **no timeout on local
print** — `LocalFilmPrintJob.printWithDialog()`'s OS dialog has no bound, unlike the
Confirm Gate's 10-minute auto-deny; an AI client's own timeout+retry risks a duplicate
physical/PDF print. (3) **no tab-cleanup tool** — `openFilmComposer` always opens a
new tab (matching real `FilmComposerFactory` behavior exactly), so a new
`closeFilmComposerTab` tool is needed or AI retries leave permanent clutter. (4)
**`setActiveSheetOrientation`/`FilmSheet.setOrientation` has no input validation** —
silently accepts any non-null garbage string; a human never hits this (dropdown-
constrained) but a direct AI call could. (5) **`applyTemplate` returns `false`
silently** on a non-pristine job instead of throwing a descriptive exception — an
ambiguous no-op for an AI caller versus a disabled-button no-op for a human.

Not yet built — planning only. Next step when resumed: M3a (addressing + open).

Architecture locked 2026-07-04 via `/grill-with-docs`; **Step 0 spike built and
verified end-to-end the same day** (still 2026-07-04, follow-up session) on branch
`spike/mcp-step0`, off a clean `master` (Film Composer phases 5A-5G3 committed as
`9f259718f` first, per user's explicit instruction — MCP work itself stays
uncommitted until all MCP work, not just Step 0, is finished). **M1a built and
verified the same day** (a third same-day session, via `/grill-with-docs` planning
then immediate build). **M1b built and verified the same day** (a fourth same-day
session, picked up from a `/handoff` doc): `org.weasis.mcp.edt.EdtInvoker` +
`EdtInvocationException`, TDD (7 tests), code-reviewed clean (java-reviewer agent,
no thread-safety/visibility/unwrapping bugs). **M1c, M1d, and M1e all built and
verified the same day too** (a fifth same-day session, user said "complete c, d,
e without compromising on tests, doc update once at the end"): `ConfirmGate`
state machine (M1c, 8 tests), `listBundles`/`tailLog`/`dumpViewRenderState` (M1d,
13 tests across `BundleListerTest`/`LogTailerTest`/`ViewRenderStateReaderTest`),
`printCurrentView` (M1e, 3 tests) — 39 tests total across the module, all green.
One code-review pass (java-reviewer agent) across all three phases together found
3 HIGH findings (uncaught `EdtInvocationException` in the print tool, unsafe
`ClassCastException`-risking casts on resolved DICOM nodes, `ConfirmGate`'s
`ScheduledExecutorService` never released) — all fixed same session, re-tested
green. **Live verification done 2026-07-05 (a sixth same-day-family session):**
built the `-Pmcp` distribution, launched it, and drove the whole surface via raw
curl + real human clicks on the `ConfirmGateDialog`, against a real loaded study
and a fake DICOM printer ("Test Printer" / AE `DHPRINTER`, deliberately
unreachable). All 5 tools round-tripped correctly, including `dumpViewRenderState`
in both its error and happy-path states. All three Confirm Gate outcomes verified
live: **Approve** (rasterized, submitted to the fake printer, cleanly caught the
expected `IOException` rather than crashing), **Deny** (clean immediate rejection,
no network attempt), **Timeout** (auto-denied + dialog auto-dismissed after the
full 10-minute window). Two operational gotchas surfaced only by live testing: a
curl client disconnecting via `-m` timeout does *not* stop the server-side blocked
`ConfirmGate.request()` call (proved the busy-guard works, since a second call in
that window correctly got `ConfirmGateBusyException`); and an abrupt client
disconnect invalidates that Streamable-HTTP session server-side, requiring a fresh
`initialize` to mint a new `Mcp-Session-Id`. **M1 is now fully closed.** M2/M3 not
started.

A new sibling OSGi bundle **`weasis-mcp`** running an **in-process MCP server** so an
external AI (Claude Code) can **observe and drive the live DHV viewer** — read
studies/series/metadata + current W/L/zoom/layout, control
W/L/zoom/navigation/layout/film arrangement on the real on-screen view — and grow as
the product develops. Also a dev channel.

**Step 0 proved:** embedded Jetty 12 (`jetty-ee10-servlet`) + the real MCP Java SDK
(`mcp-bom` v2.0.0 — corrected from an initial wrong assumption of pre-1.0) run inside
Felix/OSGi and a full MCP protocol round-trip (`initialize` → `tools/list` →
`tools/call ping`) works end-to-end via raw HTTP, verified before ever touching
Claude Code itself. Four real bugs only surfaced by actually launching the built
distribution (not by compiling/testing) — full detail in `CLAUDE.md`'s Step 0
implementation notes: (1) `javax.annotation` needed `resolution:=optional` in bnd
(Reactor-in-OSGi annotation-only reference), (2) a bundle's own `Import-Package`
override must re-add `org.slf4j;version=!` or it silently loses that
codebase-wide convention (slf4j is boot-classpath-provided with no OSGi version),
(3) `ServiceLoader`-based lookups (json-schema-validator) need the bundle's own
classloader set as the thread context classloader for the duration of the call,
(4) the auth token must be generated eagerly at bundle-start, not lazily on first
request, or the dev can never learn it to make that first request.

**Authoritative docs (read these, not just this memory):**
- Design decisions + build order + **M1a–M1e breakdown table**: `docs/MCP/mcp-design-decisions.md`
- Glossary (new **AI Control Surface** context): `docs/MCP/CONTEXT.md`; both contexts indexed in root `CONTEXT-MAP.md`
- ADRs 0006–0010; pointer block in `CLAUDE.md` ("MCP AI Control Surface")

**Locked calls (do not re-litigate):**
- **In-process bundle**, not a sidecar — calls existing singletons `EventManager`/`DicomModel`/`UICore`, EDT-marshalled (ADR-0006). Tool code **centralized** in `weasis-mcp` (rejected per-module SPI providers).
- **Forever internal / dev-only**: build-time excluded via Maven **`-Pmcp`** profile; physically absent from commercial builds (ADR-0007).
- **Action tiers**: Tier-0 observe + Tier-1 non-destructive control run free; every Tier-2 **Outward Action** (print SCU / C-STORE send / export / delete) passes a human **Confirm Gate** reusing `FilmProofSheetPreviewDialog` (ADR-0008).
- **Real patient data, no de-id in v1** — owner-approved, load-bearing on the dev-only decision; revisit if that ever changes (ADR-0009).
- **Transport**: localhost-only Streamable HTTP on `127.0.0.1` + local token.

**M1 planned in full (2026-07-04, via `/grill-with-docs`), split into 5 ordered
sub-phases, each with its own build/test/confirm gate before the next:**
- **M1a** ✅ **DONE (2026-07-04).** `-Pmcp` gates only `weasis-distributions` (+
  `weasis-launcher`, for parity) staging: jar copy + a duplicated
  `etc/config-mcp/`/`weasis-launcher/conf-mcp/` config overlay (**ADR-0010**).
  `weasis-mcp` itself stays an always-built/always-tested root module. **Real gotcha
  hit and fixed:** `maven-assembly-plugin` keeps the *first* copy of a duplicate
  destination path across fileSets, not the last — the overlay fileSet had to be
  reordered *before* the default `etc/config` fileSet, not after, or the `-Pmcp`
  build silently kept the no-MCP `base.json` with no warning. Verified by extracting
  and diffing both built zips (default: no jar, no entry; `-Pmcp`: both present,
  correctly filtered), not just green exit codes.
- **M1b** ✅ **DONE (2026-07-04).** `org.weasis.mcp.edt.EdtInvoker.callOnEdt
  (Supplier<T>, Duration timeout)` (+ a `callOnEdt(Supplier<T>)` overload with an
  8s default), used by **every** Tier-0 *and* Tier-1 tool, reads included (Swing
  state isn't safely readable off the EDT). Bounded wait implemented by running
  `SwingUtilities.invokeAndWait` on a daemon-thread waiter pool and blocking the
  caller on `Future.get(timeout, ...)`, since `invokeAndWait` has no timeout of
  its own — a stuck/busy EDT throws `EdtInvocationException` fast instead of
  hanging the MCP HTTP request; on-EDT calls short-circuit synchronously to avoid
  `invokeAndWait`'s guaranteed self-call exception. Verified: 7 unit tests
  (off-EDT execution, on-EDT short-circuit, exception unwrapping, timeout-under-
  busy-EDT via a `CountDownLatch`, null-arg validation) + a clean java-reviewer
  pass (no thread-safety/visibility/unwrapping bugs). This timeout is distinct
  from the Confirm Gate's 10-minute one (M1c, not yet built).
- **M1c** ✅ **DONE (2026-07-04).** `org.weasis.mcp.confirm.ConfirmGate.request
  (OutwardAction, Duration)` built **generic** from the start, not print-specific.
  Blocks the calling thread on a `CountDownLatch`; a `ScheduledExecutorService`
  auto-denies after 10 minutes; a shared `AtomicReference<ConfirmGateResult>`
  with `compareAndSet` guarantees exactly one of {dialog button click, timeout}
  wins, plus a defensive outer-wait margin so a delayed timer can never hang the
  caller. **Only one gate may be pending at a time** — a second Tier-2 proposal
  throws `ConfirmGateBusyException` immediately, never queued. Presentation is
  behind a `ConfirmGatePrompt` seam (package-private) so the whole state machine
  is unit-tested (8 tests: approve/deny/timeout/busy-then-reusable/nulls/default-
  timeout/shutdown) without a real dialog; `SwingConfirmGatePrompt`/`ConfirmGateDialog`
  are the real UI — **live click-through verified 2026-07-05** for all three
  outcomes (approve/deny/timeout). **Not a literal reuse of
  `FilmProofSheetPreviewDialog`** — ADR-0008's "reuse" turned out to mean the
  interaction pattern (synchronous modal), not the class itself.
- **M1d** ✅ **DONE (2026-07-04).** `listBundles`/`tailLog` (reads `boot.log` under
  `AppProperties.WEASIS_PATH`)/`dumpViewRenderState` — the latter targets only the
  **currently-selected view** in M1 (no handle param; real view/tab/cell
  addressing is explicit M2 scope). Each tool splits into unit-tested pure logic
  (`BundleLister`/`LogTailer`/`ViewRenderStateReader`, 13 tests) + thin untested
  glue that touches live `ViewCanvas`/`BundleContext`. **Real gotcha:** Mockito
  can't mock `ViewCanvas` directly (`NoClassDefFoundError:
  bibliothek/gui/dock/DockElementRepresentative` — its interface hierarchy pulls
  in an unmockable DockingFrames type) — fixed by redesigning
  `ViewRenderStateReader` to take already-extracted primitives (`OpManager`,
  zoom/rows/columns) rather than the whole `ViewCanvas`, pushing the extraction
  itself into untested glue, same split as `McpServerBootstrap`. All tools
  (including non-Swing `listBundles`/`tailLog`) route through M1b's `EdtInvoker`
  per the literal "every Tier-0/1 tool" wording.
- **M1e** ✅ **DONE (2026-07-04).** First Tier-2 proof, `printCurrentView()`,
  routes the **stable `weasis-dicom-explorer`** `DicomPrint.printImage` path
  (deliberately *not* Film Composer's `printFilmBox` — M3 is still deferred)
  through the Confirm Gate. Picks the **first configured** printer/calling node
  (no selection parameter, same no-addressing simplification as M1d) — the
  Confirm Gate's description names the exact printer/AE picked. Improves on
  `DicomPrintDialog`'s own threading: only rasterization runs on the EDT: the
  actual network submission runs on the calling thread so a slow printer can't
  freeze the UI. Code review found 3 HIGH findings (uncaught
  `EdtInvocationException`, unsafe casts risking `ClassCastException`, leaked
  `ScheduledExecutorService`) — all fixed same session.

- **Build order**: M1 (above, five sub-phases) → M2 core viewer, including the
  view/tab/cell addressing scheme M1 deferred (verify w/ tests + live QA) → M3 Film
  Composer (after its API settles).

**M2 planned in full 2026-07-05** (a `/grill-with-docs` session, same day-family as
M1's live verification), split into **six ordered sub-phases (M2a–M2f)**. Full tool
signatures/rationale: `docs/MCP/mcp-design-decisions.md` §6a.

**M2a ✅ built and unit-tested (2026-07-05, a later same-day-family session).**
New `org.weasis.mcp.tools.views` package: `ViewHandle` (the `{tabId, cellIndex}`
record), `ViewHandleResolver` (generic `<T>` pure lookup logic — deliberately
generic, not typed to `ViewCanvas`/`ViewerPlugin`, so it needs zero mocking despite
those two types being unmockable in Mockito for the same DockingFrames-interface-
hierarchy reason M1d's `ViewRenderStateReader` javadoc documents), `ViewHandleArgs`
(parses the shared flat `tabId`/`cellIndex` MCP args every future M2b-M2f
handle-taking tool will reuse — both optional together, defaulting to the
currently-focused view), `CellInfo`/`TabInfo`/`LayoutInfo` (response records),
`ResolvedView`, `ViewLookup` (untested glue against live `UICore`/
`View2dContainer`/`ViewCanvas`), `ListViewsTool`/`ListLayoutsTool`. The two
consolidated exceptions (`InvalidViewHandleException`, `McpEntityNotFoundException`)
live in the shared `org.weasis.mcp.tools` package. `dumpViewRenderState` reparametrized
with an optional handle and a much richer payload (pan/rotation/flip/layoutId/
series+SOP UID/DICOM-embedded W/L presets via `PresetWindowLevelInfo`/pixel min-max)
via a new `RenderStateInputs` grouping record, keeping `ViewRenderStateReader`'s
existing tested W/L-lookup logic untouched. **Real gotcha:** an initial `ViewLookup`
used `ViewerPlugin.getDockable()` vs. `UICore.getDockingControl()
.getFocusedCDockable()` (mirroring `ViewerPlugin.java`'s own internal pattern) to
compute `isFocusedTab` — failed to compile, since `bibliothek.gui.dock.*`
(DockingFrames) isn't on `weasis-mcp`'s classpath even transitively through
`weasis-core` (`provided`). Fixed by using
`EventManager.getInstance().getSelectedView2dContainer()` instead (same "currently
focused" mechanism already used elsewhere, e.g. `FilmComposerToolBar`) and comparing
container references directly — no new dependency needed. Tests: `ViewHandleResolverTest`
(6), `ViewHandleArgsTest` (5), `ViewRenderStateReaderTest` grew 5→7. **52/52
`weasis-mcp` tests pass** (`mvn -pl weasis-mcp test -o`); `mvn -pl weasis-mcp package
-DskipTests -o` also clean (new package auto-exported by the existing bnd
`org.weasis.mcp.*` wildcard). **Not done: live manual QA** against a running `-Pmcp`
build with a real multi-cell layout open — M2a's unit tests touch no live Swing/
docking container at all, so a real click-through is still needed before M2a is as
fully closed as M1 is.

**M2b ✅ built and unit-tested (2026-07-05, same session, immediately after M2a).**
`getPixelValue`/`getRegionStatistics`, new `org.weasis.mcp.tools.pixel` +
`org.weasis.mcp.tools.region` packages (`PixelValue`/`PixelValueReader`/
`GetPixelValueTool`, `RegionStatistics`/`RegionStatisticsReader`/
`GetRegionStatisticsTool`), plus a shared `ToolArgs.requireInt` helper and a new
`NoImageDisplayedException`. `getPixelValue` reuses `MeasurableLayer
.pixelToRealValue(Number)` — the exact modality-adjustment path the human-facing
pixel readout (`View2d.fillPixelInfo`) already uses — rather than reimplementing HU
conversion. `getRegionStatistics` builds a fully in-memory `RectangleGraphic` (never
registered on any view's `GraphicModel` — no persistent annotation) and feeds it
into the existing `ImageRegionStatistics` machinery the interactive rectangle-
measurement tool already uses. **Real gotcha caught by reading the source, not by a
failing test:** the six needed `Measurement` constants (`IMAGE_MEAN` etc.) are
shared static singletons whose `computed` flag is actually a mutable UI preference —
`ImageRegionStatistics` silently drops any measurement currently toggled off.
`GetRegionStatisticsTool` saves/forces-true/restores all six flags around each call
so the tool's output is deterministic regardless of what the human's measurement
panel has toggled. Tests: `PixelValueReaderTest` (5), `RegionStatisticsReaderTest`
(6) — both fully unit-tested with no mocking gotchas (`MeasurableLayer` is a plain
interface; `MeasureItem`/`Measurement` are plain data types). **63/63 `weasis-mcp`
tests pass**; package build also clean. **Not done: live manual QA** — same gap as
M2a, not yet closed this session.

**M2c ✅ built and unit-tested (2026-07-05, same session, immediately after M2b).**
`listStudies`/`listSeries`/`getSeriesMetadata`/`getImageMetadata`, new
`org.weasis.mcp.tools.data` package: five response records (`StudySummary`/
`SeriesSummary`/`InstanceSummary`/`SeriesMetadata`/`ImageMetadata`),
`DicomModelLookup` (tested pure traversal logic), `DicomModelAccess`
(package-private OSGi lookup of the running `DicomModel` singleton via
`BundleContext.getServiceReference`), four tool-wiring classes, plus a new
`ToolArgs.requireString` alongside M2b's `requireInt`. **Real discovery: unlike
`ViewerPlugin`/`ViewCanvas`, `DicomModel` + `MediaSeriesGroupNode`/`DicomSeries`/
`DicomImageElement` are directly testable against a real in-memory tree** — no
Mockito-unmockable-DockingFrames gotcha here; `DicomModelLookupTest` builds a real
patient→study→series→image tree via `model.addHierarchyNode` and asserts against
it directly (the image is backed by a Mockito-mocked `DcmMediaReader`, a plain
interface, purely to satisfy `DicomImageElement`'s constructor). **Real gotcha,
only surfaced by running the test:** `new DicomModel()`'s constructor isn't
side-effect-free — it eagerly triggers `DicomMediaIO`'s static init via
`SplittingRules`, which needs `org.joml.Vector3dc`, a dependency `weasis-dicom-codec`
declares as `provided` (which Maven never propagates transitively — unlike
`compile`, `provided` dead-ends one hop down). Fixed by re-declaring
`org.joml:joml:1.10.8` as a **test**-scope dependency directly in
`weasis-mcp/pom.xml` (never shipped; the real OSGi runtime already bundles it via
`weasis-dicom-codec`) — a pattern worth remembering any time a future sub-phase's
test reaches a class whose `<clinit>` goes deeper into `weasis-dicom-codec` than
expected. Tests: `DicomModelLookupTest` (8). **71/71 `weasis-mcp` tests pass**;
package build also clean (new package auto-exported by the existing bnd wildcard).
**Not done: live manual QA** — same gap as M2a/M2b.

**M2d ✅ built and unit-tested (2026-07-05, same session, immediately after M2c).**
`setWindowLevel`/`setWindowLevelPreset`/`setZoom`/`fitZoom`/`pan`/`rotate`/`flip`,
new `org.weasis.mcp.tools.control` package: `ViewControlActions` (tested pure
logic — rotation normalization to `[0,360)`, positive-zoom-factor validation),
`SynchDispatch` (package-private glue for rotate/flip only), seven tool-wiring
classes, plus a new `ViewRenderStateSnapshot.of(ResolvedView)` (extracted out of
M2a's `DumpViewRenderStateTool`) so every M2d tool returns a fresh render-state
snapshot right after mutating a view. **Each action uses the most direct public
API that applies it**, not one uniform mechanism: `zoom`/`setCenter` (already
public, absolute, self-refreshing on `ViewCanvas`) for `setZoom`/`fitZoom`/`pan`;
direct `OpManager.setParamValue(WindowOp.OP_NAME, ...)` + `imageLayer
.updateDisplayOperations()` for `setWindowLevel`/`setWindowLevelPreset` (the
preset variant resolves by name via `DicomImageElement.getPresetList`, reusing
M2's `McpEntityNotFoundException` for an unknown name). **Real gotcha:**
`DefaultView2d#updateAffineTransform()` (needed to refresh rotate/flip) is
`protected`, and Film Composer's own precedent for this exact problem
(`FilmComposerView#rotateBy`/`setRotation`/`toggleFlip`, phase 5G3) only works
because that class itself extends `DefaultView2d` in the same hierarchy —
`weasis-mcp`'s tool code is an unrelated external caller, so it can't call a
protected member even via an `instanceof` cast (Java's protected-access rule
requires the *accessing* code to be a subclass, not just the target object).
Fixed via `SynchDispatch`: fires a `SynchEvent` through `ViewCanvas`'s own public
`propertyChange` (inherited from `PropertyChangeListener`) — the same internal
path `DefaultView2d#propertyChange(SynchEvent)` already uses for the
mouse-driven case, invoked here as a single direct call on one resolved view
(confirmed by reading the source: no "am I selected" check anywhere in that
path), so it applies to exactly the resolved cell regardless of selection, same
as every other M2d tool. Every tool guards on `view.getImage() == null` first
(`NoImageDisplayedException`) since `DefaultView2d#propertyChange` itself
silently no-ops with no series — without the guard, a call against an empty
cell would report false success. Tests: `ViewControlActionsTest` (6). **77/77
`weasis-mcp` tests pass**; package build also clean. **Not done: live manual
QA** — more load-bearing here than for the read-only M2a-M2c tools, since this
sub-phase has never been exercised against a real rendered view.

**M2e ✅ built and unit-tested (2026-07-05, a later session, same day-family).**
`selectSeries(handle?, seriesUID)`/`selectImage(handle?, sopInstanceUID)`/
`setLayout(tabId, layoutId)`, new `org.weasis.mcp.tools.navigation` package:
`LayoutResolver` (tested pure logic, generic), `SelectSeriesTool`/
`SelectImageTool`/`SetLayoutTool` (untested MCP wiring, same split as every
prior sub-phase). `selectSeries`/`selectImage` resolve via `DicomModel` (new
`DicomModelLookup.requireDicomSeries`/`findImageLocation`, the latter returning
a new `ImageLocation(series, image)` record) and call the existing
`ViewCanvas.setSeries(series, null)` / `setSeries(series, image)` — the same
atomic switch the human's series-thumbnail double-click already uses.
`DicomModelAccess` (M2c) moved from package-private in `tools.data` to public
in the shared `org.weasis.mcp.tools` package, since M2e's navigation tools need
the same live `DicomModel` OSGi lookup from a different package. **Real gotcha,
the main effort this sub-phase:** `ImageViewerPlugin.setLayoutModel` (the
method that rebuilds a tab's Swing grid) is `protected`, and unlike M2d's
rotate/flip there's no existing public `SynchEvent`/`PropertyChangeListener`
path to reuse (layout isn't part of the multi-view-sync system). The only
public path that reaches it is the same one the human's own toolbar layout
combo box uses: `ActionW.LAYOUT`'s `ComboItemListener`, whose
`itemStateChanged` always applies to whichever tab
`EventManager.selectedView2dContainer` currently is. Fixed by having
`SetLayoutTool.apply` temporarily call the public
`EventManager.setSelectedView2dContainer(targetTab)`, drive
`layoutAction.setSelectedItem(layoutModel)`, then restore the previously
selected container in a `finally` block — all inside one atomic
`EdtInvoker.callOnEdt` dispatch, so no repaint/input event is processed
mid-sequence. Verified safe by reading the dicom `EventManager`'s own
`setSelectedView2dContainer` override: it re-syncs the layout combo's selected
item to the *newly selected* tab's actual current layout before this tool ever
calls `setSelectedItem`, so the combo's dedup-by-equality check can't
incorrectly no-op against stale data from a previously selected tab; also
confirmed `setSelectedView2dContainer(null)` is safe (no tab previously
focused) since the override only conditionally dereferences its parameter.
**Second gotcha:** merely *loading* `View2dContainer`'s class (even just its
static `DEFAULT_LAYOUT_LIST` field, no Mockito) throws `NoClassDefFoundError:
bibliothek/gui/dock/common/action/CAction` in a plain unit test — same
DockingFrames-not-on-classpath problem M2a's `ViewLookup` javadoc already
documents, hit here via static field access instead of mocking. Fixed the same
way M2a fixed it for `ViewHandleResolver`: made `LayoutResolver.resolve`
generic (`<T> T resolve(List<T>, Function<T,String>, String)`) so its test
uses a local `record FakeLayout(String id)`, never touching
`MigLayoutModel`/`View2dContainer`. Code review (java-reviewer agent) flagged
three items, all resolved without behavior changes: a suspected null-unsafety
in the `finally` restore (already verified safe pre-write; added one
clarifying comment), the unchecked `MediaSeries<?>` cast in
`requireDicomSeries`/`findImageLocation` (accepted — consistent with M2c's own
established "trust DicomModel only holds DICOM types" pattern), and
incomplete exception catching in the three new tool-wiring classes (accepted —
identical catch lists to M2d's already-shipped `PanTool`/`RotateTool`, not a
new regression). Tests: `LayoutResolverTest` (2), `DicomModelLookupTest` grew
by 4 (`requireDicomSeries`/`findImageLocation` found/not-found). **83/83
`weasis-mcp` tests pass**; package build also clean (new
`org.weasis.mcp.tools.navigation` package auto-exported by the existing bnd
wildcard). **Not done: live manual QA** — `setLayout`'s select/apply/restore
mechanism has never been exercised against a real running multi-tab session,
at least as load-bearing as M2d's rotate/flip gap.

**M2f ✅ built and unit-tested (2026-07-05, a later session, same day-family).**
`openStudyInViewer(studyUID)`, new `org.weasis.mcp.tools.opening` package:
`OpenStudyResult` (record: studyUID/seedSeriesUID/`TabInfo`), `OpenStudyInViewerTool`
(untested MCP wiring). Reuses the **exact** mechanism a human's double-click on a
series thumbnail triggers — `ThumbnailMouseAndKeyAdapter.openSeriesInDefaultPlugin
(DicomSeries, DicomModel)` — confirmed by reading `mouseClicked`'s own handler,
which calls this same method. Since the tool only takes a `studyUID` but opening
always happens at the series level, new `DicomModelLookup.firstSeriesOf(model,
studyUID)` picks a representative series. **Real gotcha:** naively picking the
lowest `SeriesNumber` alone would happily seed the tab with a presentation state
(PR)/key-object selection (KO)/segmentation (SEG)/structured report — all valid
`DicomSeries` instances that can have a lower `SeriesNumber` than the actual image
series. Fixed by additionally filtering on `DicomMediaIO.SERIES_MIMETYPE.equals
(series.getMimeType())` — the exact same check `View2dFactory.canReadMimeType`
itself uses to decide whether the 2D viewer can display a series at all;
confirmed by reading both methods directly rather than assuming. **Second
gotcha:** `DicomMediaIO.DCM_ELEMENT_FACTORIES` is a `ConcurrentHashMap`, which
throws `NullPointerException` on `get(null)` — `DicomSeries.getMimeType()` looks
itself up by the series' `Modality` tag with no null guard, so every test
fixture feeding `firstSeriesOf` needs an explicit `Modality` tag (one pre-existing
M2e fixture didn't have one — fixed). **Synchronicity verified, not assumed:**
traced the full open-call chain (`ViewerPluginBuilder.open()` →
`DicomModel.firePropertyChange` [synchronous when already on EDT, confirmed by
reading its source] → `WeasisWinListener.propertyChange`'s REGISTER case →
`WeasisWin.openSeriesInViewerPlugin` → either the reuse branch or the
new-viewer branch) end-to-end to confirm no step defers via `invokeLater` —
since this tool always calls the open path from inside `EdtInvoker.callOnEdt`,
the resulting/reused tab is fully built and selected by the time the call
returns, so reading `EventManager.getInstance().getSelectedView2dContainer()`
right after reports the real freshly-opened tab, not stale/null data. Code
review (java-reviewer agent) flagged the non-image-series risk (fixed, 2 new
regression tests) and the EDT-synchronicity assumption (verified correct by
reading the full listener chain rather than left as an assumption); an
incomplete-exception-catching observation was accepted as identical to every
sibling M2 tool's own catch list. Tests: `DicomModelLookupTest` grew by 5
(`firstSeriesOf` unknown-study/no-series/lowest-number/non-image-skipped/
only-non-image-throws). **88/88 `weasis-mcp` tests pass**; package build also
clean (new `org.weasis.mcp.tools.opening` package auto-exported by the
existing bnd wildcard). **Not done: live manual QA** — this is the least
previously-exercised of all six M2 sub-phases, since it's the only M2 tool
that can create a brand-new tab.

**M2 is now functionally complete — all six sub-phases (M2a-M2f) built and
unit-tested.** Live QA across the whole M2 surface (never done this session
for any sub-phase) is the natural next step before M3 (Film Composer surface).

- **Core new decision this session: view/cell addressing scheme (ADR-0011).**
  Atomic addressable unit is a **Cell** (one `ViewCanvas`), not a Tab — confirmed
  over tab-only addressing so the AI can target a non-selected cell in a
  multi-cell grid (e.g. one quadrant of a 2x2 layout). **View Handle = composite
  `{tabId, cellIndex}`**: `tabId` reuses `ViewerPlugin`'s existing `dockableUID`
  (zero new code), `cellIndex` is the cell's position in `getImagePanels()`.
  Resolved fresh every call (a lookup key, not a cached object reference) — chosen
  over minting an opaque UUID-per-cell + registry, since the composite form needs
  no new lifecycle/cleanup code and the alternative's only advantage (surviving a
  relayout) doesn't matter in practice: an AI that just changed a layout has to
  re-call `listViews` anyway to learn the new shape. `listViews()` is the *only*
  way to discover handles — none can be constructed offline.
- **Every handle-taking tool makes the handle optional**, defaulting to
  `getSelectedViewPane()` (M1's existing "currently focused" convenience) when
  omitted — keeps today's single-tab/single-cell workflow a one-line request.
- **Scope: `View2dContainer` (2D) tabs only.** MPR (`MprContainer`) and any future
  Film Composer tabs are out — matches the design doc's own original "against the
  stable `viewer2d` code" wording; extending later is additive, not a redesign.
- **`dumpViewRenderState`/`getCurrentViewState` are unified into one tool**
  (M1's own notes already said `dumpViewRenderState` would be reparametrized with
  a handle in M2 — that's the natural home for the richer payload the design
  doc's §4 always envisioned for `getCurrentViewState`). Grows to report pan/
  rotation/flip/layout/displayed-image, **plus** — driven by an explicit
  print-quality need the user flagged for M3 Film Composer — the image's full
  DICOM-embedded W/L preset list (name + window + level values, not just names)
  and its raw pixel min/max range. M2 only exposes this data; the "is this WW/WL
  print-quality-good" judgment itself is explicit M3 scope.
- **17 new/changed tools total**, grouped into six sub-phases:
  - **M2a** (foundation): `listViews`, `listLayouts`, handle resolution +
    `InvalidViewHandleException`/`McpEntityNotFoundException` (two consolidated
    exception types replacing M1's one-per-failure-mode convention, since M2's
    new failures are almost all the same "ID/handle doesn't resolve" shape
    repeated), reparametrized `dumpViewRenderState(handle?)`.
  - **M2b**: `getPixelValue` (HU-adjusted for CT via existing `PixelInfo`),
    `getRegionStatistics` (rectangle-only ROI, read-only, no `GraphicModel`
    annotation created — full interactive measurement/annotation tools were
    explicitly considered and deferred as a separate, bigger feature).
  - **M2c**: `listStudies`/`listSeries`/`getSeriesMetadata`/`getImageMetadata` —
    only studies already loaded into `DicomModel` (no new PACS query/retrieve).
  - **M2d**: `setWindowLevel`/`setWindowLevelPreset` (kept as two separate tools,
    not one overloaded signature), `setZoom`/`fitZoom` (`fitZoom` hides
    `DefaultView2d`'s internal `-200.0`/`-100.0` sentinel values behind named
    modes), `pan` (absolute `setCenter`-based, not relative `moveOrigin`),
    `rotate`, `flip` (all four control tools are absolute-value, no relative
    deltas, for idempotency).
  - **M2e**: `selectSeries`, `selectImage` (auto-switches series if the target
    image is in a different one than currently shown — the underlying
    `setSeries(series, media)` already supports this atomically), `setLayout`
    (tab-scoped, not cell-scoped, since a layout reshapes the whole grid).
  - **M2f**: `openStudyInViewer` (reuses the exact human double-click-to-open
    path/tab-reuse policy — no separate AI-specific opening policy).
- New ADR-0011 (composite view-handle addressing) + `CONTEXT.md` gained three new
  glossary terms this session: **Tab**, **Cell**, **View Handle**.

**Live QA session (2026-07-05) — DONE, M2 fully closed.** Built `-Pmcp` distribution,
cleared stale Felix bundle caches first (recurring gotcha in this codebase), launched
it, confirmed clean boot (`MCP server listening on http://127.0.0.1:9999/mcp`, no
OSGi errors). Full protocol round-trip verified via curl: unauthenticated → 401,
authenticated `initialize` → handshake + `Mcp-Session-Id`, `notifications/initialized`
→ 202, `tools/list` → all 24 tools present (Step 0 + M1's 5 + M2a-M2f's 19). User
loaded two real studies (AMENA BEGUM chest CT contrast, 22 series; SHAHINUR BEGUM
abdomen, 4 series). `listStudies`/`listSeries` verified live against real data.

**Real finding during QA (2026-07-05), documented not yet fixed:** `DicomModel
.getSeriesNode(seriesUID)` (used by `getSeriesMetadata`/`requireDicomSeries`, and
therefore `selectSeries`) walks the tree and returns the **first** child matching
that `SeriesInstanceUID` via `MediaSeriesGroupNode.matchIdValue` (raw tag equality).
Weasis's own series-splitting mechanism (`DicomModel.splitSeries`, driven by
`TagW.SplitSeriesNumber` - triggered when one physical series has images with
inconsistent geometry, common for MPR/reconstruction series) creates multiple tree
nodes that **share the same `SeriesInstanceUID`** - confirmed live on the chest CT
study, where several MPR series (e.g. "MPR 5mm Range") appeared twice in
`listSeries`' output with the same `seriesUID` but different `instanceCount`s (1 vs.
27, etc.). This means any split beyond the first is **permanently unreachable** via
`getSeriesMetadata`/`selectSeries` by UID alone - a pre-existing `DicomModel` API
limitation, not something M2's code introduced, and out of scope for M2's locked
addressing decision (#7: "natural DICOM UIDs, already stable in `DicomModel`") since
a real fix would mean inventing a new composite series-addressing scheme. Decision:
documented as a known limitation rather than fixed now; QA continues against
non-split series. Revisit only if this becomes a real usage blocker.

**Second real finding during QA (2026-07-05), found AND fixed same session:**
`selectImage` silently no-op'd whenever the target image was in the series
*already displayed* in that cell (e.g. jump to instance 150 while instance 1 of
the same 336-image chest CT series was showing) — returned `isError:false` with
a stale snapshot still showing the old instance. Root cause: a pre-existing bug
in `weasis-core`'s `DefaultView2d.setSeries(series, selectedMedia)` — a
same-series fast-path returns early before ever consulting `selectedMedia`,
silently dropping it. Never triggered by the human UI (mouse wheel/keyboard
scrolling drives `ActionW.SCROLL_SERIES`'s `SliderCineListener` instead, a
separate code path setSeries's fast-path doesn't gate) — only exposed by this
tool's explicit same-series jump use case, which is arguably the *most common*
real use of `selectImage`. User chose "fix now" when asked. Fix (in
`SelectImageTool`, zero `weasis-core` changes): detect the same-series case and
drive that same public `SliderCineListener` instead of `setSeries` — computing
the target index via `Series.getImageIndex`, temporarily selecting the
target tab/cell (mirroring M2e's `SetLayoutTool` select/apply/restore pattern),
restoring the previous selection in a `finally` block. Verified fully
synchronous by reading source (`BoundedRangeModel.setValue` → `ChangeListener`
fires synchronously → `SynchCineEvent` via `firePropertyChange` →
`DefaultView2d.propertyChange` calls `setImage` directly — no `invokeLater`
anywhere). Rebuilt, redeployed (cleared stale Felix cache — recurring gotcha,
see below), re-ran the exact failing call: now returns the correct SOP UID and
a changed `pixelMinValue`/`pixelMaxValue`; user visually confirmed the slice
changed on screen. Full writeup in `docs/MCP/mcp-design-decisions.md` in a new
subsection right after the M2e notes.

**Redeploy gotcha reconfirmed:** the exact rebuild→redeploy→relaunch sequence
that works in this dev setup is: `mvn -pl weasis-mcp -am package -Pmcp
-DskipTests` from repo root → copy the new
`weasis-mcp/target/weasis-mcp-1.0.0.jar` over
`weasis-distributions/target/native-dist/bin-dist/weasis/bundle/weasis-mcp-1.0.0.jar`
→ delete the stale Felix cache at `~/.weasis/cache-<id>` (varies per machine;
found via `ls -d ~/.weasis/cache-*`) → relaunch from inside
`.../bin-dist/weasis` with `java -cp "weasis-launcher.jar;felix.jar"
org.weasis.launcher.AppLauncher` (this exact command is also in the repo's own
`CLAUDE.md`; `java -jar weasis-launcher.jar` alone fails — that jar has no
`Main-Class` in its manifest). Studies are not persisted across restarts —
whoever is doing the live QA has to reload them into the viewer each time the
app is relaunched.

**QA closed out (2026-07-05).** After the `selectImage` fix, redeployed and finished
the walkthrough: `setLayout` (reshaped a tab from `1x1` to `2x2`, confirmed visually),
`openStudyInViewer` (confirmed correct tab-reuse policy — re-opening an
already-open study reused the existing tab, didn't duplicate it), `getPixelValue`
and `getRegionStatistics` (both read-only, no visible on-screen change by design;
results looked sane — `pixelCount` matched the requested ROI area exactly). Every
tool across M2a-M2f has now been exercised live at least once. Two minor,
inconclusive observations noted along the way (not investigated further): `zoom`
drifted slightly as an apparent side-effect of a `pan` call even though panning
shouldn't logically touch zoom; `flip` appeared to reset `panOffsetX`/`panOffsetY`
back to `0.0` (both effects were visually confirmed as real, just not flagged as
problems). `studyDate`/`windowCenter`/`windowWidth` returning `null` for some real
files also noted as plausibly legitimate (absent DICOM tags), not a defect. **M2 is
now fully closed: planned, built, unit-tested, and live-verified.** Full writeup in
`docs/MCP/mcp-design-decisions.md`'s "Live QA verification" subsection (end of §6a).

**M3a (addressing + open) ✅ built and unit-tested (2026-07-05, a later session).**
`listFilmComposerTabs()`/`listFilmSheets(tabId)`/`getFilmJobState(tabId)`/
`openFilmComposer(seriesUID)`, new `org.weasis.mcp.tools.filmcomposer` package:
`FilmJobDescriber` (tested pure logic - builds every response record from an
already-obtained `FilmJob`), `FilmComposerLookup` (untested glue mirroring M2a's
`ViewLookup` exactly, reusing its generic `ViewHandleResolver.resolveTab` directly),
four tool-wiring classes, six response records, one new
`FilmComposerOpenFailedException`. `weasis-mcp` gained its first dependency on
`weasis-dicom-filmcomposer` (`provided` scope) - the design doc's original table had
attached that dependency note to M3f, corrected in the doc since M3a obviously needs
it first. **Real discovery, better than M2a could manage:** `FilmJob`/`FilmSheet`/
`CellAssignment` touch no live Swing/docking state at all (same class as `DicomModel`,
M2c) - `FilmJobDescriberTest` builds real instances with zero
`FilmComposerContainer`/`UICore` bootstrap, no generics-to-dodge-Mockito trick needed.
**Real gotcha, verified by reading source, not assumed:** `openFilmComposer` detects
its new tab by diffing open-tab `dockableUID`s before/after calling
`FilmComposerFactory.getFilmComposerAction(series).actionPerformed(null)` (a silent
no-op for a non-image series, no exception) - proved race-free by tracing
`ViewerPlugin.showDockable`'s `GuiExecutor.execute` call, which short-circuits
synchronously on the EDT exactly like `EdtInvoker` does, so the tab is guaranteed
registered into `UICore.getViewerPlugins()` before the tool's own
`EdtInvoker.callOnEdt` call returns - the same open-call synchronicity class M2f
already established for `openStudyInViewer`, applied to Film Composer's equivalent
`ViewerPluginBuilder.open()` path. `listFilmSheets` (lightweight, addressing-only)
vs. `getFilmJobState` (full cells + `unplacedCells`) mirrors M2a's own
`listViews`/`dumpViewRenderState` split; both take `tabId` as a plain required arg,
no optional-defaults-to-focused convenience (Film Composer tabs have no
`EventManager`-style selection tracking to default against). Tests:
`FilmJobDescriberTest` (5). **93/93 `weasis-mcp` tests pass**; package build also
clean (reactor build order already correct, no pom module-order change needed).
Code review (java-reviewer agent) found no CRITICAL/HIGH issues; one MEDIUM
null-safety observation addressed with a clarifying comment only. **Not done: live
manual QA** - more load-bearing than M2a-M2c's read-only tools since
`openFilmComposer` creates a brand-new tab, same class of gap M2f had before its own
QA pass. Full writeup: `docs/MCP/mcp-design-decisions.md` §6b, "M3a build notes".
**Next: M3b (sheet lifecycle) when resumed.**

**M3b (sheet lifecycle) ✅ built and unit-tested (2026-07-05, a later session).**
`addSheet`/`removeSheet`/`moveSheet`/`selectSheet`/`setActiveSheetLayout`/
`setActiveSheetOrientation`/new `closeFilmComposerTab` - seven tool-wiring classes,
one new record (`CloseFilmComposerTabResult`), a new public
`FilmJobDescriber.describeSheet(index, job)`. `addSheet`/`setActiveSheetLayout`
reuse M2e's `LayoutResolver` directly against the static
`FilmComposerContainer.LAYOUT_LIST` - zero new resolution logic. **Gap fix landed
in production code, not just the MCP layer:** `FilmSheet.setOrientation` (in
`weasis-dicom-filmcomposer` itself) now throws `IllegalArgumentException` for any
non-null value other than `PORTRAIT`/`LANDSCAPE` - verified safe by checking every
real call site in the repo first: the only production caller,
`FilmComposerToolBar`'s two-state toggle, only ever passes its own private
`PORTRAIT`/`LANDSCAPE` constants, so this is a pure tightening with zero behavior
change on the human path; the pre-existing
`setOrientation_null_fallsBackToPortrait` test's contract is untouched (only the
non-null branch got stricter). **Deliberately did NOT extend this defensive
pattern to `removeSheet`/`moveSheet`/`selectSheet`'s existing silent-no-op-on-
invalid-index contracts** - the design doc named exactly two M3b gap fixes
(orientation validation, `closeFilmComposerTab`'s cleanup gap) and no others;
adding more was considered and rejected as unrequested scope creep, since the
post-mutation state snapshot every tool already returns lets an AI caller detect a
no-op itself. Tests: `FilmJobDescriberTest` +1, `weasis-dicom-filmcomposer`'s own
`FilmJobTest` +1. **94/94 `weasis-mcp` tests pass; 132/132
`weasis-dicom-filmcomposer` tests pass** (full suite re-run after the production
change). Code review (java-reviewer agent) explicitly re-checked every
`setOrientation`/`setActiveSheetOrientation` call site before approving - no
issues found. **Not done: live manual QA.** Full writeup:
`docs/MCP/mcp-design-decisions.md` §6b, "M3b build notes". **Next: M3c (cell
editing: `assignSeriesToCell`/`swapCells`/`clearCell`) when resumed.**

**M3c (cell editing) ✅ built and unit-tested (2026-07-05, a later session).**
`assignSeriesToCell`/`swapCells`/`clearCell` - three tool-wiring classes, plus two
new `FilmComposerLookup` glue methods (`resolveActiveCell` via
`FilmComposerContainer.getCellManager().getViewCanvas(position)`, public and
already on the classpath - no new dependency; `describeCell`, mirroring M2a's
`ViewLookup#describeCell`) and one new tested `DicomModelLookup.requireImageInSeries
(series, sopInstanceUID)`. **Key design choice:** `requireImageInSeries` searches
only *within* the already-resolved series (not model-wide like `findImageLocation`)
so a `sopInstanceUID`/`seriesUID` mismatch fails naturally, with no separate
cross-check needed. When `sopInstanceUID` is given, the tool bypasses
`FilmComposerContainer.assignSeriesToCell` (which always picks the first image by
acquisition order) and calls `view.setSeries(series, image)` directly - the same
primitive M2e's `selectImage` already uses. Cell state in every response is read
from the *live* `ViewCanvas`, not the (stale-until-next-sheet-switch) `FilmSheet`
model. **Code review caught and fixed one real thing:** the first draft of
`describeCell` assumed `view.getSeries()` is non-null whenever `view.getImage()`
is non-null - inconsistent with M2a's own `ViewLookup#describeCell`, which
null-checks both independently; fixed to match exactly, no test broke. Tests:
`DicomModelLookupTest` +2. **96/96 `weasis-mcp` tests pass**; package build clean.
**Not done: live manual QA.** Full writeup: `docs/MCP/mcp-design-decisions.md`
§6b, "M3c build notes". **Next: M3d (templates: `listFilmTemplates`/
`applyTemplate`/`resetToPristine`/`saveTemplate`/`deleteTemplate`, incl. the
`applyTemplate` silent-`false` gap fix) when resumed.**

**M3d (Film Template tools) ✅ built and unit-tested (2026-07-05, a later session).**
`listFilmTemplates()`/`applyTemplate(tabId, templateName)`/`resetToPristine(tabId)`/
`saveTemplate(name, sheetShapes)`/`deleteTemplate(name)` - five tool-wiring classes,
two new response records (`FilmTemplateInfo`/`TemplateSheetShape`,
`DeleteTemplateResult`). `listFilmTemplates` is Tier 0; the other four are Tier 1.
Unlike every other M3 sub-phase, `saveTemplate`/`deleteTemplate` are deliberately
**not** tab-scoped - Film Templates live in a per-workstation local XML store
(`FilmTemplateStore`) independent of any open tab, matching the human
`FilmTemplateManagerDialog`'s own scope. **`saveTemplate` takes an explicit
`sheetShapes` array from the caller, not a live tab's captured job** - a deliberate
difference from the human UI's `FilmTemplate.captureFrom(job, name)` convenience,
per the design doc's locked signature; needed new manual JSON parsing
(`SaveTemplateTool.parseSheetShapes`/`parseSheetShape`) since no existing `ToolArgs`
helper covers a nested array-of-objects parameter - validation of each shape's
`rows`/`cols` >= 1 is left entirely to `FilmTemplate.SheetShape`'s own compact
constructor, not duplicated in the tool. **Gap fix landed in production code, not
just the MCP layer:** `FilmComposerContainer.applyTemplate` changed from `public
boolean applyTemplate(FilmTemplate)` (silently returning `false` on a non-pristine
job) to `public void applyTemplate(FilmTemplate)`, throwing a descriptive
`IllegalStateException` instead - same "silent failure becomes explicit" pattern as
M3b's `setOrientation` fix. This one had a real live caller:
`FilmTemplateManagerDialog.onApplySelected()` used the old boolean to decide whether
to show a "confirm-and-reset" dialog - read that call site in full *before* making
the change and updated it to a try/catch on `IllegalStateException`, preserving the
exact same UI flow; grepped the whole repo first to confirm no other caller
depended on the old contract. Also added `FilmTemplateStore.find(String name)`
(`Optional<FilmTemplate>`) since the store only had `loadAll()`/`save()`/`delete()`
- discovered this gap by directly reading the store's source rather than trusting
an earlier Explore-agent report that had assumed a `load(name)` method existed.
**Code-review fix applied before merge:** `DeleteTemplateTool`'s handler initially
skipped the try/catch around `ToolArgs.requireString` that every other Tier-1 tool
in the package has - a missing/blank `name` would have thrown unhandled instead of
returning a proper `isError(true)` response; the java-reviewer agent flagged this
as a genuine deviation from the established contract, fixed to match exactly (no
test broke). Tests: `FilmTemplateStoreTest` +2 (`find` known/unknown);
`FilmComposerContainerTest` updated 4 existing tests for the new throwing contract.
**134/134 `weasis-dicom-filmcomposer` tests pass; 96/96 `weasis-mcp` tests pass**
(no new dedicated `weasis-mcp` unit tests needed - `SaveTemplateTool`'s parsing
logic was judged too simple to warrant pure-logic extraction at this scope); `mvn
-pl weasis-mcp -am install -DskipTests -o` clean end to end. Code review found one
HIGH finding (the `DeleteTemplateTool` gap, fixed same session); the `applyTemplate`
signature migration, `cols`→`columns` field-name mapping end-to-end, JSON parsing,
and EDT safety were all explicitly checked and approved. **Not done: live manual
QA** - same gap as every prior M3 sub-phase. Full writeup:
`docs/MCP/mcp-design-decisions.md` §6b, "M3d build notes". **M3 sub-phases a-d are
now all built and unit-tested.**

**M3e (output + AI-facing preview) ✅ built and unit-tested (2026-07-05, a later
session).** `setFilmJobOutputOptions(tabId, destination, filmSize?, copies?,
priority?, mediumType?, showAnnotations?)` and `getFilmSheetPreview(tabId,
sheetIndex)` (Tier 0) - two tool-wiring classes, one new response record
(`FilmJobOutputOptionsInfo`), two new package-private helpers
(`FilmPrinterResolver`, `SheetRasterEncoder`). Covers the Film Composer design
doc's own "Setting scope" table exactly (per-job: film size, copies, priority,
medium type, annotations, destination). **`destination`** is either `"LOCAL"`
(exact case, same convention as `FilmSheet.setOrientation`'s PORTRAIT/LANDSCAPE)
or a configured DICOM printer node's `description` - resolved by
`FilmPrinterResolver.resolve(List<AbstractDicomNode>, String)`, deliberately pure
and tested by taking an already-loaded node list rather than calling
`AbstractDicomNode.loadDicomNodes` itself, directly mirroring the split
`org.weasis.mcp.tools.print.PrintNodeResolver` established back in M1e (its own
test, `PrintNodeResolverTest`, was the literal template followed here). The five
optional fields (`filmSize`/`copies`/`priority`/`mediumType`/`showAnnotations`)
needed new small private `optionalString`/`optionalInt`/`optionalBoolean`
parsers - no existing `ToolArgs` helper covers optional (non-required)
arguments, and promoting them to the shared class was judged unwarranted for a
single caller with five independently-nullable fields. `filmSize` validates via
`FilmSize.valueOf(filmSize)` (the enum's own type safety, not custom validation
code - same pattern as M3d's `FilmTemplate.SheetShape`); `priority`/`mediumType`
stay free-form strings with zero validation, matching `DicomPrintOptions`' own
already-unvalidated setters. **`getFilmSheetPreview` is this codebase's first MCP
`ImageContent` response** - every tool before it (Step 0 through M3d) returns
`TextContent`. Reuses `FilmComposerContainer.rasterizeSheet` - the same
`DicomPrint.rasterize` flatten path the batch proof-sheet preview and DICOM Print
destination already use, so the AI's self-check view is WYSIWYG with what a
human would see. PNG encoding (`SheetRasterEncoder.toPngBase64`) is tested pure
logic and deliberately runs *outside* `EdtInvoker.callOnEdt` - a `BufferedImage`
is plain in-memory pixel data, not a live Swing reference, so there's no reason
to hold the EDT for the encode step. **First M3 tool where an invalid index
throws rather than silently no-ops:** unlike `removeSheet`/`moveSheet`/
`selectSheet`'s established silent-no-op contract, `rasterizeSheet` throws
`IndexOutOfBoundsException` for an out-of-range `sheetIndex` - caught and turned
into a proper `isError:true` response rather than left to propagate unhandled.
Tests: `FilmPrinterResolverTest` (4), `SheetRasterEncoderTest` (2). **102/102
`weasis-mcp` tests pass**; package build clean, no new bnd warnings. Code review
(java-reviewer agent) approved with zero CRITICAL/HIGH/MEDIUM findings -
explicitly checked the `ImageContent.builder(data, mimeType)` SDK usage, the
off-EDT encoding's safety, and a partial-mutation edge case (destination applied
before an invalid `filmSize` throws, leaving other optional fields un-set) as an
accepted session-only risk, not a bug. **Not done: live manual QA** - more
load-bearing than most M3 sub-phases, since this is the first tool returning
binary image content over the Streamable-HTTP transport, never exercised against
a real MCP client. Full writeup: `docs/MCP/mcp-design-decisions.md` §6b, "M3e
build notes".

**M3f (submit, Tier 2) ✅ built and unit-tested (2026-07-05, a later session) -
M3 is now fully built.** `submitFilmJob(tabId, sheetIndexes?)` - the last and
biggest M3 sub-phase. One Tier-2 tool-wiring class, three new response records
(`SubmitFilmJobAction`, `SheetOutcomeInfo`, `SubmitFilmJobResult`), plus real
production changes landing both design-doc-named gap fixes and ADR-0013's visual
Confirm Gate. **ADR-0013 landed:** `OutwardAction` gained `default
List<BufferedImage> images()` (empty by default, purely additive - M1e's
`PrintAction` needed zero changes); `ConfirmGateDialog` now renders a scrollable
thumbnail gallery above the text description whenever images are present, using
the exact same WYSIWYG rasters that go on to be submitted if approved. **Gap fix
#1 (the serious one, thread-safety):** `FilmJobSubmitter.submit` used to
rasterize (EDT-bound) and submit (network I/O) inline in one loop - safe only
because its sole caller, `FilmProofSheetPreviewDialog.onConfirm`, is itself
already an EDT click handler behind a modal dialog blocking all other UI
meanwhile. `weasis-mcp` has no such modal to hide behind - naively wrapping the
whole thing in `EdtInvoker.callOnEdt` would freeze the *entire* UI for the whole
batch's network time. Fixed by splitting into `prepareForSubmit` (EDT-bound:
rasterizes + captures each sheet's resolved print options into a new
`PreparedSheet` record) and `submitPrepared` (off-EDT: submits using only the
already-captured data, touching no further container/Swing state); the original
`submit()` is reimplemented on top of this split for a single source of truth,
zero behavior change confirmed by the full existing `FilmJobSubmitterTest` suite
passing unchanged. **Gap fix #2 (local print timeout):**
`LocalFilmPrintJob.printWithDialog()`'s native OS dialog has no timeout - fine
for a human watching their own screen, but an AI-initiated submit has nobody
watching, so an unattended dialog would block forever and a client retry could
open a second concurrent dialog. New `TimeoutBoundedLocalPrintSink` (60s
default) bounds the wait via `Future.get(timeout)` on a daemon thread - same
pattern `EdtInvoker` already established. Deliberately **not** wired into the
default (human-facing) constructor - zero risk to existing human UX; instead a
new `public static FilmJobSubmitter.forAiInitiatedSubmit()` factory is the only
thing `weasis-mcp` calls. **Audit trail:** `FilmJobAuditLog` gained a new
`InitiatedBy` (`HUMAN`/`AI`) trailing field via a 4-arg overload; the original
3-arg overloads still exist, delegating to the 4-arg ones defaulting to `HUMAN`,
so every pre-existing call site needed zero changes - a different axis than
ADR-0002's no-per-user-identity decision (channel, not identity). **Call
sequence:** resolve tab → default `sheetIndexes` to every sheet if omitted →
`EdtInvoker.callOnEdt` for the rasterize+prepare phase → `confirmGate.request`
on the calling thread directly (never inside the EDT dispatch, satisfying
`ConfirmGate`'s own "must not be called from the EDT" contract) → on `APPROVED`,
`submitPrepared` with `InitiatedBy.AI`; `DENIED`/`TIMED_OUT` mirror M1e's
`printCurrentView` text wording exactly. A not-all-succeeded result is a normal
(non-error) JSON response - the AI is expected to inspect `outcomes`/
`failedSheetIndexes` and retry itself. **Code-review fix applied before merge:**
`SubmitFilmJobTool`'s catch list initially omitted `EdtInvocationException`,
unlike M1e's `PrintCurrentViewTool` which explicitly catches it - the
java-reviewer agent flagged this exact precedent; fixed by adding it (no test
broke). Tests: `FilmJobAuditLogTest` +3, `FilmJobSubmitterTest` +4,
`TimeoutBoundedLocalPrintSinkTest` (new, 4). **145/145
`weasis-dicom-filmcomposer` tests pass; 102/102 `weasis-mcp` tests pass**;
package build clean end to end. Code review found one CRITICAL finding (the
missing `EdtInvocationException` catch, fixed same session) and confirmed the
EDT/off-EDT split, the `Prepared` record's `images()` mapping, and the
`TimeoutBoundedLocalPrintSink` implementation were otherwise correct; one
MEDIUM observation (a timed-out local print's background thread keeps running
rather than being cancelled) was accepted as an inherent tradeoff of failing
fast on an unattended dialog. **Not done: live manual QA** - the least
previously-exercised M3 tool of all, since it's the only one performing a real
Tier-2 outward action and the first to exercise the new Confirm Gate thumbnail
gallery against a real dialog. Full writeup:
`docs/MCP/mcp-design-decisions.md` §6b, "M3f build notes".

**M3 is now fully built: all six sub-phases (M3a-M3f) built and unit-tested.**

**Live QA verification (2026-07-05) — M3 is fully closed.** Same technique as
M2's own QA session: raw `curl` against the MCP HTTP endpoint, one tool at a
time, human visually confirming each on-screen effect, against a real `-Pmcp`
build with real patient data (AMENA BEGUM chest CT, 7-sheet Film Composer job).
All M3a-M3e tools (27 total minus `submitFilmJob`) passed live: `openFilmComposer`/
`listFilmComposerTabs`/`listFilmSheets`/`getFilmJobState`, `selectSheet`/
`setActiveSheetOrientation`/`addSheet`/`setActiveSheetLayout`/`moveSheet`/
`removeSheet`/`closeFilmComposerTab`, `assignSeriesToCell`/`swapCells`/
`clearCell`, `listFilmTemplates`/`saveTemplate`/`resetToPristine`/
`applyTemplate`/`deleteTemplate`, `setFilmJobOutputOptions`/`getFilmSheetPreview`.
`submitFilmJob` (M3f) was schema/wiring-verified only — the user deliberately
chose not to trigger a real Confirm Gate approval + local/DICOM print submission
this session, so its human-approval click and print path remain unexercised
live (though code-reviewed and unit-tested).

One real finding, resolved empirically, not a bug: `setActiveSheetOrientation`
LANDSCAPE produced no visible on-screen rotation of the live grid — root-caused
to orientation being print/raster-time-only metadata (`FilmComposerContainer.
resolveSheetPrintOptions`), never consulted by the live Swing layout; the
human UI's own toolbar toggle has the identical limitation. Proved via
`getFilmSheetPreview`: the LANDSCAPE sheet rasterized to 1500x1200 (aspect
1.25, genuinely landscape). Also empirically confirmed `setFilmJobOutputOptions
(filmSize: "A4")` takes real effect: re-rendered sheet came back 1240x1754,
aspect 0.707 = exact ISO A4 portrait ratio.

Operational notes for future QA sessions: (1) the MCP session (`Mcp-Session-Id`)
can expire from idle time between conversation turns even while the Film
Composer tab itself survives untouched (tabs live in `UICore`, not the MCP
session) — just re-`initialize` + `notifications/initialized` to recover, no
relaunch needed; (2) decoding a base64 `ImageContent` payload via `node -e`
from Git Bash on Windows needs forward-slash Windows paths
(`C:/Users/.../Temp/file.png`) — POSIX `/tmp/...` paths mis-resolve to the
current drive, and backslash-escaped paths (`C:\\Users\\...`) get stripped by
the Bash tool's single-quoted heredoc; (3) `setActiveSheetLayout`'s `layoutId`
must be one of `FilmComposerContainer.LAYOUT_LIST`'s fixed ids
(`"filmcomposer2x2"` etc.), not raw `rows`/`columns` — fails clean schema
validation if guessed wrong, working as designed.

**The whole M1-M3 AI Control Surface is now live-QA'd, except `submitFilmJob`'s
Confirm Gate/print approval click.** No M4 has been planned yet.

A practical usage/leverage guide now exists at `docs/MCP/mcp-usage-guide.md`
(2026-07-05) — build/launch steps, connection details (port 9999, `/mcp`,
token file location, the 3-call handshake), a condensed tool catalog by tier,
Confirm Gate behavior, the two addressing schemes, this session's QA gotchas,
and end-to-end "leverage recipe" workflows. Point future sessions here first
for "how do I use this" questions; `mcp-design-decisions.md` stays the
architecture/rationale record.

Related: [[film-composer-module]] (M3 target + Confirm-Gate precedent, and now the
print-quality consumer of M2a's richer `dumpViewRenderState` payload).
