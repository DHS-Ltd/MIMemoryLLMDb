---
name: sales-enablement-answer-bank
description: "The Answer Bank — internal sales-enablement layer turning Inobitec's video corpus into radiographer-facing answers for a live deal; 20 cards, ALL 24 Action Demos + all 8 own-recordings processed; 5 Reference Sessions remain. Clip series REVISED 2026-08-02 to 11 clips needing ZERO new recordings (Clip_Specs/); read the 'absorbed is not final' lesson before trusting any absorption verdict"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4de72df4-8d91-4812-9562-9e924c24629f
  modified: 2026-08-01T18:46:47.910Z
aliases: [sales_enablement_answer_bank]
---

A live Inobitec reseller deal drove a new bounded workstream, specified and **built** 2026-08-01.
Spec: `Inobitec/Sales_Enablement/README.md`. Run it with `/inobitec-sales <video>`.

## THE lesson from 2026-08-02: `absorbed` is not a final verdict

A `/grill-with-docs` session re-opened the own-recording frames and **reversed four of the
2026-08-01 conclusions.** Root cause, and it generalises to every catalog in this workspace: **the
per-video pipeline judges footage against a capability assigned in advance.** The operator's two real
questions arrived *after* several of those judgements were made. Footage marked `absorbed` — *"adds
no new evidence"* — answered the questions precisely; it had been measured against the wrong
yardstick. **When a new real question lands, re-read the absorbed corpus against it.**

What actually changed:

1. **`own-cta-nv-single-bone`** — written off as *"mislabeled, adds no evidence"* — contains **the
   entire opening act.** Its coloured render is **NOT perfusion** (preset reads `[WL]Tissue`, W/L
   700/80 → transparent-skin CLUT VRT), so that speculative `CAPABILITIES.md` gap is **closed
   negative**. But at **1m19–1m45s the preset is `CT-Bones`**: skull, cervical spine, clavicles and
   ribs intact with contrast-filled arteries orange through them, green marker on the vessel at
   1m37.5s. Both operator questions answered in 3D, one preset click, zero segmentation.
2. **Clip 2 needed no recording after all** — the planned "one short take on E980248" is withdrawn.
3. **Clip 6 is alive** on `own-mip-cleanup`: the green polygonal ROI **is** visible being drawn
   (`_read/r002`), even though no parameter dialog is legible. Maidul proposed this clip for clip 2;
   it can't serve there (TOF MRA = no cortical bone, and the take *ends* on full isolation). **Right
   footage, wrong slot.**
4. **Clip 11 cut, and the mechanism mismatch was only half the reason** — at `High Intensity 200` the
   result is a thread in heavy speckle, at `100` it's blocky at 1310 cm³. **Not presentable**, which
   no vendor substitution repairs.

**Net: 11 clips, ZERO new recordings, six on IBN Sina footage (up from three).** Cut sheets are in
`Inobitec/Sales_Enablement/Clip_Specs/` — one file per clip with measured timecodes, PHI crop/mask
rectangles as frame percentages, overlay tables, definitions of done. `CLIP-SERIES-BRIEF.md` is the
*argument*; `Clip_Specs/` is the *production sheet*. Brief **§4c** records all four reversals and
wins wherever it disagrees with §4a/§4b.

Two cards written by hand from verified frames (bank 18 → 20): `show-vessels-with-bone-and-anatomy-retained`
(the only card built from questions a real prospect asked) and `clean-up-a-messy-mip`
(`runnable-unrehearsed` — the control is still unconfirmed after two takes).

**PHI rule corrected: "crop to the viewport" is INSUFFICIENT.** The patient block sits **inside the
render area**, and **in multi-panel layouts every panel carries its own copy.** Order is now **mask,
then crop**, and **never include a study-list frame at all.** Four distinct patients across the own
corpus: `E980248` (clips 1/2/3/9), `E1082248` (clip 5), `E8993332` (clip 6), `E1067906` (cut 11).

**One caption constraint to carry forward:** the carotids are unambiguous in the `CT-Bones` frames;
the **vertebral artery is NOT provably resolved** inside the transverse foramina. They asked about
the vertebral specifically, so the clip says *"the arteries"* — the worst place in the library to
over-claim. Only the one blocker remains: `own-cta-nv-bone-removal` has **zero dense frames left**
(cleaned up), so clip 3 can't get a verified timecode until they're re-extracted at 2 fps.

