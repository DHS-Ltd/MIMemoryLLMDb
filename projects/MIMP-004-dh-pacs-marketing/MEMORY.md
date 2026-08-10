# DH PACS Project Memory

> ## ⚠ SUPERSEDED — do not use for customer-facing work
>
> **This index describes the pre-2026-08-03 positioning.** The DH PACS *sale* failed, not the product — DH PACS is the flagship under Build, the prime pillar, and the middle link of the Surgeon Chain. Superseded below:
>
> - "patient data ownership" as the category → **Advanced Connected Imaging Network**; ownership is the *mechanism*, not the claim
>
> - "Ibn Sina as master proof point" → **banned term**; **tier-matched proof** — Ibn Sina proves Enterprise only, Cumilla proves Standard, never crossed
>
> - "three-layer sales chain (IT → Management → Clinical)" → **Enterprise tier only**; Standard runs Owner → light IT → counter staff
>
> See `project-dhs-brand-strategy.md` and `project-linkedin-surgeon-first.md` in this same folder for the current position.
>
> **Authority:** `E:\DHS-PACS\CONTEXT-MAP.md` (2026-08-03). Current position:
> MIMemoryLLMDb `org/north-star.md`. Retained rather than deleted so stale copies stay
> traceable (ADR-0006).

---

- [DHS Brand Strategy](project-dhs-brand-strategy.md) — **READ FIRST for any positioning work.** Set 2026-08-03: DHS serves the SURGEON not the radiologist; category = Advanced Connected Imaging Network; endorsed house (DHS master brand); 4 Business Pillars, Build prime; 2 tiers with tier-matched proof (Cumilla=Standard, IbnSina=Enterprise); 2 revenue lines; personas P1–P6. Supersedes the patient-ownership category claim and several CLAUDE.md hard lines. See docs/adr/0002
- [Commercial Content Hub Rule](commercial-content-hub-rule.md) — DHS-PACS is the single home for marketing/positioning/pricing/official-post content for DH PACS, DHV, and DHDicomAnalyzerPro, wherever drafted; see CONTEXT-MAP.md and ADR-0001; migration of existing DHV-Weasis/DH-Advanced-Viewer content deferred
- [Product Architecture & Market Positioning](project-dh-pacs-product.md) — What DH PACS actually does: images + report merged into complete patient record; NOT teleradiology; new market category
- [Market Strategy & Sales Chain](project-dh-pacs-market-strategy.md) — Two angles (patient data ownership / film replacement), three-layer sales chain (IT → Management → Clinical), Ibn Sina as master proof point
- [Pricing Model](project-dh-pacs-pricing.md) — STANDARD small-tier model: free install, per-patient charge, patient data agreement, future B2C channel; exact numbers pending. NOTE: Ibn Sina enterprise deal differs (charged install) — see below
- [Ibn Sina Enterprise Commercial Posture](project-dh-pacs-ibnsina-commercial-posture.md) — Cancer Center deal diverges from standard: charged install, on-prem Ibn-Sina-owned data, licensed-source proprietary tier (DH keeps IP), 3 financial models (steer to Option 2, soft-pedal Option 3); 18-slide pitch deck BUILT at docs/IbnSinaCancerPacs/presentation/; see docs/IbnSinaCancerPacs/adr/0005
- [Website Content Decisions](project-dh-pacs-website-decisions.md) — All agreed changes to the blueprint (8 items); blueprint edits not yet applied; pending tasks for next session
- [HIPAA Compliance Strategy](project-dh-pacs-hipaa.md) — Bangladesh audience targets HIPAA; open-source stack is compliant; company certification is a roadmap item; phrase as "built to HIPAA standards"
- [Website Build Progress](project-dh-pacs-website-build.md) — Stack, repo, components built; deployed and LIVE on Cloudflare Workers (not Pages — Next 16 incompatible with Pages adapter) at dh-pacs-website.directhospitalsolutionsltd.workers.dev; visual pass mostly done, pre-launch tasks remain
- [Ibn Sina Technical Deck](project-dh-pacs-tech-deck.md) — technical-facing architecture deck (IT/biomedical/CIO); TCO-via-federation spine; commercial-PACS foil (sourced numbers, DH figurative); measured DHV metric (1 TB/1000 patients, 1,257 patients since Feb 2026 ≈ 1.26 TB); peer-backup feature (1:1 + 1:many); build_tech_deck.py → DH_PACS_IbnSina_Technical.pptx (19 slides)
- [Brand Voice Profile](project-dh-pacs-brand-voice.md) — canonical voice profile at docs/DH_PACS_BRAND_VOICE.md (created 2026-06-10); read before writing any copy/outreach; encodes hard lines (no teleradiology, no pricing, "built to HIPAA standards", sourced ৳14.6B)
- [LinkedIn Surgeon-First Pivot](project-linkedin-surgeon-first.md) — **READ before any personal-brand post.** Set 2026-08-05: audience pivoted to surgeons (ortho reach + vascular depth); P5 Advanced Post-Processing added as pillar spine; Central Question rewritten; 119/170 = Regional Count (LinkedIn) vs 50/70 = Bangladesh Count (UIH CV); Philips title corrected to Fast Response Team; engine never named; launch 11 Aug 2026. June strategy + July calendar now HISTORIC, never published
- [DHS CRM Design](project-dhs-crm.md) — **READ before any CRM build or schema work.** Settled 2026-08-06: Account+Contact linked (surgeons never buy, centres do); "lead" retired; job is the nag not monitoring; Notion store + Cloudflare Worker cron + local capture bot; two Stage Sets both ending past signature (Standard ends at Enrolling); Owner vs Assigned To from day one; phase gate ~27 Aug. **Amended 2026-08-08:** append-only Log in Notion page bodies (Interactions DB rejected on mobile friction), Last Interaction added to Accounts, Going Quiet weekly nag designed but held at the gate. See docs/CRM/ + ADR-0003/0004/0005
- [Loop Engineering](project-loop-engineering.md) — **PARKED 2026-08-08 — learning banked, do not pitch building it; Maidul triggers.** Studied from video in Loop_engineering/. "Loop Spec" is the unit (`/loop` is a scheduler, not a loop); evaluator-first sequencing; convergent→Claude Code in-repo vs perpetual→Worker+Notion+Telegram; prohibitions are gameable by silence; memory is the PHI leak vector so ADR-0004 moves to the tool boundary. Read when a repeated, checkable task shows up in real work
- [Personal Brand Content Skill](personal-brand-angles-skill.md) — skill at ~/.claude/skills/personal-brand-angles/SKILL.md; invoke with /personal-brand-angles; generates Idea Cards across 4 pillars; source material (voice profile, research) now lives in Self_project/Personal_Branding, not here; note: /content-angles is a separate Notion pipeline skill, do not confuse
