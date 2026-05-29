# MaidulMemoryProject MCP Server — Build Guide

> **What this document is:** A specification and context guide for building the MCP server.
> Feed this to Claude Code as context when implementing.
> **What this document is NOT:** Step-by-step code. Claude Code will write the code.

---

## Project Context

MaidulMemoryProject is a Git-based, multi-machine project memory system. It stores structured markdown memory files (MEMORY.md + referenced .md files) in a GitHub repo, organized by project ID (MMP-XXX). The CLI tool `mmp push/pull` syncs these between machines.

This MCP server is the **read layer** — it lets any MCP-compatible LLM client (Claude Code, Cursor, Continue) search and retrieve project memories on demand during a session. The LLM decides when to call the tools based on conversation context.

---

## Architecture

```
Claude Code (or Cursor, Continue)
    │
    │  MCP protocol (stdin/stdout, JSON-RPC)
    │
    ▼
MCP Server (Node.js process)
    │
    │  File system reads (no network, no DB)
    │
    ▼
MaidulMemoryProject Git repo (local clone)
    ├── registry.json
    └── projects/
        ├── MMP-001-dhv/
        │   ├── MEMORY.md
        │   ├── architecture.md
        │   └── ...
        └── MMP-002-bdc-hms/
            ├── MEMORY.md
            └── ...
```

The MCP server is a **local subprocess** — Claude Code launches it when a session starts and kills it when the session ends. It communicates via stdin/stdout using JSON-RPC 2.0. No HTTP server, no ports, no networking.

The server only **reads** from the repo. It never writes, commits, or pushes. Writing is handled by the existing `mmp push` CLI tool.

---

## Tech Stack

- **Runtime:** Node.js (already on both machines)
- **MCP SDK:** `@modelcontextprotocol/sdk` (official Anthropic SDK)
- **Transport:** stdio (stdin/stdout)
- **File reading:** Node.js `fs` module
- **JSON parsing:** Native `JSON.parse` for registry.json
- **Search:** Simple string matching across .md files (no embeddings, no vector DB)

---

## File Structure to Create

```
MaidulMemoryProject/
└── mcp-server/
    ├── package.json
    ├── index.js              ← Entry point, server setup + tool registration
    ├── tools/
    │   ├── list-projects.js  ← list_projects tool handler
    │   ├── get-memory.js     ← get_project_memory tool handler
    │   └── search-memory.js  ← search_memories tool handler
    └── lib/
        └── repo.js           ← Shared helpers: read registry, find files, etc.
```

---

## The Repo Path Problem

The MCP server needs to know where the local Git repo clone lives. This differs per machine:
- machineA: `/home/maidul/tools/MaidulMemoryProject`
- machineB: `E:\Tools\MaidulMemoryProject`

**Solution:** The repo path is passed as a command-line argument when Claude Code launches the server. This is configured once per machine in the Claude Code MCP settings.

```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": [
        "E:\\Tools\\MaidulMemoryProject\\mcp-server\\index.js",
        "--repo", "E:\\Tools\\MaidulMemoryProject"
      ]
    }
  }
}
```

The `index.js` reads `--repo` from `process.argv` and passes it to all tool handlers.

**Alternative approach:** Read from `~/.mmp-config.json` (the same config the CLI uses). This means zero duplication — the MCP server and CLI share the same config. The server reads `repo_path` from the config file at startup. Either approach works — pick one during implementation.

---

## Tools to Implement (3 total)

### Tool 1: `list_projects`

**Purpose:** Show all registered projects with their status and summary.
**When the LLM calls this:** At session start to understand what projects exist, or when the user mentions a project the LLM doesn't recognize.

**Input schema:**
```json
{
  "type": "object",
  "properties": {
    "status_filter": {
      "type": "string",
      "enum": ["active", "archived", "all"],
      "description": "Filter by project status. Default: active"
    }
  }
}
```

**What it does:**
1. Read `registry.json`
2. For each project matching the filter, read the first 5 lines of its MEMORY.md (the summary section)
3. Return formatted list

**Return format (plain text):**
```
MMP-001 | dhv | DH DICOM Viewer | active
  Summary: Cloud-capable medical imaging platform using Orthanc...

MMP-002 | bdc-hms | Baroicha Diagnostic Center HMS | active
  Summary: GAS Web App + Android WebView APK for BDC staff...

MMP-003 | erpnext | ERPNext DHS Operations | active
  Summary: ERPNext v14 for DH Solutions Limited...
```

---

### Tool 2: `get_project_memory`

