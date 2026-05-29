---
name: reference_toolbar_and_hanging_protocol
description: "Complete step-by-step guide for adding a new hanging protocol and wiring it as a standalone toolbar button in OHIF v3.12 — files, gotchas, and the isPreset trap"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 6575f78d-07bf-40a4-87d9-bd442d5cdcb8
---

# Adding a Hanging Protocol + Toolbar Button in OHIF v3.12

Learned by implementing the DHS `MPRDH` protocol (a custom MPR clone). Every step is required — skipping any one of them produces silent failures.

---

## Concept map

```
Hanging Protocol (*.ts)           → registered in getHangingProtocolModule.ts
  └─ isPreset: true               → auto-appears in Advanced dropdown (via layoutSelectorCustomization.ts)
  └─ isPreset: false              → invisible to dropdown; can only be triggered by command

Toolbar button (toolbarButtons.ts) → registered in toolbarService.register(this.toolbarButtons)
  └─ NOT in toolbarSections       → silently absent from the UI (no error, just invisible)
  └─ listed in toolbarSections    → appears in the toolbar at that position
```

---

## Step 1 — Create the protocol file

**Location:** `extensions/cornerstone/src/hps/<name>.ts`

Minimal structure (copy `mpr.ts` and change these fields):
```ts
import { Types } from '@ohif/core';
import { VOI_SYNC_GROUP, HYDRATE_SEG_SYNC_GROUP } from './mpr';  // reuse sync groups

export const mprdh: Types.HangingProtocol.Protocol = {
  id: 'mprdh',           // must be unique; used as protocolId in commands
  name: 'MPRDH',         // display name; plain string for DHS-specific names (no i18n key needed)
  locked: true,
  icon: 'layout-advanced-mpr',   // icon key from ui-next/src/components/Icons/Icons.tsx
  isPreset: false,       // TRUE → auto-appears in Advanced dropdown. FALSE → toolbar-only. 
  ...
```

**Key fields:**
- `id` — must match the `protocolId` used in the toolbar command
- `isPreset: false` — set this if you DON'T want it in the Advanced layout dropdown
- `isPreset: true` — set this if you DO want it auto-listed in the dropdown (layoutSelectorCustomization.ts reads this)
- `imageLoadStrategy` — `'nth'` for MPR-style; `'interleaveCenter'` for 3D layouts
- Each viewport needs a unique `viewportId` (e.g., `'mprdh-axial'`) to avoid collisions with the base `mpr` protocol's IDs
- `displaySetSelectors.activeDisplaySet.seriesMatchingRules` with `attribute: 'isReconstructable'` is required for volumetric (CT/MR) protocols; omit for stack-only protocols

**Available sync groups (from `mpr.ts`):**
- `VOI_SYNC_GROUP` — window/level changes propagate across viewports
- `HYDRATE_SEG_SYNC_GROUP` — segmentation overlays sync by same Frame of Reference

**Available viewport types:** `'volume'` (2D MPR slice), `'volume3d'` (3D VR render), `'stack'` (2D image stack)

**Available orientations:** `'axial'`, `'sagittal'`, `'coronal'`

---

## Step 2 — Register the protocol

**File:** `extensions/cornerstone/src/getHangingProtocolModule.ts`

```ts
import { mprdh } from './hps/mprdh';
// ...
function getHangingProtocolModule() {
  return [
    { name: mpr.id, protocol: mpr },
    { name: mprdh.id, protocol: mprdh },   // add here
    ...
  ];
}
```

Registration order determines the order in the Advanced dropdown (if `isPreset: true`). Putting it after `mpr` places it second in the list.

---

## Step 3 — Define the toolbar button

**Files:** `modes/basic/src/toolbarButtons.ts` AND `modes/segmentation/src/toolbarButtons.ts`

```ts
{
  id: 'MPRDHLayout',              // must match what you put in toolbarSections (Step 4)
  uiType: 'ohif.toolButton',      // standard clickable toolbar button
  props: {
    icon: 'layout-advanced-mpr',  // icon key; see Icons.tsx for full list
    label: 'MPRDH',               // shown below icon
    tooltip: 'Switch to MPRDH layout',
    commands: {
      commandName: 'setHangingProtocol',
      commandOptions: { protocolId: 'mprdh' },   // must match protocol id from Step 1
    },
    evaluate: 'evaluate.action',  // always-enabled; use 'evaluate.cornerstoneTool' for tools
  },
},
```

