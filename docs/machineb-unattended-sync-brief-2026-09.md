# machineB — unattended nightly sync via deploy key (brief, 2026-09-27)

**For:** a Claude Code session on machineB (MedIServer), opened in `D:\MIMemoryLLMDb` through Hermes
repo key `b-brain`, with Maidul driving from his phone. Self-contained — you need nothing else.

**Decision this implements:** ADR-0009, amendment of 2026-09-27 (in `org/decisions/`).

## Why

- machineB has pushed nothing to the brain since **2026-08-13**. Its nightly task is either not
  installed or not firing: ADR-0009 registered it "only when user is logged on", and a server's
  session ends at every sign-out and every patch reboot — after which the task silently never runs.
- Since 2026-09-27 every machine pushes a **Heartbeat** (`status/<machine>.json`) each night, and
  `mimp lint` reports `no heartbeat from machineB` until this brief is done.
- Fix: authenticate git with a **deploy key scoped to this one repo** (no credential manager, so
  nothing can open a window nobody sees), and register the task **"run whether user is logged on
  or not"** using S4U (no password stored).

## Rules for this session

1. **Step 0 is read-only.** Report its results to Maidul before changing anything.
2. **Stop and report** at any result this brief doesn't predict. Don't improvise a fix.
3. The **private key never leaves this machine** — never print it, paste it, or commit it. Only
   the `.pub` file may be shown.
4. **Never hand-edit `projects/`** (ADR-0008) — it is overwritten by the next push.
5. Record the outcome by appending to **this file** and committing it — not in Claude memory.
   The brain's own memory (MIMP-002) is pushed from machineA only (decision 2026-09-27).

## Step 0 — diagnostics (read-only)

```powershell
whoami
git -C D:\MIMemoryLLMDb status -sb
git -C D:\MIMemoryLLMDb log --oneline -3
git -C D:\MIMemoryLLMDb remote get-url origin
git -C D:\MIMemoryLLMDb config --show-origin --get-all credential.helper
Get-Content $env:USERPROFILE\.mimp-config.json
Get-ScheduledTask MIMemoryLLMDb-ScheduledSync -ErrorAction SilentlyContinue | Get-ScheduledTaskInfo
Get-Content $env:USERPROFILE\.mimp-scheduled-run.log -Tail 30 -ErrorAction SilentlyContinue
Test-Path $env:USERPROFILE\.ssh\mimp_deploy
```

Report: the user (expected `Administrator`), branch, whether the task exists and its last
result/run time, and the last log lines. **If the branch is not `master`, or `status` shows
modified tracked files → stop and report.**

## Step 1 — get the current code

```powershell
git -C D:\MIMemoryLLMDb pull --rebase
Select-String -Path D:\MIMemoryLLMDb\tools\install-schedule.ps1 -Pattern 'Unattended' -Quiet   # must be True
node D:\MIMemoryLLMDb\tools\lint.mjs --quiet    # baseline: note every ERROR line
```

This session is interactive, so the existing HTTPS credentials still work for this one pull.
After it, `projects/MIMP-002-mimp/` disappears from this machine's sparse checkout at the next
`mimp` command — expected: MIMP-002 is no longer registered on machineB.

## Step 2 — create the deploy key (Git Bash)

```bash
mkdir -p ~/.ssh
ssh-keygen -t ed25519 -N "" -C "mimp-deploy machineB" -f ~/.ssh/mimp_deploy
ssh-keyscan -t ed25519 github.com > ~/.ssh/mimp_known_hosts
ssh-keygen -lf ~/.ssh/mimp_known_hosts
```

The fingerprint must be **`SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU`** — GitHub's
published ED25519 key (docs.github.com → "GitHub's SSH key fingerprints"). **Different → stop.**

No passphrase is deliberate: an unattended task cannot type one. The key's reach is one repo.

## Step 3 — register the public key on GitHub (write access)

If `gh auth status` shows a login with admin rights on `DHS-Ltd/MIMemoryLLMDb`:

```bash
gh repo deploy-key add ~/.ssh/mimp_deploy.pub --allow-write --title "mimp machineB" -R DHS-Ltd/MIMemoryLLMDb
```

Otherwise show Maidul the **public** key (`cat ~/.ssh/mimp_deploy.pub`) and wait — he will add it
from machineA.

## Step 4 — point this repo at the key

```powershell
git -C D:\MIMemoryLLMDb config core.sshCommand "ssh -i C:/Users/Administrator/.ssh/mimp_deploy -o IdentitiesOnly=yes -o UserKnownHostsFile=C:/Users/Administrator/.ssh/mimp_known_hosts"
git -C D:\MIMemoryLLMDb remote set-url origin git@github.com:DHS-Ltd/MIMemoryLLMDb.git
git -C D:\MIMemoryLLMDb fetch origin
```

Adjust `C:/Users/Administrator` if Step 0's `whoami` said otherwise. Absolute paths on purpose:
the unattended task must not depend on `HOME` or `~/.ssh/config` being resolved.
`fetch` must succeed with no prompt of any kind. The MCP server fetches through the same config.

## Step 5 — register the unattended task

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\MIMemoryLLMDb\tools\install-schedule.ps1 -Unattended
```

If it reports access denied, re-run from an elevated PowerShell. It refuses on purpose if
`origin` is still HTTPS.

## Step 6 — test the real unattended path

A manually started S4U task still runs non-interactively, so this tests exactly what 23:00 does.

```powershell
Start-ScheduledTask -TaskName MIMemoryLLMDb-ScheduledSync
do { Start-Sleep 10; $i = Get-ScheduledTaskInfo -TaskName MIMemoryLLMDb-ScheduledSync } while ($i.LastTaskResult -eq 267009)
"result: $($i.LastTaskResult)"          # expect 0
Get-Content $env:USERPROFILE\.mimp-scheduled-run.log -Tail 25
git -C D:\MIMemoryLLMDb log origin/master --oneline -8   # expect "heartbeat: machineB"
```

This run also pushes six weeks of machineB project memory (MIMP-005/006/007).

## Step 7 — verify content

```powershell
node D:\MIMemoryLLMDb\tools\lint.mjs --quiet
```

- The `[heartbeat]` errors for machineB must be gone.
- **Any `superseded-claim` ERROR not in the Step 1 baseline → stop.** It means pushed pacsvm memory
  reintroduced a superseded business claim (this happened on 2026-08-13). Fix it at the **source**
  file in machineB's Claude memory, then push again — never in `projects/`. Procedure:
  `projects/MIMP-002-mimp/machineb-sync-procedure.md` (read it with `git show origin/master:<path>`,
  since it is no longer checked out here).

## Step 8 — record and report

Append an `## Outcome (<date>)` section to this file: task result, heartbeat commit hash, lint
heartbeat line, anything that deviated. Commit it (`docs: machineB unattended sync outcome`) and
`git push` — which also proves the interactive push path over SSH.

Then report the same to Maidul.
