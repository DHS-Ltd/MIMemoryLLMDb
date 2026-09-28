---
name: reports-evidence-discipline
description: Evidence-sourcing rules to follow when writing/editing the Isotope project reports
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0a2f3aa2-2865-4ac7-aa24-4ff624892a39
---

Both reports follow a strict evidence-boundary discipline the user expects maintained:

- **Clinical claims** come only from the 13-paper corpus in `InputDocs/` and are cited by **exact
  filename** (the user renamed the PDFs to descriptive titles specifically so references are
  traceable — e.g. `Astatine_211_First_human_Study.pdf`).
- **Market / regulatory / financial / engineering claims** come from **external web research**, each
  cited and dated in a sources appendix (e.g. [B1]–[B10], accessed 2026-06-10).
- Unverified items are labelled **[ASSUMPTION]** in an assumptions register, never presented as fact.
- Two file copies of the Nace 2011 Y-90 paper exist (`yttrium-90-radioembolization-for-colorectal-cancer-liver.pdf`
  + `Yttrium-90_Metastases_Institute_Experience.pdf`); the user wanted both cited separately though
  they are the same study.

**Why:** the reports support a real capital/sales decision; credibility depends on not blending
sourced fact, external data, and inference.
**How to apply:** keep these three evidence types visibly separate; flag accuracy nuances rather than
papering over them (see the MP-30 vs HM-30 caveat in [[project-purpose]]).
