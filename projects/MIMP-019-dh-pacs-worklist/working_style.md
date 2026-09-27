---
name: working-style
description: "How this user wants design and investigation work done in the Ibn Sina PACS projects — probe the real machine, recommend rather than offer menus, minimum build"
metadata: 
  node_type: memory
  type: feedback
  modified: 2026-09-07T11:16:50.103Z
  originSessionId: 72f28569-2532-4d52-a83c-54dd220c66b0
---

During the 2026-09-07 grilling session the user consistently rewarded three behaviours and never pushed back on them:

1. **Probe the real machine instead of asking questions it can answer.** When asked for the GE modality's network details, the user's answer was *"please give me powershell code so that I can paste you back and then you can decide."* Four read-only PowerShell probes replaced a dozen interview questions and overturned several of my assumptions.
2. **Give a recommendation with every question, not a menu.** The user answered most questions with *"agree with the recommendations"* or *"do the recommendations for now"*. Options without a stated pick waste their turn.
3. **Minimum build, explicitly.** Stated goal: *"our goal is to get the deal with the minimum effort. don't plan on to build so much."* Scope-widening suggestions were unwelcome; every probe that let the design shrink was welcomed.

**Why:** the user is the principal of a small vendor selling into a hospital chain, and design sessions are in service of closing a deal, not of building the ideal system. Elegance loses to demonstrability and to not breaking anything already running at the customer site.

**How to apply:** lead with the finding, then the recommendation, then the question. When a fact about a customer machine is in doubt, write a read-only probe script rather than asking. State corrections plainly and move on — two of my probe scripts had bugs and one alarming claim was wrong; brief correction and continue was the right register. Related: [[repo_identity]], [[grilling_plan]].
