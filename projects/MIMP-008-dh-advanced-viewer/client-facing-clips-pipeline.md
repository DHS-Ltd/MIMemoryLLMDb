---
name: client-facing-clips-pipeline
description: "New Inobitec/Client_Facing_Clips/ pipeline for customer-facing marketing video captions (overlay table + .srt), distinct from Knowledge_Base and Video_Case_Practice"
metadata: 
  node_type: memory
  type: project
  originSessionId: 63fc8d3b-5bb0-41c2-8a45-8bb94b72bb0e
  modified: 2026-07-20T18:06:36.446Z
aliases: [client_facing_clips_pipeline]
---

**Client_Facing_Clips pipeline** — a third bucket inside `Inobitec/`, alongside
`Knowledge_Base` (capability catalog) and `Video_Case_Practice` (internal training logs).
Created 2026-07-20/21 via `/grill-with-docs`. Holds captions for videos meant to be shown
to **prospective customers** to trigger software adoption — not study material, explicitly
excluded from the cataloguer agent's ingestion scope (see [[inobitec-capability-catalog]]
and `Inobitec/CONTEXT.md`'s "Client-Facing Clip" glossary entry).

**Source videos** live outside the repo in the Video Repo's `Inobitec_processed_Clips/`
subfolder (edited/exported versions of raw practice clips, each with a `-Cover.jpg`
thumbnail — see root `CONTEXT-MAP.md`).

**Per-clip output convention** (mirrored to both the Video Repo folder and
`Inobitec/Client_Facing_Clips/<Clip-Name>/` in-repo):
- `<Clip-Name>.srt` — dense, continuous narration captions (every ~5-8s), synthesized
  from silent frame analysis (these clips have no usable narration audio) + Knowledge
  Base terminology grounding. Plain language with occasional real feature names for
  credibility.
- `<Clip-Name>-overlays.md` — sparse (4-6) punchy timestamped overlay callouts as a
  markdown table, for manual burn-in in a video editor. Distinct layer from the .srt, not
  the same content reformatted.

**Workflow**: `/watch` the video for frames (audio is typically discarded — screen
recordings with no real narration), cross-reference on-screen tools against
`Knowledge_Base/CAPABILITIES.md` for accurate terminology, draft both files in chat for
user review/revision, then write finals to both locations.

**First clip processed**: `ABD_V&B_Clip_Post_Processing` (2026-07) — abdomen CT from IBN
Sina Hospital, Dhanmondi, Dhaka; demonstrates the "New Segmented Structure (Threshold)"
capability run twice (bone, then vessels). See [[marketing-caption-voice]] for the wording
rules applied.
