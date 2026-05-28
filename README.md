# MIMemoryLLMDb

Central memory database for all projects, synced via Git.

## What is this?

A structured backup and sync system for project knowledge (memory files)
used by AI coding assistants (Claude Code, etc.) across multiple machines.

## How it works

- Each project has a unique ID (MIMP-XXX) and a folder under `projects/`
- Each project folder contains a `MEMORY.md` index and referenced detail files
- CLI tools (`mimp push`, `mimp pull`, `mimp init`) sync between local projects and this repo
- Any LLM can read `MEMORY.md` to understand a project's full context

## Machines

| ID | Name | OS | Repo Path |
|---|---|---|---|
| machineA | MaidulDesktop | Windows | E:\MIMemoryLLMDb |
| machineB | MedIServer | Windows Server 2022 | D:\MIMemoryLLMDb |

## Quick start

```
mimp init "My New Project" "short-name" "E:\path\to\project"   Register a project
mimp push MIMP-001                                              Push local memory to GitHub
mimp pull MIMP-001                                             Pull memory from GitHub to local
mimp list                                                      List all registered projects
mimp status MIMP-001                                           Check if local and remote are in sync
```

## Documentation

| Document | Description |
|----------|-------------|
| [SCHEMA.md](./SCHEMA.md) | Memory file format specification |
| [docs/workflow.md](./docs/workflow.md) | Daily workflow: push, pull, create, update |
| [docs/add-new-machine.md](./docs/add-new-machine.md) | Step-by-step guide to add a new machine |
| [docs/llm-guide.md](./docs/llm-guide.md) | How any LLM can use this memory system |
| [docs/troubleshooting.md](./docs/troubleshooting.md) | Known issues and fixes |
| [docs/roadmap.md](./docs/roadmap.md) | Future enhancement ideas |
| [docs/MaidulMemoryProject-Implementation-Guide.md](./docs/MaidulMemoryProject-Implementation-Guide.md) | Original build guide |
