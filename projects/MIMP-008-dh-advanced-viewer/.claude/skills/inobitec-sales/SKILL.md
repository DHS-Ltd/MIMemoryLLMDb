---
name: inobitec-sales
description: Process ONE Inobitec video (or one time-range of a long one) into Analyzed Answers in the Sales Enablement Answer Bank. The user points at the video; this skill sizes it first, then dispatches the inobitec-sales-analyst subagent. Trigger with /inobitec-sales <video>, or when the user names an Inobitec video and wants sales answers, demo scripts, or clip storyboards from it.
---

# /inobitec-sales — process one video the user points at

**The user drives. You process exactly what they name — one video, or one time-range of a long
one — and nothing else.** There is no batch mode. The user chooses the next video because they know
what the prospect is about to ask; this skill's job is to make each pass safe and honest.

Heavy frame reading goes to the `inobitec-sales-analyst` subagent, in its own context. You size,
dispatch, verify, relay. **You never read frames yourself.**

Full design: `Inobitec/Sales_Enablement/README.md` · master index: `ANSWER-BANK.md`.

## When to use

- The user typed `/inobitec-sales <something>`.
- The user names an Inobitec video and wants the answers, a demo script, or a clip storyboard from it.
- **Do not** trigger for 3D Slicer / DHDicomAnalyzer work, or for `/inobitec-catalog` ingestion.

---

## Step 1 — resolve and size the target (always, before dispatching)

Never dispatch blind. Run the preflight:

```bash
python Inobitec/Sales_Enablement/tools/plan_video.py "<fragment of the name>"
```

It matches on any fragment of the video name and prints category, duration, whether captions exist,
the dense-frame count, the estimated read-set size, a **SAFE / SPLIT REQUIRED** verdict, and — when a
split is needed — the exact ranged commands to run.

- **No target named?** Run `--pending` and show the user what is left, shortest first. Ask which.
  Never pick for them.
- **`SPLIT REQUIRED`?** Show the proposed ranges and **stop.** Let the user choose which range to
  run now. Never silently process a slice they did not ask for, and never try the whole thing anyway.
- **Already partly done?** The preflight prints pending segments. Offer those first.

The cap is **20 minutes of video per dispatch**, with the read set held at or under ~90 frames. This
exists because the first attempt at a 58-minute session produced a 409-frame read set and fabricated
content rather than admitting it was over budget.

## Step 2 — dispatch one agent for one target

Use `subagent_type: "inobitec-sales-analyst"`, foreground. Tell the user extraction takes a minute or
two before reading starts, so it does not look hung.

> "Process **one** video into the Sales Enablement Answer Bank: `<video key>`
> [`--from <t>` `--to <t>` if ranged]. Do not touch any other video.
> Follow your operating contract exactly, including the **Evidence Gate**. Extract frames, build the
> `_read/` set within the cap, read it (transcript first if captions exist), and only then write
> cards into `Answers/<Domain>/` with rows in `ANSWER-BANK.md`. Record what you covered as segments
> in `manifest.json`. Apply the write-back assertion before marking any segment done. Preserve every
> `My comments` verbatim. Report what you actually read versus what you wrote."

Pass along anything the user said about why they want this video — if a prospect asked a specific
question, the agent should aim the cards at it.

## Step 3 — verify before relaying (do not skip this)

**The agent's report is a claim, not evidence.** A previous run reported "3 cards drafted, on track"
when it had extracted frames for one of seven videos, cited zero images, invented statistics, and
referenced two capability entries that do not exist. Check:

```bash
# cards exist, and cite images that exist
find Inobitec/Sales_Enablement/Answers -name '*.md' -newer Inobitec/Sales_Enablement/README.md
# every capability citation resolves to a real heading
grep '^### ' Inobitec/Knowledge_Base/CAPABILITIES.md
```

Then confirm: every new card has a row in `ANSWER-BANK.md` · every row has a card · counts match
`manifest.json` · segments the agent claims it covered are recorded · `CHANGELOG.md` was appended.

**Then open every curated frame the card cites and check the label against the image.** This is the
one check that cannot be done from the filesystem, and it is where the first accepted card failed:
two frames named `after-bone-removal` showed an intact rib cage, so the card's before/after pair —
the only part a customer would ever see — was inverted. It is usually 3–5 images; read them.

While the frames are open, cross-check the three things burned into every one of them: the
**version** (title bar), the **preset** (top-right) and the **protocol** (bottom-left). If the card
says `unknown` for any of these and the frame shows it plainly, the agent did not look.

**Reject the run** — quarantine to `Answers/_rejected-<date>/`, revert the bank, log it — if you find
invented statistics, inference stated as fact in a `Say this` or `Objection` field, a citation to a
capability heading that does not exist, or a card for content the agent never read.

## Step 4 — relay, briefly

Cards added · what was read versus written · catalog gaps · anything the agent flagged as unknown.
Do not paste frames or whole cards back.

**Surface prominently:**
- **Catalog gaps** — remind the user to run `/inobitec-catalog`; this skill deliberately does not ingest.
- **Anything left pending** on a ranged video, and the command to continue.
- **Fields marked unknown** — these are the honest gaps and the user often knows the answer.

Then point them at their part: `My comments` is theirs, and so is `Demo readiness` — the agent may
only mark `rehearsed` with evidence the user actually ran it, so cards arrive conservative on purpose.

---

## Guardrails

- **No vendor frame ever reaches a customer.** Every frame carries Inobitec branding in its title
  bar; the archive is a storyboard for the user's own re-recording
  ([ADR-0005](../../../Inobitec/docs/adr/0005-vendor-frames-are-a-storyboard-never-shippable.md)).
- **Fewer, solid cards beat more, padded ones.** If the agent returns three well-evidenced cards
  where you expected five, that is the contract working. Do not ask it to fill the gap.
- **Preserve `My comments`.** If the report says one could not be preserved, the run is not clean.
- **Internal only.** Cards hold timings, stage risks and demo readiness that must never appear in
  writing to a customer. Outward material re-applies the vascular-only rule, never names the vendor,
  and says *"Advanced DICOM Image Viewer"*.

## Suggested order (a reading list, not a run unit)

The user picks. If they ask what to do next, suggest by value — but the short videos are also the
safest, so there is rarely a reason not to start there:

1. **Vessel and bone action demos** (1–6 min each) — proven ground, the lineage of the demo that
   already landed
2. **Image printing** (5 min) — closes the one confirmed `CAPABILITIES.md` hole, and printing is a
   radiographer's job
3. **Organ segmentation** — liver, liver veins, heart, brain, knee
4. **The long sessions**, ranged — richest, but always split

## After the bank: derived deliverables

Once cards exist these need no new analysis — say so if asked:

- **Demo run sheets** — sequence the `Demo readiness` and `Stage risk` fields
- **Requested demo clips** — follow each card's `Reproduce as` shot list, record on IBN Sina data,
  redact via `Client_Facing_Docs/tools/redact_figures.py`, caption under `Client_Facing_Clips` rules
- **The circulated capability document** — when `Questions-Asked-Log.md` has no open misses
