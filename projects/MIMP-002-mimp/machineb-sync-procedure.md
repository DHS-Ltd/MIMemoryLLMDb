---
name: machineb-sync-procedure
description: "Runbook for catching a lagging machine (e.g. machineB) up on MIMemoryLLMDb — read-only diagnostics first, source-side fixes for superseded content, independent verification. Use whenever machineB (or any machine) hasn't pulled/pushed in a while."
metadata: 
  node_type: memory
  type: project
  originSessionId: aad12960-dbbd-4409-8859-302cdd399e45
  modified: 2026-08-13T13:49:44.401Z
---

# Catching a lagging machine up on MIMemoryLLMDb

Built 2026-08-13 catching machineB up from `9383fc2` (2026-06-20) to `faf8876` (2026-08-13) — a
15-commit gap plus three real unpushed-memory backlogs and one live recurrence of the
`org/decisions/ADR-0008-memory-edits-belong-at-the-source.md` failure mode. Worked example
transcript: `docs/machineb-catchup-2026-08.md`. Source-side fix
template: `docs/pacsvm-supersede-correction-brief-2026-08.md`. Both are dated one-off docs — for
the next catch-up, create a new dated doc from this procedure rather than editing the old ones;
they're historical record now.

## Why this is a procedure, not just "run mimp pull"

Every `mimp` command already auto-syncs (`Git-Sync` inside `tools/mimp.ps1` runs
`Sync-SparseCheckout` + `git pull --rebase` before anything else). The hard part was never
triggering the pull — it was (a) confirming it was safe to trigger blind, (b) finding backlogs
that a plain pull doesn't surface, and (c) handling the one failure mode specific to this system:
ADR-0008's "edits belong at the source" rule (`org/decisions/ADR-0008-memory-edits-belong-at-the-source.md`),
which nobody can actually violate-proof from a different machine.

## The procedure

### Phase 1 — Read-only diagnostics (safe regardless of what you find)

Run on the lagging machine, in order:

1. `git status` + `git branch -vv` — confirm branch, and whether local is already flagged ahead/behind a cached remote-tracking ref.
2. `Get-Content $env:USERPROFILE\.mimp-config.json` — sanity-check `machine_id` matches what's expected.
3. `git fetch origin` — read-only, updates remote-tracking refs only.
4. `git log HEAD..origin/master --oneline` — what's waiting to be pulled.
5. `git log origin/master..HEAD --oneline` — **the important one.** Must be empty. If it shows commits, the machine did local `mimp push` work while disconnected — stop, don't blind-pull, reconcile first.
6. `git status --porcelain` and `git status --porcelain -- projects/` — uncommitted changes anywhere, and specifically under `projects/` (the ADR-0008 danger zone — hand-edited replica files a pull could later clobber).
7. Per-project Claude-memory freshness: for every project this machine owns (`local_paths.<machine>` present in `registry.json`), compare local `.md` file count in `claude_memory_paths.<machine>` against what's in the repo's `projects/MIMP-XXX-*/`. `mimp lint`'s own `[unpushed-memory]` check does this automatically once the repo is current — but pre-pull, do it by hand with `Get-ChildItem -Filter *.md -Recurse | Measure-Object`, not a pretty-printed `Select-Object -First N` (see gotchas below).

**Decision gate:** only proceed to Phase 2 if #5 is empty and #6 is clean. Anything else, stop and
resolve before touching git further.

### Phase 2 — Sync

1. `git pull --rebase` (or any `mimp` command — same effect via `Git-Sync`).
2. Re-confirm `git log -1 --oneline` lands on the expected tip. **Don't trust a `git log -1` run immediately after a pull that looked interrupted** — see the "Unlink of file" gotcha below; re-check after a later `mimp` command if the first read looks stale.
3. `node tools/lint.mjs` (or `mimp lint`) — first real signal of the true current state, including `[unpushed-memory]` warnings for every project on this machine.
4. `mimp list` — confirm the `LOCAL`/`---` split matches which projects this machine actually owns.
5. For every `[unpushed-memory]` warning: `mimp push <short-name>`. It's idempotent — if there's genuinely nothing new, `Git-CommitPush` no-ops with "Nothing to commit."
6. Re-run lint after each push that touches a project with any history of prior ADR-0008-style repo-side corrections (see Phase 3 — this is where it bites).

