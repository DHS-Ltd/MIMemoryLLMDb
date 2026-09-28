---
name: at211-technical-context
description: "Fourth context in the repo, Astatine_211_radionuclide/, is treatment/technical only with the commercial angle explicitly excluded."
metadata: 
  node_type: memory
  type: project
  originSessionId: b2d93a6b-b682-42a9-b3a7-53829a0a09a0
  modified: 2026-08-29T12:38:18.602Z
---

`Astatine_211_radionuclide/` (added 2026-08-29) is the fourth context in this repo and the only
**non-commercial** one. The user asked explicitly to stay on treatment and technical ground and
keep the sales angle out, which distinguishes it from [[project-purpose]], [[bmu-ppp-proposal]]
and [[tmss-cyclotron-sale]].

Two findings from that work that are easy to get wrong again:

- **There is no At-211 liver cancer.** No hepatocellular carcinoma work exists at any evidence
  level. What does exist is two mouse studies of At-211-trastuzumab against HER2-positive
  **gastric cancer metastatic to the liver**. The "liver" idea in this repo leaks in from the
  Y-90 radioembolization half of `InputDocs/`, which is a different delivery physics entirely.
- **At-211 is not a strict theranostic pair**, contrary to how the root `CONTEXT.md` glossary
  frames alpha isotopes generally. It has no chelator, so Ga-68 cannot be substituted onto its
  agents, and its only imaging emission is faint 77 to 92 keV polonium K X-rays, gamma-camera
  visible but not PET.

Conventions the user set for these documents, which differ from the other contexts:
isotopes written as `At-211` not Unicode superscripts (for clean .docx export), **no em dashes
anywhere**, and .docx copies generated into `Astatine_211_radionuclide/docx/` for a manager to
read. See [[reports-evidence-discipline]] for the evidence-lane rule, which still applies.
