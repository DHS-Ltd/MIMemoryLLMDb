---
name: inobitec-capability-catalog
description: "The Inobitec Knowledge Cataloguer — built & operational Skill+Subagent that ingests Inobitec study docs into a living Capability Catalog under Inobitec/Knowledge_Base/ (Slicer mapping deferred)"
metadata:
  node_type: memory
  type: project
  originSessionId: 95591ef8-ca5a-4f34-925c-f4bb31fb0d2d
aliases: [inobitec_capability_catalog]
---

Built 2026-07-20 (design via `/grill-with-docs`, then implemented). A sub-project **separate**
from the Slicer scope-loop ([[inobitec-scope-loop]], [[scope-current-position]]) and the manual
practice track ([[inobitec-practice-track]]). All Inobitec material now lives under a single
top-level `Inobitec/` folder (repo was re-arranged this session).

**Goal:** an agent (*Inobitec Knowledge Cataloguer*) that reads the user's growing Inobitec study
corpus and keeps a **living Capability Catalog** of *how the user uses Inobitec*. **Inobitec→3D
Slicer translation is explicitly deferred** — a future consumer in the DHDicomAnalyzer context, NOT
this agent's job. Purpose: this knowledge base will be the reference when DHDicomAnalyzer development
starts, and it grows as real hospital-rollout diagnostic cases come in.

**Locked design decisions:**
- Output = one **living catalog/index** (not per-doc summaries, not graphify, not synthesis-only).
- Primary entry unit = **Inobitec capability/tool** (dedupes recurring tools like watershed);
  secondary **Workflow cross-index** references capabilities. Rationale recorded in ADR-0001 (this
  deliberately diverges from the Slicer context's workflow-as-scope-unit).
- Entry schema (5 field-groups): Core identity · Parameters & settings · Usage cross-index + sources
  (with patient-study IDs) · Quirks/status/confidence · **My comments**.
- **Sticky-comment rule (core invariant):** the agent regenerates its own fields but NEVER overwrites
  the user-authored `My comments`; runs are idempotent on unchanged input.
- Trigger = **user-invoked, incremental** via a `manifest.json` of content hashes (reads only
  new/changed docs; skips unchanged).

**Files (all live):**
- Root `CONTEXT-MAP.md` (registers the repo's two contexts), `Inobitec/CONTEXT.md` (glossary),
  `Inobitec/docs/adr/0001-capability-primary-catalog-unit.md`.
- `Inobitec/Knowledge_Base/`: `README.md` (spec) · `USAGE.md` (user manual) · `CAPABILITIES.md`
  (catalog) · `WORKFLOWS.md` (cross-index) · `CHANGELOG.md` · `manifest.json` (hashes + docsVersion).
- `.claude/skills/inobitec-catalog/SKILL.md` and `.claude/agents/inobitec-cataloguer.md`.

**The agent form = Skill + Subagent** ("Skill = the button, Subagent = the worker that does the heavy
reading in its own context so the main chat stays clean"):
- Skill `/inobitec-catalog` → thin orchestrator; dispatches the subagent, relays its diff report,
  surfaces any scope-prescan flag.
- Subagent `inobitec-cataloguer` (model sonnet; tools Read/Grep/Glob/Edit/Write/Bash) → holds the
  full ingestion contract + Change Protocol; reads only new/changed docs, merges into
  CAPABILITIES/WORKFLOWS preserving `My comments`, refreshes manifest, appends CHANGELOG.
- **To run:** type `/inobitec-catalog` after adding a doc.

**Self-update system:** a single `docsVersion` locked across README/USAGE/CHANGELOG/manifest, plus a
binding **Change Protocol** (README §8, copied into the subagent's prompt) — any change to the agent's
*behaviour/scope* must update README + USAGE + CHANGELOG and bump `docsVersion` together; pure content
ingestion does not bump it. Verified working across two behaviour changes this session.

**Cold-start ingestion (2026-07-20):** 25 docs (10 Feature Insights, 9 Manual chapters, 6 Part
reports) → ~50 capability entries (7 functional groups) + 18 workflow entries + cross-cutting
findings. Then the Skill was live-tested on the user's new `Video_Case_Practice/` (4 hands-on
video-case reports) — moved several capabilities studied-only→practiced-hands-on, added "Cut All
Except Object", preserved all `My comments`. **Manifest now tracks 29 files.**

**Scope evolution (current = v1.3):** v1.1 = 3 folders (VIdeo_Insights, Manual, Practise/Part*).
v1.2 added `Video_Case_Practice/Case*/`. v1.3 hardened intake for incoming hospital cases:
(1) **whole-folder matching** — any `.md` in an in-scope folder is ingested regardless of filename;
(2) **scope pre-scan** — every run flags any `.md` under `Inobitec/` that's outside scope so uploads
are never silently skipped (it won't auto-ingest; it prompts for a scope decision). Known-excluded
(not ingested, not flagged): `CONTEXT.md`, `Knowledge_Base/**`, `docs/**` (ADRs), all `PROGRESS.md`,
patient DB, `Video_Watch_Tool/`, `Reference_Video/`, binaries, images. **docsVersion lock at 1.3.**

**Next / open:** user will keep adding real diagnostic cases as `.md` under `Case*/` or Part folders,
then run `/inobitec-catalog`. Agent form done; Slicer mapping still out of scope until the
DHDicomAnalyzer context starts consuming this.
