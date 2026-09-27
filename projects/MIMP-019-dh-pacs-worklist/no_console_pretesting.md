---
name: no-console-pretesting
description: "Standing instruction: never propose diagnostic pre-tests of the GE console. Build dcm4chee-arc, cut over, and let the console drill be the test."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2d9a2089-479a-4d45-9f2e-b70a70dd279b
  modified: 2026-09-13T09:44:25.832Z
---

**Do not propose pre-tests, probes, or capture drills aimed at finding out whether the GE SIGNA
Hero console works, queries, or responds.** Not pktmon sniffs before a cutover, not "one cheap
Refresh test", not a control query. Build dcm4chee-arc, make the worklist answer, cut port 104
over, and let the console drill itself be the only test.

**Why:** the user has had to give this correction in *multiple* sessions. Every agent that reaches
the "but we have never captured a C-FIND-RQ from the console" fact treats it as an open question
worth resolving first, proposes a five-minute test, and burns the session on diagnostics instead
of the build. The user's position: three site sessions were already lost to exactly that, the
console's behaviour is not the deliverable, and the demo is the deliverable. The observation that
no C-FIND-RQ has been captured is **not an invitation to go capture one.**

**How to apply:** when that fact surfaces, note it and keep building. Diagnosis is legitimate only
*after* an acceptance step has actually failed — the L1 triage table in
`docs/demobuilder/ARC_WORKLIST_CUTOVER_RUNBOOK.md` is the sanctioned form, and it is read after a
blank screen, never before one. Related: [[grilling_plan]], [[dcm4chee_mwl_lab]],
[[working_style]].

**Two more standing decisions from 2026-09-13, same conversation:**

- ~~**Scope is worklist only.**~~ **REVERSED 2026-09-13 evening — see ADR 0005.** The decision was:
  copy arc's stock `WORKLIST` AE, not `DCM4CHEE`, so `DH_WORKLIST` carried no storage SOP classes;
  the GE's secondary push to 104 would fail, judged cosmetic because Sante keeps receiving.
  **The prediction was right about the mechanism and wrong about the blast radius.** The console's
  last association was a failed push (no DIMSE), after which it **stopped using the node for
  worklist too** and stayed silent for over an hour through two restarts. A refused presentation
  context is not cosmetic. **Check any AE a modality can reach against what it will SEND, not only
  what it will ASK.**
- **Orthanc's `DH-Worklist-Node` is Disabled, not parked on Manual** — it gives up 104 and 8043 and
  does not return at boot. `DH-PACS-Receiver`, `DH-PACS-Portal` and Sante are never touched, and
  the 117 instances in `D:\DHWorklist\Storage` stay exactly where they are.
