---
name: slicer-catalog
description: Update the 3D Slicer knowledge base after adding new upstream documentation. Dispatches the slicer-cataloguer subagent to read new/changed docs under 3DSlicer_Research/developer_docs and user_docs and merge them into MODULES.md, ARCHITECTURE.md, and BUILD_AND_TOOLING.md while preserving the user's My comments. Trigger with /slicer-catalog, or when the user says they added/scraped new 3D Slicer documentation and want the catalog refreshed.
---

# /slicer-catalog — refresh the 3D Slicer knowledge base

This is the **button** for the Slicer Knowledge Cataloguer. Pressing it re-ingests the
upstream 3D Slicer documentation under `3DSlicer_Research/` into the living catalog. The
**heavy document reading is delegated to the `slicer-cataloguer` subagent** so it happens in
its own context and does not clog this chat — you orchestrate and relay, you do not read
the 148 source docs yourself.

Full design: `3DSlicer_Research/Knowledge_Base/README.md` · how-to:
`3DSlicer_Research/Knowledge_Base/USAGE.md` · glossary: `3DSlicer_Research/CONTEXT.md`.

## When to use

- The user typed `/slicer-catalog`.
- The user says they added, scraped, or saved new 3D Slicer documentation under
  `3DSlicer_Research/developer_docs/` or `3DSlicer_Research/user_docs/` and wants the
  catalog updated.
- The user asks to do the **first cold-start ingestion**, or says "run the next cold-start
  chunk" — see the chunk protocol in "What to do" step 1b.
- Do **not** trigger this to fetch new docs from the web — that's a separate step
  (`scrape_slicer.py` / `scrape_slicer_user.py`, or manually saving a doc) that must happen
  *before* this command. This skill only ingests what's already on disk.
- Do **not** trigger for Inobitec cataloging — that's the separate `/inobitec-catalog` skill.

## What to do

1. **Dispatch the subagent.** Use the Agent tool with `subagent_type: "slicer-cataloguer"`.
   Give it this task (pass along any specifics the user mentioned, e.g. "I just added the
   volume rendering module docs" or "this is the first cold-start run"):

   > "Run an incremental 3D Slicer catalog ingestion. Compare every `.md` under
   > `3DSlicer_Research/developer_docs/` and `3DSlicer_Research/user_docs/` against
   > `3DSlicer_Research/Knowledge_Base/manifest.json`, read only new/changed files, and
   > merge them into `MODULES.md`, `ARCHITECTURE.md`, and `BUILD_AND_TOOLING.md` — preserving
   > every `My comments` field verbatim. Distribute script-repository snippets into existing
   > entries rather than creating a fourth file. Refresh `manifest.json`, append a
   > `CHANGELOG.md` entry, and report what changed. Follow your operating contract exactly."

   Run it in the foreground when the user is waiting on the result; background is fine if
   they've asked for other work in parallel.

1b. **Bulk runs — never dispatch a whole-corpus run.** The corpus is ~378k tokens, roughly
   **1.9× a subagent's context**, so it is impossible, not merely slow.

   **Cold start is complete** (all 5 chunks, 2026-07-28) — you will not need the chunk table
   below again unless the corpus is rebuilt from scratch. The live bulk case is a **re-scrape
   against a new Slicer release**, which marks most of the corpus CHANGED. That is not a
   cold start and the chunk table does not apply: tell the subagent to **batch by whole
   numbered source folder in path order** until its run is full, refresh the manifest for what
   it finished, and report which folders remain — then dispatch it again for the rest
   (README §6, "Large incremental runs").

   The 5 cold-start chunks, in dependency order, kept for reference (details:
   `3DSlicer_Research/Knowledge_Base/README.md` §6):

   | # | Chunk | Folders |
   |---|---|---|
   | 1 | Architecture core | `developer_docs/{02_architecture_and_mrml,03_parameter_nodes,05_extensions}`, `user_docs/02_user_interface_and_coords` |
   | 2 | Module API + core modules | `developer_docs/04_modules_api`, `user_docs/05_modules_core` |
   | 3 | Script repository | `developer_docs/06_script_repository` |
   | 4 | CLI modules (Tier 2) | `user_docs/{06_modules_processing,07_modules_analytics_and_tools}` |
   | 5 | Build/tooling + orientation | `developer_docs/{07_build_and_debugging,08_advanced_and_standards,01_getting_started_and_api}`, `user_docs/{01_getting_started,03_data_and_settings,04_segmentation_and_registration}` |

   **Chunks 1–2 must complete before chunk 3** (script snippets attach to entries that must
   already exist); 4 and 5 may follow in any order. Name the chunk and its folders explicitly
   in the task you give the subagent. To find the next one, check which chunks' folders are
   already in `manifest.json`. Each chunk is self-contained and refreshes the manifest, so the
   sequence is resumable — tell the user which chunk just finished and which remain.

2. **Relay the subagent's report** to the user in a few lines: files new/changed/skipped per
   catalog file, entries added/updated, any script-repository snippets it couldn't confidently
   place, and any ambiguity it flagged. Do not paste the raw documents or the full catalog
   back — just the diff summary.
   - **Surface the scope pre-scan result prominently.** If the subagent flagged `.md` files
     "outside ingestion scope" or non-`.md` resources it "cannot ingest", show those paths and
     ask whether to widen the scope (a `docsVersion` bump), convert them, or leave them out.
     Never let material the user added pass unmentioned.

3. **Point them at their part.** Remind the user that the agent-authored fields are done, but
   the `My comments:` field on any new/changed entry is theirs to fill in (the subagent never
   writes it) — including any DHDicomAnalyzerPro-relevance notes, since the catalog itself
   stays product-agnostic.

4. **If nothing changed**, say so plainly ("no new or changed docs — catalog already
   current") and stop. A no-op run must not touch any file.

## Guardrails (also enforced inside the subagent)

- **Preserve `My comments`** — the subagent must copy every user-authored comment across
  verbatim. If its report says it could not preserve one, surface that to the user
  prominently; do not treat the run as clean.
- **Integrity checks must be quoted, not asserted.** The report must include the real output of
  README §5a's five checks — processed↔cited both directions, the v1.3 disk-coverage
  reconciliation, the script-repository section map, and duplicate headings. A report that says
  "all checks passed" without the numbers is not evidence; two audits have now found defects
  that the run reports of the day described as clean. Ask for the output before relaying it.
- **Removed sources** — if a re-scrape deleted or renamed docs, the subagent must say which, and
  confirm it dropped their hashes and fixed their citations.
- **No product-relevance tagging** — the subagent must not add DHDicomAnalyzerPro (or any
  other consumer) relevance judgments into agent-authored fields. That's out of scope for
  this catalog (see `3DSlicer_Research/CONTEXT.md`'s scope boundary).
- **Version lock** — if the run changed the agent's *behaviour* (not just content), the
  subagent must have bumped `docsVersion` across README/USAGE/CHANGELOG/manifest per the
  Change Protocol (README §8). A pure content ingestion leaves `docsVersion` unchanged. If
  the versions look out of sync, flag it.

## Fallback (no subagent available)

If the `slicer-cataloguer` subagent can't be dispatched, you may run the same contract
inline by following `3DSlicer_Research/Knowledge_Base/README.md` §5 — but prefer the
subagent so the heavy reading stays out of the main context.
