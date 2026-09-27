# CLAUDE.md

**dh-pacs-worklist** — the DH Worklist product: turns an Ibn Sina HIS bill into a worklist entry a modality can pull over DMWL, and mints the patient identity Ibn Sina's HIS does not have.

**Status (2026-09-07): Stage 1 demo is fully designed and parameterised. Phase 0 (off-site build) is done and verified off-site** — the CSV Feeder, identity matcher, worklist plugin, and DCMTK test kit are built and passed a real `findscu` round-trip against a throwaway Orthanc. Phase 1 onward needs the actual box. Read the design before writing code — do not re-derive it, and do not re-run the machine survey.

---

## Start here — the Stage 1 demo

Read in this order:

0. **[docs/demobuilder/ARC_WORKLIST_CUTOVER_RUNBOOK.md](docs/demobuilder/ARC_WORKLIST_CUTOVER_RUNBOOK.md)** — **the current working document (2026-09-13).** The execution ladder: get one row onto the GE console's worklist screen and nothing else. Scope is **worklist only — the receiving role is deferred by decision.** Steps 0–7, each with an owner and a proof. Start here.
0b. **[docs/demobuilder/DCM4CHEE_GE_CONNECTIVITY_PLAN.md](docs/demobuilder/DCM4CHEE_GE_CONNECTIVITY_PLAN.md)** — the strategy behind it, and the record of what was measured off the wire on 2026-09-13: the console's AE titles and transfer syntaxes. Still authoritative on **facts**; the runbook wins on **scope and sequence**. Supersedes the worklist half of `SETUP_PLAN.md`.
1. **[docs/demobuilder/SETUP_PLAN.md](docs/demobuilder/SETUP_PLAN.md)** — the original runbook. Five phases, fixed parameters, demo-day run sheet, risk register. Still authoritative for everything except the worklist SCP itself.
2. **[docs/demobuilder/SITE007_PROFILE.md](docs/demobuilder/SITE007_PROFILE.md)** — what is actually on the Ibn Sina box, measured. Ports, services, credentials location, their real DICOM data, and the probe gotchas.
3. **[docs/demobuilder/DMWL_TAG_MAP.md](docs/demobuilder/DMWL_TAG_MAP.md)** — the signed-off tag mapping the worklist returns.
4. **[docs/demobuilder/HIS_VIEW_CONTRACT.md](docs/demobuilder/HIS_VIEW_CONTRACT.md)** — customer-facing; the twelve columns DH asks Ibn Sina's DBA for.
5. **[CONTEXT.md](CONTEXT.md)** and **[docs/adr/](docs/adr/)** — this repo's own vocabulary and decisions.

Scaffolding already in place: [demo/his_feed.sample.csv](demo/his_feed.sample.csv) (the twelve columns with realistic rows, including one cross-centre and one cancelled) and [demo/worklist-item.dump.template](demo/worklist-item.dump.template) (the `dump2dcm` template encoding the tag map).

### The build, in one line

**One DH-written component**: a Node script that reads a CSV, mints DH Patient Identities, and writes `.wl` files. Everything else is configuration of software already installed on that machine.

### What is still open

- ~~**The GE SIGNA Hero's calling AE title.**~~ — **RESOLVED 2026-09-09: `GEHC`**, read directly off the GE console's own DICOM/network screen. Still worth watching at Phase 2.4's first live query in case the console uses a different value when *calling out* than when addressed as `GEHC` by others.
- **`sex` in the invoice** (BUILD_PLAN C12) — the CSV carries the column either way.
- **Whether Ibn Sina's reporting portal / Sante actually searches `OtherPatientIDs`** — [ADR 0002](docs/adr/0002-the-his-number-is-sent-twice-accession-and-other-patient-ids.md) rests on it. A go-live blocker, not a demo blocker.
- **`nextDhpId` caps at 99 identities/day** (`dh-pacs-central` `deploy/backend/src/lib/idGenerators.js`). Fine for the demo; a Stage 2 blocker, since the chain issues thousands of invoices a day.
- The box's **Public and Private Windows Firewall profiles are disabled** on a hospital LAN. Convenient for the demo; fix it before their IT finds it.

