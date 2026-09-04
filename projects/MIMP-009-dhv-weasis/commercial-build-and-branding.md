---
name: commercial-build-and-branding
description: "What DH actually ships (Commercial Build vs Dev Build), the branding/de-Weasis work required before first customer delivery, and the blocking prerequisites."
metadata: 
  node_type: memory
  type: project
  originSessionId: 026bbbd1-5755-4b64-aab4-05ee971a4bb9
  modified: 2026-08-23T18:51:11.659Z
---

Decided 2026-08-23 in a `/grill-with-docs` session on the **Standalone Site**
deliverable: `DHPACSWorkstation_Setup_vX.Y.Z.exe` = **Receiver + Viewer** on one box.
No MT Portal (a Standalone Site is not Central-paired). See
[[dh-pacs-standalone-site]].

**Authoritative plan — read this, not the memory:**
`DHDicomViewer/dh-dicom-viewer/docs/SHIP_PLAN_STANDALONE_WORKSTATION.md`
(workstreams A/B/C/D/E/G/H, exact files and line numbers, ship checklist).
Decisions: Viewer ADR-0018/0019/0020, PACS ADR-0007 compliance note + PACS ADR-0018.
Glossary: `CONTEXT-MAP.md` "System-wide language" in **both** repos.

## STATUS 2026-08-24 — mostly BUILT and verified; C1/P3/P4 now done in code

Workstreams **A, B, C (minus C1), D (minus D4), F, G are implemented**. Both build shapes
were rebuilt and audited; the Commercial Build zip contains **no** filmcomposer, i18n,
acquire or dicomizer artefacts, and `-Pmcp` restores the Composer + MCP jars at 2.0.0.
All three **PACS** `.iss` `[Code]` sections compile under ISCC. **Nothing was committed** — both
working trees already carried unrelated uncommitted work, so these changes sit on top.

**Workstream E (asset pipeline) done 2026-08-24.** `Asset/prepare_assets.py` rewritten to take
both `DHV-Logo.png` and `DHP_Logo_Wording.png`. Deploys DHV-branded `svg/logo/Weasis.svg`
(C1, the taskbar/title-bar mark) and `svg/logo/WeasisAbout.svg`, plus `DHV_164x314.bmp` /
`DHV_55x58.bmp` wizard art (P3/P4), now wired into `Installer/DHDicomViewer_Setup.iss`. Deleted
the dead `about.png`/`logo-button.png` outputs. DHP-side assets (`DHP.ico`, wizard BMPs,
`favicon.ico`, `logo.png`) generate to `Asset/output/dhp_preview/` **only** — hand-made,
already-verified, already-wired versions exist in `portal/Asset/`/`portal/public/`, so the
script never overwrites them. `DHDicom.ico` was deliberately left alone — already exists,
already correctly DHV-branded, richer size set than the script produces. C1/P3/P4 are done in
code but not yet seen in a live launch/wizard run (same class of check as the other `[~]` items).

