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

| ID | Name | OS | Location |
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

## Format

See [SCHEMA.md](./SCHEMA.md) for the memory file format specification.
