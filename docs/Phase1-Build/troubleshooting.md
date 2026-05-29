# Troubleshooting Guide

This guide covers known issues encountered during setup and daily use of MIMemoryLLMDb, with root causes and verified fixes.

---

## Issue 1 — PowerShell Script Shows Parse Errors with Smart Quotes

**Symptom:**
```
Unexpected token 'active") { "Green" } else { "DarkGray" }' in expression or statement.
The '<' operator is reserved for future use.
```

**Root cause:**
The script file was saved with typographic/curly quotes (`"` `"`) instead of standard ASCII double quotes (`"`). PowerShell 5.1 does not recognize curly quotes as string delimiters, so it tries to parse the content as code.

**Fix:**
Replace all curly quotes with straight ASCII quotes. Open the file in VS Code, press `Ctrl+H`, enable regex, and replace `[“”]` with `"`. Save and reload:
```powershell
. $PROFILE
```

**Prevention:**
- Never copy-paste PowerShell code from a web browser or word processor
- Always use a plain text editor (VS Code, Notepad++) to write `.ps1` files

---

## Issue 2 — `Join-Path` Error with Three Arguments (PowerShell 5.1)

**Symptom:**
```
Join-Path : A positional parameter cannot be found that accepts argument 'MIMP-001-image-converter'.
```

**Root cause:**
`Join-Path` in Windows PowerShell 5.1 only accepts two path segments. PowerShell 7+ accepts multiple. Using `Join-Path $root 'projects' $folder` fails silently on 5.1.

**Fix:**
Nest the calls:
```powershell
# Wrong (PS7 only)
$path = Join-Path $RepoPath 'projects' $folderName

# Correct (works on both PS5.1 and PS7)
$path = Join-Path (Join-Path $RepoPath 'projects') $folderName
```

---

## Issue 3 — GitHub Push Fails with 403 Permission Denied

**Symptom:**
```
remote: Permission to DHS-Ltd/MIMemoryLLMDb.git denied to maidul-iut.
fatal: unable to access '...': The requested URL returned error: 403
```

**Root cause:**
Git is using cached credentials for a personal GitHub account (`maidul-iut`) that does not have write access to the organization repository (`DHS-Ltd`).

**Fix — Option A (Recommended): Add collaborator**
Go to GitHub → `DHS-Ltd/MIMemoryLLMDb` → Settings → Collaborators → Add the personal account with Write role.

**Fix — Option B: Use a Personal Access Token (PAT)**
1. GitHub → Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Update the remote URL:
```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/DHS-Ltd/MIMemoryLLMDb.git
```

**Fix — Option C: Clear cached credentials**
Open Windows Credential Manager → Windows Credentials → find `git:https://github.com` → remove it. Git will prompt for credentials on the next push.

---

## Issue 4 — `mimp push` Reports No Memory Files Found

**Symptom:**
```
WARNING: No memory files found for MIMP-001
Looked in: E:\Self_project\ImageConverter (CLAUDE.md, .claude\, memory\)
```

**Root cause:**
Claude Code stores agent memory in a centralized location, not inside the project directory:
```
C:\Users\<user>\.claude\projects\<encoded-path>\memory\
```
The `push` command by default only looks inside the project directory.

**Fix:**
Add the `claude_memory_path` field to the project entry in `registry.json`:
```json
"MIMP-001": {
    ...
    "claude_memory_path": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory"
}
```

**Finding your Claude memory path:**
The encoded folder name is derived from the project path:
- Drive letter lowercased: `E:` → `e`
- `:\` → `--`
- Each `\` → `-`
- Underscores in folder names → `-`

Example: `E:\Self_project\ImageConverter` → `e--Self-project-ImageConverter`

Browse `C:\Users\<user>\.claude\projects\` to find the exact folder name.

---

## Issue 5 — LF Will Be Replaced by CRLF Warnings

**Symptom:**
```
warning: in the working copy of 'tools/mimp.ps1', LF will be replaced by CRLF the next time Git touches it
```

**Root cause:**
Git's `core.autocrlf` is set to `true` on Windows, which converts Unix line endings (LF) to Windows (CRLF) on checkout. This is cosmetic and causes no functional problems.

**Fix (if warnings bother you):**
```powershell
git config core.autocrlf false
```
Or add a `.gitattributes` file to the repo:
```
* text=auto
*.ps1 text eol=crlf
*.md text eol=lf
```

---

## Issue 6 — `mimp` Command Not Found After Profile Edit

**Symptom:**
```
mimp : The term 'mimp' is not recognized as the name of a cmdlet, function, script file...
```

**Diagnosis — run these three checks:**
```powershell
Test-Path $PROFILE      # does the file exist?
cat $PROFILE            # is the function actually in it?
Get-ExecutionPolicy     # is script execution allowed?
```

**Root cause A — Profile exists but is empty (`cat $PROFILE` returns nothing):**
The file was created but the function was never saved into it. This happens when notepad
is opened but closed without saving, or on Windows Server where the editor behaves differently.

**Fix:** Write the function directly from PowerShell — no editor needed:
```powershell
Add-Content $PROFILE "`nfunction mimp {`n    & `"D:\MIMemoryLLMDb\tools\mimp.ps1`" @args`n}"
cat $PROFILE     # verify it was written
. $PROFILE
mimp list
```

**Root cause B — Profile not reloaded after editing:**
```powershell
. $PROFILE
mimp list
```

**Root cause C — Execution policy is `Restricted` (common on Windows Server):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
. $PROFILE
mimp list
```

