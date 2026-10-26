---
use_when: Diagnosing slow user-facing responses, optimizing request latency versus background batch throughput, or sizing server capacity headroom.
write_up: D:\System_Design\lesson-output\03_Latency_and_Throughput_Deep_Dive.md
---

# Lesson 03: Latency vs. Throughput

## Rules

1. **Differentiate latency from throughput**
   Adding servers scales capacity (throughput) but cannot accelerate an individual request stalled on slow database queries or synchronous external calls. Profile with waterfall diagrams first.

2. **Evaluate percentiles ($P_{50}, P_{95}, P_{99}$), never averages**
   Arithmetic means conceal tail latency. Tail latency compounds exponentially across multi-service calls; monitor and alert against high-percentile latency targets.

3. **Offload non-critical side effects asynchronously**
   Keep synchronous request-response paths lean. Push non-essential operations like email delivery, audit logging, and report generation into asynchronous queues.

4. **Reserve batching for background workloads**
   Batching amortizes connection and I/O overhead to maximize throughput, but increases latency for buffered items. Never batch on user-facing interactive paths.

5. **Maintain 30–50% server headroom**
   Queueing theory proves that as resource utilization approaches 100%, queue wait time hockey-sticks toward infinity. Trigger auto-scaling when utilization reaches 65–70%.

## Lesson Write-Up

Lesson write-up: D:\System_Design\lesson-output\03_Latency_and_Throughput_Deep_Dive.md
