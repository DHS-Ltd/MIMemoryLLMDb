---
name: reference-dh-pacs-dental-companion
description: "dh-pacs-dental is a Dedicated Instance of THIS repo's own code (Ibn Sina dental), not a separate frontend — where its docs live and how its security spec couples to this repo's"
metadata:
  node_type: memory
  type: reference
  originSessionId: db88c2c6-3aeb-47db-be96-00b77fb33d53
  modified: 2026-09-28T12:33:49.326Z
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
