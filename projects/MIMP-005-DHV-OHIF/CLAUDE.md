# CLAUDE.md — ohif-fork (DH Solutions)

This repo is **DH Solutions' fork of [OHIF/Viewers](https://github.com/OHIF/Viewers)**, pinned to upstream `v3.12.0`. It builds the custom `pacs-ohif-dhs:vN` Docker image that runs the DICOM viewer at `pacs.dhsolutions.com.bd/viewer`.

The viewer is the standalone OHIF v3 React SPA — **not** Orthanc's Stone Web Viewer. Orthanc only exposes the DICOMweb API; this app is what patients actually see.

## Working branch

- Default working branch: `dhs-main` (off upstream `v3.12.0` tag).
- `master` tracks OHIF upstream; do **not** commit DHS changes there.
- Upstream is pulled into a dedicated branch every 3–6 months; conflicts are resolved only in branded files.

## Repo role in the bigger picture

Seven repos make up the DH PACS platform. Know which one you're in:

| Repo | Audience | What it owns |
|---|---|---|
| **`ohif-viewer-dhs`** (this repo) | **Patients + hospital doctors** | The OHIF SPA source. Ships two deployments from one image (`pacs-ohif-dhs:vN`, see ADR-0001): the Patient Viewer (`/viewer` — brand assets, mobile UX, film view, share, report view) and the Doctor Viewer (`/viewer-doctor` — Oncology PET-CT mode, `tmtv`/`longitudinal`). |
| **`dh-pacs-central`** (PACS repo, on the VM under `/srv/pacs/`) | Ops/Infra | The hub: `docker-compose.yml`, `app-config.js` (mounted at runtime), nginx config, backend API, DB schema, Orthanc configuration, doctor/patient/admin UI shells. |
| **`dh-pacs-doctor`** | **Hospital doctors** | The doctor-facing *portal* SPA — login, patient list, launches this fork's Doctor Viewer mode. A launcher, not a viewer; doesn't render DICOM itself. |
| **`dh-pacs-workstation`** (local only, no GitHub remote — distributed as installers) | Ops/Infra | The on-prem site installer: branded Orthanc receiver + MT operator portal. |
| **`dh-pacs-website`** | Public/marketing | The public marketing site, mirrored at `pacs.dhsolutions.com.bd` via nginx → Cloudflare Workers. |
| **`ohif-extension-dhs-cardiac`** _(in development, local only)_ | **Hospital doctors (cardiologists)** | Cardiac LVA tooling (ejection fraction, chamber volumes) — bundled into this repo's `pacs-ohif-dhs` image as a further Doctor Viewer instance, surfaced at `/viewer-cardiac`. |
| **`ohif-extension-dhs-liver`** _(in development, local only)_ | **Hospital doctors (radiologists)** | Liver & lesion volumetry (LLV) tooling — bundled into this repo's `pacs-ohif-dhs` image as an opt-in panel inside the existing `longitudinal` mode. |

`ohif-extension-dhs-patient` (the originally planned Tier 4 package for patient-info/share/report panels) was **superseded** — those features shipped as direct Tier 3 fork edits instead (see Film View, Report, Share features below). Not pursued as a separate package.

**Rule (updated per ADR-0001, supersedes the 2026-06-14 "patient viewer only" rule):** This repo now ships two deployments from the same image — Patient Viewer and Doctor Viewer (Oncology PET-CT) — as config/mode differences on one fork, not separate repos. Dedicated *interactive* doctor tooling (drag-and-drop film builder, advanced measurements, DICOM print) still belongs in `dh-pacs-doctor` or a future doctor-specific build, not here. Before adding a feature here, ask: *"is this a mode/config difference on the existing fork, or does it need new interactive tooling that belongs in a dedicated doctor build?"*

If a customization can live in `dh-pacs-central`'s `app-config.js`, **prefer that over editing this fork.** Source edits here cost merge effort at every upstream pull.

## Customization tier discipline

OHIF supports five tiers of customization (see [Docs/OHIF_CUSTOMIZATION_PLAN.md](Docs/OHIF_CUSTOMIZATION_PLAN.md) §3). DHS is committed to **Tier 3 (fork) + Tier 4 (custom extension)**.

The layering rule, in order of preference:

