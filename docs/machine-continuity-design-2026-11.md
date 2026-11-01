# Machine continuity — design (2026-11-01)

Decided in a `/grill-with-docs` session on machineA, Q1–Q16. Goal in Maidul's words: if the SSD
crashes, "I don't miss out a thing after plugging in a new SSD"; and on a new laptop "be up to date
with the same Claude and Antigravity rules and skills set in this machineA". Terms in **bold** are in
`CONTEXT.md` (Image, Mirror, Restore Drill, Writer, Heartbeat) and in Agent_Harness's
`CONTEXT.md` (Global Harness). Nothing is built yet. Decisions recorded as ADR-0011 (Writer
handover), ADR-0012 (Image + staggered Mirrors) and Agent_Harness `docs/adr/0001` (Global Harness).

## machineA as measured (2026-11-01)

| Disk | Drives | State |
|---|---|---|
| KM600 1 TB NVMe SSD | C: (280 GB, 31 free), E: (673 GB, ~100 used) | the single point of failure |
| ST2000 2 TB HDD | D: (1,680 GB free) | only disk with room for an Image |
| ST1000 1 TB HDD | G: (146 free), H: (36 free), I: (30 free) | G: holds its Mirror |

- E: minus junk ≈ 35 GB; user folder minus caches ≈ 16 GB → one Mirror ≈ 51 GB.
- `E:\DHS-ERP\WSL\Ubuntu-22.04\ext4.vhdx` (37.5 GB) holds **Hermes** (`~/.hermes`), ERPNext
  (not in use; it backs itself up every 6 h inside the same disk), `dhs-backup`, Docker.
- Git covers only part of E:: of 7 repos found, 4 have no remote (DHS-Popular, MI_Finance,
  dh-pacs-infra, …) and several are dirty. `~/.claude`, `~/.gemini`, Agent_Harness: not in git.
- PC is on 24/7 (31/31 nightly Heartbeats in October; last boot 2026-10-23; one power cut 10-11).

## Decisions

| # | Question | Decision |
|---|---|---|
| Q1 | What comes back after an SSD crash | Weekly **Image** of C:+E: on D:, plus file **Mirrors** on both HDDs |
| Q2 | Mirror timing | D: hourly; 1 TB (G:) nightly, so G: is a one-day "undo" |
| Q3 | WSL disk | Weekly Image only (Hermes comes back as of the last Image) |
| Q4 | Mirror scope | All of E: + `C:\Users\maidu`, minus: Recycle Bin, the WSL vhdx, node_modules/.venv/.next/.gradle, AppData, .ollama, .cache, .vscode/.cursor extensions, Gradle/Maven caches |
| Q5 | History | Keep the last 4 weekly Images (~1 month); no separate file history |
| Q6 | Alerts | Results ride on machineA's **Heartbeat** → lint ERROR → Hermes brain-health → Telegram, silent when healthy. ERROR if D: Mirror >2 h old, G: Mirror >26 h, Image >8 days, or any run failed |
| Q7 | Proof | **Restore Drill** at build and every 3 months, ending in a Completion Card (below) |
| Q8 | Where the Global Harness lives | Agent_Harness becomes a private GitHub repo on `DHS-Ltd`, with a setup folder |
| Q9 | Master copy | Edit anywhere: live config points into the Agent_Harness clone (folders = junctions, CLAUDE.md = one-line pointer, settings.json/AGENTS.md = file links → Developer Mode on once per machine). Each machine commits+pushes nightly, pulls the others |
| Q10 | New laptop | Full machine: Global Harness **and** joins the brain as machineC |
| Q11 | Laptop role | Design for "alongside this PC" (covers replacement) |
| Q12 | Memory handover | Guarded pull (never overwrites unpushed memory edits; reports them in the Heartbeat) + `mimp take <project>` moves the **Writer** role. Still one Writer at a time (ADR-0009 holds) |
| Q13 | Secrets | Never in git. Install walks a "logins to redo" checklist; new deploy key per machine; the gsheets service-account file comes off the Mirror by USB once |
| Q14 | machineB | Keeps its own rules; not part of the Global Harness |
| Q15 | Install test | Throwaway local Windows user `harness-test` on machineA: blank profile + different username |
| Q16 | Order | Phase 1 backups → Phase 2 Global Harness → Phase 3 on laptop day |

