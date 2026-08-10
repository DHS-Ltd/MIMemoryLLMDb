---
name: inobitec-catalog
description: Update the Inobitec capability knowledge base after adding study material. Dispatches the inobitec-cataloguer subagent to read new/changed docs and merge them into Inobitec/Knowledge_Base/CAPABILITIES.md + WORKFLOWS.md while preserving the user's My comments. Trigger with /inobitec-catalog, or when the user says they added an Inobitec Feature Insight, Manual chapter, or Part report and want the catalog refreshed.
---

# /inobitec-catalog — refresh the Inobitec knowledge base

This is the **button** for the Inobitec Knowledge Cataloguer. Pressing it re-ingests the user's
Inobitec study material into the living catalog. The **heavy document reading is delegated to the
`inobitec-cataloguer` subagent** so it happens in its own context and does not clog this chat — you
orchestrate and relay, you do not read the 25+ source docs yourself.

Full design: `Inobitec/Knowledge_Base/README.md` · how-to: `Inobitec/Knowledge_Base/USAGE.md`.

## When to use
- The user typed `/inobitec-catalog`.
- The user says they added or changed an Inobitec Feature Insight (`VIdeo_Insights/**`), a Manual
  chapter (`Manual/<N>_*/*.md`), or a Part report (`Practise_Resoucres/Part*/`), and wants the
  catalog updated.
- Do **not** trigger for 3D Slicer / DHDicomAnalyzer mapping work — that is out of scope for this
  knowledge base.

## What to do

1. **Dispatch the subagent.** Use the Agent tool with `subagent_type: "inobitec-cataloguer"`. Give it
   this task (pass along any specifics the user mentioned, e.g. "I just added a new bronchus video"):

   > "Run an incremental Inobitec catalog ingestion. Compare the in-scope docs under `Inobitec/`
   > against `Inobitec/Knowledge_Base/manifest.json`, read only new/changed files, and merge them
   > into `CAPABILITIES.md` and `WORKFLOWS.md` — preserving every `My comments` field verbatim.
   > Refresh `manifest.json`, append a `CHANGELOG.md` entry, and report what changed. Do not add any
   > 3D Slicer mapping. Follow your operating contract exactly."

   Run it in the foreground when the user is waiting on the result; background is fine if they've
   asked for other work in parallel.

2. **Relay the subagent's report** to the user in a few lines: files new/changed/skipped, capability
   entries added/updated, workflow entries touched, and any ambiguity it flagged. Do not paste the
   raw documents or the full catalog back — just the diff summary.
   - **Surface the scope pre-scan result prominently.** If the subagent flagged any `.md` "outside
     current scope — not ingested", show those paths to the user and ask whether to widen the scope
     (a docsVersion bump) or leave them out. Never let an out-of-scope upload pass unmentioned.

3. **Point them at their part.** Remind the user that the agent-authored fields are done, but the
   `My comments:` field on any new/changed entry is theirs to fill in (the subagent never writes it).

4. **If nothing changed**, say so plainly ("no new or changed docs — catalog already current") and
   stop. A no-op run must not touch any file.

## Guardrails (also enforced inside the subagent)
- **Preserve `My comments`** — the subagent must copy every user-authored comment across verbatim.
  If its report says it could not preserve one, surface that to the user prominently; do not treat
  the run as clean.
- **Version lock** — if the run changed the agent's *behaviour* (not just content), the subagent must
  have bumped `docsVersion` across README/USAGE/CHANGELOG/manifest per the Change Protocol
  (README §8). A pure content ingestion leaves `docsVersion` unchanged. If the versions look out of
  sync, flag it.

## Fallback (no subagent available)
If the `inobitec-cataloguer` subagent can't be dispatched, you may run the same contract inline by
following `Inobitec/Knowledge_Base/README.md` §5 — but prefer the subagent so the heavy reading stays
out of the main context.
