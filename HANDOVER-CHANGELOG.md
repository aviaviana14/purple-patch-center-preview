# Purple Patch Center — Handover changelog

**Compared to:** https://stgcenterpp.wpenginepowered.com/  
**Package:** `purple-patch-center-mockup-handover.zip` (contents of `mockups/`)  
**Primary page:** `performance-center-refined.html`

This mockup is a static HTML/CSS/JS rebuild of the Center marketing site (Squarespace → WordPress direction), with matching Mariana Tek embed shells for booking flows.

---

## How to open

1. Unzip and serve the `mockups` folder (e.g. `npx serve mockups -l 4177`).
2. Home: `/` or `performance-center-refined.html`
3. Mariana pages: `/schedule/`, `/buy/`, `/login/`
4. Pricing: `/pricing/`
5. Personal Training: `/services/personal-training/`
6. Physical Therapy: `/services/physical-therapy/`
7. Strategic Bike Fitting: `/services/strategic-bike-fitting/`
8. SMI Orthopedic Massage: `/services/smi-orthopedic-massage/`
9. Precision Hydration Sweat Testing: `/services/sweat-testing/`
10. Index of mock pages: `index.html`

**Note:** Mariana Tek widgets may not hydrate on `localhost` until the host is allowlisted. Same production domain (`center.purplepatchfitness.com`) should work; request Mariana admin access for redirects/CSP troubleshooting.

---

## Navigation & IA

| Area | Staging | This mockup |
| --- | --- | --- |
| Utility links | Staging WP header | Purple Patch Home + Download iOS App + Login (grouped right) |
| Primary CTAs | Book / buy / login → live Center Squarespace | **Book a Class** → `/schedule/`; **Join Us** → `/pricing/`; **Login** → `/login/` |
| Services dropdown | Present on staging | Bike fitting, Sports massage, Sweat testing, Physical therapy, Personal training — all local `/services/…` routes |
| Sticky nav / sticky CTA | Staging patterns vary | **No sticky nav / sticky CTA** (Center brief) |

---

## New / rebuilt pages (live slugs)

Stub pages styled like the Center mockup, with the same Mariana Tek mounts as the live Squarespace Center site:

| Slug | Mariana mount | Replaces |
| --- | --- | --- |
| `/schedule/` | `/schedule/daily` | `center.purplepatchfitness.com/schedule` |
| `/buy/` | `/buy` | `center.purplepatchfitness.com/buy` |
| `/login/` | `/account` | `center.purplepatchfitness.com/login/` |
| `/pricing/` | — (static marketing) | Staging Pricing / Join Us |
| `/services/personal-training/` | Buy / Book Now → Center buy | Staging Coaching Consultations (renamed slug) |
| `/services/physical-therapy/` | Lead form modal | Staging 360 Physical Therapy |
| `/services/strategic-bike-fitting/` | Square Appointments + Strategic Fitting | Staging Strategic Bike Fitting |
| `/services/smi-orthopedic-massage/` | Mindbody | Staging SMI Orthopedic Massage |
| `/services/sweat-testing/` | SimplyBook + Contact Us | Staging Precision Hydration Sweat Testing |

All Book CTAs on the main page point to `/schedule/` (not the external Squarespace URL). **Join Us** points to `/pricing/`.

---

## Lead / inquiry forms (new vs staging)

Staging relies more on outbound links to Center buy/schedule. This mockup adds:

1. **First Class Free** (hero) → modal: Full Name, Email, Phone Number; floating labels; open/close transition; success state.
2. **Service inquiry** for tiles that don’t have dedicated service pages yet:
   - Run Analysis, Strength Analysis, Nutrition, Menopause Support
   - Fields: Full Name, Email, Phone Number, “What Do You Want Help With?” (dropdown of the four), optional details
   - Success: follow-up soon copy
3. Form field naming is Title Case and consistent across modals.

---

## Services / offerings

- Sports Massage tile + nav → `/services/smi-orthopedic-massage/`
- Personal Training → `/services/personal-training/`
- Sweat testing → `/services/sweat-testing/`
- Physio → `/services/physical-therapy/`
- Bike fitting → `/services/strategic-bike-fitting/`
- Run / Strength analysis, Nutrition, Menopause → **open inquiry modal** (not dead tiles)
- Menopause Support photo updated to **PPF-108**

---

## Classes

- Flip cards (Bike / HYROX / Strength) kept; **Book a class** links work (pointer-events fix so flipped face is clickable)
- Links go to `/schedule/`

---

## Coaches

| Item | Staging | This mockup |
| --- | --- | --- |
| Photos | Mix of photos / placeholders; “Jenna” naming | Full set of headshots for Matt, Jon, Marcia, Krystle, **CJ**, **Jena**, Kristin, Tyler |
| Naming | Jenna | **Jena** |
| CJ | Present | Photo + title **Coach** |
| Hover bios | Staging-style overlays | **Removed** — name + title only, no hover bio / zoom |

---

## Founders / masonry

- Founders hero photo → **PPF-159** (`founders-matt-kelli.jpg`)
- Caption order swapped to match photo: **Matt** (left), **Kelli** (right)
- Masonry row height capped on ultra-wide viewports so group photos don’t over-crop people at the edges

---

## Brand / UI system

- Logo → new gold **Purple Patch CENTER** lockup
- Typography: Bornia; ink `#1a1a1a`, muted `#5c5c5c`, teal `#1dbccd`
- Buttons: solid teal primary + outline teal secondary only
- Header: two-row Center header (utility + main); solid dark header on embed pages
- Style guide present as `performance-center-style-guide.html` (reference, not linked from main nav)

---

## Content / CTA wording

- “Schedule a visit” → **Join Us** (Pricing)
- Hero CTA: **First Class Free** (opens lead modal)
- Testimonials: no member names shown (Center brief)

---

## Still pointing at staging / external (intentional for now)

- Pricing / Join Us → `/pricing/` (membership comparison table + credits / need-to-know)
- Purple Patch Home → `purplepatchfitness.com`
- iOS app / some footer links → existing Purple Patch properties
- Mariana auth redirects in live embeds still conceptually map to `/login/`, `/register/`, `/my-account/` (confirm in Mariana when going live on WP)

---

## What’s not in this zip as a WP theme

This is a **static mockup**, not a WordPress theme. Handover next steps typically: port templates into WP/Elementor (or theme), wire Mariana embeds on the same domain, whitelist domains if needed, and replace staging Pricing/service URLs with final production paths.
