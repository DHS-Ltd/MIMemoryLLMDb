# Daily Workflow Guide

Practical instructions for the three most common operations: starting a session, ending a session, and registering a new project.

---

## Starting a Work Session

Before opening your AI assistant, pull the latest memory from GitHub:

```powershell
cd E:\Projects\MyProject
mimp pull image-converter
claude                        # or open Cursor, or start your LLM session
```

This ensures you have the most recent context, especially important if you worked on another machine since the last session.

**When to skip the pull:**
- You are the only person working on this project and you have not used another machine since your last push
- You are picking up exactly where you left off in the same terminal session

---

## Ending a Work Session

After finishing work, update any memory files that changed, then push:

```powershell
# Push everything to GitHub
mimp push image-converter
```

The push command:
1. Pulls latest from GitHub first (avoids conflicts)
2. Copies your local memory files to the repo folder
3. Updates the `Last updated` and `Updated by` metadata in MEMORY.md
4. Commits with a timestamped message
5. Pushes to GitHub

**Make it a habit:** treat `mimp push` like saving a file. Run it whenever you finish a significant piece of work, not just at end of day.

---

## Registering a New Project

Use `mimp init` to register any project that should have synced memory.

```powershell
mimp init "Full Project Name" "short-name" "E:\path\to\project"
```

**Arguments:**
- `full-name` — descriptive name shown in `mimp list` (can have spaces, use quotes)
- `short-name` — used in commands like `mimp push short-name` (no spaces, use hyphens)
- `local-path` — full path to the **project directory** on this machine (where your code lives, e.g. `E:\Projects\MyApp`). This is NOT the memory path — memory location is configured separately via `claude_memory_path` in registry.json.

**After init:**
1. Edit the generated `MEMORY.md` in `projects/MIMP-XXX-short-name/` with real content
2. Add the `claude_memory_path` to `registry.json` if using Claude Code agent memory
3. Run `mimp push short-name` to sync the populated MEMORY.md

---

## Finding the Claude Memory Path on Any Machine

Claude Code stores agent memory in a central location, not inside the project directory. The exact path is **different on every machine** because it contains two machine-specific parts:

```
C:\Users\  <username>  \.claude\projects\  <encoded-project-path>  \memory\
           ↑                               ↑
     Windows login name               Built from WHERE the project
     on THIS machine                  lives on THIS machine
```

You cannot guess this path in advance — you must look it up on each machine individually.

