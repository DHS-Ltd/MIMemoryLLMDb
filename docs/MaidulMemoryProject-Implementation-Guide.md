# MIMemoryLLMDb — Implementation Guide

> **Approach:** Option A — Pure Git + CLI Scripts, Copy method
> **Primary client:** Claude Code (architecture is LLM-agnostic)
> **Storage:** GitHub private repository
> **Machines:** Multi-machine (currently machineA/ServerPC + machineB/Desktop, expandable)

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Why This Works for Any LLM](#2-why-this-works-for-any-llm)
3. [GitHub Repository Setup](#3-github-repository-setup)
4. [Repository Structure](#4-repository-structure)
5. [Core Files — Schema & Registry](#5-core-files--schema--registry)
6. [MEMORY.md Format Specification](#6-memorymd-format-specification)
7. [Machine Registration](#7-machine-registration)
8. [CLI Tools — PowerShell (Windows)](#8-cli-tools--powershell-windows)
9. [CLI Tools — Bash (Linux/macOS)](#9-cli-tools--bash-linuxmacos)
10. [Workflow: Register a New Project](#10-workflow-register-a-new-project)
11. [Workflow: Push Memory to GitHub](#11-workflow-push-memory-to-github)
12. [Workflow: Pull Memory to Local Machine](#12-workflow-pull-memory-to-local-machine)
13. [Workflow: Import Existing Project Memories](#13-workflow-import-existing-project-memories)
14. [How Claude Code Uses This](#14-how-claude-code-uses-this)
15. [How Other LLMs Use This](#15-how-other-llms-use-this)
16. [Backup & Recovery](#16-backup--recovery)
17. [Adding a New Machine in the Future](#17-adding-a-new-machine-in-the-future)
18. [Project ID Reference (Initial)](#18-project-id-reference-initial)
19. [Quick Command Reference](#19-quick-command-reference)

---

## 1. Design Principles

**P1 — Git IS the database.** Every memory is a markdown file. Git history is the audit trail. GitHub is the backup. No separate database engine needed.

**P2 — Human-readable = LLM-readable.** Plain markdown with self-describing headers. Any LLM that can read text can understand the memory format without special parsing.

**P3 — Copy, not symlink.** Each local project keeps its own memory files. The CLI tool copies them to/from the GitHub repo. Two copies exist — the local working copy and the central backup. The push script warns if they've diverged.

**P4 — Machine-aware, not machine-dependent.** Every memory file records which machine created/updated it. Any machine can pull any project's memory regardless of where it was created.

**P5 — Project ID as single source of truth.** Every project gets a unique `MIMP-XXX` ID from `registry.json`. The CLI verifies this ID before any push operation.

---

## 2. Why This Works for Any LLM

The repo contains a `SCHEMA.md` file at the root. When any LLM (Claude, GPT, Gemini, Llama, DeepSeek, Qwen) is pointed at a project's memory folder, it reads `MEMORY.md` first which contains:

- A plaintext header explaining the format
- A summary of the project
- Key facts as bullet points
- File references with descriptions

There is **no proprietary syntax, no embeddings, no vector DB queries**. It's just organized markdown. Any LLM that can read files can use it.

The critical design: each `MEMORY.md` starts with a **self-describing block** that tells the LLM what this file is and how to use it:

```markdown
<!-- MEMORY FORMAT: This is a project memory index file.
     Read this file first for project context.
     Referenced files contain deeper details — read them when relevant.
     Format version: 1.0 | Schema: github.com/user/MIMemoryLLMDb/SCHEMA.md -->
```

This block works for Claude Code (which reads CLAUDE.md), ChatGPT (which reads uploaded files), and any local model (which reads context files).

---

## 3. GitHub Repository Setup

### Step 1 — Create the repo

```bash
# On either machine, in your preferred projects directory
mkdir MIMemoryLLMDb
cd MIMemoryLLMDb
git init

# Create the GitHub repo (private)
# Option A: via GitHub CLI
gh repo create MIMemoryLLMDb --private --source=. --remote=origin

# Option B: create on github.com manually, then:
git remote add origin git@github.com:YOUR_USERNAME/MIMemoryLLMDb.git
```

### Step 2 — Clone on all machines

```bash
# On machineA (ServerPC)
cd /home/maidul/tools  # or wherever you keep tools
git clone git@github.com:YOUR_USERNAME/MIMemoryLLMDb.git

# On machineB (Desktop) — PowerShell
cd E:\Tools  # or wherever you keep tools
git clone git@github.com:YOUR_USERNAME/MIMemoryLLMDb.git
```

### Step 3 — Note the clone path on each machine

You'll configure this in `local-config.json` (Section 7). Example:
- machineA: `/home/maidul/tools/MIMemoryLLMDb`
- machineB: `E:\Tools\MIMemoryLLMDb`

---

## 4. Repository Structure

```
MIMemoryLLMDb/
│
├── README.md                         ← Repo overview for humans
├── SCHEMA.md                         ← Memory format spec (LLMs read this)
├── registry.json                     ← Master project registry
├── machines.json                     ← Registered machines
│
├── projects/
│   ├── MIMP-001-dhv/
│   │   ├── MEMORY.md                 ← Root index for this project
│   │   ├── architecture.md           ← Deep context file
│   │   ├── orthanc-config.md         ← Deep context file
│   │   └── deployment.md             ← Deep context file
│   │
│   ├── MIMP-002-bdc-hms/
│   │   ├── MEMORY.md
│   │   ├── gas-setup.md
│   │   └── android-build.md
│   │
│   └── ... (more projects)
│
└── tools/
    ├── mimp.ps1                       ← PowerShell CLI (all commands)
    ├── mimp.sh                        ← Bash CLI (all commands)
    └── local-config.template.json    ← Template for machine-local config
```

Each machine also has a **local config file** (not committed to git):
```
~/.mimp-config.json     (Linux)
%USERPROFILE%\.mimp-config.json   (Windows)
```

---

## 5. Core Files — Schema & Registry

### `README.md`

```markdown
# MIMemoryLLMDb

Central memory database for all projects, synced via Git.

## What is this?
A structured backup and sync system for project knowledge (memory files)
used by AI coding assistants (Claude Code, etc.) across multiple machines.

## How it works
- Each project has a unique ID (MIMP-XXX) and a folder under `projects/`
- Each project folder contains a `MEMORY.md` index and referenced detail files
- CLI tools (`mimp push`, `mimp pull`, `mimp init`) sync between local projects and this repo
- Any LLM can read `MEMORY.md` to understand a project's full context

## Quick start
```
mimp init "My New Project"    # Register a project, get MIMP-XXX ID
mimp push MIMP-001             # Push local memory to GitHub
mimp pull MIMP-001             # Pull memory from GitHub to local
mimp list                     # List all registered projects
mimp status MIMP-001           # Check if local and remote are in sync
```

## Format
See [SCHEMA.md](./SCHEMA.md) for the memory file format specification.
```

---

### `SCHEMA.md`

This is the file any LLM reads to understand the memory format:

```markdown
# MIMemoryLLMDb — Memory Schema v1.0

## Purpose
This document defines the format for project memory files stored in this
repository. AI assistants (Claude Code, ChatGPT, Gemini, local models)
should read this to understand how memory is structured.

## Structure per project

Each project lives in `projects/MIMP-XXX-shortname/` and contains:

### MEMORY.md (required)
The root index file. Always read this first. It contains:
1. A metadata block (project ID, last update, machines, status)
2. A project summary (2-4 sentences)
3. Key facts (bullet list of most important things to know)
4. Referenced files (links to deeper context with descriptions)

### Referenced .md files (optional)
Deeper context files linked from MEMORY.md. Only read these when the
current task is related to their described topic.

## MEMORY.md template

---begin template---

<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [MIMP-XXX] Project Full Name

| Field        | Value                    |
|--------------|--------------------------|
| Project ID   | MIMP-XXX                  |
| Short name   | project-short-name       |
| Last updated | YYYY-MM-DD               |
| Updated by   | machine-name             |
| Status       | active / archived        |
| Machines     | machineA, machineB       |

## Summary
[2-4 sentences describing what this project is and its current state]

## Key Facts
- [Fact 1: most important thing to know]
- [Fact 2: stack, architecture, or key decision]
- [Fact 3: current status or blocker]
- [Fact 4: paths, configs, or access details]

## Memory Files
| File | Description |
|------|-------------|
| [architecture.md](./architecture.md) | Stack choices and design decisions |
| [config.md](./config.md) | Ports, paths, env vars, credentials hints |

## Recent Changes
- YYYY-MM-DD: [What changed and why]
- YYYY-MM-DD: [What changed and why]

---end template---

## Rules for memory content
1. Be concise — each fact should be 1-2 lines max
2. Include file paths, port numbers, and config values — these are the most
   useful things for an AI to know
3. Keep MEMORY.md under 200 lines — split into referenced files if longer
4. Referenced files should be self-contained — readable without MEMORY.md
5. Use plain markdown only — no HTML, no special tags, no frontmatter
6. The metadata table at the top is required for all MEMORY.md files
```

---

### `registry.json`

```json
{
  "schema_version": "1.0",
  "next_id": 1,
  "projects": {}
}
```

When a project is registered, it becomes:

```json
{
  "schema_version": "1.0",
  "next_id": 7,
  "projects": {
    "MIMP-001": {
      "short_name": "dhv",
      "full_name": "DH DICOM Viewer",
      "created": "2026-05-28",
      "created_by": "machineB",
      "status": "active",
      "local_paths": {
        "machineA": "/home/maidul/projects/dhv",
        "machineB": "D:\\Projects\\DHV"
      }
    },
    "MIMP-002": {
      "short_name": "bdc-hms",
      "full_name": "Baroicha Diagnostic Center HMS",
      "created": "2026-05-28",
      "created_by": "machineB",
      "status": "active",
      "local_paths": {
        "machineA": null,
        "machineB": "E:\\v1-BdcHmsApp"
      }
    }
  }
}
```

---

### `machines.json`

```json
{
  "machines": {
    "machineA": {
      "name": "ServerPC",
      "os": "linux",
      "description": "Hetzner Cloud server, always-on",
      "registered": "2026-05-28"
    },
    "machineB": {
      "name": "MaidulDesktop",
      "os": "windows",
      "description": "Home desktop, RTX 2060, 32GB RAM",
      "registered": "2026-05-28"
    }
  }
}
```

To add a new machine later, just add an entry here and create a local config.

---

## 6. MEMORY.md Format Specification

Here is a **real example** of what `projects/MIMP-001-dhv/MEMORY.md` should look like:

```markdown
<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [MIMP-001] DH DICOM Viewer (DHV)

| Field        | Value                              |
|--------------|------------------------------------|
| Project ID   | MIMP-001                            |
| Short name   | dhv                                |
| Last updated | 2026-05-28                         |
| Updated by   | machineB                           |
| Status       | active                             |
| Machines     | machineA, machineB                 |

## Summary
Cloud-capable medical imaging platform using Orthanc as on-premise PACS
relay with OHIF v3 (Cornerstone3D) as the web viewer. A Node.js backend
handles patient link generation. Designed for future migration to Google
Cloud Healthcare API with minimal config changes.

## Key Facts
- Hosting: Hetzner Cloud, Docker-based deployment
- Stack: Orthanc → DICOMweb → OHIF v3 → Node.js backend
- Orthanc runs on Windows as NSSM service (desktop) and Docker (server)
- Dual-instance Orthanc architecture: primary on D:, archive on E: via OrthancArchive service
- Java: Temurin 17.0.18 at E:\java\Eclipse Adoptium\jdk-17.0.18.8-hotspot
- Maven: C:\Program Files\Apache\maven\apache-maven-3.9.15
- Migration monitor: Python service at C:\OrthancMigration\monitor.py
- All documentation must be .md files unless explicitly asked otherwise

## Memory Files
| File | Description |
|------|-------------|
| [architecture.md](./architecture.md) | Stack decisions, why OHIF over Weasis, DICOMweb design |
| [orthanc-config.md](./orthanc-config.md) | Ports, AE titles, dual-instance peer setup, S3 plugin |
| [deployment.md](./deployment.md) | Hetzner provisioning, Docker compose, Nginx, Let's Encrypt |

## Recent Changes
- 2026-05-28: Initial memory export from Claude Projects
- 2026-05-20: Decided on Hetzner over local-only deployment
```

---

## 7. Machine Registration

Each machine needs a **local config file** (never committed to git).

### Template: `tools/local-config.template.json`

```json
{
  "machine_id": "CHANGE_ME",
  "repo_path": "CHANGE_ME",
  "default_memory_dir": ".claude",
  "auto_pull_on_start": false
}
```

### machineA setup (Linux):

```bash
cp tools/local-config.template.json ~/.mimp-config.json
nano ~/.mimp-config.json
```

```json
{
  "machine_id": "machineA",
  "repo_path": "/home/maidul/tools/MIMemoryLLMDb",
  "default_memory_dir": ".claude",
  "auto_pull_on_start": false
}
```

### machineB setup (Windows PowerShell):

```powershell
Copy-Item tools\local-config.template.json $env:USERPROFILE\.mimp-config.json
notepad $env:USERPROFILE\.mimp-config.json
```

```json
{
  "machine_id": "machineB",
  "repo_path": "E:\\Tools\\MIMemoryLLMDb",
  "default_memory_dir": ".claude",
  "auto_pull_on_start": false
}
```

The `default_memory_dir` tells the tool where memory files live inside each local project. For Claude Code projects this is typically the project root (where CLAUDE.md lives) or a `.claude/` subfolder. Adjust per your convention.

### Add to `.gitignore`

```
# Never commit local machine config
.mimp-config.json
```

---

## 8. CLI Tools — PowerShell (Windows)

Create `tools/mimp.ps1`:

```powershell
# MIMemoryLLMDb CLI — PowerShell version
# Usage: mimp <command> [args]
#
# Commands:
#   init <full_name> <short_name> <local_path>  — Register new project
#   push <project_id_or_short_name>             — Push local memory to repo
#   pull <project_id_or_short_name>             — Pull repo memory to local
#   list                                        — List all projects
#   status <project_id_or_short_name>           — Compare local vs repo
#   sync <project_id_or_short_name>             — Pull then push (full sync)

param(
    [Parameter(Position=0)][string]$Command,
    [Parameter(Position=1)][string]$Arg1,
    [Parameter(Position=2)][string]$Arg2,
    [Parameter(Position=3)][string]$Arg3
)

# ── Config Loading ──────────────────────────────────────────────────
$ConfigPath = Join-Path $env:USERPROFILE ".mimp-config.json"
if (-not (Test-Path $ConfigPath)) {
    Write-Host "ERROR: No config found at $ConfigPath" -ForegroundColor Red
    Write-Host "Run: Copy-Item tools\local-config.template.json $ConfigPath"
    exit 1
}
$Config = Get-Content $ConfigPath | ConvertFrom-Json
$RepoPath = $Config.repo_path
$MachineId = $Config.machine_id
$RegistryPath = Join-Path $RepoPath "registry.json"

# ── Helper Functions ────────────────────────────────────────────────

function Load-Registry {
    return Get-Content $RegistryPath -Raw | ConvertFrom-Json
}

function Save-Registry($reg) {
    $reg | ConvertTo-Json -Depth 10 | Set-Content $RegistryPath -Encoding UTF8
}

function Resolve-ProjectId($input) {
    $reg = Load-Registry
    # Direct MIMP-XXX match
    if ($reg.projects.PSObject.Properties.Name -contains $input) {
        return $input
    }
    # Short name match
    foreach ($prop in $reg.projects.PSObject.Properties) {
        if ($prop.Value.short_name -eq $input) {
            return $prop.Name
        }
    }
    Write-Host "ERROR: Project '$input' not found in registry" -ForegroundColor Red
    exit 1
}

function Get-ProjectFolder($projectId) {
    $reg = Load-Registry
    $project = $reg.projects.$projectId
    return Join-Path $RepoPath "projects" "$projectId-$($project.short_name)"
}

function Get-LocalPath($projectId) {
    $reg = Load-Registry
    $project = $reg.projects.$projectId
    $path = $project.local_paths.$MachineId
    if (-not $path) {
        Write-Host "ERROR: No local path configured for $projectId on $MachineId" -ForegroundColor Red
        Write-Host "Update registry.json → projects → $projectId → local_paths → $MachineId"
        exit 1
    }
    return $path
}

function Git-Sync {
    Push-Location $RepoPath
    git pull --rebase --quiet 2>$null
    Pop-Location
}

function Git-CommitPush($message) {
    Push-Location $RepoPath
    git add -A
    git commit -m $message --quiet
    git push --quiet
    Pop-Location
}

# ── Commands ────────────────────────────────────────────────────────

function Cmd-Init {
    param($FullName, $ShortName, $LocalPath)
    if (-not $FullName -or -not $ShortName) {
        Write-Host "Usage: mimp init <full_name> <short_name> <local_path>" -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $reg = Load-Registry

    # Check for duplicate short names
    foreach ($prop in $reg.projects.PSObject.Properties) {
        if ($prop.Value.short_name -eq $ShortName) {
            Write-Host "ERROR: Short name '$ShortName' already used by $($prop.Name)" -ForegroundColor Red
            exit 1
        }
    }

    # Generate project ID
    $nextId = $reg.next_id
    $projectId = "MIMP-{0:D3}" -f $nextId
    $reg.next_id = $nextId + 1

    # Create project entry
    $newProject = @{
        short_name  = $ShortName
        full_name   = $FullName
        created     = (Get-Date -Format "yyyy-MM-dd")
        created_by  = $MachineId
        status      = "active"
        local_paths = @{
            $MachineId = if ($LocalPath) { $LocalPath } else { $null }
        }
    }
    $reg.projects | Add-Member -NotePropertyName $projectId -NotePropertyValue $newProject

    Save-Registry $reg

    # Create project folder with template MEMORY.md
    $folderName = "$projectId-$ShortName"
    $projectDir = Join-Path $RepoPath "projects" $folderName
    New-Item -ItemType Directory -Path $projectDir -Force | Out-Null

    $template = @"
<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [$projectId] $FullName

| Field        | Value                              |
|--------------|------------------------------------|
| Project ID   | $projectId                         |
| Short name   | $ShortName                         |
| Last updated | $(Get-Date -Format 'yyyy-MM-dd')   |
| Updated by   | $MachineId                         |
| Status       | active                             |
| Machines     | $MachineId                         |

## Summary
[TODO: Write 2-4 sentences describing this project]

## Key Facts
- [TODO: Add key facts]

## Memory Files
| File | Description |
|------|-------------|
| | |

## Recent Changes
- $(Get-Date -Format 'yyyy-MM-dd'): Project registered
"@

    $template | Set-Content (Join-Path $projectDir "MEMORY.md") -Encoding UTF8

    Git-CommitPush "init: $projectId ($ShortName) - $FullName"

    Write-Host ""
    Write-Host "  Project registered successfully!" -ForegroundColor Green
    Write-Host "  ID:     $projectId" -ForegroundColor Cyan
    Write-Host "  Name:   $FullName"
    Write-Host "  Folder: projects/$folderName/"
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Set local_path in registry.json if not set"
    Write-Host "  2. Edit projects/$folderName/MEMORY.md with project details"
    Write-Host "  3. Run: mimp push $ShortName"
    Write-Host ""
}

function Cmd-Push {
    param($ProjectRef)
    if (-not $ProjectRef) {
        Write-Host "Usage: mimp push <project_id_or_short_name>" -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $projectId = Resolve-ProjectId $ProjectRef
    $repoDir = Get-ProjectFolder $projectId
    $localPath = Get-LocalPath $projectId

    # Find memory files in local project
    # Look for CLAUDE.md, MEMORY.md, and any .md files in .claude/ or memory/
    $memoryFiles = @()

    # Check for CLAUDE.md at project root
    $claudeMd = Join-Path $localPath "CLAUDE.md"
    if (Test-Path $claudeMd) { $memoryFiles += $claudeMd }

    # Check for .claude/ directory
    $claudeDir = Join-Path $localPath ".claude"
    if (Test-Path $claudeDir) {
        Get-ChildItem -Path $claudeDir -Filter "*.md" -Recurse |
            ForEach-Object { $memoryFiles += $_.FullName }
    }

    # Check for memory/ directory
    $memoryDir = Join-Path $localPath "memory"
    if (Test-Path $memoryDir) {
        Get-ChildItem -Path $memoryDir -Filter "*.md" -Recurse |
            ForEach-Object { $memoryFiles += $_.FullName }
    }

    if ($memoryFiles.Count -eq 0) {
        Write-Host "WARNING: No memory files found in $localPath" -ForegroundColor Yellow
        Write-Host "Looked for: CLAUDE.md, .claude/*.md, memory/*.md"
        exit 1
    }

    Write-Host "Pushing memory for $projectId..." -ForegroundColor Cyan
    Write-Host "Source: $localPath"
    Write-Host "Target: $repoDir"
    Write-Host ""

    # Ensure repo project folder exists
    New-Item -ItemType Directory -Path $repoDir -Force | Out-Null

    foreach ($file in $memoryFiles) {
        $relativePath = $file.Replace($localPath, "").TrimStart("\", "/")
        $destPath = Join-Path $repoDir $relativePath

        # Create subdirectory if needed
        $destDir = Split-Path $destPath -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null

        Copy-Item -Path $file -Destination $destPath -Force
        Write-Host "  Copied: $relativePath" -ForegroundColor DarkGray
    }

    # Update MEMORY.md metadata if it exists
    $memoryMd = Join-Path $repoDir "MEMORY.md"
    if (Test-Path $memoryMd) {
        $content = Get-Content $memoryMd -Raw
        $today = Get-Date -Format "yyyy-MM-dd"
        $content = $content -replace '(?<=Last updated \| )[\d-]+', $today
        $content = $content -replace '(?<=Updated by   \| )\S+', $MachineId
        $content | Set-Content $memoryMd -Encoding UTF8
    }

    Git-CommitPush "push: $projectId from $MachineId ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"

    Write-Host ""
    Write-Host "  Pushed $($memoryFiles.Count) file(s) for $projectId" -ForegroundColor Green
}

function Cmd-Pull {
    param($ProjectRef)
    if (-not $ProjectRef) {
        Write-Host "Usage: mimp pull <project_id_or_short_name>" -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $projectId = Resolve-ProjectId $ProjectRef
    $repoDir = Get-ProjectFolder $projectId
    $localPath = Get-LocalPath $projectId

    if (-not (Test-Path $repoDir)) {
        Write-Host "ERROR: No memory folder found at $repoDir" -ForegroundColor Red
        exit 1
    }

    Write-Host "Pulling memory for $projectId..." -ForegroundColor Cyan
    Write-Host "Source: $repoDir"
    Write-Host "Target: $localPath"
    Write-Host ""

    # Ensure local directories exist
    $claudeDir = Join-Path $localPath ".claude"
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null

    # Copy all .md files from repo project folder to local
    $files = Get-ChildItem -Path $repoDir -Filter "*.md" -Recurse
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace($repoDir, "").TrimStart("\", "/")

        # MEMORY.md → Copy as-is to .claude/MEMORY.md for reference
        # CLAUDE.md handling: if the file is named CLAUDE.md, put it at root
        if ($file.Name -eq "MEMORY.md") {
            $destPath = Join-Path $claudeDir "MEMORY.md"
        } elseif ($file.Name -eq "CLAUDE.md") {
            $destPath = Join-Path $localPath "CLAUDE.md"
        } else {
            $destPath = Join-Path $claudeDir $relativePath
        }

        $destDir = Split-Path $destPath -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "  Pulled: $relativePath → $destPath" -ForegroundColor DarkGray
    }

    Write-Host ""
    Write-Host "  Pulled $($files.Count) file(s) for $projectId" -ForegroundColor Green
    Write-Host "  Memory is now available at: $localPath" -ForegroundColor Cyan
}

function Cmd-List {
    Git-Sync
    $reg = Load-Registry

    Write-Host ""
    Write-Host "  Registered Projects" -ForegroundColor Cyan
    Write-Host "  ═══════════════════════════════════════════════════" -ForegroundColor DarkGray

    foreach ($prop in $reg.projects.PSObject.Properties) {
        $p = $prop.Value
        $localPath = $p.local_paths.$MachineId
        $hasLocal = if ($localPath -and (Test-Path $localPath)) { "LOCAL" } else { "—" }

        $statusColor = if ($p.status -eq "active") { "Green" } else { "DarkGray" }
        Write-Host ("  {0}  {1,-30} [{2}]  {3}" -f $prop.Name, $p.full_name, $p.status, $hasLocal) -ForegroundColor $statusColor
    }
    Write-Host ""
}

function Cmd-Status {
    param($ProjectRef)
    if (-not $ProjectRef) {
        Write-Host "Usage: mimp status <project_id_or_short_name>" -ForegroundColor Yellow
        exit 1
    }

    Git-Sync
    $projectId = Resolve-ProjectId $ProjectRef
    $repoDir = Get-ProjectFolder $projectId
    $localPath = Get-LocalPath $projectId

    Write-Host ""
    Write-Host "  Status for $projectId" -ForegroundColor Cyan
    Write-Host "  Repo:  $repoDir"
    Write-Host "  Local: $localPath"
    Write-Host ""

    # Compare file counts and modification dates
    $repoFiles = Get-ChildItem -Path $repoDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue
    $localMdFiles = @()

    $claudeMd = Join-Path $localPath "CLAUDE.md"
    if (Test-Path $claudeMd) { $localMdFiles += Get-Item $claudeMd }

    $claudeDir = Join-Path $localPath ".claude"
    if (Test-Path $claudeDir) {
        Get-ChildItem -Path $claudeDir -Filter "*.md" -Recurse |
            ForEach-Object { $localMdFiles += $_ }
    }

    Write-Host "  Repo files:  $($repoFiles.Count)" -ForegroundColor $(if ($repoFiles.Count -gt 0) {"Green"} else {"Yellow"})
    Write-Host "  Local files: $($localMdFiles.Count)" -ForegroundColor $(if ($localMdFiles.Count -gt 0) {"Green"} else {"Yellow"})

    if ($repoFiles.Count -gt 0) {
        $latestRepo = ($repoFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
        Write-Host "  Repo last updated:  $latestRepo"
    }
    if ($localMdFiles.Count -gt 0) {
        $latestLocal = ($localMdFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
        Write-Host "  Local last updated: $latestLocal"
    }
    Write-Host ""
}

# ── Command Router ──────────────────────────────────────────────────

switch ($Command) {
    "init"   { Cmd-Init -FullName $Arg1 -ShortName $Arg2 -LocalPath $Arg3 }
    "push"   { Cmd-Push -ProjectRef $Arg1 }
    "pull"   { Cmd-Pull -ProjectRef $Arg1 }
    "list"   { Cmd-List }
    "status" { Cmd-Status -ProjectRef $Arg1 }
    "sync"   {
        Cmd-Pull -ProjectRef $Arg1
        Cmd-Push -ProjectRef $Arg1
    }
    default  {
        Write-Host ""
        Write-Host "  MIMemoryLLMDb CLI" -ForegroundColor Cyan
        Write-Host "  Usage: mimp <command> [args]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Commands:"
        Write-Host "    init  <full_name> <short_name> <local_path>  Register new project"
        Write-Host "    push  <project_id_or_short_name>             Push local → GitHub"
        Write-Host "    pull  <project_id_or_short_name>             Pull GitHub → local"
        Write-Host "    list                                         List all projects"
        Write-Host "    status <project_id_or_short_name>            Compare local vs repo"
        Write-Host "    sync  <project_id_or_short_name>             Pull then push"
        Write-Host ""
    }
}
```

### Setting up the `mimp` alias (PowerShell)

Add to your PowerShell profile (`$PROFILE`):

```powershell
function mimp {
    & "E:\Tools\MIMemoryLLMDb\tools\mimp.ps1" @args
}
```

Reload: `. $PROFILE`

Now you can run `mimp list`, `mimp push dhv`, etc. from anywhere.

---

## 9. CLI Tools — Bash (Linux/macOS)

Create `tools/mimp.sh`:

```bash
#!/bin/bash
# MIMemoryLLMDb CLI — Bash version
# Usage: mimp <command> [args]

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────
CONFIG_FILE="$HOME/.mimp-config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: No config found at $CONFIG_FILE"
    echo "Run: cp tools/local-config.template.json $CONFIG_FILE"
    exit 1
fi

MACHINE_ID=$(jq -r '.machine_id' "$CONFIG_FILE")
REPO_PATH=$(jq -r '.repo_path' "$CONFIG_FILE")
REGISTRY="$REPO_PATH/registry.json"

# ── Helpers ─────────────────────────────────────────────────────────

resolve_project_id() {
    local input="$1"
    # Direct MIMP-XXX match
    if jq -e ".projects[\"$input\"]" "$REGISTRY" > /dev/null 2>&1; then
        echo "$input"
        return
    fi
    # Short name match
    local id=$(jq -r ".projects | to_entries[] | select(.value.short_name == \"$input\") | .key" "$REGISTRY")
    if [ -n "$id" ]; then
        echo "$id"
        return
    fi
    echo "ERROR: Project '$input' not found" >&2
    exit 1
}

get_project_folder() {
    local pid="$1"
    local short=$(jq -r ".projects[\"$pid\"].short_name" "$REGISTRY")
    echo "$REPO_PATH/projects/$pid-$short"
}

get_local_path() {
    local pid="$1"
    local path=$(jq -r ".projects[\"$pid\"].local_paths[\"$MACHINE_ID\"] // empty" "$REGISTRY")
    if [ -z "$path" ]; then
        echo "ERROR: No local path for $pid on $MACHINE_ID" >&2
        exit 1
    fi
    echo "$path"
}

git_sync() {
    cd "$REPO_PATH"
    git pull --rebase --quiet 2>/dev/null || true
}

git_commit_push() {
    cd "$REPO_PATH"
    git add -A
    git commit -m "$1" --quiet 2>/dev/null || true
    git push --quiet
}

# ── Commands ────────────────────────────────────────────────────────

cmd_init() {
    local full_name="$1"
    local short_name="$2"
    local local_path="${3:-}"

    git_sync

    # Check duplicate
    local existing=$(jq -r ".projects | to_entries[] | select(.value.short_name == \"$short_name\") | .key" "$REGISTRY")
    if [ -n "$existing" ]; then
        echo "ERROR: Short name '$short_name' already used by $existing"
        exit 1
    fi

    # Generate ID
    local next_id=$(jq -r '.next_id' "$REGISTRY")
    local project_id=$(printf "MIMP-%03d" "$next_id")

    # Update registry
    local today=$(date +%Y-%m-%d)
    local tmp=$(mktemp)
    jq --arg pid "$project_id" \
       --arg sn "$short_name" \
       --arg fn "$full_name" \
       --arg dt "$today" \
       --arg mid "$MACHINE_ID" \
       --arg lp "$local_path" \
       '.next_id += 1 |
        .projects[$pid] = {
            short_name: $sn,
            full_name: $fn,
            created: $dt,
            created_by: $mid,
            status: "active",
            local_paths: { ($mid): (if $lp == "" then null else $lp end) }
        }' "$REGISTRY" > "$tmp" && mv "$tmp" "$REGISTRY"

    # Create project folder
    local folder="$REPO_PATH/projects/$project_id-$short_name"
    mkdir -p "$folder"

    cat > "$folder/MEMORY.md" << MEMEOF
<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [$project_id] $full_name

| Field        | Value                              |
|--------------|------------------------------------|
| Project ID   | $project_id                        |
| Short name   | $short_name                        |
| Last updated | $today                             |
| Updated by   | $MACHINE_ID                        |
| Status       | active                             |
| Machines     | $MACHINE_ID                        |

## Summary
[TODO: Write 2-4 sentences describing this project]

## Key Facts
- [TODO: Add key facts]

## Memory Files
| File | Description |
|------|-------------|

## Recent Changes
- $today: Project registered
MEMEOF

    git_commit_push "init: $project_id ($short_name) - $full_name"

    echo ""
    echo "  Project registered!"
    echo "  ID:     $project_id"
    echo "  Name:   $full_name"
    echo "  Folder: projects/$project_id-$short_name/"
    echo ""
}

cmd_push() {
    local project_ref="$1"
    git_sync
    local pid=$(resolve_project_id "$project_ref")
    local repo_dir=$(get_project_folder "$pid")
    local local_path=$(get_local_path "$pid")

    echo "Pushing memory for $pid..."
    echo "Source: $local_path"
    echo "Target: $repo_dir"

    mkdir -p "$repo_dir"

    # Collect memory files
    local count=0

    # CLAUDE.md
    if [ -f "$local_path/CLAUDE.md" ]; then
        cp "$local_path/CLAUDE.md" "$repo_dir/"
        echo "  Copied: CLAUDE.md"
        count=$((count+1))
    fi

    # .claude/ directory
    if [ -d "$local_path/.claude" ]; then
        find "$local_path/.claude" -name "*.md" | while read f; do
            rel="${f#$local_path/}"
            mkdir -p "$repo_dir/$(dirname "$rel")"
            cp "$f" "$repo_dir/$rel"
            echo "  Copied: $rel"
            count=$((count+1))
        done
    fi

    # memory/ directory
    if [ -d "$local_path/memory" ]; then
        find "$local_path/memory" -name "*.md" | while read f; do
            rel="${f#$local_path/}"
            mkdir -p "$repo_dir/$(dirname "$rel")"
            cp "$f" "$repo_dir/$rel"
            echo "  Copied: $rel"
            count=$((count+1))
        done
    fi

    git_commit_push "push: $pid from $MACHINE_ID ($(date '+%Y-%m-%d %H:%M'))"
    echo ""
    echo "  Push complete for $pid"
}

cmd_pull() {
    local project_ref="$1"
    git_sync
    local pid=$(resolve_project_id "$project_ref")
    local repo_dir=$(get_project_folder "$pid")
    local local_path=$(get_local_path "$pid")

    echo "Pulling memory for $pid..."
    echo "Source: $repo_dir"
    echo "Target: $local_path"

    mkdir -p "$local_path/.claude"

    find "$repo_dir" -name "*.md" | while read f; do
        rel="${f#$repo_dir/}"
        if [ "$(basename "$f")" = "CLAUDE.md" ]; then
            cp "$f" "$local_path/CLAUDE.md"
            echo "  Pulled: CLAUDE.md → $local_path/CLAUDE.md"
        else
            mkdir -p "$local_path/.claude/$(dirname "$rel")"
            cp "$f" "$local_path/.claude/$rel"
            echo "  Pulled: $rel → .claude/$rel"
        fi
    done

    echo ""
    echo "  Pull complete for $pid"
}

cmd_list() {
    git_sync
    echo ""
    echo "  Registered Projects"
    echo "  ═══════════════════════════════════════════════════"
    jq -r '.projects | to_entries[] | "  \(.key)  \(.value.full_name)  [\(.value.status)]"' "$REGISTRY"
    echo ""
}

cmd_status() {
    local project_ref="$1"
    git_sync
    local pid=$(resolve_project_id "$project_ref")
    local repo_dir=$(get_project_folder "$pid")
    local local_path=$(get_local_path "$pid")

    echo ""
    echo "  Status for $pid"
    echo "  Repo:  $repo_dir"
    echo "  Local: $local_path"
    echo ""

    local repo_count=$(find "$repo_dir" -name "*.md" 2>/dev/null | wc -l)
    local local_count=0
    [ -f "$local_path/CLAUDE.md" ] && local_count=$((local_count+1))
    [ -d "$local_path/.claude" ] && local_count=$((local_count + $(find "$local_path/.claude" -name "*.md" 2>/dev/null | wc -l)))

    echo "  Repo files:  $repo_count"
    echo "  Local files: $local_count"
    echo ""
}

# ── Router ──────────────────────────────────────────────────────────

case "${1:-}" in
    init)   cmd_init "${2:-}" "${3:-}" "${4:-}" ;;
    push)   cmd_push "${2:-}" ;;
    pull)   cmd_pull "${2:-}" ;;
    list)   cmd_list ;;
    status) cmd_status "${2:-}" ;;
    sync)   cmd_pull "${2:-}"; cmd_push "${2:-}" ;;
    *)
        echo ""
        echo "  MIMemoryLLMDb CLI"
        echo "  Usage: mimp <command> [args]"
        echo ""
        echo "  Commands:"
        echo "    init  <full_name> <short_name> <local_path>  Register new project"
        echo "    push  <project_id_or_short_name>             Push local → GitHub"
        echo "    pull  <project_id_or_short_name>             Pull GitHub → local"
        echo "    list                                         List all projects"
        echo "    status <project_id_or_short_name>            Compare local vs repo"
        echo "    sync  <project_id_or_short_name>             Pull then push"
        echo ""
        ;;
esac
```

### Setting up the `mimp` alias (Bash)

```bash
# Add to ~/.bashrc or ~/.zshrc
alias mimp='bash /home/maidul/tools/MIMemoryLLMDb/tools/mimp.sh'
source ~/.bashrc
```

### Dependency: `jq` (install on Linux)

```bash
sudo apt install -y jq
```

---

## 10. Workflow: Register a New Project

```bash
# From any machine
mimp init "My New Cool Project" "cool-project" "/path/to/local/project"

# Output:
#   Project registered!
#   ID:     MIMP-007
#   Name:   My New Cool Project
#   Folder: projects/MIMP-007-cool-project/
```

What happens:
1. `registry.json` is updated with the new project entry
2. A folder `projects/MIMP-007-cool-project/` is created
3. A template `MEMORY.md` is created inside it
4. Everything is committed and pushed to GitHub

### Verification
The push command always resolves the project ID from `registry.json` first. If you type `mimp push wrong-name`, it fails with `Project 'wrong-name' not found`. This is the verification layer.

---

## 11. Workflow: Push Memory to GitHub

```bash
# Using short name
mimp push dhv

# Or using project ID
mimp push MIMP-001
```

What happens:
1. `git pull` to sync latest
2. Verify project ID exists in registry
3. Find memory files in local project directory:
   - `CLAUDE.md` at project root
   - `*.md` files in `.claude/` directory
   - `*.md` files in `memory/` directory
4. Copy all found files to `projects/MIMP-001-dhv/` in the repo
5. `git add`, `commit`, `push`

---

## 12. Workflow: Pull Memory to Local Machine

```bash
# On machineB, need DHV memory that was pushed from machineA
mimp pull dhv
```

What happens:
1. `git pull` to sync latest
2. Verify project ID and local path
3. Copy memory files from `projects/MIMP-001-dhv/` to local project path
4. `CLAUDE.md` goes to project root (Claude Code reads it there)
5. Other `.md` files go into `.claude/` subdirectory

Now Claude Code on machineB has the same memory as machineA.

---

## 13. Workflow: Import Existing Project Memories

For projects where you already have CLAUDE.md and memory files:

### Step 1 — Register each existing project

```bash
mimp init "DH DICOM Viewer" "dhv" "E:\Projects\DHV"
mimp init "Baroicha Diagnostic Center HMS" "bdc-hms" "E:\v1-BdcHmsApp"
mimp init "ERPNext DHS Operations" "erpnext" "/home/maidul/frappe-bench"
mimp init "BDC Marketing Pipeline" "bdc-marketing" "E:\Projects\BDC-FIA"
mimp init "Hazi Rabbani Hospital" "hrh" "E:\Projects\HRH"
```

### Step 2 — Update local_paths for the other machine

Edit `registry.json` manually to add paths for the second machine:

```json
"local_paths": {
    "machineB": "E:\\Projects\\DHV",
    "machineA": "/home/maidul/projects/dhv"
}
```

### Step 3 — Push existing memories

```bash
mimp push dhv
mimp push bdc-hms
mimp push erpnext
mimp push bdc-marketing
mimp push hrh
```

Each push copies your existing CLAUDE.md and referenced files into the GitHub repo. **Your existing files are not modified** — they're copied, not moved.

### Step 4 — Verify on GitHub

Check the repo on github.com. You should see each project folder with all your memory files. The git history now serves as your backup starting from this moment.

---

## 14. How Claude Code Uses This

Claude Code reads `CLAUDE.md` from the project root automatically. When you `mimp pull dhv` on a machine, the CLAUDE.md is placed at the project root where Claude Code expects it.

### The workflow in practice:

```
Morning on machineB:
  $ cd E:\Projects\DHV
  $ mimp pull dhv              ← Get latest memory from GitHub
  $ claude                    ← Start Claude Code session
  ... work on the project ...
  $ mimp push dhv              ← Push updated memory to GitHub

Evening on machineA:
  $ cd /home/maidul/projects/dhv
  $ mimp pull dhv              ← Get the memory machineB pushed
  $ claude                    ← Claude Code has full context
```

Claude Code doesn't know about MIMemoryLLMDb at all. It just reads the CLAUDE.md file that happens to be synced by your tool.

---

## 15. How Other LLMs Use This

Because the memory files are plain markdown, any LLM can use them:

**ChatGPT / Gemini (web):** Upload the MEMORY.md file and referenced files to the conversation.

**Local models (Ollama, LM Studio):** Point the model's context at the files:
```bash
cat projects/MIMP-001-dhv/MEMORY.md | ollama run llama3.2 "Given this context, help me..."
```

**Cursor / Windsurf / other AI editors:** Drop MEMORY.md into the project root. These editors read markdown context files similarly to Claude Code.

**API calls (OpenRouter, direct APIs):** Read the file and prepend it to the system prompt:
```python
with open("MEMORY.md") as f:
    memory = f.read()
prompt = f"Context:\n{memory}\n\nUser question: {question}"
```

The `SCHEMA.md` in the repo root tells any LLM how to interpret the format.

---

## 16. Backup & Recovery

### Backup is built-in
Git IS your backup. Every `mimp push` creates a commit. GitHub stores the full history.

### View history
```bash
cd MIMemoryLLMDb
git log --oneline projects/MIMP-001-dhv/
```

### Recover old version
```bash
# See what MEMORY.md looked like 5 commits ago
git show HEAD~5:projects/MIMP-001-dhv/MEMORY.md

# Restore a specific version
git checkout <commit-hash> -- projects/MIMP-001-dhv/MEMORY.md
git commit -m "restore: MIMP-001 MEMORY.md to previous version"
git push
```

### Clone to a new machine = instant recovery
```bash
git clone git@github.com:YOUR_USERNAME/MIMemoryLLMDb.git
# All projects, all history, all memory — instantly available
```

---

## 17. Adding a New Machine in the Future

```bash
# Step 1: Clone the repo on the new machine
git clone git@github.com:YOUR_USERNAME/MIMemoryLLMDb.git

# Step 2: Create local config
cp tools/local-config.template.json ~/.mimp-config.json
# Edit: set machine_id to "machineC" and repo_path

# Step 3: Register the machine
# Edit machines.json, add:
#   "machineC": { "name": "NewLaptop", "os": "linux", ... }

# Step 4: Add local paths for projects you work on
# Edit registry.json, add "machineC": "/path/..." to each project's local_paths

# Step 5: Push the registration
cd MIMemoryLLMDb
git add -A && git commit -m "register machineC" && git push

# Step 6: Pull any project memory
mimp pull dhv
```

Total time: ~5 minutes.

---

## 18. Project ID Reference (Initial)

These are your starting projects to register:

| ID | Short Name | Full Name | machineB Path | machineA Path |
|---|---|---|---|---|
| MIMP-001 | dhv | DH DICOM Viewer | D:\Projects\DHV | /home/maidul/projects/dhv |
| MIMP-002 | bdc-hms | Baroicha Diagnostic Center HMS | E:\v1-BdcHmsApp | — |
| MIMP-003 | erpnext | ERPNext DHS Operations | — | WSL frappe-bench |
| MIMP-004 | bdc-marketing | BDC Marketing Pipeline | E:\Projects\BDC-FIA | — |
| MIMP-005 | hrh | Hazi Rabbani Hospital | E:\Projects\HRH | — |
| MIMP-006 | mimp | MIMemoryLLMDb | E:\Tools\MIMP | /home/maidul/tools/MIMP |

Adjust paths to match your actual directories.

---

## 19. Quick Command Reference

```
mimp init "Project Name" "short-name" "/local/path"    Register new project
mimp push dhv                                           Push memory to GitHub
mimp pull dhv                                           Pull memory from GitHub
mimp list                                               Show all projects
mimp status dhv                                         Compare local vs remote
mimp sync dhv                                           Pull + push
```

---

## First Session Checklist

After reading this guide, here's the exact sequence to execute:

```
□  Create private GitHub repo: MIMemoryLLMDb
□  Clone to machineB (Desktop)
□  Clone to machineA (ServerPC)
□  Create README.md, SCHEMA.md, registry.json, machines.json
□  Create tools/mimp.ps1 and tools/mimp.sh
□  Create local config on machineB (~/.mimp-config.json)
□  Create local config on machineA (~/.mimp-config.json)
□  Set up `mimp` alias on both machines
□  Register existing projects (mimp init for each)
□  Update registry.json with all local_paths
□  Push existing memories (mimp push for each)
□  Verify on GitHub — all project folders visible
□  Test: push from machineB, pull from machineA
□  Done — memory system is live
```

---

*MIMemoryLLMDb v1.0 — Git-based, LLM-agnostic, multi-machine project memory.*