**G2 `.iss` defect FIXED 2026-08-24**, and C1/P3/P4 taken all the way to a live-verified
rebuild in the same session. `CreateUninstallRegKey={code:ShowInProgramList}` doesn't compile —
`{code:...}` is only valid inside `[Files]`/`[Icons]`/`[Run]`/`[Registry]` entry parameters,
never as a raw `[Setup]` directive value (the whole `[Setup]` section resolves before Pascal
Script exists to call). Fixed by making it static `yes` and deleting the uninstall registry key
in `CurStepChanged(ssPostInstall)` when bundled — standard Inno pattern, the uninstaller `.exe`
itself is untouched. Getting the fix to actually compile surfaced two more bugs, both fixed:
a `{code:...}` example *inside* the explanatory Pascal `{ }` comment closed the comment early
(braces don't nest — same bug family as the original), fixed by switching to `(* *)`; and
`ShowInProgramList` was called from a function defined earlier in the file, which Inno's Pascal
Script doesn't hoist — fixed by reordering. **None of this was visible until a real app-image
existed** — ISCC aborts during `[Files]` wildcard preprocessing before it ever reaches `[Code]`
compilation on a stale build tree, so a syntax-only check can't catch `[Code]` bugs.

Full rebuild done 2026-08-24: `mvn clean package` → `package-weasis.sh` (no-installer) → real
`DHDicom.exe` → full `DHDicomViewer_Setup_v2.0.0.exe` compiled clean via ISCC. Launched the
app-image with a temporary test licence (`License/DHS_2027.dhvlicense`, installed to
`ProgramData` and removed again after, same procedure as the 2026-08-23 smoke test) and
screenshotted it: **title-bar and taskbar icons both show the real DHV mark, not the Weasis
circle** — C1 is live-verified, not just deployed. Window title read `DH DICOM Viewer v2.0.0`.
Did not run the actual installer wizard (would trigger an unattendable UAC prompt in this
environment) — P3/P4's BMPs are confirmed correct and ISCC-accepted, but the wizard *page
itself* is still unseen.

## P1 — the DH EULA is WRITTEN and WIRED, 2026-08-24

`01_Pacs_File/01_Pacs_File/EULA.txt`. One copy, ASCII, hard-wrapped 78 cols, no Markdown.
`LicenseFile` in all three `.iss` + shipped into `{app}`; `package-weasis.sh`'s Windows MSI
branch uses `$DH_EULA` and **hard-fails if absent**. All three installers recompiled clean
via ISCC. The Viewer reaches across repos with `#define EulaFile`, same precedent as
`SharedScripts` — one agreement, ADR-0013 drift rule. Read ADR-0018 §Implementation, not this.

**Four commercial terms were decided to write it** (these are the answers, don't re-ask):
annual **term** licence (matches what the code enforces — reading stops, receiving never does),
**Bangladesh law / courts of Dhaka**, **"forms no clinical opinion, the clinician decides"**
(not the conservative "not for primary diagnosis", which would gut the surgeon-first pitch),
and **customer-initiated, customer-supervised remote support** as the only way DH sees PHI.
§5 states the ADR-0016 receiving-never-stops boundary as a **commitment by DH**, deliberately —
it converts the enforcement design into something the customer can hold DH to.

**NOT reviewed by counsel.** Written to be reviewable (plain language, no invented figures,
fees always deferred to the Order Form — pricing stays in the physical notebook per DHS rule).
§14 warranty and §15 liability are where a Bangladeshi commercial lawyer should look first.

**Two real defects found while wiring it, both fixed:**
1. **`NOTICE.md` + `LICENSE.txt` never shipped into `{app}` on the PACS side** — three
   comments claimed they did, no `Source:` line existed. Orthanc is AGPLv3 and DH conveys it,
   so §4 requires the text to travel with the binaries. That was a compliance gap, not a
   stale comment.
2. **The G2 `{code:...}` defect was STILL LIVE in `dh-pacs-orthanc.iss`** — the 2026-08-24 fix
   had only been applied to the Viewer installer. It aborted at `[Setup]` line 39, meaning
   that installer had not been compiled since the D1 rename. Same static-`yes` +
   `CurStepChanged` pattern applied, `ShowInProgramList` moved above its caller. Also: `dist/`
   held `dh-pacs-orthanc-setup-v0.4.0.exe` while the bundle expected the renamed
   `dh-pacs-receiver-setup-v0.4.0.exe` — rebuilt.

**Known gap left alone on purpose:** the *Viewer* installer's registry-delete sits after
`if LicenseSource = '' then Exit;`, so a bundled install with no licence would keep a second
Add/Remove entry. Unreachable today (the bundle always passes `/LICENSE=`); not restructured
because that file is live-verified and this environment can't re-run the wizard.

**COMMITTED 2026-08-24** — the long uncommitted backlog is finally in. PACS repo: branch
`feat/eula-and-licence-hardening`, commit `cb459f2`, 35 files, working tree now **clean**. DHV repo:
`4bc801c10` on `feat/dh-pacs-site-integration`, holding **only** the ship plan + `package-weasis.sh`
— the user's 120 files of Film Composer/MCP work were left untouched, as always. Neither repo has a
remote; nothing pushed.

**New gap the EULA itself created: the Order Form does not exist.** The EULA defers to "the Order
Form" **7 times** and §19 makes it prevail on commercial terms, but no such template exists in either
repo (`STANDARD_TIER_PROPOSAL_TEMPLATE.md` in DHS-PACS is a *Standard-tier proposal*, a different
document for a different tier). Drafting it against the annual-term shape is the obvious next piece
of authorship.

Still open: **P2 (site live — now the top blocker)**, counsel review of the EULA, the Order Form
template, and actually clicking through the installer wizard once (P3/P4 + the new licence page).

**Do not be alarmed by 3 red tests in `weasis-core`** (`URIUtilsTest` ×2,
`NetworkUtilTest` ×1). Proven pre-existing by reverting the touched files to HEAD and
reproducing them. They assert Unix paths on a Windows `E:\` drive. Also: `mvn test`
without `clean` produces a bogus bnd error in `weasis-dicom-send` — always clean first.

## The two build shapes

- **Commercial Build** = `mvn package`, no profile. No MCP, no Film Composer, no
  startup dialog, no unsolicited outbound call. The only thing DH may hand a hospital.
- **Dev Build** = `-Pmcp`. MCP + Film Composer together (see
  [[film-composer-module]], [[mcp-ai-control-surface]]).

## Blocking prerequisites — no customer build until these exist

1. ~~**DH EULA text.**~~ **DONE 2026-08-24** — see the P1 section above. Counsel review
   is the only part still outstanding.
2. **`https://pacs.dhsolutions.com.bd/#contact` live.** Every customer-visible
   destination now points there (Help ▸ Contact Support, About box, all installers).
3. **DHV wizard artwork** (164×314 + 55×58 BMP) — does not exist. DHP equivalents do.
4. **DHV taskbar mark as SVG** — until then the running app shows the Weasis logo.

## Decisions worth not re-litigating

- Support contact is **the website**, not an email. Three different addresses existed
  in the tree; the About box had a gmail one.
- Entity name is **DH Solutions Limited** everywhere (PACS installers said "Ltd.").
- Viewer version → **2.0.0** everywhere (pom said 1.0.0, installer said 1.1.0 — they
  disagreed). The Workstation bundle keeps its own independent number (plan decision #11).
- **English-only.** The 45-language i18n bundles are an upstream binary whose *values*
  leak "Weasis"; dropping them is the only fix. Accepted cost.
- **Nothing has shipped to a real customer yet** (confirmed 2026-08-23) — which is why
  the data-folder rename, the path moves and the EULA fix are all free right now.

## Things that were found broken, not just unbranded

- Update popup fired on **every** launch because upstream Weasis 4.7.x > DHV 1.1.0 —
  arithmetic, not a bug, and it sent customers to Weasis's download page.
- Help ▸ Check for updates is gated by **no flag at all**; config alone can't stop it.
- The running app's taskbar/title-bar icon was the **upstream Weasis mark**
  (`svg/logo/Weasis.svg` via `LogoIcon.SMALL`) — `DHDicom.ico` only covers the
  installer and shortcuts.
- `DHDicom.exe` ▸ Properties shows **`CompanyName: Unknown`** — `--vendor`/`--copyright`
  are set only inside `if [ "$PACKAGE" = "YES" ]`, which the `--no-installer` build
  never enters.
- **`Dicomizer.exe`** ships into `{app}` with the unmodified upstream `Dicomizer.ico`
  (via `--add-launcher`). Being dropped.
- Uninstalling "DH PACS Workstation" **left the Receiver service running** — no
  uninstall cascade existed. Three Add/Remove entries for one product.
- PACS ADR-0007 ("no Orthanc in installer chrome") was **violated in six places**,
  including `AppComments`, which the ADR names explicitly.
- `about-round.png` is the JVM `-splash:` image — **live**, first thing seen on launch.
  (I initially misread it as dead. `about.png` and `logo-button.png` genuinely are.)

## Deferred on purpose

Renaming the OSGi bundles (`weasis-*`, visible in About ▸ System Information). Touches
36 poms, every felix URL, assembly descriptors, MANIFEST symbolic names and
`package-weasis.sh` globs. Deferred, not rejected. The "Based on Weasis (Apache 2.0)"
line in the About box stays — that is attribution, kept deliberately.

## Colour theme — BUILT, live-verified and COMMITTED 2026-08-24

`/grill-with-docs` session locked the DHV palette work. Decisions are in
**`docs/adr/0021-dhv-brands-the-chrome-never-the-signals.md`**; glossary terms
(Signal colour, Chrome, Image-adjacent surface, DHV Dark) appended to
`CONTEXT-MAP.md` "System-wide language". Read those, not this.

Two non-obvious facts that drove the whole plan and are easy to lose:

1. **`Weasis.theme.json` is Monokai Pro Contrast by Mallowigi, verbatim** — a
   code-editor theme, not a Weasis design. Of its 2222 lines only ~56 carry a
   literal hex and the rest reference colours symbolically, so the entire re-skin
   is a rewrite of ~24 entries in the `colors` block at the top.
2. **Five of those entries must never be edited.** `red`/`yellow`/`green`/`blue`/
   `gray` already equal FlatLaf's *dark* `Actions.*` values, and they must, because
   `LookAndFeels.applyDefaultColor()` stamps those same values into `UIManager`
   after the theme loads while `GuiUtils.IconColor` freezes them into `final` enum
   constants. Java-drawn colour comes from FlatLaf; SVG icon colour comes from the
   theme. Editing them desyncs the icon red from the `InfoLayer` warning red.

Shipped defect found during the audit and **now fixed**: `ImageViewerPlugin`:165 built
the view container as a bare `new JPanel()` and `MigLayoutModel` gaps it by 5px, so a
light theme painted a **cream lattice between diagnostic images** — two clicks away in
the then-shipped build. The surround and view borders are now pinned dark in *every*
theme via `FlatLaf.properties` (which FlatLaf applies to all LAFs), scoped narrowly to
image-adjacent surfaces only.

**Built and verified same day.** DHV Dark (deep cool-slate ramp, brand-blue accent) is live in
a Commercial Build. 9 files changed + 3 new (ADR-0021, CONTEXT-MAP terms, ThemeSignalColorTest).
Full reactor build green; the 3 failing tests in `org.weasis.core.api.net` are pre-existing
Windows path tests, not caused by this. Pixel scan across a live 2x2 grid confirmed lattice
`#161F24` x5px, unselected border `#4E5F6A`, focused border `#F0A732` byte-exact. Preferences
dropdown now reads "DH DICOM Viewer Dark". **Committed** as `80bee3a05` on `feat/dh-pacs-site-integration` (12 files, +402/-31).
Staged path-by-path: the branch carried 131 uncommitted files of unrelated work and 119
still do, so never stage this tree wholesale. That commit also brought `CONTEXT-MAP.md`
into tracking for the first time, so it carries the pre-existing system-wide glossary
(Commercial Build, Dev Build, Withheld feature) as well as the new theming terms.

Two things to know next time:
- **`HistogramPanel`'s cream `#EBECD2` background was deliberately left** and now looks worse
  against the darker chrome — a large pasted-in cream field. Not a one-liner: :164 draws the
  histogram *bars* in `Color.BLACK`, so darkening the background alone erases the data. Needs
  its own visual pass. This is the most likely "you missed one" report.
- **Running any build on this machine needs `C:\ProgramData\DHDicomViewer\license.dhvlicense`.**
  It was absent (removed during Phase 7 licence testing) and the app exits silently with a modal
  `BLOCKED` dialog and no window — looks like a hang, is not. `test_valid.dhvlicense` from
  `E:\DHV-Weasis\License\` was installed to unblock verification and **is still installed as of 2026-08-24**
  - the convention used by the 2026-08-23/24 smoke tests is to remove it again after,
  so remove it once the theme work is signed off.
