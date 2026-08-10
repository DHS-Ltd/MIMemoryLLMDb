---
name: slicer
description: >
  Answer questions about 3D Slicer — what a module does, how to drive a
  workflow, what the Python API offers, why something behaves oddly — using
  this workspace's own Slicer corpus, and optionally by inspecting and driving
  the user's LIVE Slicer session over the MCP bridge. Use for medical imaging
  workflows, MRML scene graphs, segmentation, volume rendering, markups,
  transforms, models, DICOM, Slicer Python scripting, and module development.
version: "1.0"
---

# Slicer Skill (DH-Advanced-Viewer local adaptation)

Adapted 2026-07-28 from [`slicer-skill/SKILL.md`](../../../slicer-skill/SKILL.md)
(upstream: `github.com/pieper/slicer-skill`). Upstream's structure and its
Common Pitfalls are preserved; **every corpus pointer is repointed** at what
actually exists on this machine.

> **Do not edit `slicer-skill/`.** It tracks an upstream remote and must stay
> pullable. This file and `slicer-mcp-server.py` beside it are the local copies.

---

## What exists here — and what does not

Upstream's `setup.sh` was **deliberately not run**. See
[ADR-0001](../../../docs/adr/0001-slicer-live-bridge-and-corpus-scope.md).

| Upstream expects | Reality here |
|---|---|
| `slicer-skill/slicer-source/` | ❌ **Does not exist.** No Slicer source tree in this workspace |
| `slicer-skill/slicer-extensions/` | ❌ **Does not exist.** Fetch a specific extension on demand if ever needed |
| `slicer-skill/slicer-dependencies/` | ❌ **Does not exist.** No VTK/ITK/CTK source |
| `slicer-skill/slicer-discourse/` | ➡️ Lives at `3DSlicer_Research/slicer-discourse/` instead |
| *(no upstream equivalent)* | ✅ `3DSlicer_Research/` — 148 official docs + a 46-entry distilled catalog |
| *(no upstream equivalent)* | ✅ **A live, drivable Slicer session** via the MCP bridge |

**Never cite a path under `slicer-source/`, `slicer-extensions/`, or
`slicer-dependencies/`.** They are not here. If a question genuinely needs C++
internals, MRML headers, or CMake internals, say so plainly rather than
inventing a path — that content is not in this workspace.

---

## The four sources, in the order to try them

### 1. The distilled catalog — always start here

`3DSlicer_Research/Knowledge_Base/` — the answer to "what can Slicer do" is
usually already written down:

- [`MODULES.md`](../../../3DSlicer_Research/Knowledge_Base/MODULES.md) — 27
  full module entries (Segmentations, Volume Rendering, Markups, Models,
  DICOM, …) **plus a 59-row CLI Modules Index** table for the auto-generated
  CLI stubs.
- [`ARCHITECTURE.md`](../../../3DSlicer_Research/Knowledge_Base/ARCHITECTURE.md)
  — 7 cross-cutting mechanisms (MRML Scene, Parameter Node, Subject Hierarchy,
  Coordinate Systems, Extension System, …).
- [`BUILD_AND_TOOLING.md`](../../../3DSlicer_Research/Knowledge_Base/BUILD_AND_TOOLING.md)
  — 12 build/debug/contribution topics.

`grep '^### '` enumerates entries uniformly across all three — every entry is
an `###` heading by convention.

Each entry carries a `Sources:` list pointing at the raw doc it came from.
**Follow that citation** when the summary isn't enough; don't guess.

Each entry also has a **`My comments`** field. It is user-authored and
**must never be overwritten**. It often holds the most valuable line in the
entry — a real-world gotcha the official docs missed.

### 2. The raw doc corpus — when the catalog's summary is too thin

`3DSlicer_Research/developer_docs/` (8 folders):

