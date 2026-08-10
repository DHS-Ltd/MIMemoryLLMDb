---
name: dh-pacs-ibnsina-commercial-posture
description: "Ibn Sina Cancer Center enterprise deal — commercial models, proprietary/licensing posture, and the pitch-deck design. Diverges from DH's standard small-hospital model."
metadata: 
  node_type: memory
  type: project
  originSessionId: bcf65a9b-c7d6-4e0c-959c-18dcb62a2e17
aliases: [dh-pacs-ibnsina-commercial-posture, dh_pacs_ibnsina_commercial_posture]
---

The Ibn Sina **Cancer & Diagnostic Center** deal is an **enterprise** engagement that deliberately diverges from DH's standard small-tier model ([[dh-pacs-pricing]]). Full record: `docs/IbnSinaCancerPacs/adr/0005-ibnsina-enterprise-commercial-posture.md` and `docs/IbnSinaCancerPacs/CONTEXT.md`.

**Key divergences from the standard model:**
- **Installation is CHARGED** (standard small-tier = free). Figures deferred to a separate financial session.
- **Data stays on-prem and stays Ibn Sina's** under the preferred model (standard = DH-held cloud).
- **Ops split:** Ibn Sina's trained IT operates the branded system; **DH maintains the infrastructure free**. (Standard = DH runs everything.)
- **"Complete proprietary" tier** = Ibn Sina-branded + custom modules + **licensed source (run/modify), but DH keeps IP and resale rights** — a license, not a sale (preserves ADR 0003). Drops the "Powered by DH PACS" attribution for this deal.

**"Hybrid PACS" (sales term, not architecture):** one deployment, two jobs — (1) primary: dedicated PET/CT archive (kills the current 2-DVDs-per-study waste + enables branch sharing); (2) secondary: CT/MRI patient links replacing film/CD/DVD → film-replacement on-ramp.

**Three financial models (walked 1 → 3 → 2, land on Option 2):**
1. **Buy/license** — license + install + maintenance; data → Ibn Sina; heavy capital (the "anchor").
2. **Partnership (PREFERRED/STEER)** — small monthly per-patient fee (after a grace period); infra maintained free; Ibn Sina-branded licensed system + IT training; data → Ibn Sina.
3. **DH-funded** — DH invests in server+install; two-tier fee (recoup + perpetual); no maintenance fee; data control + third-party-share rights → DHS. Matches DH's B2C data ambition but **soft-pedaled** in the pitch.
- Choosing Option 2 means DH **forgoes the B2C patient-data channel** for this deal — accepted for the flagship reference + recurring revenue.

**The pitch deck (BUILT 2026-06-20, 18 slides, .pptx):** at `docs/IbnSinaCancerPacs/presentation/DH_PACS_IbnSina_CancerCenter.pptx` — fully editable native PowerPoint. Regenerate via `presentation/build_deck.py` (needs python-pptx, Pillow, qrcode). English + Bangla accents (Bangla uses Nirmala UI; body uses Segoe UI, NOT the web Plus Jakarta/Inter, to avoid font substitution live). Management+clinical audience. Goal = green-light a Cancer Center pilot (financials separate). Spine: relationship-first (Ibn Sina's 7 workstations/5 centers → Cumilla proof) → modular idea → hybrid ask → "own it" (slide 11 = Ibn Sina logo in a mock viewer header) → financial walk (1→3→2) → ask → close.
- **Branding assets** live in `docs/IbnSinaCancerPacs/Branding/`: `DHP_Banner_Design_1200x400.png` (primary DH PACS lockup, good on dark), `Correct_DHV_Logo_512x512.png` (DHV viewer mark, dark tile — needs light plate on darkest bg), `IBN_sina_Trans.png` (red+indigo — MUST sit on a white plate on dark, else indigo vanishes). Derived plates/QR/icon in `presentation/assets/`.
- **Logo system:** DHP banner = the proposal's brand (cover/ask/close/footer); DHV = product-the-user-sees slides only (8,9,11); Ibn Sina = partner (co-brand cover/close + hero of slide 11). Cumilla QR encodes the real patient link. Product shots = 4 mobile mockups from `dh-pacs-website/public/images/`. No figures anywhere in the deck.

**Positioning refinement (2026-06-21, for the technical deck):** Ibn Sina receives a **branded source repository** ("their" custom solution); **DH Solutions is the named technical implementation partner**; in return DH uses **Ibn Sina as a flagship marketing reference site**. Consistent with "Complete proprietary" = licensed source (DH keeps IP). A separate **technical-facing deck** now exists for the IT/biomedical/CIO audience — see [[dh-pacs-tech-deck]].

**Why:** Established in the 2026-06-20 grilling session designing the Ibn Sina presentation. Corrects the assumption that DH's free-install/DH-held-data model applies everywhere.

**How to apply:** When advising on the Ibn Sina deal or deck, never apply standard small-tier terms. Always steer to Option 2, soft-pedal Option 3, keep figures out of the deck. "Complete proprietary" = licensed source, never IP sale.