Raw probe transcripts are in [docs/demobuilder/probes/](docs/demobuilder/probes/), named and indexed. Everything worth keeping is distilled into [SITE007_PROFILE.md](docs/demobuilder/SITE007_PROFILE.md) — read that, not the transcripts.

---

## Where documents go — read before creating any file

**Every document is filed on creation, with a name that says what it contains.** No file is left at the repo root and no file keeps a session scratch name. The full rules, including what to do when a new stage starts, are in **[docs/README.md](docs/README.md)** — read it before writing a document, not after.

```
CLAUDE.md              orientation for agents (this file)
CONTEXT.md             glossary — terms only, never a spec or a decision log
demo/                  artifacts the build reads: CSV samples, templates
src/                   the Feeder and identity matcher (Node 20, CommonJS)
tools/                 off-site build scripts (fetch-worklist-plugin.ps1, fetch-dcmtk.ps1)
bin/                   staged binaries, gitignored, rebuilt by tools/
docs/README.md         the filing rules
docs/adr/              implementation decisions      NNNN-a-sentence-in-kebab-case.md
docs/demobuilder/      Stage 1 demo docs             SCREAMING_SNAKE_CASE.md
docs/demobuilder/probes/  raw transcripts            YYYY-MM-DD-NN-what-it-probed.md
docs/IbnSinaCancerPacs/   read-only mirror           never edited here
```

The four rules that get broken most often:

1. **Nothing new at the repo root.** `CLAUDE.md` and `CONTEXT.md` are the only two files that belong there.
2. **No scratch names** — not `survey.md`, `s3.md`, `notes.md`, `output.txt`. If a filename needs the session to explain it, it is the wrong filename.
3. **A raw transcript is filed *and* distilled.** It stays as evidence; the durable facts move into a normal document. A transcript is never the only home of a fact someone needs.
4. **Moving a document means fixing every relative link to it in the same change.**

A new stage gets a **new sibling folder**, not a bigger `demobuilder/` — Stage 2 (one site) becomes `docs/onesite/`. That keeps `demobuilder/` readable as a finished thing.

---

## What this repository is

Decided in [ADR 0009](docs/IbnSinaCancerPacs/adr/0009-worklist-ships-as-its-own-repository-for-clean-handover.md) (in the mirror below): the DH Worklist ships as **its own repository**, not a fork or mode of `dh-pacs-central`, because the codebase may be handed to Ibn Sina on sale and a shared repo cannot be given away without giving away every other customer's system.

This repo will contain **only**:
- the **Order Adapter** and its transports ([ADR 0006](docs/IbnSinaCancerPacs/adr/0006-order-adapter-seam-poll-a-his-owned-view.md))
- the **identity matcher** and DH Patient Identity minting ([ADR 0008](docs/IbnSinaCancerPacs/adr/0008-dh-mints-the-patient-identity-because-the-his-has-none.md))
- the **DMWL SCP** ([ADR 0007](docs/IbnSinaCancerPacs/adr/0007-worklist-is-a-pending-queue-dmwl-synthesizes-the-scheduled-date.md))
- the **Worklist Console** ([ADR 0005](docs/IbnSinaCancerPacs/adr/0005-worklist-is-a-bridge-not-a-ris.md))
- the **Procedure Catalogue**

It does **not** contain the PACS. Orthanc, the DHV viewer, and the DH PACS backend are consumed as prebuilt, versioned artifacts — never vendored source. Reused code (claim-safety machinery above all) is taken deliberately and attributed, never mirrored wholesale.

`FEDERATED_MODE` (the mesh) is `dh-pacs-central`'s concern, not this repo's. **This worklist must run with no mesh present** — that's what keeps it standalone-sellable to any hospital with modalities and a billing system, independent of the federated-cancer-chain deal.