| Folder | Covers |
|---|---|
| `01_getting_started_and_api` | Python API entry points, `slicer.util` |
| `02_architecture_and_mrml` | MRML scene graph, node types, events |
| `03_parameter_nodes` | Parameter node wrapper system |
| `04_modules_api` | Module types and their APIs |
| `05_extensions` | Extension structure and distribution |
| `06_script_repository` | **See below — the single richest file** |
| `07_build_and_debugging` | Build + debug process |
| `08_advanced_and_standards` | Standards, advanced topics |

`3DSlicer_Research/user_docs/` (7 folders) — the **user-facing** half, which is
what answers "what functions are available to me in the UI":

| Folder | Covers |
|---|---|
| `01_getting_started` | First steps |
| `02_user_interface_and_coords` | UI layout, coordinate systems |
| `03_data_and_settings` | Data loading, application settings |
| `04_segmentation_and_registration` | The two big workflow families |
| `05_modules_core` | `data` `volumes` `models` `transforms` `markups` `segmenteditor` `segmentations` `dicom` `volumerendering` `sceneviews` `viewcontrollers` `comparevolumes` |
| `06_modules_processing` | Filters, `dynamicmodeler`, `grayscalemodelmaker`, `extractskeleton`, `cropvolume`, BRAINS* tools, … |
| `07_modules_analytics_and_tools` | Measurement and analysis tooling |

### 3. The Script Repository — prefer it over writing code from scratch

`3DSlicer_Research/developer_docs/06_script_repository/script_repository.md`
— **6,384 lines**, ~300 working snippets in one file. Upstream calls this
*"the closest equivalent to official cookbook recipes,"* and it is: these
snippets are more accurate and more idiomatic than ad-hoc generation.

**Grep it by topic keyword before writing any Slicer Python.** It covers
loading/saving data, MRML node manipulation, Segment Editor effects, views and
layouts, `arrayFromVolume` NumPy access, running CLI modules, event observers,
keyboard shortcuts, and more.

### 4. The Discourse archive — for *why*, not *how*

`3DSlicer_Research/slicer-discourse/archive/rendered-topics/YYYY/YYYY-MM/`
— ~18,700 forum threads rendered as Markdown, one file per thread, named
`YYYY-MM-DD-topic-slug-idNNNNN.md`. `archive/INDEX.md` gives an overview.

Reach for this when the official docs explain *what* something does but not
*why* it behaves the way it does, or when something appears broken. Forum
threads carry workarounds and rationale that documentation never does.

> **Not ingested by `/slicer-catalog`.** This corpus is deliberately outside
> the cataloguer's ingestion scope — it is raw reference, searched directly.
> Do not add it to `manifest.json`.

---

## The live Slicer bridge — this workspace's unique capability

The user runs **stock 3D Slicer 5.11.0** (`E:\Slicer.org\3D Slicer 5.11.0-2026-02-10`),
designated in project memory as the **reconnaissance install**: used to see
what a capability looks like natively in stock Slicer, never to build or test
DHDicomAnalyzerPro's own code.

`slicer-mcp-server.py` (beside this file) runs *inside* that Slicer process,
exposing it over MCP at `http://localhost:2026/mcp`.

**It is opt-in per session.** `~/.slicerrc.py` defines `startMCP()` /
`stopMCP()` and calls neither. If the `slicer` MCP tools are unavailable, the
user simply hasn't run `startMCP()` — ask them to, don't try to start it
yourself.

### Tools

| Tool | Use it for |
|---|---|
| `list_nodes` | What is actually loaded right now. Optional `className` filter |
| `get_node_properties` | Full property dump for one node ID |
| `execute_python` | Run code in the live session. Set `__result` to return a value |
| `screenshot` | See the session. **`region`**: `window` \| `views` \| `3d` \| `slice` |
| `load_sample_data` | `MRHead`, `CTChest`, `CTACardio`, `MRBrainTumor1`, … |

### Using it well

- **Look before you advise.** `list_nodes` first. Advice grounded in the actual
  scene beats advice grounded in assumption.
