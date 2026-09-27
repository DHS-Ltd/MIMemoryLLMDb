---
name: no-building-during-design
description: "Standing instruction — in a design or grilling session, build nothing (no VMs, disks, keys, installs); \"approve\" means approve the design, not provision it"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 8a85a7e9-a5c7-405e-b0bd-56a60e3e5626
  modified: 2026-09-27T13:11:35.815Z
---

**Given 2026-09-27, mid-grilling on the dental CBCT project:** "Don't build anything. Whatever things have been built, please undo this." I had asked "do you approve this VM spec so I can provision it now?". The user answered "Approve this VM now", and I started provisioning `DentalVM` on the production Hyper-V host `WIN-2G5V0O0AEBU` (the host that runs `PacsVM`, Shared Central). The user stopped it partway, and everything was rolled back.

**Why:** a design session is for deciding. Provisioning on the host that runs production Central is a separate step the user wants to take deliberately, not something that follows from a design approval.

**How to apply:** while grilling or designing, record decisions only (ADRs, CONTEXT.md, specs). Never create VMs, disks, keys, services or installs, even when the user "approves" a spec. When the design is done, say that it's ready to build, and wait for an explicit instruction to start building. Related: [[working_style]], [[dental_cbct_project]].
