---
use_when: Architecting for traffic growth, choosing between scaling up vs scaling out, or refactoring stateful services for horizontal scalability.
write_up: D:\System_Design\lesson-output\05_Scalability_Vertical_vs_Horizontal_Deep_Dive.md
---

# Lesson 05: Scalability — Vertical vs. Horizontal Scaling

## Rules

1. **Vertical scaling hits silicon limits and concentrates failure**
   Scaling up incurs non-linear hardware cost premiums and terminates at physical machine limits. A single giant server remains a catastrophic single point of failure that causes total system downtime if it crashes.

2. **Statelessness is the prerequisite for horizontal scale-out**
   Application servers must never store user sessions, carts, or temporary uploads in local instance memory or disk. Externalize state to centralized shared stores (e.g., Redis, object storage) to enable seamless routing.

3. **Reject sticky sessions as a permanent architecture**
   Session affinity at the load balancer creates load hotspots and drops user sessions when instances terminate or scale down. Treat sticky sessions strictly as a temporary migration patch, not a long-term design.

4. **Follow the staged database scaling hierarchy**
   Scale stateless application compute horizontally first, scale the primary database vertically second, separate reads via read replicas third, and partition/shard data only as a last resort.

5. **Prevent database connection exhaustion under auto-scaling**
   Multiplying application nodes under traffic surges can overwhelm database connection limits. Deploy a centralized connection pooler between the auto-scaling compute fleet and the persistent database.

## Lesson Write-Up

Lesson write-up: D:\System_Design\lesson-output\05_Scalability_Vertical_vs_Horizontal_Deep_Dive.md