Insert it in the array **immediately after** the `Layout` button entry (search for `id: 'Layout'`).

**Important:** Adding the button here alone does NOT make it appear in the UI. Step 4 is mandatory.

---

## Step 4 — Add to toolbar sections (THE CRITICAL STEP most people miss)

The toolbar renders only the IDs explicitly listed in `toolbarSections.primary`. The button definition in Step 3 is just a registry entry; this step is what makes it visible.

**File:** `modes/basic/src/index.tsx`
```ts
export const toolbarSections = {
  [TOOLBAR_SECTIONS.primary]: [
    'MeasurementTools',
    'Zoom',
    'Pan',
    'TrackballRotate',
    'WindowLevel',
    'Capture',
    'Layout',
    'MPRDHLayout',   // ← add here; position in this array = position in toolbar
    'Crosshairs',
    'MoreTools',
  ],
  ...
```

**File:** `modes/segmentation/src/index.tsx` — same edit in the `toolbarService.updateSection(toolbarService.sections.primary, [...])` call (~line 43):
```ts
toolbarService.updateSection(toolbarService.sections.primary, [
  ...
  'Layout',
  'MPRDHLayout',   // ← add here
  'Crosshairs',
  'MoreTools',
]);
```

---

## The Advanced dropdown trap

`extensions/cornerstone/src/customizations/layoutSelectorCustomization.ts` dynamically generates the Advanced section of the layout dropdown by reading ALL registered protocols where `isPreset === true`. This means:

- Setting `isPreset: true` in your protocol file = it **automatically appears** in the dropdown
- Setting `isPreset: false` = invisible to the dropdown; only reachable via toolbar button or command
- You can have a protocol appear **both** in the dropdown and as a toolbar button (set `isPreset: true` + do Steps 3–4)
- You can have a protocol **only** in the dropdown (set `isPreset: true`, skip Steps 3–4)
- You can have a protocol **only** as a toolbar button (set `isPreset: false`, do Steps 3–4) ← DHS MPRDH choice

---

## Available icons (layout-related)

From `platform/ui-next/src/components/Icons/Icons.tsx`:

| Icon key | Visual |
|---|---|
| `layout-advanced-mpr` | Three vertical panels (MPR style) |
| `layout-advanced-3d-four-up` | 2×2 grid |
| `layout-advanced-3d-main` | Large top + 3 bottom panels |
| `layout-advanced-3d-only` | Single full panel |
| `layout-advanced-3d-primary` | Large left + 3 right stacked |
| `layout-advanced-axial-primary` | Large left + 2 right stacked |
| `layout-common-1x1` | Single viewport |
| `layout-common-1x2` | 1×2 |
| `layout-common-2x2` | 2×2 |
| `layout-common-2x3` | 2×3 |
| `icon-mpr` | Small MPR symbol (12×12px) |
| `tool-crosshair` | Circle with crosshairs |
| `tool-capture` | Camera |
| `tool-stack-scroll` | Stack scroll |

---

## Full file checklist (4 files for a toolbar-only protocol)

| File | Change |
|---|---|
| `extensions/cornerstone/src/hps/<name>.ts` | New protocol file (`isPreset: false`) |
| `extensions/cornerstone/src/getHangingProtocolModule.ts` | Import + register |
| `modes/basic/src/toolbarButtons.ts` | Button definition |
| `modes/basic/src/index.tsx` | Add ID to `toolbarSections.primary` |
| `modes/segmentation/src/toolbarButtons.ts` | Button definition (same) |
| `modes/segmentation/src/index.tsx` | Add ID to `primary` section array |

For **dropdown-only** (no toolbar button): only the first two files.  
For **both dropdown + toolbar**: all six files, but set `isPreset: true`.

---

## DHS MPRDH result

- Protocol file: `extensions/cornerstone/src/hps/mprdh.ts` (`isPreset: false`)
- Registered in: `extensions/cornerstone/src/getHangingProtocolModule.ts`
- Toolbar button id: `'MPRDHLayout'`, placed after `'Layout'` in primary section
- Toolbar icon: `layout-advanced-mpr` (reused MPR icon, no new SVG needed)
- Effect: 1×3 Axial/Sagittal/Coronal volume viewports, VOI-synced, segmentation-synced
- Appears: only as standalone toolbar icon (not in Advanced dropdown)
