---
name: project-about-modal-patient-rebrand
description: About modal rewritten for patient audience and deployed; title-bar bug found (separate i18n key never overridden by prior rebrand)
metadata: 
  node_type: memory
  type: project
  originSessionId: 12bc4161-b6f8-4520-a58b-e5ec88d5cdeb
---

Shipped commit `7dd50d622` on `dhs-main`, deployed to production 2026-06-17. File: [extensions/default/src/customizations/aboutModalCustomization.tsx](extensions/default/src/customizations/aboutModalCustomization.tsx).

**Bug found:** the earlier rebrand commit `c308418ed` ("redirect issue reporting to DHS Google Form; rebrand About modal") only changed the modal *body* (ProductName → "DH Solutions PACS"). The modal *title bar* is a separate concern — `ViewerHeader.tsx` reads `AboutModal?.title ?? t('AboutModal:About OHIF Viewer')`, and nothing had ever overridden `.title`. So production kept showing "About OHIF Viewer" in the title bar even after that commit shipped. Screenshots of "About OHIF Viewer" don't necessarily mean the rebrand commit is undeployed — check the title bar specifically, since it's wired independently from the body content.

**Fix pattern:** `Types.MenuComponentCustomization = React.ComponentType & { menuTitle?, title?, containerClassName? }` — these are read as **static properties on the component function itself** (`AboutModalDefault.title = '...'`), not as a separate config object. This is the supported way to override modal title/menuTitle from within a customization file, used by both the About modal and User Preferences modal menu entries in `ViewerHeader.tsx`.

**Content decisions (made via /grill-with-docs, all confirmed by user):**
- Modal is desktop-only (gear menu has `hidden md:block` — stripped from mobile in Phase B), but still patient-facing since a patient could open a shared link on a desktop browser.
- Dropped Commit Hash and Browser/OS (developer debug info, meaningless to a patient).
- Added tagline: "Secure viewer for your medical imaging."
- Added support email `directhospitalsolutionsltd@gmail.com` — same address already used as "Contact Us" on the demo portal (`Docs/Demo_Build/DH_PACS_DEMO_PORTAL_BUILD_GUIDE.md:572`), reused for consistency.
- Kept website link `pacs.dhsolutions.com.bd`.
- Kept a small de-emphasized version tag (e.g. "v3.12").
- Removed all remaining OHIF/GitHub references (continuing the direction already set in `c308418ed`).

**Why:** this repo is patient-viewer-only (see fork CLAUDE.md). A patient who opens "About" is more likely confused/looking for help than debugging — content should read as identity + reassurance + support contact, not a build-info panel.

**How to apply:** if further About-modal or similar menu-driven modal copy changes come up, remember the title/body split and check both. [[feedback-build-deploy-ops]] has the deploy-verification gotchas hit while shipping this.