### Phase 3 — If `[superseded-claim]` errors appear after a push

This means a project had a correction banner applied to its **repo replica** at some point
(`projects/MIMP-XXX-*/`) but never at the actual source, and the push just overwrote the banner
with the original un-bannered content. Not a bug — the check working as designed. See ADR-0008
for the full mechanism.

1. Find the historical fix commit: `git log --oneline --all -- projects/MIMP-XXX-*/<file>` or search for a commit message like "fix: contain superseded claims in...". `git show <that-commit> -- <files>` gives the exact banner text that was applied before — reuse it verbatim, don't re-invent.
2. The lint check (`tools/lint.mjs`, section 9, `BANNED`/`DISCUSSES`) is **file-wide**: if a file's text contains `superseded|banned|retired|_avoid_|demoted|no longer the headline|replaced by` **anywhere**, the entire file is exempt from the banned-phrase scan. The fix doesn't require finding every offending sentence — one correction banner containing a trigger word, inserted at the source, clears it.
3. **Do not blind-script the fix from a different repo's context**, especially if the file lives inside a live project's own repo (e.g. a project's `CLAUDE.md`, which `mimp push` sources from that project's **root**, not its Claude memory folder — check `local_paths.<machine>` vs `claude_memory_paths.<machine>` in `registry.json`, they're different locations). Two things went wrong doing this the blind way in the 2026-08-13 session: a literal-string anchor missed the target file entirely (path assumption was wrong), and a second anchor missed due to a likely smart-quote/apostrophe mismatch. **Write a brief instead** — the target file's content, the intended change, the authority sources, and an explicit "don't touch anything else" guardrail — and have a Claude Code session running inside that project apply it. See `docs/pacsvm-supersede-correction-brief-2026-08.md` as the template.
4. `mimp push <short-name>` again, then re-lint. Expect the `[superseded-claim]` errors specifically to clear; unrelated pre-existing warnings (broken links, broken wikilinks pointing at another machine's unpushed memory, missing sources) are normal noise, not part of this fix.
5. **Verify independently, not from the pasted transcript.** A local lint pass on the machine that just pushed reads on-disk content, which reflects the push's file-copy step even before confirming the network push landed. From any other machine (or the same one, separately): `git fetch origin` and check the new commit exists, then `git show origin/master:<path>` to read the corrected file straight from git objects.

## Gotchas specific to this environment

- **`Unlink of file '...pack-....idx' failed. Should I try again? (y/n)`** has appeared during both `git fetch` and `git pull --rebase` on machineB. Non-fatal so far — the ref update seems to land regardless, just possibly after the point where an unanswered prompt makes it *look* stuck. If a `git log -1` right after this shows a stale `HEAD`, don't conclude the pull failed — re-check after the next `mimp` command (which re-runs `Git-Sync`) before assuming anything's wrong. Possible cause: antivirus/backup software holding a lock on `.git\objects\pack\`. Worth a `git gc` if it keeps happening.
- **`CLAUDE.md`'s real source for `mimp push`/`mimp pull` is the project root** (`local_paths.<machine>\CLAUDE.md`), **not** the Claude memory folder (`claude_memory_paths.<machine>`). Only the other `.md` files come from the memory folder. Confirmed by reading `Cmd-Push` in `tools/mimp.ps1` directly — don't assume all memory files live in one place.
- **PowerShell console scrollback silently truncates loop output.** A script asking for `Select-Object -First 3` per path in a loop over 4 paths returned 12 unsorted rows for one path in the 2026-08-13 session — the `-First 3` wasn't actually being respected/captured, likely scrollback truncation across the pasted terminal buffer, not a script bug. Prefer `Measure-Object` counts for a quick freshness check over pretty-printed rows when the result needs to be trusted.
- **Copy-paste section misalignment is common** when a checklist doc has many similarly-shaped `**Result:**` blocks in a row — results have landed one section off from their actual command more than once. Read pasted results by matching their content (the command echoed in the transcript) against the section header, not by trusting positional placement.

## Related

ADR-0008 (`org/decisions/ADR-0008-memory-edits-belong-at-the-source.md`) is the decision this whole procedure exists to work around/with — read it for the
full incident it was written from (MIMP-004, 2026-08-10) before assuming Phase 3 is optional.
