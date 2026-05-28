# MIMemoryLLMDb — Architecture

## Design Approach

Option A — Pure Git + CLI Scripts, Copy method. No database engine, no embeddings, no server. Git is the database. GitHub is the backup. Plain markdown is the format.

## Repository Structure

```
MIMemoryLLMDb/
├── README.md                          -- Repo overview with links to all docs
├── SCHEMA.md                          -- Memory format spec (LLMs read this)
├── registry.json                      -- Master project registry (MIMP-XXX IDs)
├── machines.json                      -- Registered machines
├── .gitignore                         -- Excludes .mimp-config.json
│
├── projects/
│   ├── MIMP-001-image-converter/
│   │   ├── MEMORY.md                  -- Root index for this project
│   │   ├── architecture.md
│   │   ├── bugs-fixed.md
│   │   ├── current-state.md
│   │   ├── environment-setup.md
│   │   └── project-overview.md
│   │
│   └── MIMP-002-mimp/
│       ├── MEMORY.md
│       ├── architecture.md
│       ├── current-state.md
│       └── setup-history.md
│
├── tools/
│   ├── mimp.ps1                       -- PowerShell CLI (all commands)
│   └── local-config.template.json    -- Template for machine-local config
│
└── docs/
    ├── MaidulMemoryProject-Implementation-Guide.md
    ├── add-new-machine.md
    ├── llm-guide.md
    ├── roadmap.md
    ├── troubleshooting.md
    └── workflow.md
```

## Registry Schema

`registry.json` tracks all projects. Fields per project:

```json
"MIMP-001": {
    "short_name": "image-converter",      -- used in CLI commands
    "full_name": "ImageConverter",        -- human-readable display name
    "created": "2026-05-28",
    "created_by": "machineA",
    "status": "active",                   -- active | archived
    "local_paths": {
        "machineA": "E:\\Self_project\\ImageConverter",
        "machineB": null                  -- null = not on this machine
    },
    "claude_memory_path": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory"
}
```

The `claude_memory_path` field was added because Claude Code stores agent memory centrally at `~/.claude/projects/<encoded-path>/memory/` rather than inside the project directory.

## Machine Config Schema

Each machine has a local config file at `~/.mimp-config.json` (not committed to git):

```json
{
    "machine_id": "machineA",
    "repo_path": "E:\\MIMemoryLLMDb",
    "default_memory_dir": ".claude",
    "auto_pull_on_start": false
}
```

Machines are also registered in `machines.json` (committed to git):

```json
{
    "machines": {
        "machineA": {
            "name": "MaidulDesktop",
            "os": "windows",
            "description": "Main development desktop",
            "repo_path": "E:\\MIMemoryLLMDb",
            "registered": "2026-05-28"
        },
        "machineB": {
            "name": "MedIServer",
            "os": "windows-server-2022",
            "description": "Always-on office server",
            "repo_path": "D:\\MIMemoryLLMDb",
            "registered": "2026-05-28"
        }
    }
}
```

## How Push Works

`mimp push <project>` does:
1. `git pull --rebase` to sync latest from GitHub
2. Load project entry from registry.json using machine_id to resolve local_path
3. Scan three locations for .md files:
   - `{local_path}/CLAUDE.md`
   - `{local_path}/.claude/*.md`
   - `{local_path}/memory/*.md`
   - `{claude_memory_path}/*.md` (Claude Code agent memory)
4. Copy all found files to `projects/MIMP-XXX-shortname/` in the repo
5. Update `Last updated` and `Updated by` metadata in MEMORY.md
6. `git add -A && git commit && git push`

## How Pull Works

`mimp pull <project>` does:
1. `git pull --rebase`
2. Read project entry from registry to get local_path for this machine
3. Copy all .md files from `projects/MIMP-XXX-shortname/` to local:
   - `CLAUDE.md` → `{local_path}/CLAUDE.md` (Claude Code reads this automatically)
   - `MEMORY.md` → `{local_path}/.claude/MEMORY.md`
   - Other files → `{local_path}/.claude/{filename}`

## PowerShell 5.1 Compatibility Notes

The script runs on Windows PowerShell 5.1 (not PowerShell 7). Key differences observed:
- `Join-Path` only accepts 2 path segments — must nest calls for 3 segments
- Ternary-style `$x = if (cond) { a } else { b }` works but fragile — use explicit if/else blocks
- Use single-quoted strings `'...'` for static text to avoid encoding issues
- Box-drawing characters (`═`) cause garbled output in some terminals — use ASCII (`-`) instead

## LLM Agnosticism

The format is intentionally LLM-agnostic:
- Plain markdown, no proprietary syntax
- SCHEMA.md at repo root explains the format to any LLM
- MEMORY.md starts with a self-describing comment block
- Any LLM that can read text files can use this system
- See docs/llm-guide.md for integration instructions per LLM type
