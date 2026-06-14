---
name: project-film-view-feature
description: "Film View 2x2 toolbar button shipped 2026-06-14; patient-viewer lightbox mode, first 4 series one per cell, mobile+desktop visible"
metadata: 
  node_type: memory
  type: project
  originSessionId: 08e49322-1c59-47b8-aa96-6bdc17be3bab
---

Film View feature shipped on `dhs-main` as commit `51dbb1ec8` (2026-06-14).

**What it does:** Toolbar button (`FilmViewDH`) that activates a 2×2 grid hanging protocol showing the first 4 series of the study one per cell. Cells beyond available series remain empty (`allowUnmatchedView: true`). Classic lightbox aesthetic — OHIF's black viewport background, no extra chrome needed.

**4 files (MPRDHLayout pattern):**
- `extensions/cornerstone/src/hps/filmViewDH.ts` — protocol (`id: 'filmViewDH'`, `isPreset: false`, 4 displaySetSelectors `ds0`–`ds3` with no matching rules)
- `extensions/cornerstone/src/getHangingProtocolModule.ts` — registered
- `modes/basic/src/toolbarButtons.ts` — button id `FilmViewDH`, icon `layout-common-2x2`, no `mobileHidden`
- `modes/basic/src/index.tsx` — inserted in `toolbarSections.primary` between `MPRDHLayout` and `Crosshairs`

**Key design decisions:**
- Visible on both mobile and desktop (`mobileHidden` not set, defaults false)
- `isPreset: false` — toolbar-only, does not appear in Advanced dropdown
- Icon: `layout-common-2x2` (pre-existing in OHIF icon set)
- Cell content: different series per cell (not frames of one series like `frameView`)
- `viewportType: 'stack'`, `toolGroupId: 'default'`

**Scope boundary:** This is the patient-viewer lightbox (Option A). The full interactive film layout builder with drag-and-drop cell assignment (Option B) belongs in `dh-pacs-doctor` (planned, not yet created). See [[project-multi-repo-architecture]].

**Why:** Patients wanted to see all their scan series at once in a familiar "film" layout. Doctors get a fuller builder in their dedicated workstation repo.
