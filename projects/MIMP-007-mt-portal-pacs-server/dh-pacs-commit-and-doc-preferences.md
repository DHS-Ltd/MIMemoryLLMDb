---
name: dh-pacs-commit-and-doc-preferences
description: Confirmed preferences for splitting commits and writing docs in dh-pacs-workstation
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 79f71c49-7a50-4eb0-9fc3-9c99c8074a1e
---

When a working tree has accumulated many unrelated pending changes, split into logical commits by
concern rather than one combined commit — even when that requires hunk-level staging within a
single file that mixes concerns (e.g. a glossary file gaining two unrelated terms in one sitting,
or an installer script touched by two different features).

**Why:** confirmed explicitly in the 2026-07-12 README/commit session over both "one combined
commit" and "just commit the docs, leave the rest" alternatives. A reviewable, bisectable history
was valued over speed.

**How to apply:** before committing a dirty tree, diff every changed file and group by concern
first; only fall back to whole-file/whole-commit grouping if the user explicitly says not to split
hunks (offer it as the "simplify" option, don't assume it).

---

Prefer **capability-based status** ("what exists and works now") over a **dated status
snapshot table** in docs like README.md.

**Why:** the previous README status table had already gone stale twice within about a month
(CLAUDE.md's own status line and this project's memory disagreed by ~5 weeks at time of decision).
A capability list stays true until a capability is actually removed.

**How to apply:** when refreshing status sections in README.md or similar docs, default to
capability/feature framing; only use a dated table if the user asks for one specifically.

---

Don't redefine domain terms already owned by `CONTEXT-MAP.md` (or a context's `CONTEXT.md`) inside
other docs like README.md — link out to the glossary instead of restating definitions.

**Why:** confirmed explicitly — restating creates two places that can drift out of sync; the
glossary file is the intended single source of truth per the `grill-with-docs` skill's own model.

**How to apply:** when a README or other doc needs to reference Site/Central/Site Mode/Standalone
Receiver/etc., use the term informally and link to `CONTEXT-MAP.md` rather than giving its own
definition.

---

Runtime-generated logs living inside a docs/ or site-specific folder (e.g.
`docs/IBN_Sina_Bogra/monitor.log`, produced continuously by `monitor.py`) should be gitignored, not
committed, even when the rest of that folder is legitimate documentation being committed for the
first time.

**Why:** confirmed when flagged during the 2026-07-12 commit session — a 1680-line, continuously
growing log file is dead weight in history and will conflict/bloat on every future commit if not
excluded.

**How to apply:** when committing a new docs/ subfolder for the first time, check for `.log` or
other runtime-output files mixed in with real docs before staging, and gitignore them instead.
