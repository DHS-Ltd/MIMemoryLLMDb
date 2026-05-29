# CLAUDE.md — ohif-fork (DH Solutions)

This repo is **DH Solutions' fork of [OHIF/Viewers](https://github.com/OHIF/Viewers)**, pinned to upstream `v3.12.0`. It builds the custom `pacs-ohif-dhs:vN` Docker image that runs the DICOM viewer at `pacs.dhsolutions.com.bd/viewer`.

The viewer is the standalone OHIF v3 React SPA — **not** Orthanc's Stone Web Viewer. Orthanc only exposes the DICOMweb API; this app is what patients actually see.

## Working branch

- Default working branch: `dhs-main` (off upstream `v3.12.0` tag).
- `master` tracks OHIF upstream; do **not** commit DHS changes there.
- Upstream is pulled into a dedicated branch every 3–6 months; conflicts are resolved only in branded files.

## Repo role in the bigger picture

Three repos work together for the DHS viewer. Know which one you're in:

| Repo | What it owns |
|---|---|
| **`ohif-fork`** (this repo) | The OHIF SPA source. Brand assets, layout patches, toolbar trims, mobile UX, custom extensions wired into the bundle. Produces `pacs-ohif-dhs:vN`. |
| **PACS repo** (separate, on the VM under `/srv/pacs/`) | `docker-compose.yml`, `app-config.js` (mounted at runtime), nginx config, the token landing page (`viewer.html`), the backend, Orthanc configuration. |
| **`ohif-extension-dhs-patient`** (not created yet — Phase C) | The custom extension package (`@dhsolutions/extension-patient`) registering patient-info, share, and report panels. Added to this fork via `yarn add` before building the image. |

If a customization can live in the PACS repo's `app-config.js`, **prefer that over editing this fork.** Source edits here cost merge effort at every upstream pull.

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
- Phase A is **done**. Phase B (mobile UX) and Phase C (custom extension) have not started.

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
