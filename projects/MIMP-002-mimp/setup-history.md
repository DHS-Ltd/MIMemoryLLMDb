# MIMemoryLLMDb — Setup History

A full record of how this system was built on 2026-05-28, including every bug hit and how it was resolved. Useful for rebuilding on a new machine or diagnosing regressions.

---

## Build Session: 2026-05-28

### Step 1 — GitHub Repo Created

- Created private repo `DHS-Ltd/MIMemoryLLMDb` on GitHub manually
- Initialized git in `E:\MIMemoryLLMDb` and connected remote:
  ```powershell
  git init
  git remote add origin https://github.com/DHS-Ltd/MIMemoryLLMDb.git
  git fetch origin
  ```

### Step 2 — Core Files Created

Created in one pass, committed, and pushed to GitHub:
- `README.md` — repo overview
- `SCHEMA.md` — memory format specification
- `registry.json` — initial empty registry `{ "next_id": 1, "projects": {} }`
- `machines.json` — machineA + machineB registered
- `.gitignore` — excludes `.mimp-config.json`
- `projects/.gitkeep` — placeholder to keep the empty folder in git
- `tools/local-config.template.json` — template for local config

First push:
```
53e683a  init: repository structure, schema, registry, machines
```

### Step 3 — CLI Tool Created

Created `tools/mimp.ps1` with all 6 commands. Initial version used double-quoted strings throughout.

```
c2ffc1e  feat: add mimp PowerShell CLI tool
```

**Bug hit:** Script failed to parse when run. Errors showed `The '<' operator is reserved for future use` and `Unexpected token`.

**Root cause:** Smart/curly quote characters (`"` `"`) in the saved file. PowerShell 5.1 does not treat these as string delimiters.

**Fix:** Rewrote script using single-quoted strings (`'...'`) for all static text, replaced `<arg>` placeholders with `[arg]` in help text, changed inline color ternaries to explicit if/else blocks.

```
a3f5f22  fix: replace box-drawing character to fix terminal encoding
```

**Second bug:** Box-drawing character `═` displayed as `â•` in PowerShell terminal (UTF-8 encoding mismatch).

**Fix:** Replaced `═══...═══` separator with plain ASCII `---...---`.

### Step 4 — PowerShell Alias Set Up

Added to `$PROFILE`:
```powershell
function mimp {
    & "E:\MIMemoryLLMDb\tools\mimp.ps1" @args
}
```
Reloaded with `. $PROFILE`. Tested: `mimp` shows help output correctly.

### Step 5 — Local Config Created

`C:\Users\maidu\.mimp-config.json`:
```json
{
    "machine_id": "machineA",
    "repo_path": "E:\\MIMemoryLLMDb",
    "default_memory_dir": ".claude",
    "auto_pull_on_start": false
}
```

Confirmed with `mimp list` — no errors, showed empty project list.

### Step 6 — First Project Registration (MIMP-001 ImageConverter)

Ran:
```powershell
mimp init "ImageConverter" "image-converter" "E:\Self_project\ImageConverter"
```

**Bug hit:** `Join-Path : A positional parameter cannot be found that accepts argument 'MIMP-001-image-converter'`

**Root cause:** PowerShell 5.1's `Join-Path` only accepts 2 path segments. The script used `Join-Path $RepoPath 'projects' $folderName` (3 segments — PS7 only).

**Fix:** Nested calls:
```powershell
# Before (PS7 only)
Join-Path $RepoPath 'projects' $folderName

# After (PS5.1 compatible)
Join-Path (Join-Path $RepoPath 'projects') $folderName
```

**Second issue:** GitHub push returned `403 Permission denied to maidul-iut`. The personal GitHub account did not have write access to the `DHS-Ltd` org repo.

**Fix:** Added `maidul-iut` as a collaborator with Write role on GitHub → DHS-Ltd/MIMemoryLLMDb → Settings → Collaborators.

**State recovery:** The script half-succeeded — registry.json was updated but the project folder was never created. Manually created `projects/MIMP-001-image-converter/MEMORY.md` from the template.

```
3b25bf0  init: MIMP-001 (image-converter) - ImageConverter
7ce6430  fix: Join-Path PS5.1 compat + add missing MIMP-001 MEMORY.md
```

### Step 7 — First Memory Push Test

Ran `mimp push image-converter`. Output: `WARNING: No memory files found in E:\Self_project\ImageConverter`

**Root cause:** Claude Code stores agent memory centrally at `~/.claude/projects/<encoded-path>/memory/` — not inside the project directory. The push command only looked in the project directory.

**Fix:** Added `claude_memory_path` field to registry.json and updated `Cmd-Push` to also search that path.

```json
"claude_memory_path": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory"
```

```
6aab32c  feat: support claude_memory_path in push command
```

