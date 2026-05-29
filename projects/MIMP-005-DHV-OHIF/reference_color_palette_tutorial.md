---
name: reference-color-palette-tutorial
description: "In-repo manual at Docs/Tutorial/COLOR_PALETTE.md is the canonical how-to for changing brand colors — recipes for primary/accent/NavBar/panels, HSL format rules, deploy + cache-bust workflow"
metadata: 
  node_type: memory
  type: reference
  originSessionId: dae93935-5b9a-4c53-a297-203db49c3279
---

**Where:** [d:\ohif-fork\Docs\Tutorial\COLOR_PALETTE.md](Docs/Tutorial/COLOR_PALETTE.md) (in-repo, on `dhs-main`).

**What it covers:**
- The two-preset architecture (`ui-next` CSS variables + legacy `ui` flat-hex preset) and which tokens live where.
- HSL triplet format gotcha (`178 45% 38%` not `hsl(...)` or `#hex` — pasting the wrong format silently fails).
- Five concrete recipes: change `--primary`, change `--accent`, change the top NavBar background (the legacy `secondary.dark` cascade trick), match a logo gradient stop to HSL, change panel/card backgrounds.
- Local dev workflow (`yarn dev`, hot reload).
- Production deploy + the SW + Cloudflare cache-bust sequence (see also [[project-v11-palette-shipped]] §"Operational gotcha").
- Troubleshooting table for common silent-fail symptoms.

**When to consult:**
- Any user request to change a UI color in the OHIF chrome — start here before grepping the codebase.
- If a follow-up palette tweak is requested (e.g., "make the primary slightly darker"), the doc's Recipe 1 has the exact lines to edit and the contrast rule.
- If asked to change the top bar color specifically, jump to Recipe 3 — the legacy-preset edit is non-obvious.

**When NOT to consult:**
- Toolbar trim / button removal — that's [Docs/TOOLBAR_TRIM.md](Docs/TOOLBAR_TRIM.md), a different concern.
- Logo swap — separate workflow (replace `platform/app/public/assets/dhs-logo.svg` + update whiteLabeling in PACS-repo's `app-config.js`).

**Maintenance:** Keep the "Reference — current production palette" section at the bottom in sync whenever the palette ships a new revision. The recipes themselves should stay stable.
