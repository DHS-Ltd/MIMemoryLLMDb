# LLM Guide — How to Use MIMemoryLLMDb Memory Files

This guide explains how any AI assistant can read and use the project memory files stored in this repository. No special tools or integrations are required — the format is plain markdown.

---

## What You Are Reading

This repository stores structured project knowledge as markdown files. Each project has:

- A `MEMORY.md` index file — start here, always
- One or more referenced `.md` files with deeper context on specific topics

The `SCHEMA.md` at the repo root explains the full format specification.

---

## How to Use Memory in a Session

### Rule 1 — Read MEMORY.md first

Every project's `MEMORY.md` contains a metadata table, a 2-4 sentence summary, a key facts list, and links to deeper files. Reading it takes less than 30 seconds and gives you enough context to answer most questions about the project.

### Rule 2 — Read referenced files only when relevant

The memory files linked in MEMORY.md are deep context files. Only read them when the user's question or task is directly related to their described topic. Do not load all files upfront — this wastes context.

### Rule 3 — Trust the key facts section

The key facts list is curated to contain the most important things an AI needs to know: paths, versions, architectural decisions, active blockers. Treat these as ground truth for the session.

### Rule 4 — Check the Recent Changes section

The `## Recent Changes` section tells you what has changed recently and why. This is critical for avoiding stale assumptions.

---

## Using Memory with Claude Code

Claude Code reads `CLAUDE.md` from the project root automatically. When you run `mimp pull <project>` on a machine, the project's memory files are copied into the local project directory. Claude Code picks them up on the next session without any extra configuration.

**Typical session start:**
```
cd E:\Projects\MyProject
mimp pull myproject          ← sync latest memory from GitHub
claude                       ← Claude Code now has full context
```

---

## Using Memory with ChatGPT or Gemini (Web)

1. Go to `github.com/DHS-Ltd/MIMemoryLLMDb/tree/master/projects/<MIMP-XXX-name>/`
2. Open `MEMORY.md` and copy its raw content
3. Paste it at the start of your conversation with the instruction:

```
This is project context. Read it before answering my questions.

[paste MEMORY.md content here]
```

For deeper context, also upload the relevant referenced `.md` files as attachments.

---

## Using Memory with Local Models (Ollama, LM Studio)

Pipe the memory file as context before your question:

```bash
# Single file
cat projects/MIMP-001-image-converter/MEMORY.md | ollama run llama3.2 "Given this context, what is the project's tech stack?"

# Multiple files
cat projects/MIMP-001-image-converter/MEMORY.md \
    projects/MIMP-001-image-converter/architecture.md | \
    ollama run llama3.2 "Summarize the architecture."
```

For LM Studio, use the system prompt field:
```
You are working on a project. Here is the full context:

[paste MEMORY.md content]
[paste architecture.md content if needed]
```

---

## Using Memory with Cursor, Windsurf, or Other AI Editors

These editors typically read markdown context files from the project root or a `.cursor/` directory. Copy the project's `MEMORY.md` to the location your editor expects:

```powershell
# For Cursor
Copy-Item projects\MIMP-001-image-converter\MEMORY.md E:\Projects\MyProject\.cursorrules

# Or use mimp pull which handles this automatically
mimp pull image-converter
```

---

## Using Memory via API (OpenAI, Anthropic, OpenRouter)

Prepend the memory content to your system prompt or first user message:

```python
import anthropic

with open("projects/MIMP-001-image-converter/MEMORY.md") as f:
    memory = f.read()

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=4096,
    system=f"You are assisting with a software project. Here is the project context:\n\n{memory}",
    messages=[{"role": "user", "content": "What should I work on next?"}]
)
```

For multiple memory files:

```python
import os

memory_dir = "projects/MIMP-001-image-converter/"
memory_files = [f for f in os.listdir(memory_dir) if f.endswith(".md")]
combined = ""
for filename in ["MEMORY.md"] + [f for f in memory_files if f != "MEMORY.md"]:
    path = os.path.join(memory_dir, filename)
    if os.path.exists(path):
        with open(path) as f:
            combined += f"\n\n--- {filename} ---\n\n" + f.read()
```

---

## Creating New Memory Files

When an AI assistant discovers new important information during a session, it should write or update the appropriate memory file:

**What belongs in MEMORY.md:**
- Key architectural decisions and why
- File paths, port numbers, credentials hints (never actual secrets)
- Current project status and active blockers
- Recent major changes

**What belongs in a referenced file:**
- Deep technical details (config schemas, deployment steps, bug post-mortems)
- Information longer than 10-15 lines on a single topic

**What does NOT belong in memory:**
- Code snippets (these belong in the codebase itself)
- Temporary debugging notes
- Information already derivable from reading the code
- Git history (use `git log` for that)

**Format rule:** Keep MEMORY.md under 200 lines. If it grows beyond that, split content into a new referenced file and link to it.

---

## Updating Memory After a Session

At the end of a working session, update the relevant memory file(s) with:
- What changed and why (add to Recent Changes)
- Any new key facts discovered
- Updated status or blockers

Then push to GitHub:

```powershell
mimp push <project-short-name>
```

The push command automatically updates the `Last updated` and `Updated by` fields in MEMORY.md and commits everything.

---

## Memory File Freshness

Memory files include a `Last updated` date in their metadata table. Before relying on memory content, check this date against the current date. If a memory file is more than a few weeks old and the project has been active, verify key facts against the actual codebase before acting on them.

```markdown
| Last updated | 2026-05-28 |
```

If you find outdated information, correct it in the file and run `mimp push` to sync.
