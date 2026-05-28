# MIMemoryLLMDb — Memory Schema v1.0

## Purpose

This document defines the format for project memory files stored in this
repository. AI assistants (Claude Code, ChatGPT, Gemini, local models)
should read this to understand how memory is structured.

## Structure per project

Each project lives in `projects/MIMP-XXX-shortname/` and contains:

### MEMORY.md (required)

The root index file. Always read this first. It contains:
1. A metadata block (project ID, last update, machines, status)
2. A project summary (2-4 sentences)
3. Key facts (bullet list of most important things to know)
4. Referenced files (links to deeper context with descriptions)

### Referenced .md files (optional)

Deeper context files linked from MEMORY.md. Only read these when the
current task is related to their described topic.

## MEMORY.md template

---begin template---

<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [MIMP-XXX] Project Full Name

| Field        | Value                    |
|--------------|--------------------------|
| Project ID   | MIMP-XXX                 |
| Short name   | project-short-name       |
| Last updated | YYYY-MM-DD               |
| Updated by   | machine-name             |
| Status       | active / archived        |
| Machines     | machineA, machineB       |

## Summary
[2-4 sentences describing what this project is and its current state]

## Key Facts
- [Fact 1: most important thing to know]
- [Fact 2: stack, architecture, or key decision]
- [Fact 3: current status or blocker]
- [Fact 4: paths, configs, or access details]

## Memory Files
| File | Description |
|------|-------------|
| [architecture.md](./architecture.md) | Stack choices and design decisions |
| [config.md](./config.md) | Ports, paths, env vars, credentials hints |

## Recent Changes
- YYYY-MM-DD: [What changed and why]
- YYYY-MM-DD: [What changed and why]

---end template---

## Rules for memory content

1. Be concise — each fact should be 1-2 lines max
2. Include file paths, port numbers, and config values — these are the most
   useful things for an AI to know
3. Keep MEMORY.md under 200 lines — split into referenced files if longer
4. Referenced files should be self-contained — readable without MEMORY.md
5. Use plain markdown only — no HTML, no special tags, no frontmatter
6. The metadata table at the top is required for all MEMORY.md files
