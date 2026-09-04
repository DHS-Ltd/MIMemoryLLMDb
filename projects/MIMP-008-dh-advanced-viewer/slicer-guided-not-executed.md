---
name: slicer-guided-not-executed
description: "In hands-on Slicer practice sessions, guide the user to click controls themselves — don't execute the steps via execute_python on their behalf, even when scripting would be faster"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1d9da353-cefb-47ba-94e6-d532775bd9d7
  modified: 2026-08-10T10:16:42.738Z
---

During live Slicer practice sessions (the [[slicer-learning-track]]), when a task is a
UI action the user is meant to learn (module navigation, setting a control, applying a
technique), **name the module/control and have the user do it** — don't call
`mcp__slicer__execute_python` to perform it directly, even when the Python API is
faster or when a control proves hard to script reliably.

**Why:** explicit correction, 2026-08-10, mid-session on exercise
`03-brain-neck-angio-mip-comparison`. I had drifted into doing several mechanical
steps myself via script (segmentation export + masking, creating a Volume Rendering
display node, applying a preset) for expediency after multiple rounds of correction
cycles had already eaten a lot of turns. The user explicitly said: *"you should guide
me to do the steps not to do by yourself."* This confirms and sharpens the existing
`slicer-learning-track` note ("guidance should favour naming the module and control
and verifying they found it over silently executing Python") — that guidance was
already written down and I still deviated from it under time pressure.

**How to apply:** reserve `execute_python` for **verification** (checking node
properties, querying voxel counts, taking screenshots to confirm state) and for
**diagnostics** (root-causing why something looks wrong). Reserve it for *performing*
a step only when the user asks for that explicitly (e.g., "just do it via script",
"finish this programmatically to keep us moving") — a standing preference for speed
does not override the default; ask or wait for that signal rather than assuming it
after a rough patch. If a UI control turns out to be hard to find via the scripting
API (e.g., the Volume Rendering "Technique" dropdown, which isn't a clean MRML
property), that is a reason to hand the single click back to the user, not a reason to
keep digging for a script-based workaround.
