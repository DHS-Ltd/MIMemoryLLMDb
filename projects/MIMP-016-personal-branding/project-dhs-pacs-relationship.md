---
name: personal-brand-dhs-pacs-relationship
description: How this repo relates to E:\DHS-PACS — the commercial parent — and what belongs in each project
metadata: 
  node_type: memory
  type: reference
  originSessionId: af2acf84-f41d-482f-ac0e-e6d5e3ae06de
---

**Two projects, one person, deliberate separation:**

| What | Lives in |
|------|----------|
| DH PACS product, website, pricing, company brand voice, Ibn Sina pitch, tech deck | `E:\DHS-PACS` |
| Maidul's personal educator identity, LinkedIn content, post drafts, voice profile | `E:\Self_project\Personal_Branding` (this repo) |
| Maidul's CV (UIH direct-rep) and headshot/profile-pic source material | `E:\Self_project\Personal_Branding\Maidul_CV` (this repo) |

**DHS-PACS memory:** `C:\Users\maidu\.claude\projects\e--DHS-PACS\memory\MEMORY.md` — 10 memory files covering product architecture, market strategy, pricing, Ibn Sina commercial posture, website build, HIPAA compliance, brand voice, tech deck (personal-brand content fully removed as of 2026-08-03).

**2026-08-03 full cleanup (resolves the old "stale paths" problem below):** DHS-PACS's entire
`LinkedIn_Marketing\` folder (CV, Profile_Pic, and the older Content/LinkedIn_Maidul_Data/Research
duplicate) has been removed from DHS-PACS — verified byte-identical against this repo's copies
before deletion, so nothing was lost. `LinkedIn_Marketing\CV\` and `\Profile_Pic\` moved into
`Maidul_CV\` here (a standalone deliverable, kept separate from the ongoing `LinkedIn_Marketing\`
content-calendar tree). The three DHS-PACS memory files that pointed at the old `Marketing\...`
paths (`linkedin-profile-changes.md`, `project-dh-pacs-maidul-personal-voice.md`,
`project-dh-pacs-linkedin-calendar.md`) were deleted outright since their content was fully
superseded by [[project-linkedin-profile]], [[project-brand-voice]], and [[project-content-calendar]]
here. DHS-PACS now has **no LinkedIn_Marketing folder at all** — all of it lives here. If a DHS-PACS
memory ever again references a `Marketing\...` or `LinkedIn_Marketing\...` path, treat it as stale
and look here first.

**Also found and resolved the same day:** a separate `E:\DHS-PACS\Marketing\` folder (distinct
from `LinkedIn_Marketing\`) had its own `Content\Dicom_Post_Draft.md` and `DICOM_Carousel_Brief.md`.
The `Dicom_Post_Draft.md` there was a **newer, cleaner revision** than this repo's copy (later
timestamp, no draft-notes footer) — synced over to replace this repo's version, see
[[project-content-calendar]]. `Marketing\Content\` was then deleted from DHS-PACS.
`Marketing\Popular_Diagnostic\` remains in DHS-PACS untouched — that's a real DH PACS commercial
proposal (hospital prospect), correctly company-scoped, not personal-brand content.

**When to open DHS-PACS instead of this repo:**
- Writing product copy, website content, or demo materials for DH PACS
- Preparing the Ibn Sina commercial pitch
- Discussing pricing or commercial structure
- Anything where "DH PACS" is named as the subject

**When to stay in this repo:**
- Drafting any LinkedIn post where Maidul Islam is the author
- Updating the content calendar
- Reviewing the voice profile or litmus tests
- Building out post ideas across the four pillars
- Anything personal brand related

**Why:** The strategy is explicit — the personal brand must be built entirely on education and expertise, with DH PACS never named in personal content. Keeping separate working environments enforces this discipline.
