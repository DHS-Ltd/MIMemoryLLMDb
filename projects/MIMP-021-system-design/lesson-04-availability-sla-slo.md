---
use_when: Defining uptime targets, negotiating SLAs, setting error budgets, or calculating distributed dependency reliability.
write_up: D:\System_Design\lesson-output\04_Availability_SLA_SLO_Deep_Dive.md
---

# Lesson 04: Availability, SLA, SLO & "The Nines"

## Rules

1. **Acknowledge that 100% availability is an architectural myth**
   Hardware, networks, and dependencies eventually fail. Design systems to survive failure with redundancy, graceful degradation, and fault containment instead of impossible zero-downtime guarantees.

2. **Treat every added "Nine" as an order of magnitude**
   Moving from 99% (Two Nines, ~3.65 days annual downtime) to 99.9% (Three Nines, ~8.76 hours) requires a 10x reliability improvement and exponential infrastructure cost; align targets with actual business loss.

3. **Calculate series dependencies and decouple with parallel redundancy**
   Components in series multiply availabilities ($A_1 \times A_2$), making the chain less reliable than its weakest link. Place critical components in parallel ($1 - (1 - A)^2$) to eliminate single points of failure.

4. **Strictly enforce the SLA < SLO <= SLI hierarchy**
   Never set customer-facing contractual SLAs equal to internal engineering SLO targets. The gap provides an essential operational buffer to detect and remediate incidents before incurring financial penalties.

5. **Govern deployment velocity with an Error Budget**
   Treat allowable downtime ($100\% - \text{SLO}$) as a budget. Deploy features freely while budget remains; freeze releases and dedicate engineering exclusively to reliability when the budget is exhausted.

## Lesson Write-Up

Lesson write-up: D:\System_Design\lesson-output\04_Availability_SLA_SLO_Deep_Dive.md
