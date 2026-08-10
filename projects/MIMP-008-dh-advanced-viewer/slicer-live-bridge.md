---
name: slicer-live-bridge
description: "The live Claude↔running-Slicer MCP bridge is wired up and opt-in per session — how to start it and why it isn't automatic"
metadata: 
  node_type: memory
  type: project
  originSessionId: 64bb8465-991b-4f39-9a63-acea2f1b844c
  modified: 2026-07-28T13:45:07.274Z
aliases: [slicer_live_bridge]
---

Wired up 2026-07-28, closing the deferral in [[dhdicomanalyzerpro-rescaffold]]. Claude can
see and drive the user's **running** 3D Slicer session — the actual scene, the actual loaded
volumes — not a hypothetical one.

**Verified working end-to-end 2026-07-28** — `list_nodes`, `execute_python`, and
`screenshot(region=...)` all confirmed against a live session with a real study loaded.

**Session ritual:** open Slicer → `startMCP()` in the Python console → *Yes* on the access
dialog → work → `stopMCP()` or just close Slicer.

**Ordering gotcha (hit on the first real run):** Claude Code attaches to MCP servers at
launch. If Slicer/`startMCP()` comes up *after* Claude Code, the `slicer` tools will be
missing and everything looks broken when nothing is. Fix: **`/mcp reconnect all`** — takes
a few seconds and needs no restart. Diagnose which side is at fault with a direct probe
before assuming the bridge failed:
`curl -s -X POST http://localhost:2026/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'`

**It never starts on its own, deliberately.** `~/.slicerrc.py` defines `startMCP()` /
`stopMCP()` and calls neither. Upstream autostarts on load; that was changed because the
bridge grants arbitrary Python execution against whatever is loaded, and this user chose to
work against **real patient studies** rather than sample data. The explicit call *is* the
access gate. If the `slicer` MCP tools are missing, they simply haven't run `startMCP()` —
ask them to; don't try to start it from outside.

**PHI is a live concern, and it has already materialized.** On the very first `list_nodes`
call against a real study (2026-07-28), the scene returned a **folder node carrying the
patient's name and MRN**, plus identifying series descriptions. The user was shown this and
accepted it — do not re-litigate the decision, but do **not** copy identifiers into memory
files, repo docs, or summaries, and don't restate them once they've been surfaced.

`screenshot` takes a `region` argument (`window`|`views`|`3d`|`slice`) added locally for
this — `views`/`3d`/`slice` exclude the module panel and DICOM browser, and are the right
default with a real study loaded. It **reduces** exposure, it doesn't eliminate it:
`list_nodes` returns node names regardless. Prefer targeted `execute_python` queries over
a blanket `list_nodes` when you only need part of the scene.

**The user's goal is to learn what stock Slicer offers** — they said they don't know many of
the functions available. Prefer *naming the module and control and verifying they found it*
over silently executing Python that produces the answer. The curriculum was deliberately left
open ("tooling first"); it hasn't been designed yet.

Full rationale, including why `slicer-skill`'s `setup.sh` was rejected:
`docs/adr/0001-slicer-live-bridge-and-corpus-scope.md`. Reference lookups go through the
`/slicer` skill. See also [[slicer-knowledge-base]] and [[workspace-containment]].
