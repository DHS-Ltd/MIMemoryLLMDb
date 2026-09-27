---
id: ADR-0009
date: 2026-09-04
status: accepted
scope: [infra, projects]
tags: [mimp, push, automation, scheduled-task, windows-credential, discovery]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0009-scheduled-unattended-memory-sync.md | Decision (ADR, trajectory layer) -->

# ADR-0009: Scheduled unattended sync, not an event-driven hook

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | accepted |
| Scope | `mimp scheduled-run`, one Windows Scheduled Task per machine |

## Context

`mimp push`/`sync` only ever ran when someone remembered to type the command. In practice that
update was being lost — memory changed during a session, the session ended, nothing was pushed.
Separately, of the ~26 Claude Code project memory folders on machineA
(`~/.claude/projects/*`), only 6 were registered in `registry.json` with a `machineA` path — the
other ~20 (Hermes_Agent_Setup, BDC-Marketing, DHS-ERP, Personal-Branding, etc.) were invisible to
the brain entirely, so even a perfectly-remembered manual push would have had nothing to push for
most of what was actually being worked on.

Git push on this repo authenticates via the `wincred` credential helper (Windows Credential
Manager), which is bound to the interactive logon session, not to the machine in the abstract.

## Decision

Each machine runs its own Windows Scheduled Task, once daily at a fixed time (11:00 PM on
machineA), invoking a new `mimp scheduled-run` command. The task is registered with **"run only
when user is logged on"** and **`StartWhenAvailable`** (Task Scheduler's missed-run catch-up), so
a run that can't fire at 11 PM fires at next login instead of being silently skipped.

`scheduled-run` does two things:

1. **Push** — reads `registry.json` live and pushes every project where `status: active` and a
   `local_paths.<thisMachine>` entry exists. No hardcoded project list; a newly registered project
   is picked up automatically. Each project push is delegated to `mimp push <name>` as a child
   process, so one project's git failure (rejected push, conflicted rebase) can't abort the rest
   of the batch — `Invoke-Git`'s existing fail-loud `exit 1` (ADR-0007) stays intact per-project
   instead of being weakened.
2. **Discovery** — scans `~/.claude/projects/*/memory` for folders with a real `MEMORY.md` that no
   registered project claims for this machine (matched against both `claude_memory_paths` and the
   path `mimp init` would derive from `local_paths`), filtered against a repo-committed
   `tools/mimp-ignore.txt`. Candidates are reported, never auto-registered.

Every run appends to a local log file (`~/.mimp-scheduled-run.log`); a run with any push failure or
any discovery candidate additionally raises a Windows balloon notification (`System.Windows.Forms`,
already available in Windows PowerShell — no new dependency) so a problem surfaces same-day instead
of sitting unread in a log.

The same script and Task Scheduler registration are installed on machineB independently
(`tools/install-schedule.ps1`, run once per machine) — no code branches on which machine it is,
since `mimp.ps1` already resolves `$MachineId`/`$RepoPath` from that machine's own
`~/.mimp-config.json`.

## Alternatives

- **Claude Code `Stop` hook per project** — fires the instant a session ends, zero latency. Rejected:
  would need wiring into every project's own `.claude/settings.json` individually (a growing,
  per-repo configuration surface) rather than one machine-level schedule, and a daily checkpoint
  was judged good enough against the actual failure mode (forgetting entirely), not worth the
  per-project wiring cost.
- **Filesystem watcher service** — most "instant," rejected because it requires a standing
  background process to always be running, which is heavier to build and keep alive than a
  scheduled task.
- **"Run whether user is logged on or not"** — would fire even fully logged off, rejected because
  `wincred` credential access is unreliable outside an interactive session and this mode requires
  storing the Windows account password in Task Scheduler — trading one silent-failure mode for
  another, which is exactly what this ADR exists to eliminate.
- **Auto-registering discovered projects** — rejected. `mimp init` asks for entity/pillar/product
  classification, a judgment call the business brain depends on being correct (see ADR-0006);
  guessing it would pollute `org/` with wrong classifications silently.
- **Flag every unregistered folder, every run, forever** — rejected as pure noise once a folder is
  confirmed to never be a real project (e.g. `C--WINDOWS-system32`); a committed ignore list lets
  that decision be made once, on either machine, and stick everywhere.

## Path-impact

- **Commits** new-project onboarding to a discover-then-notify-then-manual-`mimp init` shape,
  permanently — automation stops at detection because classification can't be automated away.
- **Requires** a one-time, per-machine setup step (`tools/install-schedule.ps1`) that is not itself
  git-synced — a Scheduled Task is host state, not a repo file. Forgetting to run it on a new
  machine silently re-creates the original manual-only behavior there.
- **Introduces** `tools/mimp-ignore.txt` as a new repo-committed control surface the discovery scan
  reads.
- **Reversible.** Deleting the Scheduled Task returns exactly to today's manual-only behavior;
  `mimp push`/`pull`/`sync` are unchanged.

## Amendment — 2026-09-27: detect a job that has stopped, not just a failed push

**What happened.** On 2026-09-06 a Hermes dispatch left this checkout on a `hermes/*` branch with no
upstream. Every nightly run from 09-07 to 09-26 (20 nights) failed at `git pull --rebase`, and
none of it surfaced: `scheduled-run` exited 0 so Task Scheduler recorded success, and the balloon
fired every night regardless because of 16–18 standing discovery candidates, so a real failure
was indistinguishable from routine noise. Separately, machineB had pushed nothing since 2026-08-13
and nothing in the brain could say whether its task was broken, missing, or never installed.

**Changes to the decision above:**

- `mimp` refuses to sync unless this checkout is on `master` (any command, not just scheduled-run).
  Work on `mimp` itself happens in a git worktree.
- `scheduled-run` exits 1 on any failure, so the task's Last Run Result shows it.
- The balloon fires on **failures only**. Discovery candidates no longer raise it.
- Each run pushes a **Heartbeat** — `status/<machine>.json` — as its own commit. `mimp lint` and the
  MCP `whats_next` tool flag any machine in `machines.json` whose Heartbeat is missing, older than
  48 hours, or records a failure; discovery candidates appear there as a warning.

**Why a Heartbeat and not a louder alert** (Telegram from `mimp` was considered): every alert
raised from inside the job is silent when the job isn't running at all. Only the other machine
noticing an absence catches that — and machineB is an unattended server where no balloon is ever
seen. Cost: one small commit per machine per day.

<!-- Related: ADR-0007 (fail loudly on git errors — preserved per-project inside scheduled-run), ADR-0006 (classification is a judgment call, not to be guessed). -->
