---
name: dental-cbct-project
description: "Ibn Sina dental CBCT project — own repo D:\\dh-pacs-dental, Dedicated Instance at ibnsina.dhsolutions.com.bd; design + security grilled to completion 2026-09-27, ready to build, nothing built"
metadata:
  node_type: memory
  type: project
  originSessionId: 617f85e1-ad3f-437d-bf93-70fed61103f7
  modified: 2026-09-27T16:47:01.564Z
---

Ibn Sina Cancer Diagnostic Center's **dental department** (one combined CBCT/OPG unit) ordered a
per-patient storage service: 150 BDT per Patient Subscription (24 months), paid monthly. Growth
target: reach as many outside **Referring Dentists** as possible.

**It lives in `D:\dh-pacs-dental`**, never in `d:\IBNSinaPacs`. As of 2026-09-27 night the design
is **complete and ready to build, with nothing built**: ADRs 0001–0019, `docs/DELIVERY_PLAN.md`
(MVP on day 4, v2 on day 8, handover), `docs/SECURITY_REGISTER.md`, and
`docs/AS_BUILT_AUDIT_BEFORE_IMPLEMENTATION.md`. Read that repo's `CLAUDE.md` first; it has the
reading order.

**"Level 2" (a separate dental backend, Central unchanged) was superseded by its ADR 0012.**
Central owns data and access rules as default-off capabilities; the dental repo owns the Dental
Console, Billing Service, printouts and deployment.

**Why a separate repo and instance:** this Customer's patient data and billing must never mix with
Shared Central's (`pacs.dhsolutions.com.bd`). One Dedicated Instance per Customer, each with its own
hostname.

**How to apply:** don't add dental work to this worklist repo (ADR 0009 scope). A security notes
file the user created at `docs/ibnsinadentalPacs/` here was moved to the dental repo on
2026-09-27. Never route CBCT studies through SITE007's Receiver or MT Portal. Building starts only
on the user's explicit instruction ([[no_building_during_design]]); before building, re-verify the
as-built audit ([[verify_as_built_before_implementing]]). Related: [[repo_identity]],
[[working_style]], [[shared_central_security_exposures]].
