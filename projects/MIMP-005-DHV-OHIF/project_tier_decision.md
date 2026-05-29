---
name: project-tier-decision
description: "DHS committed to OHIF customization Tier 3 (fork) + Tier 4 (extension); Tier 1+2 alone can't do mobile or new panels, Tier 5 (rewrite on cornerstone3D) is months of reimplementation"
metadata: 
  node_type: memory
  type: project
  originSessionId: 166f59ff-4dd5-4370-91b6-893b33f68d3c
---

OHIF supports five customization tiers (per `Docs/OHIF_CUSTOMIZATION_PLAN.md` §3, cheapest → most powerful):

1. Runtime `app-config.js` keys
2. Config + injected CSS via nginx `sub_filter`
3. Fork OHIF, build custom image
4. Custom extension/mode package (requires Tier 3 to bundle)
5. Abandon OHIF, build on cornerstone3D directly

**DHS chose Tier 3 + Tier 4 combined** because:
- Tier 1+2 alone can't do mobile-first layout or add new React panels — fails 2 of 4 customization goals
- Tier 5 (cornerstone3D rewrite) is months of reimplementation; OHIF gives ~80% of the patient viewer for free
- Tier 4 alone is impossible — extensions require a custom build, which means Tier 3

**Why this matters for *how* to make changes:**
- Anything achievable from `app-config.js` (Tier 1) should live in the PACS repo, not in this fork. See [[project-multi-repo-architecture]].
- Source edits in this fork should be reserved for changing *existing* OHIF UI (layout, toolbar contents, palette wiring).
- *New* features (new panels, new toolbar buttons, new modes) belong in a separate extension package, not embedded in `extensions/default`. This keeps them upgrade-safe across OHIF version bumps.
- nginx `sub_filter` CSS injection (Tier 2) was explicitly rejected — since we already own the fork, a clean source edit is preferable.

**How to apply:** when asked to add a customization, first ask which tier it belongs to. If someone proposes editing OHIF source for a *new* panel/button/mode, push back — that's Tier 4 territory, not Tier 3. If someone proposes `sub_filter` hacks for styling, push back — that was rejected.