> **Note:** This is a one-time manual step per machine per project.
> Auto-detection is planned (Roadmap item #9) but not yet built.
> Your project MIMP-XXX number is shown by `mimp init` output or `mimp list`.

---

### Step-by-Step: Find and Add the Path on a Machine

**Step 1 — Open Claude Code in the project at least once**

Claude Code only creates the memory folder after the first session. If you have never run `claude` in this project on this machine, do that first, then come back here.

**Step 2 — List all Claude Code memory folders on this machine**

```powershell
ls $env:USERPROFILE\.claude\projects\
```

You will see a list of folders — one per project you have ever opened with Claude Code on this machine. Example output:

```
e--Self-project-ImageConverter
e--MIMemoryLLMDb
d--Projects-DHV
```

**Step 3 — Identify which folder belongs to your project**

The folder name is the project path with these encoding rules applied:
- Drive letter lowercased, colon removed: `E:` → `e`
- The `\` after the drive → `--` (double dash)
- Each `\` in the rest of the path → `-` (single dash)
- Underscores `_` in folder names → `-` (single dash)

Examples:

| Project path on this machine | Encoded folder name |
|------------------------------|---------------------|
| `E:\Self_project\ImageConverter` | `e--Self-project-ImageConverter` |
| `D:\Projects\ImageConverter` | `d--Projects-ImageConverter` |
| `E:\MIMemoryLLMDb` | `e--MIMemoryLLMDb` |
| `C:\Work\MyApp\Backend` | `c--Work-MyApp-Backend` |

**Step 4 — Verify memory files are inside the folder**

```powershell
ls $env:USERPROFILE\.claude\projects\e--Self-project-ImageConverter\memory\
```

You should see `.md` files. If the `memory\` folder is empty or missing, Claude Code has not saved any memory for this project yet — run a Claude Code session first.

**Step 5 — Build the full path string**

The full path is:

```
C:\Users\<your-username>\.claude\projects\<encoded-folder-name>\memory
```

To get your exact username:

```powershell
echo $env:USERPROFILE
# Output: C:\Users\maidu
```

So the full path becomes (example for machineA):

```
C:\Users\maidu\.claude\projects\e--Self-project-ImageConverter\memory
```

**Step 6 — Open registry.json and add the path**

```powershell
notepad E:\MIMemoryLLMDb\registry.json
```

Find your project entry by MIMP-XXX ID. Add or update the `claude_memory_paths` field with your machine ID as the key:

```json
"MIMP-001": {
    "short_name": "image-converter",
    "full_name": "ImageConverter",
    "created": "2026-05-28",
    "created_by": "machineA",
    "status": "active",
    "local_paths": {
        "machineA": "E:\\Self_project\\ImageConverter"
    },
    "claude_memory_paths": {
        "machineA": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory"
    }
}
```

> **Important:** `claude_memory_paths` is an object with one key per machine — just like `local_paths`.
> Each machine adds its own entry. You never overwrite another machine's entry.
> If machineB has the project at `D:\Projects\ImageConverter` and Windows user `mediadmin`, it would add:
> ```json
> "claude_memory_paths": {
>     "machineA": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory",
>     "machineB": "C:\\Users\\mediadmin\\.claude\\projects\\d--Projects-ImageConverter\\memory"
> }
> ```

**Step 7 — Commit and push the registry update:**

```powershell
cd E:\MIMemoryLLMDb
git add registry.json
git commit -m "registry: add claude_memory_paths for image-converter on machineA"
git push
```

**Step 8 — Test that mimp push finds the memory files:**

```powershell
mimp push image-converter
```

The output should show `Claude memory: C:\Users\...\memory` and list the copied files. If it still says no files found, double-check Step 4 — the folder name encoding must be exact.

---

## Updating an Existing Memory File

If you discover new important information during a session (a new config path, a key decision, a resolved bug):

1. Open the relevant memory file directly in your editor
2. Add the new information to the appropriate section
3. Add a line to `## Recent Changes` with today's date
4. Run `mimp push <project>` to sync

**Do not** put temporary notes or debugging output in memory files. Memory should contain durable facts that will still be useful in 6 months.

---

## Cross-Machine Sync — Practical Example (MIMP-001 ImageConverter)

This is the core value of the system. Here is how context flows between machines.

### The Scenario

- **Day 1 (machineA):** You finish a session on ImageConverter. You push memory to GitHub.
- **Day 3 (machineB):** You continue the project from the office server. You pull, work, push.
- **Day 7 (machineA):** You return to machineA. You need machineB's context before starting.

---

### Day 1 — machineA finishes and pushes

```powershell
# machineA — end of session
cd E:\Self_project\ImageConverter
mimp push image-converter
```

GitHub now holds the latest memory: 6 files including `current-state.md` with notes on
what was done, and `bugs-fixed.md` with known issues. Claude Code's memory at
`~/.claude/projects/e--Self-project-ImageConverter/memory/` is copied to GitHub.

---

### Day 3 — machineB starts, pulls, works, pushes

> **Prerequisite:** machineB must be set up first (see docs/add-new-machine.md) and
> `registry.json` must have `local_paths.machineB` set for MIMP-001.

```powershell
# machineB — start of session: pull before opening the project
cd D:\Projects\ImageConverter
mimp pull image-converter
```

What `mimp pull` does:
1. Runs `git pull` to fetch the latest from GitHub
2. Copies all memory files from `projects/MIMP-001-image-converter/` in the repo directly into Claude Code's central memory location for this machine:
   - `C:\Users\mediadmin\.claude\projects\d--Projects-ImageConverter\memory\MEMORY.md`
   - `C:\Users\mediadmin\.claude\projects\d--Projects-ImageConverter\memory\current-state.md`
   - `C:\Users\mediadmin\.claude\projects\d--Projects-ImageConverter\memory\bugs-fixed.md`
   - etc.
3. If a `CLAUDE.md` exists in the repo folder, it is placed at the project root so
   Claude Code reads it automatically on the next session

> This is why `claude_memory_paths.machineB` must be configured in `registry.json` before pulling — that is where `mimp pull` knows to write the files. Without it, files fall back to the project's `.claude\` folder which Claude Code does not read automatically.

**Now open your AI assistant. It reads the pulled files and has full context from Day 1's machineA session — as if you never left.**

After working on machineB (fixed a bug, changed a config, made a decision), manually add any important new facts to the relevant memory files before pushing — Claude Code auto-updates memory sometimes but does not always capture everything. Then push:

```powershell
# machineB — end of session
mimp push image-converter
```

This commits from machineB with a message like:
```
push: MIMP-001 from machineB (2026-05-31 17:45)
```

GitHub now holds the updated memory including everything machineB added.

---

### Day 7 — machineA returns and gets machineB's context

```powershell
# machineA — start of session, BEFORE opening any AI assistant
cd E:\Self_project\ImageConverter
mimp pull image-converter
```

`mimp pull` fetches from GitHub and overwrites the local `.claude/` memory files with
machineB's latest versions. When you now open Claude Code:

```powershell
claude
```

Claude reads the updated files and knows everything machineB did on Day 3 — the bug
fix, the config change, the decision — without you having to explain anything.

---

### The Rule: Always Pull Before Starting, Always Push After Finishing

```
machineA session:   mimp pull  →  work  →  mimp push
machineB session:   mimp pull  →  work  →  mimp push
machineA session:   mimp pull  →  work  →  mimp push
```

If you skip the pull at the start, your AI assistant reads stale context and may
suggest work that was already done on the other machine.

If you skip the push at the end, the other machine will not get your updates on
its next pull.

---

### What If Both Machines Push Without Pulling First?

Example: machineA pushes on Day 5. Then machineB pushes on Day 6 without pulling first.

machineB's push uses `git add -A` and `git commit`. Git will push machineB's version of the memory files, overwriting machineA's Day 5 changes that machineB never pulled.

**Current behaviour:** The system does not warn you — the last push wins.

**How to avoid this:** Always run `mimp pull` before starting work. This is git pull
under the hood, so if there is a real conflict in a tracked file, git will report it.

**Planned fix:** Conflict detection before push (Roadmap item #10) — the system will
warn if the repo version is newer than your local version before overwriting.

---

## Checking Sync Status

Before pushing, verify what's in the repo vs what's local:

```powershell
mimp status image-converter
```

Output shows:
- Number of files in the GitHub repo copy
- Number of files in your local project
- Timestamps of most recently modified files on each side

---

## Pulling Memory to a Different Machine

When switching machines, pull the memory before starting work:

```powershell
# On machineB, for a project whose local path is configured in registry.json
mimp pull image-converter
```

The pull command copies memory files from the GitHub repo to:
- `CLAUDE.md` → project root (Claude Code reads it automatically)
- Other `.md` files → project's `.claude/` directory

---

## Archiving a Completed Project

When a project is complete and no longer actively worked on, mark it as archived:

1. Open `registry.json`
2. Change `"status": "active"` to `"status": "archived"`
3. Commit and push

Archived projects still appear in `mimp list` (in gray) and their memory is preserved on GitHub. They can be reactivated by changing status back to `active`.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start session | `mimp pull <project>` |
| End session | `mimp push <project>` |
| Register new project | `mimp init "Name" "short-name" "path"` |
| Check all projects | `mimp list` |
| Check sync state | `mimp status <project>` |
| Pull then push | `mimp sync <project>` |