**Deliverable B is now unblocked but NOT due** — the open-miss queue is empty, but on two
*paraphrased* questions from one operator. Hold it until a real meeting's questions are logged.

## Update 2026-08-01 (later same day): all 8 own-recording clips now processed

A separate `/grill-with-docs` session (not run by me) happened between my checkpoint above and this
update — it locked `CLIP-SERIES-BRIEF.md` (12-clip customer series, 5 acts), found the
"capacity not capability" reframe (D1–D6 in `Questions-Asked-Log.md`), wrote
[ADR-0006](../../../e--DH-Advanced-Viewer/Inobitec/docs/adr/0006-vendor-footage-shippable-when-the-customer-already-knows-the-vendor.md)
(vendor footage now shippable to *this* customer specifically, since they already know Inobitec is
the vendor — scopes ADR-0005, doesn't overturn it), and directly verified 2 of the 8 own-recording
clips ad hoc, finding own-recordings **do** carry the vendor title bar (my instruction to the first
agent run was wrong on that point) and that PHI is worse than assumed — full patient info in the
corner of **nearly every frame**, not just opening screens, and one clip turned out to be a **Google
Remote Desktop capture** (browser chrome, hospital-named tab, taskbar all in frame).

I then processed the remaining 7 clips through the formal pipeline, one dispatch each, each verified
before moving to the next. **All 8 are now `absorbed`** — none produced a new card; several
corroborated existing cards (subtraction, stenosis measurement, bone removal), and three **correctly
declined to force a bad mapping**: two clips assigned to specific cards by the brief (watershed;
automatic vessel segmentation) turned out to show a *different*, non-overlapping capability instead
— the agent caught this itself both times rather than citing the wrong tool (this pipeline's
recurring failure mode elsewhere, see below). One clip's PHI turned out to genuinely require zero
curation (`own-mip-brain-neck` — confirmed Remote Desktop, no frame met the bar). Full detail and
the `CLIP-SERIES-BRIEF.md` consequences (clips 4 and 11 need re-sourcing; clip 6 still has no usable
footage after two tries) are in that file's new §4b — read it before touching this series again.

**One open item I flagged but didn't chase:** `own-cta-nv-single-bone`'s absorbed content includes a
render the agent called "perfusion analysis" that might actually just be a colored vessel VRT, or
might be genuine CT perfusion (TTP/Area/Slope) — which would close a documented `CAPABILITIES.md`
gap from an earlier vendor-video absorption. Worth a 2-minute look at the frames on D: before
assuming either way; I didn't verify this one myself since it's a judgment call best made by someone
who knows Inobitec's UI on sight.

Read "Own-recording: now a 3rd source category" and "Fourth failure mode" below — both still
current and apply to any future own-recording clip added to this folder.

Separately (background, lower priority than the resume point above): **all 24 Action Demos processed
as of 2026-08-01** — 18 answer cards written, 6 videos
correctly absorbed (thin-evidence montages or content already covered by an existing card — see
"Absorption policy proved sound" below). `WORKLIST.md` reads "24 of 24 done." **Remaining scope: the
5 Reference Sessions** in `Video Repo → Reference_Video/` (4.5h, transcript-first, must be run
ranged via `tools/plan_video.py`) — explicitly out of the Action Demo worklist's own structure, not
yet started. When picking this back up, that's the next unit of work, not a re-run of Action Demos.

## The discovery that reframed the whole layer (2026-08-01, `/grill-with-docs`)

The prospect's constraint is **capacity, not capability** — one scanner + one workstation, rising
CT+MR volume, and they have *already decided* they need a dedicated seat. The vessel demo's
"half faith" was a **relevance** gap (*"great for CTA, that's 5% of my day"*), not a credibility one.
And the key fact: **they produce 3D/vessel/segmentation whenever they themselves spot a problem** —
discretionary, unrequested, and therefore the first thing the queue kills. **They are rationing
their own quality.** So the demo never missed; it landed on the work the constraint suppresses.
Recorded as D1–D6 in `Sales_Enablement/Questions-Asked-Log.md`; acted on in
`Sales_Enablement/CLIP-SERIES-BRIEF.md` (12 clips, five acts, silent + English burn-in overlays).
**Do not pitch breadth to this account** — adding capabilities they think Siemens already covers
converts a relevance objection into a displacement one.

**The first two REAL questions arrived same session, and they overturned the opener.** The operator
asked (paraphrased — get their literal words next meeting): *"can I show the vessels prominently
while the other, irrelevant organs stay for context?"* and *"can I show the brain/vertebral artery
**with the bone still in place**?"* One need stated twice: **show the vessel without throwing away
the anatomy** — the *opposite* of destructive bone removal, which is what the landed demo showed and
what 6 of his 8 own-recording clips contain. So the series now opens on context preservation and
bone removal is repositioned as "one setting on a dial you control." Three mechanisms answer it, all
already in `CAPABILITIES.md`: the **`CT-Transparent Skin` CLUT preset** (bone+vessel in one click,
no segmentation, practiced-hands-on), per-structure **opacity sliders** (carded), and the **clipping
box**. He also cut the report-editor clip outright — *"they have a proven reporting structure in
place"* — a useful signal about where not to pitch.

**Both candidate own-recordings were then watched (2026-08-01) and the result corrected the plan —
see `CLIP-SERIES-BRIEF.md` §4a.** (a) `MIP_Brain_neck` is a **TOF MRA** (`tof_fl3d_tra_MRA`), not
CT — it **cannot** show the vertebral artery with bone, since MR doesn't image cortical bone, and
CT CLUT presets misbehave on MR signal data. The "run CT-Transparent Skin on it" plan was dead on
arrival. (b) `CTA_Neck_Vessel` **is** the right study (`Head+Neck Angio 1.00 Bv36`, 110 kV, paired
non-contrast series, bone present in the VRT) — but the workflow isn't on tape, so clip 2 needs one
short recording on that study. (c) **Free win:** that same clip shows the real bone-subtraction
dialog on an IBN Sina contrast/non-contrast pair, so the subtraction clip upgrades from vendor
footage to their own data. (d) **Two standing assumptions were wrong and are corrected in
`README.md` §3b:** own recordings **do** carry the vendor title bar
(`Inobitec DICOM Viewer Professional Edition 2.19.0.13776-rW` — outside the 2.3–2.5 range the README
claims the corpus spans), and the **PHI is far worse than a header strip** — full names, IDs, DOBs,
sex, hospital and study dates on nearly every frame, two different patients across the two clips,
and `MIP_Brain_neck` is a **Google Remote Desktop session** with browser URL bar, a tab titled
`IBN_Sina_Hospital_Dhanmondi` and the Windows taskbar in shot. **Crop to the viewport; redaction of
a header strip is not enough.**

## Facts that are NOT derivable from the repo

- The prospect's technologists are **radiographers running the scanner**, not radiologists. The
  existing Brochure/Dossier address someone who signs a report — wrong reader for the demo, right
  reader for the document that eventually circulates upward. The design carries that split.
- The deal is won by **a second live demo plus specific requested demo clips**, not paperwork. The
  circulated document comes only once every technologist ask is satisfied.
- The *vascular-only, no cardiac/calcium/PET/DTI* rule is a **positioning choice for this
  customer**, not liability. Maidul intends to pitch those to specific doctors later. So the
  internal bank is unfiltered; only outward material stays vascular.
- He resells **Pro**, has a working DICOM printer, and can freely screen-record his install.
- **"Analyzed Answer" is his term** for the atom (I proposed "Demo Answer").
- He works **one video at a time, never in batches** — this is also recorded in `CLAUDE.md` about
  the practice track, and I designed batches against it once before being corrected. Do not
  reintroduce batch mode. See [[inobitec-scope-loop]].

## THE most important lesson: the video is the WEAKEST evidence source

Maidul's correction, 2026-08-01, and it reshaped the contract. **Most of what a video cannot show is
already documented in this workspace.** Order of authority: `Practise_Resoucres/Part*/` and
`Video_Case_Practice/` (what actually happened when *he* ran it) → `CAPABILITIES.md` → the
`Manual/` chapters (which ship **figures of the very dialogs that are illegible in frames**) → the
frames themselves.

Worked example: the bone-removal card recorded trigger control, dialog contents and reversibility as
`unknown`. All three were in the Manual, including `fig3.16-bone-remove-parameters-dialog.png`. It
also said `runnable-unrehearsed` when a full as-run report existed. And the record held what no video
could — **the vendor's documented defaults (700 HU / 3 voxels) removed NO bone on E1082977 Arterial;
500 HU / 30 voxels was required.** That one line is worth more in a live demo than the whole video.

**`unknown` now means "not in the frames AND not in the record."** Never send Maidul to go find
something manually before searching the record — that mistake was made once and wasted his time.

## Own-recording: now a 3rd source category (added 2026-08-01), NOT the same as vendor footage

Maidul pointed at `D:\Inobitec_Video_Repo\Inobitec_processed_Clips\Inobitec_Clip_Process\` (8 edited
practice clips, protocol-named, 30s–3min each) and asked for the same Answer Bank treatment as the
vendor corpus. This is **distinct from** `Inobitec_Raw_Practise_Clips\` (the untouched OBS captures)
but same underlying risk: **real IBN Sina patient data**, confirmed by him directly (not vendor
de-identified footage). Registered as `"category": "own-recording"` in `manifest.json`
(`sourcePath` + `"phi": true` fields, no `youtubeId`), documented in `README.md` §3b, sized by
`plan_video.py` same as Action Demo (frames-first default, narration unconfirmed per clip). **A PHI
Gate (README.md §8 rule 0a) is mandatory before any frame from this category is curated into
`Answers/.../images/`** — the first run correctly caught and withheld a frame showing a real patient
worklist (names, MRNs, DOBs).

**Important nuance vs. what I predicted earlier:** own-recording footage does **not** automatically
become shippable Deliverable D material just because it's his own screen. It's unredacted real
patient footage sourced as **evidence**, same role as vendor Action Demos — it only becomes
shippable once deliberately re-purposed and run through `redact_figures.py`, same as any other
footage. Don't conflate "his own screen" with "safe to ship" again.

**Only 1 of 8 own-recording clips processed as of 2026-08-01** (`own-cta-nv-bone-removal` —
absorbed as corroborating evidence for the existing `hide-bones-from-3d` card, no new card). 7
remain unprocessed. This pool is **deliberately not in `WORKLIST.md`** (that file stays scoped to
the vendor Action Demo corpus by design) — use `plan_video.py "own-<fragment>"` to size the rest,
and he picks the next one, same one-video-at-a-time rule as everything else here.

## The two failures this pipeline has already had — read before trusting a run

1. **Batch run, rejected outright.** Wrote cards for videos whose frames were never extracted, with
   invented statistics (*"10% of cases"*, *"95%+ of branches"*) and two citations to
   `CAPABILITIES.md` headings that do not exist. Caught because `manifest.json` was untouched.
2. **First accepted card, corrected on review.** Process was sound (frames real, manifest honest)
   but **three of four evidence frames were mislabelled** — two named `after-bone-removal` showed an
   intact rib cage, inverting the before/after pair. Also marked the version `unknown` when the
   title bar reads `2.4.0.6606` plainly, invented "portal phase", and leaked inferred mechanism into
   an objection response.

**The lesson that transfers:** the bookkeeping is now trustworthy — nothing is marked done that
isn't on disk. **The perception is not.** Every card needs a frame-level review (open the images,
check labels against content, cross-check version/preset/protocol which are burned into every frame)
before it goes near a customer. That check is now step 3 of the skill. Same failure *shape* as
[[slicer-knowledge-base]], and the integrity rules were inherited from it.

## Third failure mode found across the 2026-08-01 full-worklist run: wrong capability cited

Across videos 2–18, nearly every card had **at least one** defect on frame-level review — wrong/
truncated version numbers were the most common (7+ cards in a row at one point), but the most
consequential was **citing the wrong tool entirely**: a card described a dialog as "Automatic Vessel
Segmentation" when its exact on-screen fields (`Min density`/`Max density`/`Min depth`/`Max basins`/
`Use structure markers`) only matched `CAPABILITIES.md`'s **Watershed Segmentation** entry — the two
capabilities have completely non-overlapping parameter sets. This is worse than a wrong number: it
would send someone hunting for the wrong menu item live in front of a customer. **Always cross-check
a dialog's exact field names against `CAPABILITIES.md` before citing a capability** — don't infer the
tool from the video's title or the anatomical domain.

Other recurring shapes: (a) calling a genuinely legible structures-panel "not legible" (happened
twice) — verify before hedging, don't hedge reflexively; (b) the inverse — asserting a semantic
label (e.g. "ventricles") for a colored structure with no on-screen name confirming it; (c) a final
3D render not actually showing what its caption claims (a structure present in the panel but toggled
invisible in that particular frame); (d) sanity-check every structure volume against the base volume
— one card had a sub-structure reported *larger* than the whole.

## Fourth failure mode: agent wrote into the user-only `My comments` field

First own-recording run (`own-cta-nv-bone-removal`, 2026-08-01) found genuine corroborating evidence
for an existing card, then filed it **inside that card's empty `My comments` section** — a field the
agent's own contract calls user-authored and says never to blank/reword/move. The contract's wording
only covered *altering existing* content, not *adding new* content to an empty section, so the agent
found a loophole its instructions didn't close. Caught on verification (I check every run before
relaying, per skill step 3 — this is why that step exists), fixed by moving the note to the card's
`Proof` section and restoring `My comments` to empty, and closed the gap in
`.claude/agents/inobitec-sales-analyst.md` rule 2 so it can't recur. **Lesson: sticky-field rules
need to explicitly forbid both edit-in-place and fresh-write, not just the former** — the same
pattern likely applies to `My comments` in the Inobitec/Slicer knowledge-base catalogs too, worth
checking next time either of those is touched.

## Fifth failure mode: corroboration recorded in manifest.json but not written into the card

One own-recording run (`own-cta-nv-analysis`, 2026-08-01) absorbed a segment with a full
corroboration rationale in `manifest.json`'s `absorptionReason`, but never added the matching
`Proof` bullet to the card it was supposedly corroborating — leaving the finding invisible to
anyone who reads the card instead of the manifest (which is everyone in a live sales conversation).
Caught on verification, fixed by adding the bullet manually, and closed in the agent contract
(rule 2 area): if `manifest.json` says a segment corroborates card X, card X's `Proof` section must
carry the same finding, every time — not sometimes. **Two of eight own-recording runs violated a
"write it into the actual card" expectation in some form** (this one, plus the `My comments` one) —
worth treating "does the enrichment actually land on the card, not just in bookkeeping" as its own
verification step going forward, not an assumption.

## Absorption policy proved sound (the "montage" videos)

The last 6 videos of the 24-video worklist (coronary arteries, a testimonial reel, a feature-icon
montage, and three "new features in version X.Y" round-ups) were short (<2.5 min) videos that either
showed no working UI at all or re-demonstrated an already-catalogued capability. **Correctly
absorbing these with zero new cards — rather than padding out shallow entries — was the right call
every time**, confirmed by cross-checking each absorption reason against `CAPABILITIES.md` directly.
One version round-up (2.13) *did* contain a genuine gap (a Report Editor with company-branding
support) and correctly got both a full card and a Feature Insight — so the policy isn't "montages
never get cards," it's "judge each capability on its own evidence, every time." **Printing is no
longer a total catalog gap** — the Report Editor Feature Insight (`report-editor-feature.md`) covers
report generation specifically, distinct from the pre-existing print-layout capability.

## Standing rules

- **Vendor footage: audience-dependent since 2026-08-01, no longer an absolute ban.** Every frame
  carries `Inobitec DICOM Viewer Professional Edition` in the title bar, so it is still never shown
  to a prospect held under white-label positioning. But **the live reseller deal's customer already
  knows the vendor** (Maidul, 2026-08-01: *"There is no problem to show the Inobitec footage. The
  customer already knows about this"*) — so for them, vendor footage is **shippable**, and the 5.8 h
  corpus is a source, not just a storyboard. Scoped in `Inobitec/docs/adr/0006-*`; ADR-0005 marked
  `accepted — scoped by ADR-0006`. **Client_Facing_Docs stays white-label, unchanged.** Captions
  still say *"the post-processing software"* so own-footage clips stay reusable elsewhere — see
  [[marketing-caption-voice]].
- **20 minutes of video per dispatch**, read set ≤90 frames. `tools/plan_video.py` sizes any video
  and emits ranged commands for the long ones. All 24 Action Demos are single-dispatch; the 5
  Reference Sessions (4.5 h) must be ranged.
- **Analyzed Answers are the sole per-video output.** Feature Insights only for genuine
  `CAPABILITIES.md` gaps — ~85% is already covered, but **Printing has no entry at all**.

**Why:** without this, a future session sees an unfiltered cardiac/liver/brain bank next to a
vascular-only Dossier and "corrects" it, ships a vendor-branded frame, or trusts an agent report
that reads clean and isn't.
