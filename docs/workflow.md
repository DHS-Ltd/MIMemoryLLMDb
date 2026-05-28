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
- `local-path` — full path to the project on this machine

**After init:**
1. Edit the generated `MEMORY.md` in `projects/MIMP-XXX-short-name/` with real content
2. Add the `claude_memory_path` to `registry.json` if using Claude Code agent memory
3. Run `mimp push short-name` to sync the populated MEMORY.md

---

## Finding and Adding the Claude Memory Path

Claude Code stores agent memory in a central location, not in the project directory. You need to add this path to `registry.json` for `mimp push` to find it.

**Step 1 — Find the encoded path:**

```powershell
ls $env:USERPROFILE\.claude\projects\
```

Look for a folder that corresponds to your project. The encoding pattern:
- Drive letter lowercased, colon removed: `E:` → `e`
- `\` after drive → `--`
- Each subsequent `\` → `-`
- Underscores in folder names → `-`

Example: `E:\Self_project\ImageConverter` → `e--Self-project-ImageConverter`

**Step 2 — Verify memory files exist:**

```powershell
ls $env:USERPROFILE\.claude\projects\e--Self-project-ImageConverter\memory\
```

**Step 3 — Add to registry.json:**

Open `E:\MIMemoryLLMDb\registry.json` and add `claude_memory_path` to the project:

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
    "claude_memory_path": "C:\\Users\\maidu\\.claude\\projects\\e--Self-project-ImageConverter\\memory"
}
```

**Step 4 — Commit and push the registry update:**

```powershell
cd E:\MIMemoryLLMDb
git add registry.json
git commit -m "registry: add claude_memory_path for image-converter"
git push
```

---

## Updating an Existing Memory File

If you discover new important information during a session (a new config path, a key decision, a resolved bug):

1. Open the relevant memory file directly in your editor
2. Add the new information to the appropriate section
3. Add a line to `## Recent Changes` with today's date
4. Run `mimp push <project>` to sync

**Do not** put temporary notes or debugging output in memory files. Memory should contain durable facts that will still be useful in 6 months.

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
