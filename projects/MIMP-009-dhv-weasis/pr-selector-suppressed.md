---
name: pr-selector-suppressed
description: "2026-08-25 fix removing the unwanted Presentation State (PR) selector icon/menu that started appearing on every image at SITE015 Mirpur; ADR-0020, permanent for all installs."
metadata: 
  node_type: memory
  type: project
  originSessionId: 5f2a4940-d456-42f6-85af-2482899f3ca2
  modified: 2026-08-25T23:30:00.000Z
---

SITE015 (Mirpur) doctors reported a small icon on every loading image, opening a "Presentation
State" menu with `None` / `None (series)` / one dated entry (3 options). Root-caused via
`/grill-with-docs` to Weasis's inherited `PRManager.buildPrSelection()` (`weasis-dicom-viewer2d`),
which adds that selector to any view whose series carries a GSPS object parsed into a
`PRSpecialElement`. Confirmed via [[series-tear-fix]]'s own SHIP doc: the Hafiza reference study
used to validate v2.0.2 has 21 Presentation State instances — these only started arriving reliably
once ADR-0019 widened the Retrievable Set, same root event as the series-tear bug, different
symptom.

**Fix (code, not config):** one-line change in `View2d.updatePrButtonState()` —
`ViewButton prButton = null;` instead of calling `PRManager.buildPrSelection(...)`. Permanent for
every DH DICOM Viewer install, not a per-site toggle (explicit product decision — no site has asked
to keep this, doctors don't want it anywhere). GSPS retrieval itself is untouched — ADR-0019's
Retrievable Set still fetches and parses these objects; only the UI surfacing is suppressed.
`PRManager`'s ~900 lines of apply/graphic/spatial-transform logic and the "apply latest PR
automatically" checkbox in Tools > Options are now dormant but deliberately left in place, not
deleted — a full-removal pass was scoped and explicitly deferred, not forgotten.

Code review (code-reviewer agent): **0 findings, APPROVE** — confirmed `buildPrSelection()` had
exactly one call site, no other code path can set `ActionW.PR_STATE` to a `PRSpecialElement`, and
GSPS retrieval is unaffected.

**Also fixed en route:** Study Assembly's `CONTEXT.md` "Renderable instance" entry incorrectly said
every pixel-less instance is discarded as `UNREADABLE` — untrue for PR/KO/SEG, which
`DicomMediaIO.DCM_ELEMENT_FACTORIES` deliberately retains as **Special Elements**. Added a new
Special Element glossary entry alongside the correction.

**Where things live:** ADR-0020 (`docs/adr/0020-pr-selector-suppressed-not-removed.md`),
`docs/StudyAssembly/CONTEXT.md`. Surrounding context: [[series-tear-fix]],
[[dh-pacs-standalone-site]]. **Code + docs written 2026-08-25, compiles clean
(`mvn -pl weasis-dicom/weasis-dicom-viewer2d compile -o` → BUILD SUCCESS), code-reviewed clean.
Built and SHIPPED 2026-08-25 in Viewer v2.0.3 (its first installer), installed at SITE015 the
same night and live-verified: the PR icon is gone. Still uncommitted.** The dh-dicom-viewer repo
has substantial unrelated pre-existing uncommitted state from prior sessions, so committing this
change needs a deliberate, scoped `git add` of just the touched files, not a blanket commit.