**Purpose:** Retrieve the full memory for a specific project.
**When the LLM calls this:** When the user is working on a specific project and the LLM needs its full context, or when the LLM found a relevant project via search and wants the complete picture.

**Input schema:**
```json
{
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "Project ID (MMP-001) or short name (dhv)"
    },
    "include_referenced_files": {
      "type": "boolean",
      "description": "If true, also return content of files referenced in MEMORY.md. Default: true"
    }
  },
  "required": ["project"]
}
```

**What it does:**
1. Resolve project ID from input (could be MMP-XXX or short name)
2. Find the project folder in `projects/`
3. Read `MEMORY.md`
4. If `include_referenced_files` is true: parse the "Memory Files" table in MEMORY.md, read each referenced .md file
5. Return all content concatenated with clear file headers

**Return format (plain text):**
```
═══ MEMORY.md ═══
[full content of MEMORY.md]

═══ architecture.md ═══
[full content of architecture.md]

═══ orthanc-config.md ═══
[full content of orthanc-config.md]
```

**Edge cases to handle:**
- Project not found → return clear error message (not an exception)
- Referenced file doesn't exist → skip it, note it as missing in output
- MEMORY.md is empty → return the template with a note that memory hasn't been populated yet

---

### Tool 3: `search_memories`

**Purpose:** Search across ALL projects for a keyword or topic.
**When the LLM calls this:** When the user asks something that might exist in another project's memory, or when looking for cross-project patterns (e.g., "where have I configured Nginx before?").

**Input schema:**
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query — keywords to find across all project memories"
    },
    "project_filter": {
      "type": "string",
      "description": "Optional: limit search to a specific project ID or short name"
    }
  },
  "required": ["query"]
}
```

**What it does:**
1. If `project_filter` is set, search only that project's folder
2. Otherwise, search all folders under `projects/`
3. For each .md file, read content and check for case-insensitive match
4. For each match, return: project ID, filename, and the matching line with 2 lines of context above and below (5-line window)
5. Cap results at 20 matches to avoid overwhelming the context window

**Return format (plain text):**
```
Found 3 matches for "Nginx":

── MMP-001-dhv/deployment.md (line 24) ──
  ...Hetzner server runs Docker containers
  Nginx reverse proxy handles SSL termination
  Let's Encrypt for certificate renewal...

── MMP-006-infra/server-setup.md (line 8) ──
  ...UFW configured to allow ports 80, 443
  Nginx installed via apt, config at /etc/nginx/sites-available/
  Default server block proxies to Docker containers...

── MMP-003-erpnext/MEMORY.md (line 15) ──
  ...ERPNext accessible via Cloudflare Tunnel
  Nginx is managed by frappe-bench, not manually configured
  Bench setup handles SSL via certbot...
```

**Search approach:** Simple case-insensitive substring matching. Split multi-word queries on spaces and match files containing ALL words (AND logic). This is intentionally simple — for a file-based system with <100 files, grep-style search is fast and effective. No need for fuzzy matching or ranking.

---

## Important Implementation Details

### MCP SDK Usage

The `@modelcontextprotocol/sdk` package provides the server framework. The basic pattern:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "mmp-memory",
  version: "1.0.0"
});

// Register tools using server.tool(name, schema, handler)
server.tool("list_projects", { /* schema */ }, async (args) => {
  // handler logic
  return { content: [{ type: "text", text: "result" }] };
});

// Connect via stdio
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Key point:** Tool handlers return `{ content: [{ type: "text", text: "..." }] }`. The content is always an array of content blocks. For this server, every response is a single text block.

### Module Type

Use `"type": "module"` in package.json for ES module imports, since the MCP SDK uses ESM.

### Error Handling

MCP tool handlers should NOT throw exceptions. If something goes wrong (file not found, invalid project ID), return a text response explaining the error. The LLM can then tell the user what happened or try a different approach.

```javascript
// Good — error as response
return { content: [{ type: "text", text: "Error: Project 'xyz' not found in registry" }] };

