---
name: oem-substitution-lead-fujifilm
description: "The live Fujifilm/Synapse 3D substitution deal, and the two argument errors it exposed — reusing a false \"access\" claim, and asserting a structural difference without checking our own side"
metadata: 
  node_type: memory
  type: project
  originSessionId: 75d796bb-7097-4686-a174-276c63f0aefd
  modified: 2026-08-15T10:05:51.836Z
---

Opened **2026-08-15**. A **Fujifilm distributor** in Bangladesh sold an MRI to a **private
diagnostic centre** whose post-processing requirement **names Synapse 3D**. DH is pitching the
Advanced DICOM Image Viewer into that line item. Everything lives in
`Inobitec/Client_Facing_Docs/Synapse_3D_Fujifilm/`.

**The shape that drives every decision:** DH sells to the *distributor*, the distributor hands
the document to *their* customer's radiologist, and DH is never in the room. The carrier
represents the competitor — so the brochure names **neither** Fujifilm **nor** the software
vendor. DH Solutions *is* named and branded; what stays hidden is the vendor and the reseller
arrangement, not DH.

**Two argument errors caught in this session — both generalise:**

1. **An existing, proven argument was false, not merely weak.** The vascular Brochure's whole
   spine — *"the problem is not capability, it is access"* — dies against Fujifilm's own
   architecture page (*"web-based and enterprise capable"*, *"true, full-featured thin client
   capability"*, *"all the applications you need are available on any workstation running
   SYNAPSE"*). Tempting to reuse because it's polished and adjacent. **Check the competitor's
   architecture before recycling a positioning line.**
2. **The replacement axis was nearly false too, in our own favour.** "Everything included, no
   module list" — except **Inobitec Pro is modular too** (PET/CT, Extended Segmentation, Vessel
   Analysis, Coronary, Cardiac, DTI, Perfusion, Image Annotation are separate purchases, on the
   vendor's public site). The competitor was researched carefully and our own product was
   assumed. **Verify the structure on both sides before arguing from a structural difference.**

**What actually wins:** the **relevance filter**. Fujifilm publishes **51 applications**;
roughly **20** are live at a single-MRI diagnostic centre with no cardiology, surgical planning,
PET or radiotherapy. We cover nearly all 20. Never quote a count — an argument that tries to
match the catalogue loses; one built on the daily workload wins. Final axis: *everything used
daily is in the base · no server · prove it on your own studies.*

**The offer is a delivered system, not a licence** (changed later the same day, and it rewrote
the second axis). The centre's reporting PCs are basic, so **DH supplies a 12 GB VRAM
workstation** and maintains hardware + software + configuration as one system. Deployment is
**hybrid** - that one machine does segmentation/3D/perfusion/DTI, the software also sits on
ordinary desks for 2D/MPR/ADC/measurement, which the vendor's own minimum spec ("video card
without hardware acceleration") explicitly supports. The trial no longer installs anything at
their site: **send a study** and DH returns the result, or **book a session** on DH's machine.
Bureau route is **pre-sale only** - offering it ongoing would compete with the workstation sale.

**The lesson worth keeping:** three claims had to be deleted, and the painful one was *"the full
vascular workup ran entirely in software rendering."* It was true, evidenced, and a genuine
strength - and it became a liability the instant DH started selling a GPU, because the reader
asks *"so why am I buying your box?"* **A true, well-evidenced claim can become the wrong claim
without ceasing to be true.** Also retired: "on the desks you already own", "graphics
acceleration not required where absent". Replacement axis is **turnkey against components** -
Fujifilm sells a licence and you assemble a server platform; DH hands over a working system and
owns it. "No server" survives, demoted to a supporting clause.

**Offer:** Pro base + Perfusion + Vessel Analysis + Extended Segmentation + **DTI** (user
reaffirmed DTI after being shown it breaks the standing *"excluding DTI"* rule — Fujifilm ships
Craniotomy/Tensor Analysis, so it's a match point). Every brochure claim is mapped to its
module, so a shrunken configuration is a mechanical edit.

**Figure sourcing was lifted the same day, and it was the real constraint.** v1 came out
text-heavy purely because only two self-recorded MR studies existed. Any Inobitec source is now
allowed — **the vendor's official manual and published marketing videos**, which ADR-0007 never
evaluated (it only weighed the storyboard frames). They are English, PHI-free and high-res.
Three non-obvious rules now in `tools/build_figures.py`: **English UI only** (the best breast/
prostate frames are in a *Russian* interface — unusable for Dhaka), **re-extract at 1920×1080
from `D:\Inobitec_Video_Repo\`** rather than using the 1024×576 derivatives, and **the product
name hides in webcams, watermarks and caption banners**, not just the title bar. White-label
still binds; branding is a crop, not a ban.

**Still open / still carried:** vendor **permission** for marketing re-use (belongs to the
Vendor Channel) · **PC-MRI flow analysis has never been run** and must not be demoed ·
own-recorded breast DCE and prostate frames would still beat borrowed ones (~750 of the 1,760
IBN Sina studies contain MR).

Related: [[customer-facing-sales-docs]] · [[sales-enablement-answer-bank]] ·
[[inobitec-capability-catalog]]
