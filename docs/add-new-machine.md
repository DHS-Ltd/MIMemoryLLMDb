# Adding a New Machine to MIMemoryLLMDb

This guide walks through registering a new machine so it can push and pull project memories from the central GitHub repository.

**Time required:** ~10 minutes  
**Prerequisites:** Git installed, PowerShell available, GitHub access

---

## Overview

Each machine that participates in the memory system needs:
1. A local clone of the `MIMemoryLLMDb` repository
2. A local config file (`~/.mimp-config.json`) with the machine's ID and repo path
3. A `mimp` alias in PowerShell so commands work from anywhere
4. An entry in `machines.json` to officially register it

---

## Step 1 — Clone the Repository

On the new machine, open PowerShell and clone the repo:

```powershell
cd D:\                          # or wherever you keep tools
git clone https://github.com/DHS-Ltd/MIMemoryLLMDb.git
```

> **Note on sparse checkout:** The initial clone downloads all project folders. That is fine — once you complete Steps 2-4 and run any `mimp` command, sparse checkout activates automatically. It will prune project folders that do not belong to this machine and keep only your projects on future pulls. No manual sparse checkout setup is needed.

Note the full path where you cloned it. You will need it in Step 4.

---

## Step 2 — Authenticate Git with GitHub

Git must be authenticated before any `git pull` or `git push` (and therefore any `mimp` command) can work.

**Set up Windows Credential Manager as the credential helper:**

```powershell
git config --global credential.helper wincred
```

**Trigger authentication by running a pull:**

```powershell
cd D:\MIMemoryLLMDb
git pull
```

When prompted, enter:
- **Username:** your GitHub username (e.g. `maidul-iut`)
- **Password:** a Personal Access Token — NOT your GitHub account password

**Generating a Personal Access Token (PAT):**
1. Go to `github.com` → your Profile → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token — set Note to `machineB MedIServer`, check **`repo`** scope
4. Copy the token immediately — it is only shown once
5. Use it as the password when git prompts

Once entered, Windows Credential Manager caches it. Future `git pull` and `git push` commands will not prompt again.

**Verify auth is working:**

```powershell
git pull
git push
```

No credential prompt = authentication is set up correctly.

---

## Step 3 — Create the Local Config File

Copy the template and fill in your machine-specific values:

```powershell
Copy-Item D:\MIMemoryLLMDb\tools\local-config.template.json $env:USERPROFILE\.mimp-config.json
notepad $env:USERPROFILE\.mimp-config.json
```

Edit it to match your machine:

```json
{
  "machine_id": "machineB",
  "repo_path": "D:\\MIMemoryLLMDb",
  "default_memory_dir": ".claude",
  "auto_pull_on_start": false
}
```

**About `machine_id`:**
- You invent this label yourself — there is no auto-generation or auto-detection
- It can be anything meaningful: `"machineB"`, `"office-server"`, `"maidul-laptop"`, `"home-desktop"`
- The only rule: it must be unique across all machines in the system
- Check `machines.json` in the repo to see IDs already in use before choosing
- Once set, this ID becomes the key used in `local_paths` and `claude_memory_paths` in `registry.json` — changing it later requires updating those fields too
- This file is listed in `.gitignore` — it will never be committed to GitHub

---

## Step 3 — Set Up the PowerShell Alias

Open your PowerShell profile:

```powershell
notepad $PROFILE
```

If the file does not exist, create it first:

```powershell
New-Item -Path $PROFILE -ItemType File -Force
```

Add this function at the bottom, replacing the path with your actual repo location:

```powershell
function mimp {
    & "D:\MIMemoryLLMDb\tools\mimp.ps1" @args
}
```

