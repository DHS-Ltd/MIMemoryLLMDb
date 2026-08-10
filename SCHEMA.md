# MIMemoryLLMDb — Memory Schema v1.1

## Purpose

This document defines the **format** for markdown files stored in this repository. AI assistants
(Claude Code, ChatGPT, Gemini, local models) should read this to understand how memory is structured.

> **Scope note.** This is a *format* specification and nothing else. How the assistant *operates*
> the Wiki — ingest, lint, citation discipline, Q&A behaviour — is `wiki/RULES.md`. Vocabulary is
> `CONTEXT.md`. Keeping the three apart is deliberate; the video that prompted Phase 3 calls its
> rules doc "the schema", and that collision is banned here.

> **v1.1 (2026-08-10)** — corrects rule 5, which forbade frontmatter that roughly half the repo
> already used. Claude Code's own auto-memory writes frontmatter, and `mimp push` copies those files
> in verbatim, so the repo has always had two writers with two conventions. The rule lost. Also adds
> the wikilink rule, after 6 links in MIMP-004 were found resolving to nothing.

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

## Machine ID

The `machine_id` used in `local_paths`, `claude_memory_paths`, and the `Updated by`
field in MEMORY.md is a user-defined label — not auto-generated or auto-detected.

Rules:
- You choose it yourself when setting up each machine in `~/.mimp-config.json`
- It can be any string: `"machineA"`, `"office-server"`, `"maidul-laptop"`
- It must be unique across all machines — check `machines.json` before choosing
- Once set, it becomes the key for that machine in every project's `local_paths`
  and `claude_memory_paths` — changing it later requires updating all those entries
- All registered machine IDs are listed in `machines.json` at the repo root

## Rules for memory content

1. Be concise — each fact should be 1-2 lines max
2. Include file paths, port numbers, and config values — these are the most
   useful things for an AI to know
3. Keep MEMORY.md under 200 lines — split into referenced files if longer
4. Referenced files should be self-contained — readable without MEMORY.md
5. **YAML frontmatter is permitted and, for machine-read files, expected.** It is how Claude Code's
   auto-memory writes files and how `get_decisions` filters ADRs. Recognised keys:

   | Key | Used by | Notes |
   |-----|---------|-------|
   | `name` | auto-memory | Short slug. **Not** the filename — see rule 7 |
   | `description` | auto-memory, recall | One line; used to judge relevance |
   | `aliases` | wikilink resolution | Array. Include `name` here whenever it differs from the filename |
   | `metadata.type` | auto-memory | `user` / `feedback` / `project` / `reference` |
   | `id`, `date`, `status`, `scope`, `tags`, `supersedes`, `superseded_by` | ADRs | See `org/decisions/_TEMPLATE.md` |
   | `card`, `origin`, `sha256`, `source_modified`, `registered` | Source cards | See ADR-0007 |

   Keep it flat and simple — the parser in `mcp-server/lib/repo.js` handles scalars and inline
   arrays (`[a, b]`) only. No block sequences, no nested maps beyond `metadata`.

6. The metadata table at the top is required for all MEMORY.md files
7. **A `[[wikilink]]` must match a filename or an `aliases:` entry.** Frontmatter `name` is *not*
   resolvable on its own. Six links in MIMP-004 pointed at `name` values and silently resolved to
   nothing until 2026-08-10. When `name` differs from the filename, add `aliases: [<name>]`.
8. **Superseded claims are bannered, never deleted.** Use a blockquote at the top naming what
   replaced the claim, when, and which Source holds Authority. Stale copies survive in other repos;
   deleting the record here destroys the only trace that the claim ever existed (ADR-0006).
9. 🚫 **Never hand-edit files under `projects/`.** That folder is a **replica**. `mimp push` copies
   one way — Claude memory → repo, with `Copy-Item -Force` — so any repo-side edit is destroyed by
   the next push, silently. Edit
   `~/.claude/projects/<encoded>/memory/<file>.md` instead, then `mimp push`. This is not
   hypothetical: seven supersession banners were lost this way on 2026-08-10 and only `mimp lint`
   noticed. See **ADR-0008**. Files the brain itself owns — `org/`, `wiki/`, `raw/_cards/`,
   `CONTEXT.md`, `SCHEMA.md`, `registry.json` — are authored in the repo and unaffected.
