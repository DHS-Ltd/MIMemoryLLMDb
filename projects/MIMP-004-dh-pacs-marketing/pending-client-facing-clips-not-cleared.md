---
name: pending-client-facing-clips-not-cleared
description: "Inobitec Client_Facing_Clips were cut for one Aug 2026 deal with patient masking off; six carry real Ibn Sina footage, five are Inobitec's; not cleared for any other prospect"
metadata:
  node_type: memory
  type: project
  originSessionId: 2ae72ff9-5df8-41da-8f61-8b8fdac7377f
  modified: 2026-11-06T17:45:18.480Z
---

`E:\DH-Advanced-Viewer\Inobitec\Client_Facing_Clips\` is not cleared for general customer use, despite its name and despite the shared memory's `org/programs/adpp-campaign.md` saying so. Six clips (1, 2, 3, 5, 6, 9) are own recordings of real Ibn Sina patients, cut with `PHI_ACTIONS = DISABLED` (set by the user 2026-08-02, for that one deal). Five (4, 7, 8, 10, 12) are Inobitec footage with its title bar, usable only with a customer who already knows the vendor.

**Why:** found 2026-11-06 when the first Campaign (DHV workstation) was asked to showcase post-processing work. Sending these to another hospital would ship patient identifiers.

**How to apply:** before any clip leaves DH, re-cut it with masking on (`Sales_Enablement/Clip_Specs/README.md` holds the switch; each spec's §2 holds the measured rectangles), remove the "IBN SINA HOSPITAL" overlay, and do not view unmasked frames in cloud tools. See [[pending-cleanup-dav-unredacted-figures]], [[project-first-campaign]].
