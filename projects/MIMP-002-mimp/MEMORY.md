<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [MIMP-002] MIMemoryLLMDb (mimp)

| Field        | Value                              |
|--------------|------------------------------------|
| Project ID   | MIMP-002                           |
| Short name   | mimp                               |
| Last updated | 2026-10-04                         |
| Updated by   | machineA                           |
| Status       | active                             |
| Machines     | machineA, machineB (synced 2026-09-28) |

## Summary

MIMemoryLLMDb is a Git-based project memory system that lets AI assistants (Claude Code and others) share structured project knowledge across multiple machines. Each project gets a unique MIMP-XXX ID and a folder of markdown memory files in a private GitHub repository. A PowerShell CLI tool (`mimp`) handles syncing via push/pull/init commands. The format is plain markdown — any LLM can read it without special integrations. As of 2026-06-02 it also has a **Phase-2 brain layer** (`org/` + registry v2.0) that models the whole DHS business as entities → programs → projects — see [brain-layer.md](./brain-layer.md).

## Key Facts

- GitHub repo: https://github.com/DHS-Ltd/MIMemoryLLMDb.git
- machineA repo path: E:\MIMemoryLLMDb
- machineB repo path: D:\MIMemoryLLMDb — owns MIMP-005/006/007/018/019/020 (DHV-OHIF, pacsvm, mt-portal-pacs-server, dh-pacs-doctor, dh-pacs-worklist, medi-thailand-website); **MIMP-002 is pushed from machineA only** (one pushing machine per project). Nightly task `MIMemoryLLMDb-ScheduledSync` S4U at 23:30 machineB time (UTC+7), installed 2026-09-28 — it had never been installed before. Catch-up runbook: [machineb-sync-procedure.md](./machineb-sync-procedure.md)
- Auth: each machine pushes with its own repo-scoped **deploy key** (repo-local `core.sshCommand` with absolute paths + SSH `origin`) — "mimp machineA" (id 164612661), "mimp machineB" (id 164619894). No credential manager, so no hidden account picker. machineA nightly at 23:00.
- Health: each nightly run pushes a Heartbeat `status/<machine>.json`; `mimp lint` and Hermes `brain-health` (Telegram, 08:05, silent when healthy) read it.
- CLI tool: E:\MIMemoryLLMDb\tools\mimp.ps1
- Local config (machineA): C:\Users\maidu\.mimp-config.json — machine_id: machineA
- PowerShell alias in $PROFILE: `function mimp { & "E:\MIMemoryLLMDb\tools\mimp.ps1" @args }`
- Claude memory for this project: C:\Users\maidu\.claude\projects\e--MIMemoryLLMDb\memory
- All commands tested and working on machineA as of 2026-05-28

## Memory Files

| File | Description |
|------|-------------|
| [architecture.md](./architecture.md) | System design, file structure, how push/pull works |
| [current-state.md](./current-state.md) | What is built, tested, known bugs fixed, pending work |
| [setup-history.md](./setup-history.md) | Exact steps taken to build this system — bugs hit and how fixed |
| [mcp-server.md](./mcp-server.md) | MCP server design, tool list, config per machine, known issues |
| [brain-layer.md](./brain-layer.md) | **Phase 2 brain — as-built reference**: entity→program→project model, org/ layer, registry v2.0, schema-aware init, build status |
| [brain-architecture-decision.md](./brain-architecture-decision.md) | Phase 2 brain decision + DHS business context (scope, options weighed, flywheel thesis, north-star) |
| [machineb-sync-procedure.md](./machineb-sync-procedure.md) | **Runbook for catching a lagging machine up** — read-only diagnostics first, decision gate, source-side (not repo-replica) fixes for superseded content per ADR-0008, independent verification. Use this whenever machineB (or any machine) needs to sync. |
| [changelog.md](./changelog.md) | **Full detail of every Recent Changes entry below** — read for the why behind any line |

## Recent Changes

One line each; full detail in [changelog.md](./changelog.md).

