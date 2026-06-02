<!-- MEMORY FORMAT v1.0 | Project memory index | Read this first -->

# [MIMP-002] MIMemoryLLMDb (mimp)

| Field        | Value                              |
|--------------|------------------------------------|
| Project ID   | MIMP-002                           |
| Short name   | mimp                               |
| Last updated | 2026-05-28                         |
| Updated by   | machineA                           |
| Status       | active                             |
| Machines     | machineA, machineB (pending setup) |

## Summary

MIMemoryLLMDb is a Git-based project memory system that lets AI assistants (Claude Code and others) share structured project knowledge across multiple machines. Each project gets a unique MIMP-XXX ID and a folder of markdown memory files in a private GitHub repository. A PowerShell CLI tool (`mimp`) handles syncing via push/pull/init commands. The format is plain markdown — any LLM can read it without special integrations.

## Key Facts

- GitHub repo: https://github.com/DHS-Ltd/MIMemoryLLMDb.git
- machineA repo path: E:\MIMemoryLLMDb
- machineB repo path: D:\MIMemoryLLMDb (not yet cloned — setup pending)
- CLI tool: E:\MIMemoryLLMDb\tools\mimp.ps1
- Local config (machineA): C:\Users\maidu\.mimp-config.json — machine_id: machineA
- PowerShell alias in $PROFILE: `function mimp { & "E:\MIMemoryLLMDb\tools\mimp.ps1" @args }`
- Claude memory for this project: C:\Users\maidu\.claude\projects\e--MIMemoryLLMDb\memory
- All commands tested and working on machineA as of 2026-05-28
- machineB has NOT been set up yet — see docs/add-new-machine.md

## Memory Files

| File | Description |
|------|-------------|
| [architecture.md](./architecture.md) | System design, file structure, how push/pull works |
| [current-state.md](./current-state.md) | What is built, tested, known bugs fixed, pending work |
| [setup-history.md](./setup-history.md) | Exact steps taken to build this system — bugs hit and how fixed |

## Recent Changes

- 2026-05-28: Full system built from scratch in one session
- 2026-05-28: MIMP-001 (ImageConverter) registered and memory pushed — first successful end-to-end test
- 2026-05-28: Documentation suite created (workflow, add-new-machine, llm-guide, troubleshooting, roadmap)
