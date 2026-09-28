---
name: project-purpose
description: The real driver of the Isotope_Research_Cyclotron project — selling a Sumitomo CYPRIS cyclotron; includes the corrected HM (proton-only) vs MP (multi-particle) fact
metadata: 
  node_type: memory
  type: project
  originSessionId: 0a2f3aa2-2865-4ac7-aa24-4ff624892a39
---

The `Isotope_Research_Cyclotron` project's true commercial purpose is to **sell a Sumitomo
CYPRIS cyclotron**. This surfaced only late (2026-06-10) when the user said "Sumitomo Cypris HM 30
MPS alpha is our target machine which we are trying to sell."

**Machine characterisation corrected 2026-08-29 — the original note here was wrong.** **HM = H-minus
(proton only); MP = multi-particle.** The HM-30 is **not** multi-particle and **not** alpha-capable:
alpha needs a second ion source and a second extraction system (electrostatic deflector, not a
stripping foil) and **cannot be retrofitted**. Treat "HM-30 alpha" anywhere in this repo as an error
to fix, not a spec to preserve. On the TMSS line the configuration resolved (2026-09-22) to **two
machines — an HM-20-class proton/deuteron accelerator plus a TR-ALPHA-class dedicated alpha
irradiator**; see [[tmss-cyclotron-sale]].

The research reports are sales/positioning vehicles built around that machine:
- `Theranostics_Advantages_Report.md` — investor advantages brief (theranostics is a big opportunity).
- `Theranostics_Bangladesh_Feasibility_Brief.md` — go-framed feasibility case for a Bangladesh
  national theranostics + isotope-production hub; the HM-30 is the target cyclotron, justified
  because ²¹¹At (7.2 h half-life) cannot be imported and must be produced locally.

**Why:** every framing choice (frontier-led alpha positioning, "full vertical build", the cyclotron
as the linchpin) ultimately serves making the case for buying this specific machine.
**How to apply:** keep the Sumitomo cyclotron central and the alpha-production logic intact, but
**do not attribute alpha capability to an HM-class machine**. Peer-reviewed At-211 work cites the
Sumitomo CYPRIS **MP-30** — a genuinely multi-particle machine — so don't claim an HM-30 was the
machine in those papers, and don't claim the HM-30 can do what it did. See
[[reports-evidence-discipline]].