- **NEXT SESSION START HERE (set 2026-09-28):** (1) **rotate `JWT_SECRET` on the production PACS central server** — its value was in MIMP-006 memory pushed from machineB in August; scrubbed at source 2026-09-28 but still in git history, so only rotation makes it worthless (signs everyone out; Maidul picks the time); (2) check the 2026-09-28 23:00 machineA run — `status/machineA.json` shows 14 pushed, 0 failed, `unregistered` empty (first push of MIMP-010..017 through the secret guard; clears lint's stale "18 unregistered" WARN); (3) **re-ingest the 4 Drifted Sources** — `dhs-pacs-context-map`, `dhs-brand-strategy`, `dh-advanced-viewer-context-map`, `pacs-market-research-bd-2026` (`raw/_cards/`) — `org/north-star.md` cites the drifted CONTEXT-MAP and the north-star deadline is **2026-10-10**; (4) confirm Hermes `brain-health` (job `aed5a348e6e8`) and `content-nudge` ran clean at 08:05/08:00. Parked, small: the Central security-exposures note (moved to `D:\DHS-Security\` on machineB, deliberately outside the brain) is unactioned; `mimp status` counts the project dir not the Claude memory dir; 5 dead `hermes/*` branches (all at `a640f76`); `docs/machineb-catchup-2026-08.md` + `docs/pacsvm-supersede-correction-brief-2026-08.md` still uncommitted; `classification` vocab drift; intermittent log `Add-Content` lock; MED I Thailand as an entity (needs a Source).
- 2026-09-28: **machineB unattended sync live** — deploy key + S4U task (23:30 +07:00), first run 6 pushed / 0 failed, Heartbeat `88f7dc4`; **MIMP-018..020 registered** (dh-pacs-doctor, dh-pacs-worklist, medi-thailand-website; MIMP-012 linked to client MED I Thailand); **a production `JWT_SECRET` was found in MIMP-006 memory** — scrubbed at source, guard gained an `.env`-style pattern (`6c8779e`), rotation pending. Outcome: `docs/machineb-unattended-sync-brief-2026-09.md`.
- 2026-09-27 (cont.): **Hermes carries brain health to Telegram** — `tools/brain-health.mjs` (commit `101f81c`) filters lint's heartbeat findings (sync missing/stale/failed, Drift), prints nothing when healthy, for a zero-token `hermes cron --no-agent` routine at 08:05 (command in Hermes `docs/tutorial-hermes/06-routines.md`, for Maidul to run). Lint check 11 reports each machine's recorded `source_drift`. `.gitattributes` pins the script to LF (WSL shebang). Hermes' `CONTEXT.md` Brain Layer + its ADR-0002 amended: the brain is where Hermes *reads* business facts but holds authority over none — Source wins (ADR-0006).
- 2026-09-27 (cont.): **Drift rides on the Heartbeat** — nightly run executes lint, records `source_drift`; `whats_next` opens with changed Sources (ADR-0006: Source wins); re-ingest stays attended. **Drift** added to CONTEXT.md (commit `3a62f50`).

- 2026-09-27 (cont.): **Brain = business memory only, nothing confidential** (personal, legal, payroll folders on `mimp-ignore.txt`); **secret guard** in `mimp push` (`tools/test-secret-guard.ps1`); **MIMP-010..017 registered** (bdc-hms-react, bdc-marketing, cyclotron-sale, minfound-ct-resale, email-official, sqa-learning, personal-branding, content-creation) — first push = next nightly run.

- 2026-09-27: **Nightly sync had silently failed 20 nights** (a Hermes dispatch left HEAD on a `hermes/*` branch). Fixed + hardened (ADR-0009 amendment): `mimp` refuses to sync off `master`; nightly **Heartbeat** `status/<machine>.json` checked by lint + MCP `whats_next`; one deploy key per machine; machineB task `-Unattended`; one pushing machine per project (MIMP-002 = machineA only). Both follow-ups done 2026-09-28: Maidul wired machineA to its deploy key by hand (Claude was blocked by the permission check), and machineB was set up by hand with step-by-step guidance instead of a Hermes `b-brain` session (see 2026-09-28).
- 2026-09-04: Scheduled unattended sync + unregistered-project discovery built (`mimp scheduled-run`, ADR-0009).
- 2026-08-13: machineB caught up to `faf8876`; ADR-0008 failure recurred and was fixed at the source → runbook [machineb-sync-procedure.md](./machineb-sync-procedure.md).
- 2026-08-09/10: Phases 0–4 — `org/` rebuilt as cited (**brain cites, never asserts**: ADR-0006/0007/0008), registry v2.1 (pillar/product), `mimp lint`, first wiki pages, Obsidian vault. **North star: sell ONE licence of the Advanced DICOM Image Viewer (Inobitec resale, PRD-003) by 2026-10-10** — not DHDicomAnalyzerPro (PRD-004, no code). Open risks: R4 (Inobitec marketing permission not in writing), R8 (DH-Advanced-Viewer scope vs Surgeon Chain). Remaining: Phase 5 freshness.
- 2026-06-10: MCP brain tools (`get_business_overview`, `get_entity`, `get_decisions`, `whats_next`).
- 2026-06-05: Decision log — `org/decisions/` ADR template + ADR-0001..0005.
- 2026-06-02: Brain layer (Phase 2): `org/`, registry v2.0, schema-aware `mimp init`; cross-machine init verified.
- 2026-05-28→30: System built; machineB set up; MCP server (git-objects mode); classic sparse checkout.

