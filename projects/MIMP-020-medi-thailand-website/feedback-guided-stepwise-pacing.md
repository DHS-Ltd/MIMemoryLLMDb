---
name: feedback-guided-stepwise-pacing
description: "For hands-on dashboard/manual work, give one step at a time and wait for confirmation before advancing"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f48f69dd-90d7-42cd-9385-5030ba8fbaf6
  modified: 2026-07-19T13:18:46.198Z
---

When walking the owner through hands-on manual steps (Cloudflare dashboard, registrar,
any UI they have to click through themselves), give **exactly one step at a time** and wait
for them to report back before giving the next one. If they get stuck or something looks
different from expected, solve that problem first before moving on to the next step.

**Why:** the owner is non-technical (see [[user-medi-thailand-owner]]) and explicitly asked
for this pacing (2026-07-19) while walking through the Cloudflare Pages project setup. Dumping
multiple steps at once risks them getting lost or making a mistake on a shared account that
also runs the unrelated PACS project (see [[feedback-cloudflare-guided-access]]).

**How to apply:** applies to any guided walkthrough of an external UI/dashboard — Cloudflare,
the domain registrar (hosting.com), Zoho admin, Brevo, etc. Does NOT apply to Claude's own
code/file work (editing, building, committing) — that can proceed at normal pace without
owner confirmation between each internal action.