Ran `mimp push image-converter` again — success. 6 files pushed:
- MEMORY.md, project-overview.md, environment-setup.md, architecture.md, bugs-fixed.md, current-state.md

```
d322088  push: MIMP-001 from machineA (2026-05-28 19:21)
```

### Step 8 — Documentation Created

Five documentation files written and pushed:
- `docs/workflow.md`
- `docs/add-new-machine.md`
- `docs/llm-guide.md`
- `docs/troubleshooting.md`
- `docs/roadmap.md`

README.md updated with links to all docs.

### Step 9 — Project Self-Registration (MIMP-002)

Registered MIMemoryLLMDb itself as MIMP-002 in registry.json. Created memory files:
- `projects/MIMP-002-mimp/MEMORY.md`
- `projects/MIMP-002-mimp/architecture.md`
- `projects/MIMP-002-mimp/current-state.md`
- `projects/MIMP-002-mimp/setup-history.md` (this file)

---

## Build Session: 2026-05-29–30

### Sparse Checkout v1 — Cone Mode (later replaced)

Implemented `Sync-SparseCheckout` using `git sparse-checkout init --cone`. It was called automatically from `Git-Sync` before every pull.

**Bug hit on machineB:**
```
git config core.sparseCheckout  → (empty)
git sparse-checkout list        → fatal: this worktree is not sparse
```

**Root cause:** `git sparse-checkout init --cone --quiet 2>$null` was failing silently. Cone mode requires Git 2.26+ (Jan 2020). Windows Server 2022 may have an older git version OR the command was failing for another reason — the `2>$null` suppressed the actual error.

**Fix — Sparse Checkout v2 (classic file-based approach):**
Rewrote `Sync-SparseCheckout` to use the universal approach:
1. `git config core.sparseCheckout true` — enables classic sparse checkout (works on git ≥ 1.7)
2. Writes `.git/info/sparse-checkout` file with patterns:
   ```
   /*
   !projects/*/
   projects/MIMP-002-mimp/
   ```
3. `git read-tree -mu HEAD` — applies patterns to working tree

Pattern explanation:
- `/*` — include all root-level files (registry.json, README.md, etc.) automatically
- `!projects/*/` — exclude all project subdirectories
- `projects/MIMP-XXX-name/` — re-include only this machine's project folders (later rules win)

Also fixed `mimp sparse-status` to read `.git/info/sparse-checkout` directly instead of calling `git sparse-checkout list` (which fails if cone mode isn't active).

**Verified on machineB:** Only `projects/MIMP-002-mimp/` present in working tree. MIMP-001, MIMP-003, MIMP-004 absent. ✓

---

### mimp init Hardening (2026-05-30)

**Bug hit:** User ran `mimp init DHPACsSolutions E:\DH-PACs-Solutions` (missing short_name argument). PowerShell mapped `E:\DH-PACs-Solutions` as the short_name. The project was registered with `short_name: "E:\\DH-PACs-Solutions"`, folder creation failed (backslash in folder name), but `Git-CommitPush` still ran and pushed the bad registry entry.

**Fix 1 — Short_name path guard:**
```powershell
if ($ShortName -match '[:\\\/]') {
    Write-Host "ERROR: short_name looks like a file path..."
    exit 1
}
```

**Bug hit 2 — Auto-detect unreliable:** The encoding-based path detection (`Get-EncodedClaudePath`) didn't always produce the correct folder name (e.g., `e--DHS-PACS` vs `e--DH-PACs-Solutions`). User had to manually edit registry.json anyway.

**Fix 2 — Replace auto-detect with manual paste + validation:**
Changed to prompt user to paste the path explicitly. Validates:
1. Directory exists (`Test-Path`)
2. `MEMORY.md` exists inside it

**Fix 3 — Validate BEFORE assigning project ID:**
Moved the memory path prompt to run BEFORE `Save-Registry`. If the path is invalid, the function exits with no ID assigned, no registry change, no commit. Correct order:
```
1. Validate args → 2. Prompt + validate memory path → 3. Assign MIMP-XXX → 4. Save registry → 5. Create folder → 6. Commit
```

**Fix 4 — Folder creation rollback:**
Added try/catch around `New-Item` for the project folder. If it fails, removes the registry entry and resets `next_id` before exiting — no partial state committed.

---

## Key Decisions Made

| Decision | Reason |
|----------|--------|
| PowerShell only (no Bash) | Both machines are Windows; Bash can be added later if needed |
| `claude_memory_path` as explicit registry field | Auto-detection is complex; explicit is reliable and auditable |
| Single-quoted strings throughout `mimp.ps1` | Avoids smart quote encoding issues when file is saved/copied |
| ASCII separator `---` instead of `═══` | Avoids UTF-8 terminal encoding issues on Windows |
| `git add -A` in Git-CommitPush | Captures all staged changes including registry and script updates |
| Copy method (not symlink) | Two independent copies — local working copy + GitHub backup |
