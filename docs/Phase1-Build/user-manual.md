# MIMemoryLLMDb — User Manual

> Day-to-day reference for managing project memory across machines.
> For full guides see the other docs in this folder.

---

## What This System Does

Every project gets a folder of markdown files (`MEMORY.md` + detail files) stored in a private GitHub repo. The `mimp` CLI syncs them between machines. The MCP server lets Claude Code read any project's memory automatically — no copy-pasting required.

```
Your Claude session  →  MCP server  →  git fetch origin/master  →  GitHub
                                                 ↑
                    mimp push (any machine) ─────┘
```

---

## Machines

| ID | Machine | Repo path |
|----|---------|-----------|
| machineA | MaidulDesktop (Windows) | `E:\MIMemoryLLMDb` |
| machineB | MedIServer (Windows Server) | `D:\MIMemoryLLMDb` |

---

## Daily Workflow

### After a coding session — save memory

```powershell
mimp push <short-name>
```

Example:
```powershell
mimp push mimp          # saves MIMemoryLLMDb project memory
mimp push dh-pacs-marketing
```

This copies your Claude Code memory files for that project to the repo and pushes to GitHub.

### Start of day on a different machine — nothing needed

The MCP server auto-fetches from GitHub on every query (60s TTL). Just ask Claude about the project — it will pull the latest memory from GitHub automatically.

If you want to also update the local working tree (e.g. to edit memory files directly):
```powershell
cd E:\MIMemoryLLMDb   # or D:\ on machineB
git pull
```

---

## Key Commands

```powershell
mimp list                                    # show all registered projects

mimp push <short-name>                       # upload this machine's memory to GitHub
mimp pull <short-name>                       # download memory from GitHub to this machine
mimp sync <short-name>                       # pull then push

mimp status <short-name>                     # compare local vs repo file counts/timestamps
mimp sparse-status                           # show which project folders are checked out locally

mimp init "Full Name" "short-name" "C:\path\to\project"   # register a new project
```

---

## Registering a New Project

```powershell
mimp init "My Project" "my-proj" "E:\path\to\project"
```

During `init` you will be prompted to paste the Claude Code memory path. Find it:
```powershell
ls "$env:USERPROFILE\.claude\projects\"
# look for the folder matching your project path (encoded), e.g.:
# e--path-to-project\memory\
```

Paste the full path including `\memory\` when prompted. `mimp init` validates that the directory exists and contains a `MEMORY.md` before assigning an ID.

---

## MCP Server — Using Memory in Claude

The MCP server (`mmp-memory`) is registered globally in Claude Code. It has 3 tools Claude calls automatically:

| Tool | When Claude uses it |
|------|---------------------|
| `list_projects` | You mention a project Claude doesn't recognise |
| `get_project_memory` | You start working on a specific project |
| `search_memories` | Your question might involve any project |

**You don't invoke these manually** — just ask Claude naturally:

```
"What projects do I have?"
"Get the memory for the v1HMS project"
"Have I configured Nginx anywhere before?"
```

The server fetches from GitHub automatically — no `git pull` needed first.

### Verify the server is connected

In any Claude Code session:
```
/mcp
```
Look for `mmp-memory ✓ Connected`.

---

## Adding the MCP Server on a New Machine

After cloning the repo and running `npm install`:

```powershell
cd <repo-path>\mcp-server
npm install
```

Then register in Claude Code:
```powershell
claude mcp add --scope user mmp-memory node "<repo-path>\mcp-server\index.js"
```

Reload the VS Code window. Verify with `/mcp`.

---

## Adding a New Machine to the System

Full steps in [add-new-machine.md](add-new-machine.md). Quick summary:

1. Clone repo: `git clone https://github.com/DHS-Ltd/MIMemoryLLMDb.git <path>`
2. Create `~/.mimp-config.json`:
   ```json
   { "machine_id": "myMachine", "repo_path": "D:\\MIMemoryLLMDb" }
   ```
3. Add PowerShell alias to `$PROFILE`:
   ```powershell
   function mimp { & "D:\MIMemoryLLMDb\tools\mimp.ps1" @args }
   ```
4. Install MCP server: `cd D:\MIMemoryLLMDb\mcp-server && npm install`
5. Register MCP: `claude mcp add --scope user mmp-memory node "D:\MIMemoryLLMDb\mcp-server\index.js"`
6. Set up git auth (Windows Credential Manager with a GitHub PAT)

---

## Project Memory Structure

```
projects/
└── MIMP-XXX-short-name/
    ├── MEMORY.md          ← index file — always read this first
    ├── architecture.md    ← referenced detail file
    ├── current-state.md   ← referenced detail file
    └── ...                ← any other detail files linked from MEMORY.md
```

Claude Code memory lives at:
```
~/.claude/projects/<encoded-project-path>/memory/
```

`mimp push` copies from there → repo. `mimp pull` copies from repo → there.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `mmp-memory` not in `/mcp` | Run `claude mcp add --scope user mmp-memory node "<path>\index.js"`, reload VS Code |
| MCP returns stale data | Wait 60s (fetch TTL) or restart Claude session |
| `mimp push` fails with "nothing to push" | Run `git pull` first — remote has changes |
| `mimp init` rejects short-name | Short-names cannot contain `\`, `/`, `.`, or spaces |
| New project from machineB not visible | MCP auto-fetches; just ask Claude — no manual pull needed |
| `registry.json` parse error at startup | File has a UTF-8 BOM — handled automatically; if error persists check JSON validity |

Full issue log: [troubleshooting.md](troubleshooting.md)