- **Verify after you act.** After `execute_python`, confirm with `list_nodes`
  or a screenshot. Don't report success you haven't observed.
- **Pick the screenshot region deliberately.** `region="window"` when the
  question is *where is that control* — the module panel is the answer. Use
  `views`/`3d`/`slice` when the answer is in the image, especially with a real
  study loaded: those regions exclude the module panel and DICOM browser where
  identifiers appear.
- **The user works with real patient studies.** `region` reduces PHI exposure;
  it does not eliminate it. `list_nodes` returns node names, and
  DICOM-loaded volumes often carry the series description. Don't dump node
  lists or screenshots into a summary without cause.
- **Prefer teaching to doing.** The user's stated goal is to learn what Slicer
  offers. Naming the module and the control, then verifying they found it, is
  worth more than silently executing Python that produces the result.
- **The Python console is the main Qt thread.** Long `execute_python` calls
  freeze the UI. Chunk the work, or use `slicer.app.processEvents()`.

---

## Common Pitfalls

Carried over from upstream unchanged. These live in the gap between the code
and how people misuse it — they are not discoverable by search, which is why
they are inlined here rather than pointed at.

- **`arrayFromVolume` returns a view, not a copy.** After modifying it in
  place you must call `slicer.util.arrayFromVolumeModified(volumeNode)` or the
  display never updates.
- **MRML node names are not unique identifiers.** Multiple nodes can share a
  name. Use `node.GetID()`, never `node.GetName()`, to identify a node.
- **The Python console runs on the main Qt thread.** Long operations block the
  UI. Use `slicer.app.processEvents()` in loops, or `qt.QTimer.singleShot()`.
- **Coordinate systems.** Slicer is **RAS** internally; many formats and tools
  are **LPS**. Sign-flip bugs live here. *(Relevant to the biomodeling work:
  STL carries no coordinate system at all, making export the only LPS/RAS
  exposure in that workflow.)*
- **Volume axis ordering.** `arrayFromVolume()` returns **KJI** (slice, row,
  column) — the reverse of the IJK most people expect.
- **Extension CMake differs from standalone projects.** Extensions must use
  `slicerMacroBuildScriptedModule` / `slicerMacroBuildLoadableModule`; plain
  `add_library` will not integrate with module loading.
- **`slicer.util.pip_install()` for runtime dependencies.** Slicer bundles its
  own Python. Never system pip.

---

## Where to look, by task

| Task | Start here |
|---|---|
| "What does module X do?" | `Knowledge_Base/MODULES.md` → its `Sources:` → `user_docs/05_modules_core/x.md` |
| "How do I script X?" | Grep `06_script_repository/script_repository.md` first |
| "What's loaded right now?" | `list_nodes` on the live bridge |
| "Where is that button?" | `screenshot(region="window")` on the live bridge |
| "Why does X behave weirdly?" | Common Pitfalls above → then `slicer-discourse/` |
| MRML / parameter nodes / subject hierarchy | `Knowledge_Base/ARCHITECTURE.md` |
| Building Slicer or an extension | `Knowledge_Base/BUILD_AND_TOOLING.md` |
| Segment → model → STL (biomodeling) | `user_docs/04_segmentation_and_registration/`, `05_modules_core/segmenteditor.md`, `06_modules_processing/grayscalemodelmaker.md`, `dynamicmodeler.md` |

---

## Scope boundary

This skill **answers questions**. It does not ingest documentation — that is
`/slicer-catalog`'s job, and it has a narrow, twice-audited contract
(manifest hashes, write-back assertions, coverage reconciliation). Keep the
two apart: never write to `Knowledge_Base/*.md` or `manifest.json` from here.

Per `3DSlicer_Research/CONTEXT.md`, that context models **Slicer's own
capabilities** and never tags entries by relevance to DHDicomAnalyzerPro. If a
product-relevance insight surfaces while using this skill, it belongs in that
entry's **`My comments`** field — nowhere else.
