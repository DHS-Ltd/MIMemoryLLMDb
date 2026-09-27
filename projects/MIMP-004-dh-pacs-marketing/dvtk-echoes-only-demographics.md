---
name: dvtk-echoes-only-demographics
description: "DVTk Modality Emulator copies ONLY PatientName/ID/Sex from the selected MWL row into a C-STORE; accession, age and RequestAttributesSequence are its own built-ins"
metadata:
  type: reference
---

Measured 2026-09-16 against the Machine A archive, by reading a stored study — no GUI needed.

A **worklist-driven** DVTk Modality Emulator store carries, from the row the operator picked:

- `00100010` PatientName ✔ · `00100020` PatientID ✔ · `00100040` PatientSex ✔
- **and nothing else.**

Everything identifying the *order* is DVTk's own hardcoded built-in, not the row's:

| tag | what DVTk sends |
|---|---|
| `00080050` AccessionNumber | `CD2170001` |
| `00081030` StudyDescription | the literal string `StudyDescription` |
| `00101010` PatientAge | absent |
| `00400275` RequestAttributesSequence | `MR-BRAIN-P` / `BL-1001` |

`0040,0275` is precisely where a real console echoes the request back, which is why this is easy to
assume and wrong. **A real modality returns the accession — that is the entire point of MWL.** DVTk
is a test tool, so it merges demographics onto its own sample headers.

**What it breaks:** any reconciliation keyed on accession. Falling back to `patient_id` is *not* a
safe substitute when one patient legitimately holds several worklist rows — the join then marks
every one of that patient's rows as scanned. That killed the demo's Status column outright.

**How to check it in two minutes on any rig:** release an order, query MWL in DVTk, select the row,
Store Image, then
`curl -s "http://localhost:8080/dcm4chee-arc/aets/DCM4CHEE/rs/studies?includefield=all"`.

Related: [[project-demo-rig-machines]]