1. **Tier 1 — `app-config.js` keys** in the PACS repo. Reach for this first. `whiteLabeling`, `hotkeys`, `extensions[]`, `investigationalUseDialog`, etc.
2. **Tier 3 — source edits in this fork**, only when Tier 1 can't do it (layout, toolbar contents, brand palette wiring).
3. **Tier 4 — extension package** for *new* features (panels, toolbar buttons, modes). Never embed new features directly into `extensions/default` — they belong in a separate extension repo.

If you find yourself reaching for nginx `sub_filter` CSS injection (Tier 2), stop — we already own the fork, so a proper source edit is cleaner.

## Status — what's already shipped

- **`pacs-ohif-dhs:v1`** is live in production:
  - DHS logo via `whiteLabeling.createLogoComponentFn` in PACS-repo `app-config.js`, pointing at [platform/app/public/assets/dhs-logo.svg](platform/app/public/assets/dhs-logo.svg)
  - SVG favicon at [platform/app/public/assets/dhs-favicon.svg](platform/app/public/assets/dhs-favicon.svg)
  - Page title + meta in [platform/app/public/html-templates/index.html](platform/app/public/html-templates/index.html)
- Single source commit on `dhs-main`: `48f99e181` "feat(branding): DH Solutions branding v1 placeholder".
- Phase A is **done**. Phase B is **done** (see below). Phase C (`ohif-extension-dhs-patient` custom extension) was **superseded** — its planned scope (patient info/share/report panels) shipped as direct fork edits instead; see Report and Share features below.
- **Film View** shipped `51dbb1ec8`: `FilmViewDH` toolbar button (2×2 grid, first 4 series one per cell, mobile+desktop visible). See `extensions/cornerstone/src/hps/filmViewDH.ts`.

**Phase B — mobile UX — COMPLETE (2026-06-02)**
All changes are guarded by `isMobileViewport` (`window.innerWidth < 768`) or `md:` Tailwind breakpoints. Desktop layout is untouched.
- Left/right panels hidden entirely on mobile (`!isMobileViewport` guard in `ViewerLayout/index.tsx`)
- Left panel auto-collapses on resize below 768px (`ResizablePanelsHook.tsx`)
- Toolbar trimmed to 4 buttons: WindowLevel, Zoom, Pan, MoreTools (`mobileHidden: true` on others in `toolbarButtons.ts`; filter in `Toolbar.tsx`)
- Touch targets enlarged to 44px (`touch` size added to `ToolButton.tsx`)
- Viewport overlay row suppressed on mobile (`MOBILE_SUPPRESSED_SECTIONS` in `Toolbar.tsx`)
- Header: UndoRedo, PatientInfo, gear, Secondary toolbar hidden (`hidden md:*` in `Header.tsx`)
- `MobileThumbnailStrip.tsx` (new): 160px horizontal scrollable strip below the DICOM image; image-only cards (112×144px, ~3 visible); tapping loads series into viewport; async thumbnail loading via cornerstone
- nginx fix: `/viewer` served with `Cache-Control: no-store` to prevent blank-screen after builds (`deploy/config/nginx/nginx.conf`)

## Where to look first

| You want to… | File |
|---|---|
| Understand the overall customization plan | [Docs/OHIF_CUSTOMIZATION_PLAN.md](Docs/OHIF_CUSTOMIZATION_PLAN.md) (design doc; some file paths are slightly off — trust ImplementationSteps.md for current paths) |
| Know what to do **next** | [Docs/ImplementationSteps.md](Docs/ImplementationSteps.md) — post-Phase-A playbook with Track A/B/C/D |
| Track brand-asset placeholders vs. final | [BRAND_TODO.md](BRAND_TODO.md) |
| Build the Docker image | [Dockerfile](Dockerfile) — `docker compose build ohif` from the PACS repo also works |

## Architectural nuance to remember

- **`platform/ui-next/` is the modern component library** in v3.12 (Header, SidePanel, NavBar, Toolbar). The older `platform/ui/` still exists but most UI work in v3.12 happens in `ui-next`. The design doc occasionally points at `platform/ui/...` — **verify with `Glob`/`Grep` before editing**, the actual file usually lives in `ui-next`.
- **Tailwind tokens chain through presets**: `platform/app/tailwind.config.js` presets `[ui, ui-next]`. Brand-palette overrides should target CSS custom properties (`--primary`, `--secondary`, etc.) defined in `platform/ui-next/src/`, **not** the flat `colors` block in the `ui` preset. The latter is brittle.
- **Toolbar buttons can register from multiple extensions**: `extensions/default` is the main one, but `measurement-tracking` and `cornerstone-dicom-sr` also register tools. If a tool persists after editing `getToolbarModule.tsx`, check those.
- **`app-config.js` is mounted `:rw`** in the PACS-repo docker-compose — the container's entrypoint gzips it in place. Don't mount it read-only.

