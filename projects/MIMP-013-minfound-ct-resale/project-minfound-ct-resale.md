---
name: project-minfound-ct-resale
description: "Facts and agreed positions for the MinFound ScintCare Blue 755 resale report (Shaheen General Hospital, Raipura)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9e5968f4-c94f-4987-86ba-15ef207ec8f2
  modified: 2026-07-27T17:18:01.390Z
---

Resale of a MinFound ScintCare Blue 755 CT, S/N MIN01000628, built 2024, installed at
Shaheen General Hospital, Raipura — installation completed 10 Jan 2025, clinical operation
from 13 Jan 2025. Being sold on because of a business-contract situation; the buying
audience already knows that background.

Facts established with the user (not derivable from the repo files):

- **Slices**: 16 physical detector rows producing **32 slices/rotation via dual sampling**.
  The OEM config table's "16 slices/360°" is superseded by this; never write "32-row".
- **Tube**: the fitted Varex GS-30722 (H32929, built April 2021) replaced the delivered
  Jan-2024 tube (H39232) on **OEM recommendation** before go-live — the old tube was fine in
  most exposures but faulty at certain settings. It is in the user's warehouse for return to
  the OEM and is **not** part of the sale.
- **Usage as of 1 July 2026**: 5,302 exposure seconds, 130 patient examinations, zero
  unscheduled service events, no parts replaced other than that tube.
- **Warranty offered**: 12 months from installation at the buyer's site, backed by MinFound,
  all parts and labour **including the tube** — more generous than the OEM's original
  tube-excluded 2-year terms, so written OEM confirmation should exist.
- **Scope**: seller does de-installation, transport, re-installation and commissioning.
  Included: DICOM/film printer, 80 kVA 3-phase UPS, full OEM accessory kit. Buyer's scope:
  injector, PACS workstation, room AC, shielding/civil works, BAEC licence transfer.
- **BAEC licence** is live under the hospital and transferable; transfer is buyer's scope.
- **No price in the report** by decision. Note: the OEM config `.doc` ends with
  "End User Price: 1750000USD", almost certainly a typo for 175,000 — that file must not go
  to a buyer unedited.
- Report stays **silent on ownership/title**, by the user's decision.

**Status: report delivered and considered finished (as of this session).** Deliverables in
the repo root: `MinFound_ScintCare_Blue755_Specification_and_Condition_Report.md` (source),
`.html` (print-ready, images embedded as base64), `.pdf` (verified 2-page render). Page 1 =
commercial case (stat strip, 3 photos, condition, tube history, scope of supply). Page 2 =
technical spec, licensed software, warranty/regulatory, signature.

Photo selection went through two rounds — final set on page 1 is: gantry front view
(IMG_8772), aperture/laser positioning view (IMG_8795), and a control-room shot (IMG_8787,
re-cropped and brightened) showing the console with a reconstructed study, the scanner
through the leaded window, and the operator from behind. Excluded: IMG_8785 (identifiable
patient face — privacy), the Nov-2024 installation shots (bystanders needing consent, and
later dropped in favour of the clinical-use shot which reads stronger anyway).

Open items not yet closed by the user: designation and contact placeholders in the
signature block still blank; written OEM confirmation that the 12-month warranty covers the
tube has not been produced (report states tube-inclusive cover on the user's instruction —
flag this to the user again if they ask for anything that implies it's been verified with
MinFound in writing).

Terminology and framing decisions live in the repo's [[CONTEXT.md]].
