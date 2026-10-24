---
name: system-design-curriculum
description: "Roadmap, progress tracking, and module overview for the System Design learning track"
metadata:
  node_type: memory
  type: project
  modified: 2026-10-25T03:28:00.000Z
aliases: [system_design_curriculum]
---

# System Design Curriculum & Progress

The project repository (`D:\System_Design`) hosts a full system design learning track. Knowledge is extracted directly from high-quality video courses and compiled into comprehensive reference documents in `lesson-output/`.

## Progress Overview

| Module | Lesson ID | Topic | Status | Output Document |
|---|---|---|---|---|
| **01. Fundamentals** | Lesson 01 | System Design Introduction & Principles | Available in `Course_Video/SD_1_...mp4` | Pending synthesis |
| **01. Fundamentals** | Lesson 02 | Functional vs Non-Functional Requirements | Available in `Course_Video/SD_2_...mp4` | Pending synthesis |
| **01. Fundamentals** | Lesson 03 | Latency vs. Throughput — Numbers Every Engineer Must Know | ✅ **Completed** | `lesson-output/03_Latency_and_Throughput_Deep_Dive.md` |
| **01. Fundamentals** | Lesson 04 | Availability, SLA, SLO & "The Nines" | ✅ **Completed** | `lesson-output/04_Availability_SLA_SLO_Deep_Dive.md` |
| **01. Fundamentals** | Lesson 05 | Scalability: Vertical vs Horizontal Scaling | ✅ **Completed** | `lesson-output/05_Scalability_Vertical_vs_Horizontal_Deep_Dive.md` |
| **01. Fundamentals** | Lesson 06 | CAP Theorem & PACELC Theorem | Upcoming | Queued |
| **02. Networking & APIs** | — | OSI Model, TCP vs UDP, HTTP/2 & HTTP/3, WebSockets, gRPC | Upcoming | Queued |
| **03. Load Balancing** | — | L4 vs L7 Load Balancers, Consistent Hashing | Upcoming | Queued |
| **04. Caching** | — | Cache Invalidation, Eviction (LRU/LFU), Cache Aside, Write-Through | Upcoming | Queued |
| **05. Storage & Databases**| — | SQL vs NoSQL, Sharding, Replication, ACID vs BASE, B-Trees vs LSM Trees | Upcoming | Queued |
| **06. Async Processing**| — | Message Queues, Kafka/RabbitMQ, Event-Driven Architecture | Upcoming | Queued |
| **07. Distributed Systems**| — | Consensus (Raft/Paxos), Distributed Locks, Sagas | Upcoming | Queued |

## Standards for Every Lesson

1. **Exhaustive coverage**: Zero skipped concepts, zero hand-waving.
2. **Visual continuity**: High-resolution screenshots of every slide and diagram stored in `lesson-output/images/<Lesson_ID>/`.
3. **Dual mental models**: Physical real-world analogies coupled with formal software definitions.
4. **Actionable diagnostics**: Profiling tools (waterfall, DevTools, metrics).
5. **Trade-off emphasis**: Every architectural pattern highlights both gains and costs.