> **If notepad does not save or the profile stays empty**, use this PowerShell command instead — it writes the function directly without opening an editor:
>
> ```powershell
> Add-Content $PROFILE "`nfunction mimp {`n    & `"D:\MIMemoryLLMDb\tools\mimp.ps1`" @args`n}"
> ```
>
> Verify it was written: `cat $PROFILE`

Save, then reload the profile (without reloading list data will not come):

```powershell
. $PROFILE
```

Test it:

```powershell
mimp list
```

You should see the list of all registered projects.

---

## Step 4 — Register the Machine in `machines.json`

On any machine that already has `mimp` working, open `machines.json` in the repo and add your new machine entry:

```powershell
notepad E:\MIMemoryLLMDb\machines.json
```

Add the new machine inside the `machines` object:

```json
{
  "machines": {
    "machineA": { ... existing entry ... },
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

Commit and push:

```powershell
cd E:\MIMemoryLLMDb
git add machines.json
git commit -m "register: machineB (MedIServer)"
git push
```

---

## Step 5 — Add Local Paths for Existing Projects

For any project you want to work on from the new machine, add its local path to `registry.json`.

Open `registry.json` and find the project entry. Add your machine's path inside `local_paths`:

```json
"local_paths": {
    "machineA": "E:\\Self_project\\ImageConverter",
    "machineB": "D:\\Projects\\ImageConverter"
}
```

Commit and push:

```powershell
git add registry.json
git commit -m "registry: add machineB local_paths for existing projects"
git push
```

---

## Step 6 — Find and Add the Claude Memory Path for This Machine

This is a required step for `mimp push` and `mimp pull` to work correctly with Claude Code.
**The path is different on every machine** — you must look it up, you cannot copy it from another machine.

> **Shortcut:** If you use `mimp init` to register the project on this machine, it will automatically scan and prompt you to save the path — no manual steps needed. Only follow the manual steps below if you skipped the prompt, the memory folder did not exist yet, or you are adding `claude_memory_paths` for a project already registered on another machine.

**6a — Open Claude Code in the project at least once**

Claude Code only creates its memory folder after the first session in a project.
If you have not done this yet, run `claude` in the project directory now, then exit.

**6b — List the Claude memory folders on this machine**

```powershell
ls $env:USERPROFILE\.claude\projects\
```

Find the folder that matches your project. The encoding rule:
- Drive letter lowercased, colon removed: `D:` → `d`
- `\` after drive → `--`
- Each remaining `\` → `-`
- Underscores `_` → `-`

Example: `D:\Projects\ImageConverter` → `d--Projects-ImageConverter`

Get your username:
```powershell
echo $env:USERPROFILE
# Output example: C:\Users\mediadmin
```

Your full Claude memory path for this project on this machine:
```
C:\Users\mediadmin\.claude\projects\d--Projects-ImageConverter\memory
```

**6c — Add the path to `registry.json` under `claude_memory_paths`**

```powershell
notepad D:\MIMemoryLLMDb\registry.json
```

Add your machine's entry inside `claude_memory_paths` — do NOT overwrite machineA's entry:

```json
"claude_memory_paths": {
    "machineA": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory",
    "machineB": "C:\\Users\\mediadmin\\.claude\\projects\\d--Projects-ImageConverter\\memory"
}
```

**6d — Commit and push the registry update**

```powershell
cd D:\MIMemoryLLMDb
git add registry.json
git commit -m "registry: add machineB claude_memory_paths for existing projects"
git push
```

---

## Step 7 — Pull a Project Memory to the New Machine

Now that both `local_paths` and `claude_memory_paths` are configured, pull:

```powershell
mimp pull image-converter
```

`mimp pull` will copy the memory files directly into:
```
C:\Users\mediadmin\.claude\projects\d--Projects-ImageConverter\memory\
```
Claude Code reads from that location automatically — no extra steps needed.

---

## Step 8 — Verify

```powershell
mimp list                       # all projects visible
mimp status image-converter     # local vs repo file counts match
mimp push image-converter       # test push from new machine
```

The new machine is fully operational.

---

## Adding a Linux Machine (Future)

If you add a Linux machine in the future:
1. Clone the repo to `/home/<user>/tools/MIMemoryLLMDb`
2. Create `~/.mimp-config.json` with the Linux-style path
3. Use `tools/mimp.sh` instead of `mimp.ps1` (requires `jq` — install with `sudo apt install jq`)
4. Add the alias to `~/.bashrc`: `alias mimp='bash ~/tools/MIMemoryLLMDb/tools/mimp.sh'`
5. Follow Steps 4–7 above

---

## Checklist

```
[ ] Repo cloned to new machine
[ ] Git authenticated with GitHub (credential.helper wincred + PAT)
[ ] ~/.mimp-config.json created with correct machine_id and repo_path
[ ] PowerShell alias added to $PROFILE
[ ] mimp list runs without errors
[ ] machines.json updated and pushed
[ ] registry.json local_paths updated for relevant projects
[ ] Claude Code opened in each project at least once (creates memory folder)
[ ] Claude memory path found with: ls $env:USERPROFILE\.claude\projects\
[ ] registry.json claude_memory_paths updated for each project on this machine
[ ] mimp pull tested — files appear in ~/.claude/projects/<encoded-path>/memory/
[ ] mimp push tested — files appear on GitHub
```
