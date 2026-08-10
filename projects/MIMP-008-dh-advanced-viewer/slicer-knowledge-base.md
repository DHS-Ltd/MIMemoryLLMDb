---
name: slicer-knowledge-base
description: "3DSlicer_Research became its own bounded context (2026-07-28) with a slicer-cataloguer agent mirroring the Inobitec pattern, adapted for upstream reference docs instead of usage narratives"
metadata: 
  node_type: memory
  type: project
  originSessionId: dbddbbae-3976-449d-8444-208ccfb41382
  modified: 2026-07-28T08:36:59.930Z
aliases: [slicer_knowledge_base]
---

`3DSlicer_Research/` (raw scrape of upstream 3D Slicer developer+user docs, 148 `.md` files) was
resolved 2026-07-28 via `/grill-with-docs` into the repo's **third bounded context** — own
`CONTEXT.md`, own `docs/adr/`, and a `Knowledge_Base/` distilled by a new `slicer-cataloguer`
subagent (`/slicer-catalog` skill), mirroring [[inobitec-capability-catalog]] exactly in
mechanism (Skill + Subagent, incremental `manifest.json` content-hash ingestion, sticky `My
comments` field) but **not** in schema — the source material is official upstream reference
docs, not the user's own hands-on usage narratives, so the catalog schema differs:

- **Corpus is 148 `.md` files ≈ 378k tokens** — ~1.9× one agent context, so **cold start runs
  as 5 sequential chunks**, never one pass (architecture → module API/core → script-repo →
  CLI modules → build/orientation; chunks 1–2 must precede 3 since script snippets attach to
  entries that must already exist). Each chunk refreshes the manifest, so it's resumable.
  *(The initial design said "260+ files, one full pass" — the count had wrongly included
  `.png` images and the pass was physically impossible. Corrected in v1.1.)*
- **`MODULES.md` is two-tiered:** full entries for core/interactive modules, plus a compact
  "CLI Modules Index" table. 74 of the 148 docs are 18–30 line auto-generated CLI-descriptor
  stubs on a fixed template; one-entry-per-module would have made ~74 of ~100 entries filler
  ranked equal with Segmentations/Volume Rendering. Tier by *source-doc substance*, not a
  fixed allow-list.
- **Three parallel catalog files**, not one: `MODULES.md` (per Slicer module),
  `ARCHITECTURE.md` (cross-cutting mechanisms — MRML Scene, Parameter Node, Subject
  Hierarchy, Coordinate Systems), `BUILD_AND_TOOLING.md` (per-platform build/debug/
  contribution process). Chosen because the source corpus's own folder structure already
  splits this way (`developer_docs/02_architecture_and_mrml` vs `04_modules_api` vs
  `07_build_and_debugging`), and forcing everything into one taxonomy (like Inobitec's
  single capability-primary `CAPABILITIES.md`) would misrepresent it.
- **Entry depth = structured summary + source pointer, never embedded code.** Real code
  always comes from the cited source doc, not a copy baked into the entry — keeps entries
  from drifting stale as Slicer's actual API evolves between doc scrapes.
- **The ~300-snippet `script_repository.md` gets distributed**, not its own file — each
  snippet's citation is folded into whichever existing Module/Architecture entry its topic
  matches, rather than spawning a fourth "recipes" catalog.
- **Full-scrape ingestion, no sub-folder filtering** — unlike Inobitec's four narrow
  in-scope globs, everything under `developer_docs/` and `user_docs/` is in-scope by design,
  including build/tooling docs (the user explicitly wanted "master of 3D Slicer... for a
  production-ready product," not a narrowly-scoped subset).
- **Deliberately no product-relevance tagging.** Unlike a hypothetical Inobitec-style
  deferred-mapping caveat, here the user's stated purpose *is* to consult this while
  implementing DHDicomAnalyzerPro — but the catalog schema still stays product-agnostic;
  any relevance insight goes in that entry's own `My comments`, never an agent-authored
  field. This was a deliberate choice, not an oversight — confirmed via direct question.
- **The cataloguer never fetches docs itself** — `scrape_slicer.py` / `scrape_slicer_user.py`
  runs (or manually-saved pages) are a separate, prior step; the agent only diffs/ingests
  what's already on disk. Confirmed explicitly: the user does not want scraping bundled in.

- **A scope pre-scan runs every time** (restored in v1.1 after being wrongly dropped): flags
  `.md` dropped outside `developer_docs/`/`user_docs/` **and** non-`.md` resources (PDFs, .py,
  .html) that can't be ingested at all. Necessary because the user's intake model is "all
  knowledge resources land in this repository," so out-of-tree drops are expected, and the
  Markdown-only catalog would otherwise swallow them silently.
- **`developer_docs/index.md` is excluded** — a 548-line pure table of contents (nav links,
  no content) that matched the glob but no routing rule.

**Status as of 2026-07-28:** cold start **complete** (all 5 chunks) and the catalog operational
at `docsVersion` **1.3** — 142 files processed = 142 cited (+6 known-excluded = 148), 46 entries
(27 modules + 7 architecture + 12 build/tooling) + a 59-row CLI index. From here it's plain
incremental `/slicer-catalog` runs; cold-start chunking will not recur.

**Two audits, and the lesson that transfers.** Both found the same failure — the manifest
recording work that was never done — and both were caught by checking the *files*, never by the
run reports, which described the defective runs as clean.
- **v1.2** closed it at file level: a hash may enter `processed` only if the path is actually
  cited (`absorbed` map for deliberate non-ingestion), merge-before-create, reports derived from
  re-reading what was written.
- **v1.3** found the same shape surviving in the two places those rules structurally could not
  reach — **the granularity they were written at** (`script_repository.md` is one hash over 24
  sections, so it passed on a single citation while 7 sections sat orphaned, some long after
  their target entries existed) and **the direction they compared** (`processed` ↔ cited only, so
  a file *never read* was invisible to both directions and the check stayed green). Fixed with a
  per-section map + a standing re-check of unplaced sections, and a disk-vs-accounted
  reconciliation. Also added REMOVED as a diff class (re-scrapes rename files) and
  folder-granular batching for bulk runs.

**Generalisable:** an integrity rule only covers the granularity it is written at and the
directions it actually compares — and "flagged as unplaced" is worthless without a scheduled
re-check, because the blocker is usually removed by a *later* run. Worth applying to
[[inobitec-capability-catalog]], which shares the mechanism.

**Known bug elsewhere:** `Inobitec/Knowledge_Base/USAGE.md` §6C's version-lock check greps
*every* `## [x.y]` changelog heading, so it reports false drift now that that changelog has
history. The Slicer copy was fixed (`grep -m1`); apply the same one-line fix to the Inobitec
one next time that context is touched.

**Why:** the user wants a Slicer knowledge base that "becomes the master for 3D Slicer" to
consult while building their custom advanced workstation solution — see [[dhdicomanalyzerpro-rescaffold]]
for the product this ultimately feeds. See root `CONTEXT-MAP.md` and `CLAUDE.md` for the
current pointer-level summary; `3DSlicer_Research/Knowledge_Base/README.md` for the full spec.