Assumed (cheap to change): Images Sun 02:00, G: Mirror 00:30, D: Mirror hourly at :40 (clear of
the 23:00 sync); Mirrors at `D:\Backup\Mirror` and `G:\Backup\Mirror`; the Global Harness captures
today's setup as-is (all 77 ECC rule files, 79 commands) and PLAN.md's trims (L04, ~2026-11-16)
happen afterwards inside the repo as reviewable diffs.

## Phases and what "done" means

**Phase 1 — backups (now).** Image job (elevated), two Mirror jobs, Heartbeat fields + lint checks.
Done when: (1) the Heartbeat shows an Image and both Mirrors succeeded; (2) lint raises the ERROR
when a timestamp is faked old, and brain-health prints it; (3) Restore Drill #1: 3 random files
from each Mirror hash-match E:; the Image opened read-only and files inside it opened; a Windows
boot USB boots to System Image Recovery and finds the Image on D:; (4) Completion Card.

**Phase 2 — Global Harness (now).** Agent_Harness → git + private repo; setup folder holding what
was written by hand (global CLAUDE.md, AGENTS.md, settings.json made machine-neutral, own skills,
rules, commands, hooks, PROFILE/ACCURACY) and install lists for what is reinstalled from source
(plugins: `enabledPlugins` + `extraKnownMarketplaces` already in settings.json; `~/.agents`
skills: `.skill-lock.json`; Antigravity plugins). machineA's live config linked into the clone;
nightly commit+push added to the existing scheduled run. Done when: secret guard
(`tools/test-secret-guard.ps1` patterns) and a confidential-content scan (PROFILE rule 5) pass
before the first push; and in `harness-test`, Claude Code and Antigravity load the rules, skills
and plugins from a blank profile; then the test user is deleted.

**Phase 3 — laptop day.** Guarded pull, `mimp take`, nightly pull on the laptop, machineC joined
via `docs/Phase1-Build/add-new-machine.md` + install, logins checklist walked. Done when a memory
edit made on the laptop survives a night and reaches machineA after `take`.

## Verify before building (Unverified today)

- wbadmin on Windows 11 keeps older Images on a local target volume, and how to cap them at 4
  (`wbadmin get versions`). Verified: client wbadmin takes whole volumes only, no `-exclude`; it
  uses VSS; needs Administrator (`wbadmin start backup` help text on machineA; learn.microsoft.com).
- Restoring an Image onto a new SSD: does the target disk have to be ≥ the old 1 TB disk?
- Image files can be mounted read-only for the Restore Drill.
- Claude Code: plugins listed in settings.json install themselves on a fresh profile; settings.json
  survives being a file link (Claude rewrites it); CLAUDE.md `@import` with a `~` path.
- Antigravity: follows a file-linked `AGENTS.md`; whether it can import instead of holding a copy.
- robocopy: `/XJ` (skip junctions — `~/.claude/skills` is full of them) and `/R:1 /W:1` (default
  retries a locked file 1,000,000 times × 30 s). Flags verified in `robocopy /?` on machineA.

## Parked (not in this design)

- **A GitHub token sits in plain text in `E:\v1-BdcHmsApp`'s git remote URL** — revoke it on
  GitHub, then reset the remote without it. Do this before Phase 1 copies it to two more disks.
- D:, G:, H:, I: hold the only copy of what lives there (patient data folders, phone backups).
- One power cut on 2026-10-11; a UPS would protect an Image in progress.
- E:'s 12 GB Recycle Bin goes into every Image — empty it before the first.
- CLAUDE.md says the guides are in `docs/`; they are in `docs/Phase1-Build/`.