// Bad — thrown exception
throw new Error("Project not found");  // This crashes the MCP connection
```

### Logging

MCP servers communicate via stdin/stdout, so **never use `console.log()`** — it would corrupt the JSON-RPC stream. Use `console.error()` for debug logging (stderr is safe). The MCP SDK may also provide a logging mechanism.

### No Write Operations

This server has no tools that modify files. It's read-only. All writes happen through `mmp push`. This is intentional — it keeps the MCP server simple and prevents accidental memory corruption during LLM sessions.

---

## Tool Descriptions — Critical for LLM Behavior

The tool descriptions you write determine WHEN the LLM decides to call each tool. Write them from the LLM's perspective:

**list_projects:**
```
"List all registered projects in the MaidulMemoryProject memory system.
Returns project IDs, names, and brief summaries. Call this when you need
to know what projects exist, or when the user mentions a project you
don't have context for."
```

**get_project_memory:**
```
"Retrieve the full memory context for a specific project, including its
MEMORY.md index and all referenced detail files. Call this when working
on a specific project and you need its architecture decisions, configs,
or historical context. Accepts project ID (MMP-001) or short name (dhv)."
```

**search_memories:**
```
"Search across all project memories for keywords or topics. Returns
matching lines with surrounding context from any project. Call this when
the user's question might be answered by knowledge from another project,
or when looking for cross-project patterns like shared configs, similar
setups, or reusable solutions."
```

These descriptions are what the LLM reads to decide which tool to use. Be specific about WHEN to call each one.

---

## Claude Code MCP Configuration

After building, register the server in Claude Code's config.

### Global config (applies to all projects):

**machineB (Windows)** — edit `%APPDATA%\Claude\settings.json`:
```json
{
  "mcpServers": {
    "mmp-memory": {
      "command": "node",
      "args": ["E:\\Tools\\MaidulMemoryProject\\mcp-server\\index.js"]
    }
  }
}
```

**machineA (Linux)** — edit `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "mmp-memory": {
      "command": "node",
      "args": ["/home/maidul/tools/MaidulMemoryProject/mcp-server/index.js"]
    }
  }
}
```

### Verify it works:

After adding the config, start Claude Code and run:
```
/mcp
```
This shows connected MCP servers. `mmp-memory` should appear with 3 tools listed.

Then test:
```
You: "What projects do I have in my memory system?"
LLM: [calls list_projects] → shows all your projects
```

---

## Testing Checklist

```
□ Server starts without errors (node mcp-server/index.js --repo /path)
□ list_projects returns all projects from registry.json
□ list_projects shows summary from each MEMORY.md
□ get_project_memory returns full MEMORY.md for a valid project ID
□ get_project_memory returns full MEMORY.md for a valid short name
□ get_project_memory includes referenced files when flag is true
□ get_project_memory returns clear error for invalid project
□ search_memories finds matches across multiple projects
□ search_memories returns context lines around matches
□ search_memories handles multi-word queries (AND logic)
□ search_memories respects project_filter
□ search_memories returns "no matches" message when nothing found
□ No console.log in the codebase (only console.error for debug)
□ Claude Code /mcp shows mmp-memory with 3 tools
□ LLM successfully calls each tool in a real conversation
```

---

## Build Order for Claude Code Session

When you open Claude Code to build this, follow this sequence:

```
Step 1: Initialize the project
  → cd MaidulMemoryProject/mcp-server
  → npm init, install @modelcontextprotocol/sdk
  → Create index.js with server boilerplate + stdio transport

Step 2: Build lib/repo.js
  → Helper functions: readRegistry(), resolveProjectId(),
    getProjectFolder(), readFileContent()
  → Test with a simple script that reads your registry.json

Step 3: Build tools/list-projects.js
  → Register tool, read registry, read MEMORY.md summaries
  → Test by running the server manually

Step 4: Build tools/get-memory.js
  → Resolve project, read MEMORY.md, parse file references,
    read referenced files, concatenate
  → Test with both MMP-XXX and short name inputs

Step 5: Build tools/search-memory.js
  → Walk all project folders, read all .md files,
    case-insensitive match, extract context lines
  → Test with a keyword you know exists in multiple projects

Step 6: Connect to Claude Code
  → Add to settings.json, restart Claude Code
  → Test /mcp, then have a real conversation using the tools

Step 7: Push the mcp-server/ code to GitHub
  → mmp push mmp (push the MaidulMemoryProject's own memory)
  → git add/commit/push the mcp-server code
```

---

## Future Enhancements (Not Now)

These are ideas to consider after the basic 3-tool server is working:

- **`get_cross_project_summary` tool** — Returns a condensed view of all projects, useful when starting a session on a new project that touches multiple existing ones
- **`get_recent_changes` tool** — Reads git log for a project and returns recent memory changes with dates
- **Resource endpoints** — MCP supports "resources" (read-only data the client can list and read). Each project's MEMORY.md could be exposed as a resource, letting Claude Code's UI show them in a sidebar
- **Write tool (careful)** — A `save_memory` tool that appends to a project's MEMORY.md during a session. This would replace the manual `mmp push` step but needs safeguards against LLM hallucination corrupting memory files

---

*Feed this entire document to Claude Code as context when starting the implementation session.*
