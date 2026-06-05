---
id: ADR-0003
date: 2026-05-30
status: accepted
scope: [infra, mcp-server, projects]
tags: [mcp, git-objects, sparse-checkout, retrieval, remote-sync]
supersedes:
superseded_by:
---

<!-- BRAIN LAYER | org/decisions/ADR-0003-mcp-git-objects-remote-sync.md | Decision (ADR, trajectory layer) -->

# ADR-0003: MCP server reads via git objects + remote sync

| Field | Value |
|-------|-------|
| Date | 2026-05-30 |
| Status | accepted |
| Scope | Read-only MCP retrieval server (`mcp-server/`) |

## Context

The MCP server (built 2026-05-29) gives any MCP client read-only access to project memories. Its
first version read files from **disk** (`fs.readFileSync`). But classic sparse checkout (ADR-0002)
means most machines only have *their own* projects on disk — so a disk-reading server on machineB
could not see MIMP-001/003/004 at all. Worse, disk only reflects the *local* working tree, which may
lag behind what other machines have already pushed to GitHub. A retrieval layer that can only see a
fraction of the portfolio, stale, is not a memory system.

## Decision

Read memory from **git object storage instead of disk**, against the **remote** ref:

- **v2 — git objects (2026-05-30):** replace `fs.readFileSync` with `git show <ref>:<path>` and
  `git ls-tree <ref> <path>`. Git objects contain *every* project regardless of sparse checkout, so
  the server sees the whole portfolio on any machine.
- **v3 — remote sync (2026-05-30):** read from `origin/master` rather than `HEAD`, with a 60-second
  auto-fetch TTL and a per-call registry re-read — so the server reflects what *all* machines have
  pushed, not just the local tree.

The server remains strictly **read-only and a context-assembler — it never calls a model**. All
writes still flow through `mimp push`.

## Alternatives

- **Disk reads (v1)** — rejected: blind to sparse-excluded projects; stale vs. remote.
- **Drop sparse checkout so disk has everything** — rejected: undoes ADR-0002's per-machine scoping.
- **Run a sync/daemon to mirror all files to disk** — rejected: more moving parts than reading git
  objects directly; git already stores every version.
- **Read `HEAD` instead of `origin/master`** — rejected: `HEAD` is the local tree's last commit and
  misses other machines' pushes until a manual pull.

## Path-impact

- **Unlocks** true cross-machine retrieval — verified 2026-05-30: machineB read memories pushed from
  machineA for a project not checked out on machineB's disk.
- **Establishes the pattern** that the Phase-2 brain MCP tools (step 1e) must reuse: same git-objects
  / `origin/master` reads, same stderr-only logging (stdout is the JSON-RPC channel), same Zod v4
  schemas, same context-assembler discipline.
- **Implementation constraints captured:** strip the UTF-8 BOM before `JSON.parse(registry)`;
  `git ls-tree` returns full paths on this git version (use as-is, don't prepend `projects/`); never
  `console.log` (corrupts the stream — use `console.error`).