## Toolbar + Hanging Protocol system (v3.12)

Adding a layout protocol or toolbar button requires **4 touch points** — missing any one causes a silent failure:

1. **Protocol file** — `extensions/cornerstone/src/hps/<name>.ts`. Set `isPreset: false` to keep it out of the Advanced dropdown; `isPreset: true` to include it. Use unique `viewportId` strings per viewport.
2. **Protocol registration** — `extensions/cornerstone/src/getHangingProtocolModule.ts`. Import and add `{ name: proto.id, protocol: proto }`.
3. **Button definition** — `modes/basic/src/toolbarButtons.ts` (and `modes/segmentation/src/toolbarButtons.ts`). Use `uiType: 'ohif.toolButton'`, `commands: { commandName: 'setHangingProtocol', commandOptions: { protocolId: '...' } }`. **This alone does NOT show the button.**
4. **Toolbar section** — `modes/basic/src/index.tsx` `toolbarSections.primary` array (and same in `modes/segmentation/src/index.tsx`). The button ID must appear here at the desired position or it is invisible.

**The isPreset trap:** `extensions/cornerstone/src/customizations/layoutSelectorCustomization.ts` dynamically reads all protocols with `isPreset: true` and auto-populates the Advanced dropdown. Setting `isPreset: true` on a new protocol makes it appear there automatically — set `isPreset: false` for toolbar-only protocols.

**DHS custom protocols added:**
- `mprdh` — `extensions/cornerstone/src/hps/mprdh.ts` — 1×3 MPR clone, toolbar-only (`isPreset: false`), button id `MPRDHLayout`

Full step-by-step recipe with icon table and file checklist: see memory `reference_toolbar_and_hanging_protocol`.

## Build commands

```bash
# Dev (from repo root)
yarn install --frozen-lockfile
yarn dev                # webpack dev server
yarn dev:fast           # experimental rsbuild dev (faster)

# Production build (what Docker does)
yarn build              # output → platform/app/dist

# Docker (from PACS repo, on the VM)
cd /srv/pacs/compose && docker compose build ohif && docker compose up -d ohif
```

Node 18+, Yarn 1.20+. The Dockerfile uses `bun` for installs internally — don't replicate that locally unless you want to.

## Conventions

- **Tag the image, don't use `latest`.** Each shipped build gets a real tag (`v1`, `v1.1`, `v2`…); the PACS-repo `docker-compose.yml` references the tag.
- **All brand tokens live in one file.** Never sprinkle hex codes across components. Tailwind config + CSS custom properties only.
- **One DHS commit per logical change**, on `dhs-main`. Don't squash multiple goals into one commit — it makes upstream merges much harder.
- **Don't add planning/decision docs to the repo unless asked.** Customer-facing docs go in `Docs/`. Working notes belong in conversation/memory, not committed.
- **Never commit `node_modules/`, `dist/`, or any built artifacts.**

## Open questions (block specific work)

These are flagged in [Docs/OHIF_CUSTOMIZATION_PLAN.md](Docs/OHIF_CUSTOMIZATION_PLAN.md) §9 and [Docs/ImplementationSteps.md](Docs/ImplementationSteps.md) §7. They block Phase C work:

- **Report source of truth** — RIS? DICOM SR in Orthanc? PDF attachments? Blocks the report panel.
- **Share-link audit policy** — should `/api/links/resolve` log shares to `app.audit_log`?
- **Patient info exposure** — which demographics beyond MRN/name/DOB are safe in-browser?
- **i18n scope** — English only, or Bangla/English toggle?
- **Offline / poor-network caching** — aggressive first-series cache for slow mobile?

## Things not to do

- Don't bypass the fork discipline by editing OHIF source for *new features* — that's Tier 4 (extension) territory. Source edits are for *changing existing UI*.
- Don't commit to `master` — that's upstream-tracking only.
- Don't pin to floating tags in docker-compose (`latest`, `alpine`) — use digests or versioned tags.
- Don't skip hooks (`--no-verify`) on commits or bypass signing without an explicit reason.
