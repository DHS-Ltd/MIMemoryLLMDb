# MIMemoryLLMDb

Git-based project memory system. Syncs AI assistant memory (markdown files) across multiple machines via a private GitHub repo. CLI tool: `tools/mimp.ps1`.

## Key Commands

```powershell
mimp list                                              # show all registered projects
mimp init "Name" "short-name" "E:\path\to\project"   # register new project
mimp push <short-name>                                 # upload memory to GitHub
mimp pull <short-name>                                 # download memory from GitHub
mimp status <short-name>                               # compare local vs repo
mimp sync <short-name>                                 # pull then push
```

## Repo Structure

```
registry.json          ← master project list (MIMP-XXX IDs) — edit this to add projects/paths
machines.json          ← registered machines
tools/mimp.ps1         ← all CLI logic lives here
projects/MIMP-XXX-*/   ← one folder per project, contains MEMORY.md + referenced files
docs/                  ← full guides (workflow, add-new-machine, llm-guide, troubleshooting, roadmap)
```

## Registry Schema

Each project in `registry.json` has:
- `local_paths` — per-machine project directory (where code lives)
- `claude_memory_paths` — per-machine Claude Code memory location (`~/.claude/projects/<encoded>/memory`)

Both are keyed by `machine_id` (user-defined label set in `~/.mimp-config.json`).

## Machines

| ID | Name | OS | Repo path |
|---|---|---|---|
| machineA | MaidulDesktop | Windows | E:\MIMemoryLLMDb |
| machineB | MedIServer | Windows Server 2022 | D:\MIMemoryLLMDb |

## Local Config (not in repo)

`~/.mimp-config.json` — set `machine_id` and `repo_path` per machine. Never committed.

## Read before editing anything

- 🚫 **Never hand-edit files under `projects/`** — it is a replica. `mimp push` copies Claude memory
  → repo one-way and will silently destroy your edit. Edit
  `~/.claude/projects/<encoded>/memory/` instead, then push. See **ADR-0008**.
- **The brain cites; it does not assert.** `org/` and `wiki/` name the Source that owns each claim.
  Authority for anything commercial is `E:\DHS-PACS`. If this repo and a Source disagree, the
  **Source wins**. See **ADR-0006**.
- **Run `mimp lint` before pushing.** Deterministic, no tokens, exit 1 on error.
- **The MCP server reads `origin/master`** — nothing is retrievable until it is pushed.

## Important Notes

- `mimp.ps1` targets PowerShell 5.1 — use single-quoted strings, nested `Join-Path` calls
- `claude_memory_paths` must be looked up on each machine: `ls $env:USERPROFILE\.claude\projects\`
- See `docs/troubleshooting.md` for known issues and fixes
- See `projects/MIMP-002-mimp/` for full project memory (architecture, current state, setup history)
