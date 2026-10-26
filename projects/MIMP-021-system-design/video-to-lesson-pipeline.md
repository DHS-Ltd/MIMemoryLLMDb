---
name: video-to-lesson-pipeline
description: "Standard operating procedure for transforming lecture videos into deep-dive study documents"
metadata:
  node_type: memory
  type: reference
  modified: 2026-10-26T16:12:00.000Z
aliases: [video_to_lesson_pipeline]
---

# Video-to-Lesson Knowledge Extraction Pipeline

This document defines the repeatable procedure for turning any video lecture in `Course_Video/` into a deep-dive Markdown lesson guide.

## Toolchain Components

1. **`watch` Skill**: Installed under `~/.gemini/config/plugins/claude-video/` and `~/.claude/plugins/marketplaces/claude-video/`.
   - Uses `ffmpeg` for frame extraction.
   - Patched for Windows UTF-8 stdout encoding (`cp1252` crash prevention).
2. **`ffmpeg`**: Winget Gyan.FFmpeg installed on Windows PATH.
3. **Multimodal Analysis**:
   - Audio extraction to MP3 for full spoken transcription and cultural analogy analysis.
   - Keyframe extraction at 1280px width for crystal-clear slide and graph text readability.

## Execution Steps

```
[MP4 Video in Course_Video/]
         │
         ├──► 1. Audio Track Extraction (ffmpeg -vn -acodec libmp3lame audio.mp3)
         │       └──► Listen & transcribe full lecture content & case studies
         │
         ├──► 2. Slide Boundary Mapping & Keyframe Extraction
         │       └──► Extract high-res PNGs to lesson-output/images/<Lesson_ID>/
         │
         ├──► 3. Markdown Synthesis
         │       └──► Compile lesson-output/<XX_Topic_Name>.md
         │
         └──► 4. Write the Lesson (lesson-NN-<slug>.md)
                 └──► Compact memory record; no studied key: it starts as not studied yet
```

1. **Audio Track Extraction**: Extract audio from video via `ffmpeg` and transcribe spoken lecture content.
2. **Slide Boundary Mapping & Keyframe Extraction**: Extract clear keyframes and diagrams into `lesson-output/images/<Lesson_ID>/`.
3. **Markdown Synthesis**: Compile full reference write-up into `lesson-output/<XX_Topic_Name>.md`.
4. **Write the Lesson (lesson-NN-<slug>.md), no studied key: it starts as not studied yet.**

## Structure Requirements for Generated Guides

- **Section 1: Executive Summary & Learning Objectives**: Core principles in 3 bullets.
- **Section 2: Motivating Case Study**: Real-world paradox or engineering scenario.
- **Section 3: Physical Mental Models**: Relatable everyday analogies (kitchen, traffic).
- **Section 4: Formal Engineering Definitions**: Precise definitions, formulas, units.
- **Section 5: Diagnostic Profiling**: Waterfalls, flame graphs, or system traces.
- **Section 6: Hardware Realities**: Order-of-magnitude physics numbers (RAM vs SSD vs HDD).
- **Section 7: Statistical Rigor**: Percentiles ($P_{50}, P_{95}, P_{99}$) vs deceptive averages.
- **Section 8: Load & Queueing Dynamics**: Non-linear degradation curves and safe headroom.
- **Section 9: Architectural Playbook**: Concrete strategies for latency vs throughput.
- **Section 10: Trade-Off Analysis**: Seesaws, gains vs compromises (e.g. batching).
- **Section 11: Common Pitfalls Table**: What fails vs what to do instead.
- **Section 12: Hands-On Lab Exercise**: Practical browser DevTools or command-line task.