---

## Issue 7 — `mimp list` Shows Registry Parse Error

**Symptom:**
```
Get-Content : Cannot find path 'C:\WINDOWS\system32\CHANGE_ME\registry.json' because it does not exist.
```

**Root cause:**
The local config file `~/.mimp-config.json` still has the template placeholder values (`CHANGE_ME`) instead of actual values.

**Fix:**
Edit `C:\Users\<user>\.mimp-config.json` and replace all `CHANGE_ME` values:
```json
{
  "machine_id": "machineA",
  "repo_path": "E:\\MIMemoryLLMDb",
  "default_memory_dir": ".claude",
  "auto_pull_on_start": false
}
```

---

## Issue 8 — Registry Has Inconsistent State After Failed `mimp init`

**Symptom:**
`registry.json` has a new project entry but no folder was created in `projects/`.

**Root cause:**
`mimp init` partially succeeded — it saved the registry but crashed before creating the project folder (typically due to a script bug mid-execution).

**Fix:**
Manually create the missing folder and MEMORY.md:
```powershell
$projectDir = "E:\MIMemoryLLMDb\projects\MIMP-001-image-converter"
New-Item -ItemType Directory -Path $projectDir -Force
# Then create MEMORY.md from the SCHEMA.md template
```
Then commit and push the recovery:
```powershell
git add -A
git commit -m "fix: recover missing MIMP-001 project folder"
git push
```

---

## Issue 9 — `claude_memory_path` Was a Single Field (Design Fix: Now Per-Machine)

**Symptom:**
`mimp push` reads from the correct Claude memory location on machineA but fails silently or reads the wrong location on machineB. `mimp pull` copies files to the project's `.claude\` folder but Claude Code on the other machine does not pick them up automatically.

**Root cause:**
The original design stored `claude_memory_path` as a single string in `registry.json`. This was wrong because the path has two machine-specific parts that differ on every machine:

```
C:\Users\  <username>  \.claude\projects\  <encoded-project-path>  \memory\
           ↑                               ↑
     Windows username                Encoded from the project's
     on THAT machine                 location on THAT machine
```

The encoded project path is derived from where the project lives on each machine:
- machineA project at `E:\Self_project\ImageConverter` → `e--Self-project-ImageConverter`
- machineB project at `D:\Projects\ImageConverter` → `d--Projects-ImageConverter`

A single `claude_memory_path` value cannot work for both machines.

**Fix applied (2026-05-28):**
Changed `claude_memory_path` (single string) to `claude_memory_paths` (per-machine object, same structure as `local_paths`).

Before:
```json
"claude_memory_path": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory"
```

After:
```json
"claude_memory_paths": {
    "machineA": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory",
    "machineB": "C:\\Users\\mediadmin\\.claude\\projects\\d--Projects-ImageConverter\\memory"
}
```

`mimp.ps1` now reads `$project.claude_memory_paths.$MachineId` — it only uses the path for the machine currently running the command.

**Also fixed:** `mimp pull` now copies files directly into the machine's `claude_memory_paths` location so Claude Code picks them up automatically on the next session. Previously it only copied to `{project_dir}\.claude\` which Claude Code does not read.

**How to find the correct path on any machine:**
See the step-by-step instructions in [workflow.md — Finding the Claude Memory Path](./workflow.md#finding-the-claude-memory-path-on-any-machine).

---

## General Diagnostic Commands

```powershell
# Check current config
cat $env:USERPROFILE\.mimp-config.json

# Check git state
git -C E:\MIMemoryLLMDb log --oneline -5
git -C E:\MIMemoryLLMDb status

# Check what mimp sees
mimp list
mimp status image-converter

# Reload profile and retry
. $PROFILE
```
