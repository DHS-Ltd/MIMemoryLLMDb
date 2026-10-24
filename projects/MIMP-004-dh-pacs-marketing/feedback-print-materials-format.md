---
name: feedback-print-materials-format
description: "Customer print materials = styled A4 HTML with explanatory pictures, no em dashes, overlap-checked; offer letters as .docx only; English, paper meetings"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1410b357-ad6d-4467-ad2b-ad47b4bbb601
  modified: 2026-10-23T17:47:17.412Z
---

For customer-facing materials: build print pieces as styled A4 HTML with pictures (diagrams) that
make the point; offer letters as **.docx only**. **Never use em dashes** in the writing (avoid en
dashes too; also avoid a flat-line bullet that looks like one). **Check every page for overlapping
or overflowing sections** before handing over. Meetings like the Ibn Sina 15/A branch manager visit
are on paper, in English, with no Bangla "what to say" script unless asked.

**Why:** the user's instructions, 2026-10-23, Ibn Sina 15/A DHV Archive materials.

**How to apply:** use Windows system fonts (Bahnschrift, Segoe UI) so the checked layout is the
printed one; run a headless-Chrome check per page (overflow, footer clearance, sibling overlap, SVG
text spill / label collision / line-through-text, PDF sheet count, dash scan) and look at every page
image; render .docx through real Word (COM ExportAsFixedFormat) before calling it done.
See [[project-ibnsina-15a-local-pacs-pitch]], [[feedback-pitch-to-the-room-as-it-runs]].
