---
name: reference-dh-pacs-dental-companion
description: "dh-pacs-dental is a Dedicated Instance of THIS repo's own code (Ibn Sina dental), not a separate frontend — where its docs live and how its security spec couples to this repo's"
metadata:
  node_type: memory
  type: reference
  originSessionId: db88c2c6-3aeb-47db-be96-00b77fb33d53
  modified: 2026-09-29T05:55:04.235Z
---

`D:\dh-pacs-dental` is a separate repo/deployment, but it runs **this repo's own codebase** as one
hospital's Dedicated Instance rather than the shared multi-tenant one — unlike the Doctor Portal or
Worklist companion repos, which are genuinely different frontends calling this central's API.

Key docs on that side: `docs/build/CENTRAL_CHANGES_SPEC.md` (capability flags CC-01 onward, each
off by default so Shared Central's behavior is unchanged until a flag is set), `docs/SECURITY_REGISTER.md`
(S1–S10, the source findings), and its own `docs/adr/` — numbered independently from this repo's
`docs/adr/` (dental ADR N is not the same decision as this repo's ADR N).

**The coupling:** security/access hardening (role-bound tokens, per-study DICOMweb gate, etc.) is
built once on branches in *this* repo and serves both deployments as capability flags — see
[[project_security_api_exposure_remediation]]. Full detail lives in CLAUDE.md's "Companion project
— DH PACS Dental" section (added 2026-09-28); this memory is just the pointer so it surfaces without
having to re-read the whole file.

**2026-09-29 — caught and fixed real drift between the two docs, don't assume they're synced just
because both exist.** After this repo's Phase 3 (CC-02/CC-03, the per-study DICOMweb gate) went from
"designed" to "built, reviewed, bug-fixed, deployed, in shadow mode" in one session, dental's own
`CENTRAL_CHANGES_SPEC.md` was checked and found still describing CC-02/CC-03 in pure future tense
("Add...", "Change...") with no SHA at all — plus its existing CC-04 SHA reference (`8d628da`) had
already gone two commits stale (missing `76b77df` ADR 0028 and `96856d8`'s compose-wiring fix).
Corrected directly in `D:\dh-pacs-dental\docs\build\CENTRAL_CHANGES_SPEC.md`: the top "Built once"
note and the CC-02/CC-03 sections now say "Built", cite the real tip `ed74917` (not the pre-review-fix
`aeb96c8`/`3df752b`), and carry forward the 3 bugs that review found — most importantly, the
`extractUid()` crash bug (an unhandled `decodeURIComponent` exception, externally triggerable, kills
the whole backend container) mattered **more** for dental's plan than for Shared Central's: dental's
own design skips shadow mode and goes straight `off → on` at go-live (greenfield, no legacy QR
traffic to protect), so it would have had no soak period to catch this before a crash-prone gate went
live-enforcing on day one. **How to apply:** don't assume a spec pin is current just because a SHA is
present — check it against the actual branch tip (`git log --oneline <branch> -1` in this repo)
before either side's session treats "built" as "battle-tested."