---

## Design authority lives elsewhere — read this before assuming anything here is current

Per ADR 0009: **domain and product decisions stay in `dh-pacs-central`**; this repo only gets implementation-level decisions of its own (that is what `docs/adr/0001–0003` are).

- **Canonical source:** `D:\Pacs_Viewer_Storage_Project\docs\IbnSinaCancerPacs\`
- **Mirror in this repo:** [docs/IbnSinaCancerPacs/](docs/IbnSinaCancerPacs/) — a **read-only snapshot copied 2026-09-07**, kept for offline reading. It is **not authoritative** and is not auto-synced. If anything here looks stale or contradicts the canonical copy, the canonical copy wins. See [docs/README.md](docs/README.md).
- Start with the mirrored [README.md](docs/IbnSinaCancerPacs/README.md) → [ARCHITECTURE.md](docs/IbnSinaCancerPacs/ARCHITECTURE.md) → [CONTEXT.md](docs/IbnSinaCancerPacs/CONTEXT.md) (glossary) → [BUILD_PLAN.md](docs/IbnSinaCancerPacs/BUILD_PLAN.md) (Stage 1 demo → Stage 2 one site → Stage 3 further centers; blocking confirmations C1–C13).

**Note that [ADR 0002](docs/adr/0002-the-his-number-is-sent-twice-accession-and-other-patient-ids.md) in this repo supersedes part of central's ADR 0008** — specifically its claim that `AccessionNumber` protects Ibn Sina's existing workflow. Their `AccessionNumber` is empty in production; `PatientID` is their only searchable key.

---

## Companion projects

### dh-pacs-central — design authority + backend source
`D:\Pacs_Viewer_Storage_Project`. Design authority for all domain and product decisions. Also the source of code this repo deliberately reuses:

- `deploy/backend/src/lib/idGenerators.js` — `nextDhpId()`, the `DHP-YYMMDDNN` format (**99/day cap**)
- `deploy/backend/src/lib/safetyChecks.js` — the safety comparison the matcher builds on
- `deploy/backend/src/routes/mt-claim.js`, `admin-safety.js` — `app.claim_safety_log` / `app.safety_alerts`, the duplicate-review surface the Prefer-split rule depends on

### dh-pacs-workstation — the software already on the Ibn Sina box
`D:\dh-pacs-workstation`. Components A (Orthanc Receiver), B (MT Portal), C (DH Remote) — **escrowed, never handed to a customer** ([ADR 0010](docs/IbnSinaCancerPacs/adr/0010-escrow-the-product-hand-over-the-data.md)), which is exactly why the worklist is built here instead ([ADR 0003](docs/adr/0003-the-demo-runs-on-an-isolated-worklist-node-built-here.md)). Consume from it, don't build into it:

- `orthanc/tools/fetch-orthanc.ps1` — the pinned Osimis Orthanc **26.6.0** fetch; strips the 316 MB `Plugins\` folder, which is why the worklist plugin must be re-extracted (`OrthancWorklists.dll` in this build, not `ModalityWorklists.dll` as earlier assumed — confirmed 2026-09-07)
- `portal/src/lib/nameTokenize.ts` — name normalisation already tuned for Bangladeshi honorifics (`MRS`, `MD`); the matcher's normalisation layer, kept in sync with central's `safetyChecks.js`
- `docs/adr/0011-standalone-orthanc-no-central-pairing.md` — the standalone-Orthanc pattern the Worklist Node copies
- `orthanc/bin/nssm/nssm.exe` — already on the target box; use it to register the two new services

## Conventions

- **`.ps1` files: ASCII-only.** Non-ASCII without a BOM breaks Windows PowerShell 5.1 string parsing.
- The target box runs **Windows PowerShell 5.1** — no `&&`/`||`, no ternary, no null-coalescing.
- Node 20 is already on the box at `C:\DHPacs\Portal\bin\node\node.exe`. Reuse it; add no runtime.
