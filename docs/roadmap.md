# Roadmap — Future Enhancements

This document lists improvement ideas for MIMemoryLLMDb, organized by effort level and impact. None of these are required for the system to work — the current version is fully functional. These are opportunities to make it better over time.

---

## Near-Term (Low Effort, High Value)

### 1. Auto-detect Claude Memory Path

**Problem:** Users must manually find and add `claude_memory_path` to `registry.json` for each project. The encoded folder name is non-obvious.

**Solution:** Add a `mimp detect <project>` command that scans `~/.claude/projects/` and attempts to match based on the project's `local_path`. Present the match for user confirmation before writing to registry.

```powershell
mimp detect image-converter
# Detected: C:\Users\maidu\.claude\projects\e--Self-project-ImageConverter\memory
# Add to registry? [Y/N]
```

---

### 2. `mimp edit <project>` Command

**Problem:** Editing MEMORY.md requires navigating to the repo folder manually.

**Solution:** A command that opens the project's MEMORY.md in the default editor:

```powershell
mimp edit image-converter
# Opens: E:\MIMemoryLLMDb\projects\MIMP-001-image-converter\MEMORY.md
```

---

### 3. `.gitattributes` for Line Endings

**Problem:** Every commit shows LF/CRLF warnings on Windows.

**Solution:** Add a `.gitattributes` file to normalize line endings:

```
* text=auto
*.ps1 text eol=crlf
*.md text eol=lf
*.json text eol=lf
```

---

### 4. `mimp push --all` Command

**Problem:** Pushing all projects requires running `mimp push` for each one individually.

**Solution:** A batch push command:

```powershell
mimp push --all           # push all active projects on this machine
mimp push --all --dry-run # show what would be pushed without doing it
```

---

### 5. Push Timestamp in MEMORY.md Footer

**Problem:** The `Last updated` field in MEMORY.md is only updated when the file already exists in the repo folder. New pushes may not update it if MEMORY.md is not in the claude_memory_path.

**Solution:** Always update (or add) a metadata footer when pushing, regardless of whether MEMORY.md came from the local path or claude_memory_path.

---

## Medium-Term (Moderate Effort, Good Value)

### 6. `mimp search <keyword>` Command

**Problem:** To find which project contains information about a specific topic, you have to manually browse files.

**Solution:** Full-text search across all project memory files:

```powershell
mimp search "Orthanc"
# MIMP-001 image-converter: architecture.md (line 12)
# MIMP-003 dhv: orthanc-config.md (line 5, 18, 34)
```

Implementation: simple `Select-String` across all `.md` files in `projects/`.

---

### 7. `mimp diff <project>` Command

**Problem:** Before pushing, there is no easy way to see exactly what changed in the memory files since the last push.

**Solution:** Show a diff between local memory files and what is currently in the repo:

```powershell
mimp diff image-converter
# Shows: which files changed, lines added/removed
```

---

### 8. Machine-Specific Push Exclusions

**Problem:** Some memory files contain machine-specific paths or credentials hints that should not be shared across machines.

**Solution:** A `.mimpignore` file in the project's memory directory that lists files to exclude from push:

```
# .mimpignore
local-secrets.md
machine-specific-paths.md
```

---

### 9. `mimp init` Prompts for Claude Memory Path

**Problem:** After `mimp init`, users must manually find and add the claude_memory_path.

**Solution:** After registering, `mimp init` scans `~/.claude/projects/` for a matching folder and prompts:

```
Project registered as MIMP-007.
Scanning for Claude Code memory...
Found: C:\Users\maidu\.claude\projects\e--My-Project\memory
Add this as claude_memory_path? [Y/N]
```

---

### 10. Conflict Detection on Push

**Problem:** If two machines push the same project without pulling first, one overrides the other silently.

**Solution:** Before copying files, compare timestamps. If the repo version is newer than the local version, warn the user:

```
WARNING: Repo version of MEMORY.md is newer than your local copy.
Last repo push: 2026-05-28 19:21 (machineA)
Your local file: 2026-05-27 14:05
Run 'mimp pull image-converter' first, or use --force to override.
```

---

## Longer-Term (Higher Effort, Strategic Value)

### 11. Web Dashboard (Read-Only)

A simple static HTML page (hosted on GitHub Pages or any static host) that renders all project memory files in a searchable, browsable interface. No backend required — just a build step that converts the markdown to HTML.

**Tech:** A small Python or PowerShell script that generates static HTML from all `MEMORY.md` files.

---

### 12. VS Code Extension

A VS Code extension that:
- Shows `mimp status` in the status bar
- Adds a "Push Memory" button to the command palette
- Highlights when local memory is out of sync with the repo
- Auto-runs `mimp pull` when opening a registered project

---

### 13. Encrypted Memory Files

For projects with sensitive information (API keys, server IPs, internal hostnames), add optional encryption using GPG or AES:

```powershell
mimp push image-converter --encrypt    # encrypt before pushing
mimp pull image-converter --decrypt    # decrypt after pulling
```

The encryption key stays local (never committed). Encrypted files are stored as `.md.enc` in the repo.

---

### 14. Memory Quality Score

An automated check that scores each MEMORY.md on completeness:
- Has Summary? (+1)
- Has at least 4 Key Facts? (+1)
- Summary is under 4 sentences? (+1)
- No TODO placeholders? (+1)
- Referenced files all exist? (+1)

```powershell
mimp lint image-converter
# Quality: 4/5 - Missing: no TODO placeholders (2 found)
```

---

### 15. GitHub Actions Auto-Backup

A GitHub Actions workflow that runs on a schedule (e.g., daily) to verify all registered projects have been pushed recently, and sends a notification (email, Slack, or Teams) if any project has not been updated in more than 7 days.

---

## Completed Features

| Feature | Status | Added |
|---------|--------|-------|
| Core CLI (init/push/pull/list/status) | Done | 2026-05-28 |
| PowerShell 5.1 compatibility | Done | 2026-05-28 |
| Claude Code agent memory path support | Done | 2026-05-28 |
| Multi-machine registry | Done | 2026-05-28 |
| Git-based backup | Done | 2026-05-28 |
