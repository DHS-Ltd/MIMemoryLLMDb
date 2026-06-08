# DH PACS Workstation — CLAUDE.md

On-prem **Windows** software pairing a hospital site with **DH PACS Central**. Two installers are
built from this repo (outputs → `dist\`, gitignored). Companion repo: `dh-pacs-central` at
`D:\Pacs_Viewer_Storage_Project`.

## Components

| Dir | Component | What it is |
|---|---|---|
| `orthanc/` | **A — Orthanc Receiver** | Branded [Orthanc](https://orthanc-server.com/) DICOM server. Modalities C-STORE to `localhost:4242`; forwards stable studies to central (`PACS_CENTRAL` @ `100.118.47.99:4242`) over Tailscale. NSSM service `DH-PACS-Orthanc`; web console `:8042`. Installer `orthanc/installer/dh-pacs-orthanc.iss`. |
| `portal/` | **B — MT Portal** | Vite+React+TS SPA + Express server bound to `127.0.0.1:3001`. Safety-gated claim flow (7 layers): MT matches each study to a patient via the central API. NSSM service `DH-PACS-Portal`. Installer `portal/installer/dh-pacs-portal.iss`. **Needs central P1.5 deployed + Node 20 on the box.** |

## Build (needs Inno Setup 6 `iscc`, Node 20; Component A also needs network for fetch)

```powershell
# Component A
cd orthanc; .\tools\fetch-orthanc.ps1; cd installer; iscc dh-pacs-orthanc.iss
# Component B
cd portal; npm install; npm test; npm run build; cd installer; iscc dh-pacs-portal.iss
# Both (elevated, from repo root)
.\build-all.ps1
```

## Tests

- Portal safety: `cd portal && npm test` (vitest — `nameTokenize`).
- Central safety logic: `cd D:\Pacs_Viewer_Storage_Project\deploy\backend && npm test` (node — `safetyChecks`).

## Conventions & gotchas

- **`.ps1` files: ASCII-only.** Non-ASCII without a BOM breaks Windows PowerShell 5.1 string parsing.
- **Orthanc on Windows is an Osimis *Inno Setup* installer** (year-versioned, pinned `26.6.0`), **not** a zip — `fetch-orthanc.ps1` uses **innoextract** (auto-fetched) and excludes the 316 MB `Plugins\` folder. See `orthanc/BUILD-NOTES.md`.
- **Safety source of truth is the server** (`dh-pacs-central` `src/lib/safetyChecks.js`); the portal re-renders the same comparison. Keep `portal/src/lib/nameTokenize.ts` honorifics in sync with it.
- Claim states use **`'linked'`** (claimed), `'pending'`, `'under_review'` — `claim_status` is a plain VARCHAR (no enum).
- Both components share **major/minor** versions; bump together on a central-contract change.

## Central contracts (build manual §11 — don't drift unilaterally)

Central AET `PACS_CENTRAL` · central IP `100.118.47.99` · site AET `^SITE\d+_(ORTHANC|DHPACS)$` (new sites `SITE<NNN>_DHPACS`, legacy `SITE<NN>_ORTHANC`) ·
claim body `{ patientId, typed_mobile, acknowledged_mismatches[] }` · safety-check returns
`{ can_claim, hard_blocks, soft_blocks, requires_typed_mobile, comparison }`.

## Docs

`docs/DH_PACS_WORKSTATION_BUILD_MANUAL.md` (blueprint) · `docs/WRONG_PATIENT_MATCH_SAFETY_DESIGN.md`
(gating) · `docs/SITE_SAFETY_ACCEPTANCE_TEST_GUIDE.md` (§10 acceptance suite — operator-runnable
from an installed site with a real `.dcm`) · `docs/P3_DH_PACS_Workstation.md` (Component B spec) ·
`docs/COMPONENT_A_BUILD_AND_TEST_GUIDE.md` (do-it-yourself build + VM test) · `orthanc/BUILD-NOTES.md`.

## Status (2026-06-04)

Both installers build; central safety extension complete on branch `feat/safety-mt-gated`
(not yet deployed/merged). Remaining = deploy + clean-VM + E2E tests + code-signing (see the
build manual and the central migration in `D:\Pacs_Viewer_Storage_Project\deploy\config\postgres\migrations\`).

## Agent skills

### Issue tracker

Issues and PRDs live as local markdown under `.scratch/<feature>/` (no git remote). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` at root -> per-component `CONTEXT.md` (e.g. `orthanc/`, `portal/`). See `docs/agents/domain.md`.
