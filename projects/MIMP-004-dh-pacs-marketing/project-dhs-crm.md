---
name: project-dhs-crm
description: "DHS CRM design settled 2026-08-06 — Notion store, Cloudflare Worker nag, Account+Contact model; read before any CRM build or schema work"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0af12712-f8f3-49c9-b187-b0d176d3b68c
  modified: 2026-08-08T17:02:05.754Z
---

CRM design fully settled in a grill session on 2026-08-06. Doctrine at `docs/CRM/CONTEXT.md` + `docs/CRM/BUILD_PLAN.md`; decisions in [ADR-0003](e:/DHS-PACS/docs/adr/0003-crm-lives-in-three-layers.md) and [ADR-0004](e:/DHS-PACS/docs/adr/0004-crm-holds-case-shape-not-case-identity.md).

**The load-bearing choices, with the reasoning that is easy to lose:**

- **Account + Contact, linked.** Surgeons never buy (free Doctor Dashboard) but fill the inbox; centres buy but are quiet. A single "lead" object would park a surgeon in a pipeline he can never close. The `Contact —Refers To→ Account` edge *is* the catchment strategy in record form.
- **"Lead" is retired** as ambiguous. Canonical: Account, Contact, Opportunity.
- **The job is the nag, not monitoring.** Dashboards you must remember to visit die; the Calendar_Sync_Bot survives because it interrupts at 8am. Silence = nothing due, and silence is information.
- **Brand Separation is a publishing rule, not a data rule** — one book, with the wall enforced on the Next Action field (a Surgeon Contact's next action may never be a pitch).
- **Notion store · Cloudflare Worker cron for the nag · local Python bot for capture.** Supabase was rejected as primary store because it has no UI and building one competes with the six open website tasks. The nag is off-machine because it cannot tolerate downtime; capture is local because Telegram queues messages 24h.
- **GitHub Actions was rejected for the nag** — scheduled workflows are disabled after 60 days of repo inactivity, so a quiet CRM repo would fail *silently*.
- **Two Stage Sets, both ending past signature.** Standard ends at `Enrolling`, not signature, because Line 1 revenue is per enrolled patient — Cumilla is Connected but at ~11 patients/centre, i.e. live and commercially near-dead. Exit is `Dormant` + revisit date; there is deliberately no "Lost".
- **Second operator expected within ~6 months** → `Owner` (relationship, drives nag) and `Assigned To` (delivery step, inert) both ship from day one.
- **Phase gate: no capture bot until the Phase 1 nag has survived 3 weeks of real use** (~27 Aug 2026). The schema will move in month one; parsing against a moving schema wastes the work.

**Phase 1 LIVE as of 2026-08-06** at `E:\DHS-CRM\`. Dedicated Notion integration ("DHS CRM"), dedicated Telegram bot (`@dhs_crm_nag_bot`), Cloudflare Worker deployed to `dhs-crm-nag.directhospitalsolutionsltd.workers.dev` under the "DH Solutions Limited" Cloudflare account, cron `0 2 * * *` (08:00 Dhaka). End-to-end tested live via manual trigger: correctly found the seeded-overdue Popular Diagnostic record and delivered a real Telegram message.

Seeded: Ibn Sina (Enterprise, chain-level per the design — user confirmed "IBN Sina Dhanmondi" is just naming a centre within that one chain account, not a separate record), Popular Diagnostic Dhanmondi (Standard, deliberately overdue as the day-one proof), and only **2 of 5** Cumilla centres by real name (Cumilla Medical College Hospital, Cumilla CT Scan Point — user had only 2 confirmed real; the other 3 were dropped rather than fabricated, to be added the same way once named). The 7 Cumilla referring doctors and Popular's Owner/MD contact are still `RENAME` placeholders with `refers_to` deliberately left empty (not guessed) — inert, safe, awaiting real names.

**Build note:** current package versions are `@cloudflare/workers-types` **v5** and TypeScript **7** — v4/v5.x assumptions fail to install. Also hit a `wrangler login` OAuth failure ("No CSRF value... request_forbidden") — fixed by killing orphaned processes on the callback port (8976) and retrying in an Incognito window; likely a browser-extension/cookie issue on localhost, not a wrangler bug.

**CLAUDE.md written 2026-08-06** in both repos — `E:\DHS-CRM\CLAUDE.md` (operating instructions: commands, live deployment details, the gotchas hit during build) and a new CRM section added to `E:\DHS-PACS\CLAUDE.md` (pointer to doctrine + both ADRs + phase gate). `CONTEXT.md` in each stays the glossary; `CLAUDE.md` is the operating brief — division kept clean per the grill-with-docs convention.

**Amended 2026-08-08 — the Log ([ADR-0005](e:/DHS-PACS/docs/adr/0005-crm-interaction-history-lives-in-page-bodies.md)).** Two days of real use found the loop open at one end: `Next Action` is single-valued, so recording that a visit happened destroyed the note that prompted it. Surfaced on Pranto General Hospital (an Account the user added post-seed; Enterprise post-processing licence is the target).

- **Interaction history = an append-only `Log` in the Notion page body**, newest first, hand-written. Entry shape: `@date · was: <action discharged> ✓` / what happened / `→ next:`. The `was:` line is the point — it records the promise *and* whether it was kept.
- **A third `Interactions` database was rejected** on mobile capture friction (relation-picking every evening), not on correctness. Revisit when a second operator joins — cross-person activity is the first question a page-body Log cannot answer.
- **`Last Interaction` added to Accounts.** They had none; only Contacts did — an asymmetry nobody chose. Means *reached the other party*, never internal work: "I've been busy with it" must not buy silence. `Last edited time` was rejected as a free substitute for exactly this reason.
- **`Going Quiet`** (new term, weekly) vs **`Going Cold`** (daily): promise never made vs promise broken. Scope = every stage but `Dormant` — `Licence Signed` and `Enrolling` deliberately **included**, because Cumilla's ~11 patients/centre is a won account bleeding silently and a nag that stops at the finish line cannot see it.
- **The Going Quiet cron is designed but deliberately NOT built** — held at the 27 Aug gate because no record is old enough to satisfy a 14-day condition before ~22 Aug. Only the field shipped, since it cannot be backfilled. At the gate, ask "did the logging habit survive?" *before* building anything.

**Open question raised, not yet resolved:** Tier (deployment shape) and Revenue Line 2 (Advanced Post-Processing licence) are orthogonal, but neither Stage Set models Line 2 — so "Licence Signed" is ambiguous between the DHV workstation licence and the post-processing licence. Pranto is the first account where this bites.

**Open item:** `Marketing/Popular_Diagnostic/` violates ADR-0004 — patient name in two PDF filenames, bill no. in the proposal body. Not urgent (nothing in git), but clean before sharing or reusing as a template. Also flagged: the proposal names Prof. Altaf Hossain Sarker as the surgeon who waited — a relationship risk, not a compliance one.

See also [[project-dhs-brand-strategy]], [[commercial-content-hub-rule]], [[project-linkedin-surgeon-first]].
