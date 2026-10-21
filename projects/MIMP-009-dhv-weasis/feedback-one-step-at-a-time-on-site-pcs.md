---
name: feedback-one-step-at-a-time-on-site-pcs
description: "When guiding the user through commands on a hospital/site PC (install, removal, diagnosis), give ONE step at a time and stay on it until it resolves."
metadata:
  node_type: memory
  type: feedback
  originSessionId: 39125933-4ebb-446d-b347-f94150cb65d7
  modified: 2026-10-21T14:39:44.876Z
---

When walking the user through anything done on a site PC (installs, uninstalls, hardware or service
diagnosis, verification), give exactly one step per message, wait for the pasted output, and stay on
that step until it is resolved before showing the next. Applies to all similar checks on this project.

**Why:** at IBN Sina CTG (2026-10-21) I sent a six-step block (disable service, uninstall x3, install,
verify) and the user asked for one step at a time. They are typing into a live PC in a hospital, often
with the machine flaky, and a long block is easy to mis-run or half-run.

**How to apply:** one command block + what output to expect + what each result means, then stop. Do not
preview later steps beyond one line. If a step fails, diagnose it before moving on. Related:
[[ibn-sina-ctg-site]], [[site-onboarding-docs-pattern]].
