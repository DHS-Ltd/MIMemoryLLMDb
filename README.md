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
| [docs/Phase1-Build/workflow.md](./docs/Phase1-Build/workflow.md) | Daily workflow: push, pull, create, update |
| [docs/Phase1-Build/add-new-machine.md](./docs/Phase1-Build/add-new-machine.md) | Step-by-step guide to add a new machine |
| [docs/Phase1-Build/llm-guide.md](./docs/Phase1-Build/llm-guide.md) | How any LLM can use this memory system |
| [docs/Phase1-Build/troubleshooting.md](./docs/Phase1-Build/troubleshooting.md) | Known issues and fixes |
| [docs/Phase1-Build/roadmap.md](./docs/Phase1-Build/roadmap.md) | Future enhancement ideas |
| [docs/Phase1-Build/MaidulMemoryProject-Implementation-Guide.md](./docs/Phase1-Build/MaidulMemoryProject-Implementation-Guide.md) | Original build guide |
| [CONTEXT.md](./CONTEXT.md) | Glossary — the shared language of the brain |
| [org/](./org/) | The cited company index: business, north-star, entities, programs, decisions |
| [wiki/RULES.md](./wiki/RULES.md) | How the assistant ingests Sources and maintains the Wiki |
| [docs/BrainBuild/brain-build-plan.md](./docs/BrainBuild/brain-build-plan.md) | Phase 2 — the brain layer |
| [docs/Phase3-Wiki/wiki-build-plan.md](./docs/Phase3-Wiki/wiki-build-plan.md) | Phase 3 — the Wiki layer (current) |
