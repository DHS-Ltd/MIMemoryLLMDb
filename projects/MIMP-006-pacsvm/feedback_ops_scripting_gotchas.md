---
name: feedback-ops-scripting-gotchas
description: Three non-obvious bugs hit while building VM bash scripts + PowerShell wrappers for this project - check these first before debugging similar symptoms again
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7d3a8be2-b17d-4a8a-bd37-e45b1629feca
  modified: 2026-09-05T18:49:27.557Z
---

Found while building [[project_study_export_runbook]] (2026-09-06). All three cost real debugging time because the symptoms looked unrelated to the actual cause. Check these first if a similar script misbehaves.

**`docker exec -i` silently eats a wrapping bash script's later `read` prompts.**
`docker exec -i pacs-postgres psql ...` attaches and forwards the *entire* stdin stream to the container process — even when that process (`psql -c "..."`) never reads stdin itself. If the bash script calling it has its own `read -rp` prompts later on, expecting to read from the same stdin (e.g. piped in via `printf '...' | ssh host script.sh`), those reads come up empty/EOF because `docker exec -i` already drained the pipe.
**Why:** confirmed the hard way — a script with `read` prompts before and after a `docker exec -i psql -c ...` call would stall silently on the second prompt with no error output, until `bash -x` tracing pinpointed the exact line.
**How to apply:** never add `-i` to `docker exec` unless the containerized command genuinely needs to read stdin. For one-shot `psql -c` calls, always omit it.

**psql's `:'var'` / `:var` colon-substitution does not work inside `-c` query text in this project's `postgres:15-alpine` container**, even though it's the textbook-documented psql feature and works fine for meta-commands (`\echo :var` interpolates correctly). Every attempt — `-v x=1 -c "SELECT :x;"`, with or without `ON_ERROR_STOP`, with or without `-t -A` — threw `ERROR: syntax error at or near ":"`. Root cause not fully diagnosed (suspect a stripped-down psql build in the Alpine image, not a shell-quoting issue — verified byte-for-byte with `od -c` that the argument reaching psql was correct).
**Why:** cost a full debugging cycle isolating shell-quoting as a red herring before ruling it out with a minimal repro.
**How to apply:** don't rely on `:'var'` substitution against this project's Postgres container. Build queries with manual SQL-literal escaping instead — double embedded single quotes (`sed "s/'/''/g"`) and interpolate directly. Safe enough for scripts only reachable by trusted staff over SSH; would need real parameterization (or a differently-built psql) if ever exposed more broadly.

**Windows PowerShell 5.1 silently mis-parses non-ASCII punctuation (em-dash `—`, probably other multi-byte UTF-8) in `.ps1` files saved without a BOM**, producing a cascading `The string is missing the terminator: "` error that points at the *last* quote in the file, not the actual offending line — very misleading to debug.
**Why:** a `.ps1` file with several em-dashes in `Write-Host`/`Write-Warning` strings failed to parse entirely; replacing every em-dash with a plain ASCII hyphen (`-`) fixed it immediately with no other changes.
**How to apply:** stick to plain ASCII punctuation (`-` not `—`, straight quotes) in `.ps1` files in this environment. This mirrors the PowerShell tool's own documented caveat about `Set-Content`/`Add-Content` defaulting to the system ANSI codepage rather than UTF-8 — the script-parsing path has the same blind spot for files written without a BOM. Markdown/bash files are unaffected (both tested fine with em-dashes in this same session).
