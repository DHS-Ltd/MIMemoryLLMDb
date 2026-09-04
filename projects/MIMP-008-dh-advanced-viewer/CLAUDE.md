# DH-Advanced-Viewer

Maidul's workspace for DH Solutions' medical-imaging line. It holds **three bounded
contexts** (each with its own `CONTEXT.md` glossary — vocabularies don't cross over) plus
a couple of self-contained utility folders. This file is the fast-orientation index; the
authoritative, timestamped record of structural decisions is
[`CONTEXT-MAP.md`](./CONTEXT-MAP.md) — read that when this summary isn't enough.

## Folder map

| Folder | What it is | Detail |
|---|---|---|
| `DHDicomAnalyzerPro-Planning/` | Planning docs/glossary/ADRs for **DHDicomAnalyzerPro**, the DH-branded 3D Slicer product. Product source code is **not** in this repo — it lives externally at `E:\DHDAPro\Src` (not yet created, see below). | [`docs/CONTEXT.md`](./DHDicomAnalyzerPro-Planning/docs/CONTEXT.md) |
| `DHDicomAnalyzerPro-Planning/docs/UX-Foundation/` | **New 2026-08-03.** The three-step interaction-design study run *before* any UI code: six **UX surface** docs → per-area Slicer mapping with evidenced bucket calls → design decisions. Also the foundation corpus for a future **feature-implementation agent** (D24). | [`README.md`](./DHDicomAnalyzerPro-Planning/docs/UX-Foundation/README.md) |
| `Inobitec/` | The Inobitec knowledge base: capability catalog, client-facing marketing material, hands-on practice track. Inobitec is DH's **reference standard** (certified comparator + feature-idea source) — never a code/interop target. | [`CONTEXT.md`](./Inobitec/CONTEXT.md) |
| `Inobitec/Sales_Enablement/` | The **Answer Bank** (new 2026-08-01): internal sales-enablement layer turning Inobitec's video corpus into answers for a prospect's **radiographers**, in a live deal. Never customer-facing; out of catalog scope. Run `/inobitec-sales`. | [`README.md`](./Inobitec/Sales_Enablement/README.md) |
| `Inobitec/Client_Facing_Docs/Synapse_3D_Fujifilm/` | **New 2026-08-15.** The first **OEM-Substitution Lead** — a Fujifilm distributor sold an MRI to a private diagnostic centre whose requirement names **Synapse 3D**. Holds an internal **Competitor Profile** and a customer-facing **Requirement Brochure**. ⚠️ **`Client_Facing_Docs/` is no longer single-audience** and the two scope rules below are now lead-scoped. | [`README.md`](./Inobitec/Client_Facing_Docs/Synapse_3D_Fujifilm/README.md) |
| `Inobitec/docs/Mail_Communication/` | **New 2026-08-15.** All correspondence with **Inobitec Software FZ-LLC** — the vendor *company* — plus its drafts. The **Vendor Channel**: DH in front of the vendor, as opposed to everything in `Sales_Enablement/`, which is DH in front of a customer. Has its own subordinate glossary (parent `Inobitec/CONTEXT.md` still wins). What DH learns *through* this channel is quarantined from DHDicomAnalyzerPro — [root ADR-0002](./docs/adr/0002-inobitec-taught-material-is-quarantined-from-dhdicomanalyzerpro.md). | [`CONTEXT.md`](./Inobitec/docs/Mail_Communication/CONTEXT.md) |
| `3DSlicer_Research/` | The 3D Slicer knowledge base (own bounded context, resolved 2026-07-28): raw scraped upstream 3D Slicer developer+user docs (`developer_docs/`, `user_docs/`) distilled by the `slicer-cataloguer` agent into `Knowledge_Base/{MODULES,ARCHITECTURE,BUILD_AND_TOOLING}.md`. Product-agnostic Slicer reference — no DHDicomAnalyzerPro tagging baked in. | [`CONTEXT.md`](./3DSlicer_Research/CONTEXT.md) |
| `slicer-skill/` | Third-party repo (own git remote, `pieper/slicer-skill`) — **read-only, never edit.** Its live Claude↔running-Slicer MCP bridge is now wired up (2026-07-28); its `setup.sh` corpus builder was deliberately **not** run. | [root ADR-0001](./docs/adr/0001-slicer-live-bridge-and-corpus-scope.md) |
| `.claude/skills/slicer/` | The **live Slicer bridge + reference skill**: an adapted `SKILL.md` (upstream's pointers repointed at what actually exists here) and a hardened `slicer-mcp-server.py`. Invoke as `/slicer`. | [`SKILL.md`](./.claude/skills/slicer/SKILL.md) |
| `docs/adr/` | **Cross-context** decisions — ones spanning more than one bounded context. | [ADR-0001](./docs/adr/0001-slicer-live-bridge-and-corpus-scope.md) |
| `.claude/` | Skills, agents, and settings scoped to this workspace (e.g. `/inobitec-catalog`, `/slicer-catalog`). | — |

**Moved out of this repo** (kept for reference, not duplicated here — see CONTEXT-MAP.md's
rearrangement log for the full why):
- `E:\Archive\DHDicomAnalyzer` — retired pre-rename product checkout, own git history intact.
- `D:\Inobitec_Video_Repo` — every raw/reference video source file.
- `E:\Self_project\md_to_pdf_Converter` — unrelated personal utility.
- `E:\Self_project\Video_Editor_Utilities` — standalone video processing, compression, and callout overlays utility.

Repo root is **intentionally not a git repository** (deferred decision, 2026-07-28) — two
subfolders (`slicer-skill/`, and formerly `DHDicomAnalyzer/`) are/were nested git repos
with their own remotes.

## Current state — DHDicomAnalyzerPro (the product)

- **Renamed + fully re-scaffolded 2026-07-27** (DHDicomAnalyzer → DHDicomAnalyzerPro) to
  fix a "every change takes 5 hours to rebuild" problem: the outer SuperBuild was always
  being rebuilt instead of the inner `Slicer-build` tree. New repo, generated fresh via
  [SlicerCustomAppTemplate](https://github.com/KitwareMedical/SlicerCustomAppTemplate),
  pinned to Slicer stable `v5.12.3`. Reasoning:
  [ADR-0001](./DHDicomAnalyzerPro-Planning/docs/adr/0001-dhdicomanalyzer-rename-and-rescaffold.md),
  [ADR-0002](./DHDicomAnalyzerPro-Planning/docs/adr/0002-dhdicomanalyzerpro-build-toolchain.md).
- **Phase 1** (bare scaffold + verify the rebuild fix, at `E:\DHDAPro\Src` /
  `E:\DHDAPro\Build`): plan written in
  [Phase1-Dev-Environment](./DHDicomAnalyzerPro-Planning/docs/DHDicomAnalyzerPro-Phase1-Dev-Environment.md),
  **not yet executed** (`E:\DHDAPro` doesn't exist yet — check before assuming otherwise).
  🚩 **When Phase 1 is executed, open
  [`UX-Foundation/PARKED.md`](./DHDicomAnalyzerPro-Planning/docs/UX-Foundation/PARKED.md) first** —
  the UX study was parked 2026-08-03 with this scaffold as its resume trigger, and it carries five
  **build-time** items (bundle ffmpeg *inside the Slicer tree*, flip two stock defaults, author DH
  VRT presets, build standard-view buttons, re-verify on 5.12.3) that cannot be applied
  retroactively without rework. The flag is repeated at the top of the Phase-1 doc itself.
- **Phase 2** (future): re-port `DHStenosisVMTK`, VMTK `ExternalProject` wiring, and the
  `Home` module from the archived `E:\Archive\DHDicomAnalyzer` into the new scaffold, using
  its `DHDicomAnalyzerBuilding.md` for already-solved VMTK/CPack packaging gotchas.
- **Toolchain locked:** outer SuperBuild = plain VS2022 generator (used once). Inner loop =
  VS "Open Folder" CMake pointed at `Slicer-build` (Ninja under the hood). No ccache/sccache.
- **Positioning locked:** commercial product, Bangladesh-domestic (DGDA, not CE/FDA),
  sequenced-moat go-to-market (Phase-1 packaging+localization+local support, Phase-2
  ecosystem integration). Ships as a non-diagnostic aid while DGDA registration proceeds in
  parallel. One node of the DH stack (OHIF/DHViewer web viewer, Weasis desktop, Orthanc
  PACS, PyTorch AI server).
- **Two scoping methods now, separated by trigger — not by subject** (D22, 2026-08-03):
  - **Clip-driven** (unchanged, validated): short Inobitec clip → `/watch` → Feature Insight
    (Layer 1, in `Inobitec/Inobitec_Resources/VIdeo_Insights/`) → Slicer implementable spec
    (Layer 2, `DHDicomAnalyzerPro-Planning/docs/Workflow-Scope-*.md`).
  - **Area-driven** (new): a planned sweep → **UX surface** → Slicer mapping → design decisions,
    all under `docs/UX-Foundation/`. Started because shell-level UI decisions cannot be derived
    from one workflow.
  Either way, every step maps to one of three buckets — 1 Curation (expose/brand only),
  2 Workflow-wiring (**most real v1 effort**), 3 Custom dev (algorithm genuinely missing — none
  found yet). **Bucket 1-vs-2 is a UX call and may not be made from docs** (D20) — settle it in
  the live Slicer bridge. The existing `Biomodeling-Slicer-Implementation-Path.md` predates that
  rule and its bucket calls are doc-only; treat them as provisional.
- **UX-Foundation, the interaction-design study (D17–D24, 2026-08-03).** Six feature areas
  (3D VRT · segmentation+biomodeling · basic 2D · measurements · MPR/MIP · subtraction+fusion);
  **Vessel Analysis excluded** (specialist module, v2 per D16). Persona is the **BD
  diagnostic-centre operator** — capability-constrained, *fewer decisions* — explicitly **not** the
  Answer Bank's radiographer, who is capacity-constrained
  ([ADR-0003](./DHDicomAnalyzerPro-Planning/docs/adr/0003-design-for-the-unobserved-novice-not-the-observed-radiographer.md)).
  **D12 is not superseded:** study six, decide the *shell* against six, design *depth* only for
  biomodeling. Two accepted risks carried in writing: the study unit is the feature area, so
  **no seam evidence exists and every seam decision must be tagged *inferred, no source***
  ([ADR-0004](./DHDicomAnalyzerPro-Planning/docs/adr/0004-ux-study-unit-is-the-feature-area-not-the-clinical-workflow.md));
  and **the persona has never been observed**, so every design decision carries an `assumption`
  tag plus a falsifier. **D23 (does the shell mirror Inobitec or depart from it?) is deliberately
  open** — it is the first entry of step 3 and must not drift past that.
  Start at [`UX-Foundation/README.md`](./DHDicomAnalyzerPro-Planning/docs/UX-Foundation/README.md);
  first deliverable is the **G4 (3D VRT) surface, written as a schema pilot** — revise the schema
  before writing the other five.
- **Scope status:** D12 locked — first shippable slice is **3D Biomodeling** (segment →
  model → STL). Vessel/aneurysm workflow already fully scoped as v2 backlog (maps ~1:1 onto
  existing `DHStenosisVMTK` modules, zero missing algorithms).
  The **Slicer-mechanics half of D12 is now written** —
  [Biomodeling-Slicer-Implementation-Path](./DHDicomAnalyzerPro-Planning/docs/Biomodeling-Slicer-Implementation-Path.md)
  maps the 10-step path onto concrete modules with catalog citations, confirms **zero Bucket-3
  work** (every algorithm exists in stock Slicer), and flags the one gotcha this workflow has
  that the vessel one doesn't: **STL carries no coordinate system**, so export is the only
  LPS/RAS exposure in the flow. **The D12 Workflow-Scope (Layer-2) doc is now blocked on D15
  alone** — its other missing input, a Layer-1 Feature Insight for biomodeling, is satisfied
  instead by UX-Foundation's G7 + G4 surfaces (D22). **D15** (biomodeling in/out boundaries —
  notably whether Dynamic Modeler parametric edits are in the v1 slice) is best answered *after*
  those two surfaces exist.

## Current state — Inobitec knowledge base

- **Capability Catalog** (`Inobitec/Knowledge_Base/`): built and operational. Run
  `/inobitec-catalog` after adding a new Feature Insight / Manual chapter / Part report —
  it's incremental (content-hash manifest), preserves user-authored `My comments`, currently
  tracks 29 files at `docsVersion` 1.3. Inobitec→Slicer translation is **deliberately
  deferred** here — this catalog is purely an Inobitec-usage record.
- **Client_Facing_Clips/** and **Client_Facing_Docs/**: customer-facing marketing material,
  explicitly out of the catalog's ingestion scope. Standing rules that recur every time
  these are touched — check before drafting anything new:
  - Sales docs call the product **"Advanced DICOM Image Viewer"**; clip captions instead
    say **"the post-processing software"** (never the Inobitec brand name in either).
  - Target customer is **vascular**; cardiac/coronary/calcium-scoring/PET-SUV/DTI excluded.
    ⚠️ **Lead-scoped since 2026-08-15, not context-wide.** This rule was written for the *cold
    vascular prospect*. The `Synapse_3D_Fujifilm/` OEM-substitution lead is **MRI-led** and has
    **DTI in scope** — the exclusion encoded *irrelevant to that buyer*, never *never offer*.
    State which lead any new doc serves ([ADR-0008](./Inobitec/docs/adr/0008-oem-substitution-lead-rescopes-customer-facing-material.md)).
  - **Never reuse "the problem is not capability, it is access" against a server-based
    competitor.** It is the existing Brochure's whole argument and it is **false** against
    Fujifilm Synapse 3D, whose own architecture page claims thin-client reach to every
    workstation. Check the competitor's architecture first. And when arguing from a structural
    difference, **verify the structure on both sides** — Inobitec Pro is modular too, so
    "everything included, no modules" is not ours to claim.
  - **DH PACS and the DHV Workstation are out of scope** for this product's sales material.
  - No pricing, no stopwatch numbers (qualitative speed claims only in sales docs; clip
    captions may state a conservative concrete time).
  - PHI caution: raw clip footage often opens on a real patient-list screen — flag for
    blur/crop before external distribution.
  - **Figures come from `Practise_Resoucres/` and `Video_Case_Practice/` — never from
    `Sales_Enablement/Answers/*/images/` or `VIdeo_Insights/*/images/`.** Those are vendor
    frames carrying the vendor title bar; the practice archives (~180 self-recorded IBN Sina
    captures) are the shippable library, via `Client_Facing_Docs/tools/redact_figures.py`
    (**mask, then crop** — the tool errors if a mask falls outside its crop). The wrong folder
    is the obvious one — see [ADR-0007](./Inobitec/docs/adr/0007-self-recorded-captures-are-the-figure-source-for-cold-material.md),
    which also records the rule it forced: *a capability you have run yourself beats a broader
    one you have only watched.*
  - Three docs now, in funnel order: **Lead Sheet** (2 pp, HTML+A4 print CSS, dark
    [house identity](./Inobitec/CONTEXT.md) from `E:\DHS-PACS\dh-pacs-website`; argues
    *deliverable*) → **Brochure** (4 pp; argues *access*) → **Capability Dossier** (long-form).
    Inheriting the DH visual identity is **not** inheriting the product association — the
    DH-PACS-out-of-scope rule above is unchanged.
- **Sales Enablement / Answer Bank** (`Inobitec/Sales_Enablement/`): **built and operational
  2026-08-01 — all 24 Action Demos and all 8 own-recording clips done; 5 Reference Sessions remain.**
  Driven by a live reseller deal — the prospect is sold on
  the vascular demo and their **radiographers** (not radiologists) are asking what else it does day
  to day. `/inobitec-sales <video>` + `inobitec-sales-analyst` turn the 29-video / 5.8-hour corpus
  into **Analyzed Answers** (one *request a radiographer is handed*, answered end to end, with demo
  readiness and stage risk).
  - **Third source category, `own-recording`** (README.md §3b) — the user's own workstation practice
    recordings, 8 clips at `D:\Inobitec_Video_Repo\Inobitec_processed_Clips\Inobitec_Clip_Process\`,
    registered in `manifest.json`/`CONTEXT-MAP.md`. Distinct from the vendor corpus in one critical
    way: **real IBN Sina patient data, not de-identified footage** — every card built from it goes
    through a PHI Gate (README.md §8 rule 0a) before any frame is curated; own-recordings turned out
    to also carry the vendor title bar (corrected assumption) and at least 3 of the 8 are **Google
    Remote Desktop captures** with browser/taskbar chrome in frame, worse PHI exposure than a header
    strip. **All 8 processed and `absorbed` as of 2026-08-01** — none produced a new card; several
    corroborated existing ones, three correctly declined a bad capability mapping the clip series
    brief had assumed. Two contract gaps found and closed on `.claude/agents/inobitec-sales-analyst.md`
    rule 2: writing *into* the user-only `My comments` field (even when adding to an empty section),
    and recording a corroboration in `manifest.json` without writing the matching bullet into the
    card itself.
  - **`absorbed` is not a final verdict — the lesson of 2026-08-02, and it generalises.** A
    re-verification session re-read the own-recording frames against the operator's *recorded
    questions* rather than against capabilities assigned in advance, and **reversed four of the
    2026-08-01 conclusions.** A clip written off as *"mislabeled, adds no evidence"*
    (`own-cta-nv-single-bone`) turned out to contain **the entire opening act** — a `CT-Bones` VRT at
    1m19–1m45s with the cervical spine intact and the arteries orange through it. Clip 6 revived,
    clip 2's planned recording withdrawn, clip 11 cut for *result quality* rather than mechanism.
    **When a new real question lands, re-read the absorbed corpus against it.**
    Net: **11 clips, zero new recordings**, six on IBN Sina footage (up from three). Cut sheets are
    in [`Clip_Specs/`](./Inobitec/Sales_Enablement/Clip_Specs/) — measured timecodes, PHI
    rectangles, overlay tables, one file per clip. `CLIP-SERIES-BRIEF.md` is the *argument*;
    `Clip_Specs/` is the *production sheet*, and the brief's **§4c wins wherever it disagrees with
    §4a/§4b**. Bank is at **20 cards**; the `Questions-Asked-Log.md` open-miss queue is **empty**, so
    Deliverable **B** is *unblocked but not due* (two paraphrased questions from one operator).
  - **PHI: "crop to the viewport" is insufficient** — corrected 2026-08-02. The patient block sits
    **inside the render area**, and **in multi-panel layouts every panel carries its own copy.**
    Order is **mask, then crop**, and **never include a study-list frame at all.**
  - **Resume from [`WORKLIST.md`](./Inobitec/Sales_Enablement/WORKLIST.md)** — generated by
    `tools/worklist.py`, never hand-edited; orders all 24 Action Demos by sales value, shortest
    first. **One video per run, never batches.** `tools/plan_video.py` sizes a video before dispatch
    (cap: 20 min of video, ≤90 read frames) and emits ranged commands for the 5 long Reference
    Sessions.
  - **Two runs have already failed, in different ways** — one fabricated statistics and citations
    outright; the next got the bookkeeping right but **mislabelled three of four evidence frames**.
    The bookkeeping is now trustworthy; the *perception* is not. **Open the frames and check every
    card before it is used with a customer** — that is step 3 of the skill, not optional.
  - Four rules that recur:
  - The **vascular-only scope rule is outward-only** — the bank is unfiltered (cardiac, liver, brain,
    knee, dental all in). Positioning, not liability ([ADR-0004](./Inobitec/docs/adr/0004-analyzed-answer-is-the-sole-per-video-output.md)).
  - **Vendor footage is audience-dependent, not banned outright** (changed 2026-08-01). Every frame
    carries `Inobitec DICOM Viewer Professional Edition` in the title bar, so it never reaches a
    prospect held under white-label positioning — but **the live deal's customer already knows the
    vendor**, so for them the 5.8 h corpus is a shippable source, not just a storyboard
    ([ADR-0006](./Inobitec/docs/adr/0006-vendor-footage-shippable-when-the-customer-already-knows-the-vendor.md)
    scopes [ADR-0005](./Inobitec/docs/adr/0005-vendor-frames-are-a-storyboard-never-shippable.md);
    `Client_Facing_Docs/` is unchanged).
  - **This account's constraint is capacity, not capability** — one seat, rising CT+MR volume, and
    they already ration the discretionary 3D/vessel work they'd rather do on every case. Do not
    pitch breadth here. Discovery in `Sales_Enablement/Questions-Asked-Log.md` (D1–D6); the clip
    series that acts on it is [`CLIP-SERIES-BRIEF.md`](./Inobitec/Sales_Enablement/CLIP-SERIES-BRIEF.md).
  - **Analyzed Answers are the sole per-video output**; Feature Insights are written only for genuine
    `CAPABILITIES.md` gaps (~85% is already covered; **Printing has no entry at all**).
  - Videos split into **Action Demos** (`Inobitec_marketing_video/`, frames are the content, 2 fps)
    vs **Reference Sessions** (`Reference_Video/`, words are the content, transcript-first, tracked
    per *segment*). Shape, not duration.
- **Practice track** (`Inobitec/Practise_Resoucres/`): personal 10-day hands-on manual
  walkthrough. Chapters 1–6 complete and cross-referenced; Ch6 Demo 2 (brain-tumor
  photorealistic cutaway) is **parked** — no study with a confirmed lesion found yet, not
  abandoned. Current phase: feed in new external videos one at a time, same
  watch → Feature-Insight → hands-on-reproduce loop, not batch work.

## Current state — 3D Slicer knowledge base

- **Scaffolded 2026-07-28** via `/grill-with-docs`, mirroring the Inobitec Knowledge Base
  pattern (Skill + Subagent, incremental manifest-hash ingestion, sticky `My comments`), but
  adapted for upstream *reference docs* rather than usage narratives. Design rationale:
  [`3DSlicer_Research/docs/adr/0001-independent-bounded-context.md`](./3DSlicer_Research/docs/adr/0001-independent-bounded-context.md);
  full spec: [`3DSlicer_Research/Knowledge_Base/README.md`](./3DSlicer_Research/Knowledge_Base/README.md).
- **Three catalog files, not one:** `MODULES.md` (per Slicer module), `ARCHITECTURE.md`
  (cross-cutting mechanisms like MRML/Parameter Nodes/Subject Hierarchy), and
  `BUILD_AND_TOOLING.md` (per-platform build/debug/contribution process) — because the
  source corpus itself splits along these lines and forcing everything into one taxonomy
  would misrepresent it.
- **Seeded, audited twice, operational** (2026-07-28, `docsVersion` 1.3). All 5 cold-start chunks ran;
  cold start is **done and will not recur** — from here it's plain incremental `/slicer-catalog`
  runs, no chunking. Current state: **142 files processed = 142 cited** (+6 known-excluded = 148
  corpus), **46 entries** (27 modules + 7 architecture + 12 build/tooling) plus a 59-row CLI
  index.
- **The cold start shipped two defects; both are fixed and fenced off.** The audit (files, not
  run reports) found 10 documents hashed as `processed` but cited nowhere — including the
  330-line `brainsfit.md` — plus 3 duplicate entries. The first was the dangerous one: processed
  hashes are skipped forever, so those docs were *permanently invisible*, and the run reports
  said nothing. Root cause: the manifest was written from what the agent **read**, not what it
  **wrote**. Now closed by three binding rules — write-back assertion (+ an `absorbed` map for
  deliberate non-ingestion), entry uniqueness (merge before create), and reports derived from the
  diff.
- **A second audit (v1.3, same day) confirmed those held and found the same failure *shape* in
  two places they couldn't reach.** (a) The rules are **file**-granular, so `script_repository.md`
  — 6,384 lines, 24 sections — passed on one citation while 7 sections sat orphaned, some long
  after their target entries existed; now tracked per-section in `manifest.json`'s
  `scriptRepositorySections`, with every run re-checking the unplaced ones. (b) The check
  reconciled `processed` ↔ cited only, so a file **never read** was invisible to both directions
  and the check still read green; now reconciled against the disk too. Also added: **REMOVED** as
  a diff class (re-scrapes rename files), and folder-granular batching for large runs — the old
  "next unprocessed chunk" fallback dead-ended once all 5 chunks were `done`.
  **After any bulk ingestion, re-run the standing integrity check** in
  [`Knowledge_Base/README.md`](./3DSlicer_Research/Knowledge_Base/README.md) §5a (now five
  checks) — it needs no agent and is what caught every defect so far.
- **`MODULES.md` is two-tiered:** full entries for core/interactive modules, plus a compact
  CLI Modules Index table — because 74 of the 148 docs are 18–30 line auto-generated CLI
  stubs that would otherwise swamp the catalog. **Exactly two shapes, no third** — a module is
  either a `###` Tier-1 entry or an index row. All entries across all three catalogs are `###`,
  so `grep '^### '` lists them uniformly.
- **Scope is intentionally product-agnostic:** the catalog never tags entries by relevance
  to DHDicomAnalyzerPro; any such insight goes in that entry's own `My comments` field
  instead. The agent also never fetches new docs itself (`scrape_slicer.py` /
  `scrape_slicer_user.py` stays a separate manual step).
- **A second raw corpus landed 2026-07-28: `slicer-discourse/`** — ~19,100 Slicer community
  forum threads. Where the doc scrape records what Slicer *does*, this records *why it
  behaves as it does*. It is **deliberately never ingested** — searched directly, never
  distilled, never in `manifest.json`. The v1.3 coverage check globs only
  `developer_docs`/`user_docs`, so the archive is invisible to it by construction;
  **preserve that scoping** if that check is ever widened, or the next run will report
  19,100 unaccounted files.

## Live Slicer bridge — learning stock Slicer with AI guidance

Wired up 2026-07-28 (closing a deferral recorded in project memory). Stock **3D Slicer
5.11.0-2026-02-10** at `E:\Slicer.org\3D Slicer 5.11.0-2026-02-10\` is the **reconnaissance
install** — used to see what a capability looks like natively for Bucket 1/2/3 triage, never
to build/test DHDicomAnalyzerPro. **2026-08-08: a second, sibling install landed alongside
it** — `E:\Slicer.org\3D Slicer 5.12.3\` — installed for hands-on extension practice (starting
with TotalSegmentator), not for product build/test either. Both copies coexist under the same
`E:\Slicer.org\` parent; the 5.11 copy is untouched. Neither is the product's own 5.12.3 pin —
that build doesn't exist yet (`E:\DHDAPro` is unscaffolded, Phase 1 not executed).

**Extension practice is a third thread, distinct from both the reconnaissance-triage use above
and the [[slicer-learning-track]] curriculum** (which still starts its next session with manual
bone removal on the lower-limb CTA — untouched by this). Findings from extension practice
sessions are narrative-only, written to `3DSlicer_Research/Practise_Resoucres/` (created lazily,
first real content lands the first time a session produces findings) — deliberately **not**
wired into `/slicer-catalog`'s ingestion scope and **not** added to `Knowledge_Base/MODULES.md`,
because third-party extensions (no upstream Slicer doc to cite) don't fit that catalog's
sourcing rule. If that rule is ever widened, revisit this.

**The session ritual:**
1. Open Slicer normally → `startMCP()` in the Python console → *Yes* on the access dialog
2. If the `slicer` tools are missing here, run **`/mcp reconnect all`** — Claude Code only
   attaches at launch, so a bridge started afterwards needs a reconnect (no restart needed)
3. Work. Claude can `list_nodes`, `execute_python`, `screenshot`, `load_sample_data`
4. `stopMCP()` — or just close Slicer

Verified end-to-end 2026-07-28.

**Why it's opt-in, not autostart:** the bridge grants arbitrary Python execution against
whatever is loaded, and this workspace works with **real patient studies**. `~/.slicerrc.py`
defines `startMCP()`/`stopMCP()` and calls neither — the explicit call *is* the access gate.
Upstream autostarts on load; that was changed deliberately.

**PHI:** `screenshot` takes a `region` argument (`window`|`views`|`3d`|`slice`) — use
`views`/`3d`/`slice` with a real study loaded, since those exclude the module panel and DICOM
browser. This **reduces** exposure, it does not eliminate it: `list_nodes` returns node names,
and DICOM-loaded volumes often carry the series description.

**Reference lookups go through `/slicer`** (`.claude/skills/slicer/SKILL.md`), which routes to
the catalog → raw docs → the 6,384-line Script Repository → `slicer-discourse/`. There is **no
Slicer source tree in this workspace** — never cite a `slicer-source/`, `slicer-extensions/`,
or `slicer-dependencies/` path; they don't exist here.

## Standing rules (repo-wide)

- **Legal guardrail:** study Inobitec workflow/UX ideas only — never decompile or copy its
  code or assets.
- **`/watch`** needs a per-run PATH patch on this machine (ffmpeg + yt-dlp aren't on the
  persistent PATH) — see the `watch-tooling-windows` project memory for the recipe, or ask.
- Root repo is not git-tracked (see above) — don't assume `git status`/`git diff` reflect
  anything at the root level; nested repos (`slicer-skill/`) are independent.

## Video Editor Utilities CLI Reference
For clip processing (located at `E:\Self_project\Video_Editor_Utilities`):
* `python video_tools.py template <video_path>` — Create a `<Clip-Name>-overlays.md` file.
* `python video_tools.py compress <video_path>` — Compress video in-place to `compressed_*.mp4`.
* `python video_tools.py burn <video_path>` — Render markdown callout overlays and compress to `final_*.mp4` (auto-syncs to workspace `Inobitec/Client_Facing_Clips/`).

## Keeping this file accurate

This file is **not auto-regenerated** — there's no hook wired up to rewrite it on file
changes, and none is planned unless you ask for one. It mirrors the facts in
`CONTEXT-MAP.md` (which owns the authoritative, dated rearrangement log) and in this
project's memory. The convention going forward: **whenever a structural change happens
(folder moved/renamed, a context retired, a new strategic decision locked), update
`CONTEXT-MAP.md` first, then reflect the change here in the same session** — keep this file
short and pointer-heavy (conclusions + links), leave the "why" to the linked doc so this
file doesn't drift out of sync with the reasoning behind it.
