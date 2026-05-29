# MCP Server Guide

> The MCP server gives Claude Code (and other MCP-compatible clients) direct access to all your project memories during a session. Instead of manually pasting memory files, the LLM retrieves them automatically via tool calls.

---

## What It Does

The MCP server exposes three tools the LLM can call:

| Tool | When the LLM calls it |
|------|-----------------------|
| `list_projects` | At session start, or when you mention a project it doesn't recognise |
| `get_project_memory` | When it needs the full context for a specific project |
| `search_memories` | When your question might involve knowledge from any project |

It is **read-only** — it never writes to memory files. All writes still go through `mimp push`.

---

## Requirements

- Node.js installed (any recent version — tested on v24)
- The `MIMemoryLLMDb` repo cloned locally
- `~/.mimp-config.json` with `repo_path` set (same file used by the `mimp` CLI)
- Claude desktop app or Claude Code with MCP support

---

## Setup (per machine)

### Step 1 — Install dependencies

```powershell
cd <repo_path>\mcp-server
npm install
```

This installs `@modelcontextprotocol/sdk` and `zod`. Only needs to be done once per machine after cloning or pulling the repo.

### Step 2 — Register in Claude Code

Open the Claude config file for your platform:

**Windows** — `%APPDATA%\Claude\claude_desktop_config.json`

Add the `mmp-memory` entry inside `mcpServers`:

```json
{
  "mcpServers": {
    "mmp-memory": {
      "command": "node",
      "args": ["E:\\MIMemoryLLMDb\\mcp-server\\index.js"]
    }
  }
}
```

Replace the path with your actual repo location. Use double backslashes on Windows.

**Example for machineB (D drive):**
```json
"args": ["D:\\MIMemoryLLMDb\\mcp-server\\index.js"]
```

### Step 3 — Restart Claude

Close and reopen the Claude desktop app (or reload the window in Claude Code).

### Step 4 — Verify

In a Claude Code session, run:

```
/mcp
```

You should see `mmp-memory` listed with 3 tools. If it shows an error, see [Troubleshooting](#troubleshooting) below.

---

## Using the Tools

You don't need to call the tools manually — the LLM decides when to use them based on the conversation. But you can trigger them explicitly:

```
"What projects do I have in my memory system?"
→ LLM calls list_projects

"Get the full memory for the v1HMS project"
→ LLM calls get_project_memory with project: "v1HMS"

"What was the Orthanc setup I did?"
→ LLM calls search_memories with query: "Orthanc"

"Have I configured Nginx anywhere?"
→ LLM calls search_memories with query: "Nginx"
```

### list_projects

Returns all projects with status and a short summary.

Optional filter: `status_filter` — `active`, `archived`, or `all` (default: `active`)

### get_project_memory

Returns the full MEMORY.md plus every file it references, concatenated with `═══ FILENAME ═══` headers.

Accepts the project ID (`MIMP-001`) or short name (`mimp`, `v1HMS`, `image-converter`).

Optional: `include_referenced_files: false` to get only MEMORY.md.

### search_memories

Searches all `.md` files across all projects for your query.

- Case-insensitive
- Multi-word queries use AND logic — all words must appear on the same line
- Returns up to 20 matches, each showing the matching line plus 2 lines of context above and below

Optional: `project_filter` to limit the search to one project.

---

## How Config Is Resolved

The server reads `repo_path` from `~/.mimp-config.json` — the same file the `mimp` CLI uses. There is no separate config to maintain.

```json
{
  "machine_id": "machineA",
  "repo_path": "E:\\MIMemoryLLMDb"
}
```

If `repo_path` is missing or the file doesn't exist, the server exits with an error in its stderr log.

---

## File Structure

```
mcp-server/
├── package.json             ← dependencies
├── index.js                 ← entry point
├── lib/
│   └── repo.js              ← shared helpers
└── tools/
    ├── list-projects.js
    ├── get-memory.js
    └── search-memory.js
```

The server is committed to the repo, so `mimp pull mimp` on a new machine will pull the code. You only need to run `npm install` and add the Claude config entry.

---

## Troubleshooting

### `/mcp` doesn't show `mmp-memory`

1. Check the path in `claude_desktop_config.json` is correct and uses double backslashes
2. Confirm Node.js is on PATH: `node --version`
3. Confirm `npm install` was run inside `mcp-server/`
4. Restart Claude completely (not just a reload)

### "Could not read ~/.mimp-config.json"

The server can't find your local config. Create it:
```powershell
notepad "$env:USERPROFILE\.mimp-config.json"
```
Minimum contents:
```json
{ "machine_id": "yourMachineName", "repo_path": "E:\\MIMemoryLLMDb" }
```

### "Could not read registry.json"

The `repo_path` in your config is wrong or the repo isn't cloned at that path. Check:
```powershell
Test-Path "$((Get-Content "$env:USERPROFILE\.mimp-config.json" | ConvertFrom-Json).repo_path)\registry.json"
```
Should return `True`.

### Tools return stale data

The server reads files from disk at call time — it does not cache. If you've run `mimp push` from another machine but haven't pulled locally, the data will be stale. Run `mimp pull <short-name>` or `git pull` in the repo to refresh.

### Server crashes after a tool call

Check Claude's MCP logs (usually in the app's developer tools console). The most common cause is a malformed `registry.json` — validate it at [jsonlint.com](https://jsonlint.com).

---

## Updating Memories After a Session

The MCP server is read-only. To save what you learned in a session:

```powershell
mimp push <short-name>
```

This copies your Claude Code memory files for that project from `~/.claude/projects/.../memory/` into the repo and pushes to GitHub.

---

## Registering on a New Machine

See [add-new-machine.md](./add-new-machine.md) for the full setup walkthrough. After the standard setup, add the MCP server step:

1. `cd <repo_path>\mcp-server && npm install`
2. Add the `mmp-memory` entry to Claude config
3. Restart Claude, verify with `/mcp`
