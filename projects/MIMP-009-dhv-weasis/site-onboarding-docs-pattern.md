---
name: site-onboarding-docs-pattern
description: Per-site onboarding record pattern under 01_Pacs_File/docs/ — one folder per site (README + SITE_FACTS + dated event logs), started with Ibn Sina Bogura 2026-08-26, intended to be reused for future site onboarding sessions.
metadata:
  type: reference
  originSessionId: 23052427-87f8-4f68-9fe2-05606ad2bc93
  modified: 2026-08-25T19:13:08.421Z
---

The user wants a "memory lane" per site — durable, human-readable onboarding records that live in
the repo itself (not just in Claude's memory), so future sessions working on a *different* site can
follow the same shape without having to re-derive it, while each site's actual content stays
specific to that site's own constraints (his framing: "cohesive structure... every site has unique
requirements").

**Location:** `E:\DHV-Weasis\01_Pacs_File\01_Pacs_File\docs\<Site_Name>_System_Onboarding\`

**First instance:** `Ibn_Sina_System_Onboarding\`, built 2026-08-26 during the Bogura recovery —
see [[bogra-site-recovery-and-storage-overflow]] for the incident that produced it.

**Shape established (reuse the shape, not the content):**
- `README.md` — index, entry point, and an explicit "Open for the next session" section naming
  what must be preserved/not broken by future work at that site.
- `SITE_FACTS.md` — the current configuration of record: AET (including any divergence between the
  DH registration AET and the live modality-facing AET, and *why*), licence terms, storage layout,
  installed build, what was retired. Written to be corrected in place if it ever disagrees with
  what the box actually reports — a record, not a spec.
- Dated event files (`YYYY-MM-DD_<what-happened>.md`) — one per incident/onboarding session, not
  edited after the fact; history accumulates rather than being overwritten.
- Any raw artifacts worth keeping (e.g. a `DhSiteId-<machine>.txt` machine-code reading) sit
  alongside, referenced from `README.md`.

**Distinct from, and does not replace:**
- `CONTEXT-MAP.md` / `orthanc/CONTEXT.md` / `portal/CONTEXT.md` — those are domain glossaries, kept
  free of site-specific or implementation detail. Site facts never belong there.
- `docs/adr/` — architectural decisions that apply to the *product*. A site-specific exception
  (like Bogura's perpetual licence, ADR-0021) still gets its own ADR when it meets the bar
  (hard to reverse, surprising, a real trade-off), cross-referenced from that site's `SITE_FACTS.md`
  rather than duplicated into it.
- The still-unsettled central Site Register (`06_CONNECT_A_NEW_CUSTOMER.md` Stage 7's "Open
  decision (L5 §3)") — this per-site folder pattern is a candidate answer to that open question but
  was not declared as the official answer; a future session should treat it as a strong precedent,
  not an already-ratified decision, unless the user says otherwise.

**How to apply:** when onboarding or recovering a new site in a future session, create
`docs/<Site>_System_Onboarding/` following this shape before the session ends, the same way this
one did — don't let site-specific operational knowledge live only in chat memory.
