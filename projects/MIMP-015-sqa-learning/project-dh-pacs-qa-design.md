---
name: project-dh-pacs-qa-design
description: "SQA course applied to DH PACS (settled 2026-09-25): each lecture becomes an Applied Lecture grill where Maidul is tested on his own product; output goes to the DH PACS Test Plan in Notion"
metadata:
  node_type: memory
  type: project
  originSessionId: e9a29732-3280-4d4e-8acb-4e575c271c1b
  modified: 2026-09-24T23:58:39.151Z
---

Settled in a /grill-with-docs session 2026-09-25. Glossary: `E:\Self_project\SQA_Learning\dhPacsSQADesign\CONTEXT.md`. Read it before any Applied Lecture.

**Purpose:** learning is the goal; the real DH PACS is the medium. Output is real QA, true of the real system. Not a sales asset; Ibn Sina's "no free implementation before work order" still applies.

**Notion (automation's token in `Course_Content_Automation/.env` reaches it):**
- `SQA Learning` page `3e483bab-0289-801f-8e57-eb45ffc40e02` holds:
  - the `SQA Learning Hub` lecture DB `3e483bab-0289-80f8-adc1-ee0d799f8584` (title prop is `Name`, not `Title`)
  - the `DH PACS Test Plan` page `3e583bab-0289-8196-8e0b-fbdfd1b91bdd`
- The plan has Ground Rules at the top and the Verification List at the foot. Insert sections before the divider using the `after` param.
- Test Cases DB is created lazily at lecture #34; Bug Reports DB at #35.

**Loop (option C):** a lecture lands in the Hub → grill: Claude asks the technique as questions about DH PACS → Maidul answers → Claude challenges and fact-checks → Claude writes via the API. Never generate content without his answer.

**Definition of Done:**
1. A `§N <Topic>` section in the plan, @-linking its lecture.
2. Every claim tagged `[memory]` or `[code: file:line]`; every `[memory]` claim also goes to the Verification List.
3. Artifacts created in their DBs, where the lecture calls for them.
4. Guardrail check passed.
5. A "Tested on DH PACS" block appended to the lecture's own Hub page, recording held and corrected answers.

**Guardrails:** no PHI in Notion (scrub memory-sourced names, IDs and tokens; use synthetic data like TEST^PATIENT). Production is read-only for learning; write tests are marked "Blocked: no test environment". What the test environment *should* be is Maidul's answer at lecture #29; don't pre-decide it.

**System Under Test (agreed, evolves):**
- In scope: ingest (modality → workstation → Tailscale → central), merge (study + Doctor Reports), deliver (Patient Link, Doctor Dashboard, Centre Console), both seams into DHV, and the DHS Admin Panel.
- Out of scope: orchestrate/Finding Request, DHV rendering internals, the Ibn Sina federated system, the website.
- Centre Console is read as the MT portal, an assumption until verified.
- This table seeds the #28 Scope grill; still test him on assumptions and constraints there.

**Applied Lecture mode:** don't show the answer before he answers. He asked for "guide me" hints once, and it worked: clue → name it.

**State 2026-09-25:**
- **#27 done.** §1 Objectives is written: primary = Risk Mitigation, the Integrity Floor, AR-1 (mis-association) and AR-2 (guessable DHP-ID credential), both accepted until the Production Deal. Hardest = Requirements Verification; a Requirements Baseline is to be written. V1–V6 are on the Verification List. The Tested block is on lecture #27's page.
- **Next: #28 Scope.**
- **Flagged, undecided:** a live JWT_SECRET and the Postgres password sit in plain text in MIMP-006 memory. He hasn't said whether to track it. Keep it out of Notion.
- Plan page created 2026-09-25. Lectures #27–29 are in the Hub; #30–51 are downloaded, not synced. The code lives on MachineB (`D:\Pacs_Viewer_Storage_Project`), not this machine; PACS facts come from mmp-memory MIMP-006. Build a `/apply-lecture` skill only after 2–3 hand-run loops.
