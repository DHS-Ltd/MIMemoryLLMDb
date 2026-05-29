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

## Key Decisions Made

| Decision | Reason |
|----------|--------|
| PowerShell only (no Bash) | Both machines are Windows; Bash can be added later if needed |
| `claude_memory_path` as explicit registry field | Auto-detection is complex; explicit is reliable and auditable |
| Single-quoted strings throughout `mimp.ps1` | Avoids smart quote encoding issues when file is saved/copied |
| ASCII separator `---` instead of `═══` | Avoids UTF-8 terminal encoding issues on Windows |
| `git add -A` in Git-CommitPush | Captures all staged changes including registry and script updates |
| Copy method (not symlink) | Two independent copies — local working copy + GitHub backup |
