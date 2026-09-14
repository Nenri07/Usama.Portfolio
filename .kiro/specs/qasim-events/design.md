# Design Document

## Overview

Qasim Events is a single-route, motion-driven marketing site built with Next.js (App Router), TypeScript, and Tailwind CSS v4 (CSS-first `@theme` in `app/globals.css`, no `tailwind.config.js`). It renders six sections in a fixed order (Hero → Trusted By clients → Work/Projects grid → Results numbers → Team → Contact) with a dark navy/black base and a single maroon accent used sparingly. The experience targets the feel of an agency portfolio (e.g. jesperlandberg.com): smooth scroll, parallax, split-text staggers, scroll-choreographed reveals, magnetic hover buttons, and a custom cursor. All content is static and hardcoded in one data module; there is no backend, CMS, or additional routes.

The central architectural decision is a **layered motion system** that avoids three competing animation loops:

- **GSAP + ScrollTrigger is the PRIMARY engine** for all scroll-choreographed reveals and parallax.
- **Lenis provides smooth scroll and DRIVES ScrollTrigger** — Lenis scroll events call `ScrollTrigger.update`, and the GSAP ticker advances Lenis (`gsap.ticker.add((t) => lenis.raf(t * 1000))` with `gsap.ticker.lagSmoothing(0)`).
- **anime.js is SECONDARY**, restricted to small standalone effects only (the Results count-up and the clients marquee).

A **single shared scroll-reveal pattern** (`useReveal`, now GSAP+ScrollTrigger based) is reused by the Work grid, Results, and Team sections to keep reveal behavior consistent. Browser-only APIs run exclusively inside `useEffect` in `'use client'` components, so SSR stays safe. Every animated element's default (unanimated) state is its final visible state, and `prefers-reduced-motion` disables non-essential motion — so the page is always fully readable and correctly laid out even if GSAP, Lenis, or anime.js never run.

### Requirements Mapping (high level)

| Area | Requirements |
|------|--------------|
| Scaffold, deps (incl. gsap), image set | 1.1–1.6 |
| Hero (split-text, parallax, reduced-motion) | 2.1–2.6 |
| Trusted By clients | 3.1–3.7 |
| Work / Projects grid (enriched, no financials) | 4.1–4.10 |
| Results numbers | 5.1–5.6 |
| Team | 6.1–6.7 |
| Contact | 7.1–7.8 |
| Visual system, smooth scroll, section order, no financials | 8.1–8.6 |
| Motion system & scroll choreography | 9.1–9.8 |

## Architecture

### Technology & Setup

- **Framework:** Next.js App Router + TypeScript + Tailwind CSS v4 (Req 1.1). Tokens live in a CSS-first `@theme` block in `app/globals.css`; there is no `tailwind.config.js`.
- **Dependencies:** `gsap` (primary, with `gsap/ScrollTrigger`), `lenis` (smooth scroll + ScrollTrigger driver), `animejs` v4 (secondary effects), `clsx` (Req 1.2). `gsap` is already installed. Scaffold halts with an identified failing step if creation or any install fails (Req 1.3) — a build-time/CLI concern verified by command exit status.
- **GSAP imports:** `import { gsap } from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; gsap.registerPlugin(ScrollTrigger);` (client only).
- **anime.js v4 ESM import:** `import { animate, createTimeline, stagger } from 'animejs'` — used ONLY by the count-up and marquee.
- **Single route:** `app/page.tsx` composes all six sections in order (Req 8.5).

### Motion System (Req 9)

The Motion_System is layered to keep one authority over scroll:

1. **GSAP + ScrollTrigger — primary (Req 9.1).** All scroll reveals (Work cards, Results trigger, Team cards) and parallax are GSAP timelines/tweens bound to `ScrollTrigger`. `ScrollTrigger` is registered once, client-side.
2. **Lenis drives ScrollTrigger (Req 9.2).** In `SmoothScrollProvider`:
   ```ts
   const lenis = new Lenis({ smoothWheel: true });
   lenis.on('scroll', ScrollTrigger.update);
   gsap.ticker.add((time) => lenis.raf(time * 1000));
   gsap.ticker.lagSmoothing(0);
   ```
   Lenis no longer runs its own `requestAnimationFrame` loop; the GSAP ticker is the single clock, so smooth scroll and scroll-triggered animation stay in sync (no dual-loop jank).
3. **anime.js — secondary (Req 9.3).** Only the Results count-up tween and the clients marquee loop use anime.js. anime.js is never used for scroll choreography.
4. **Shared motion utilities (Req 9.4):** `Split_Text_Reveal`, `Parallax_Effect`, `Magnetic_Button`, `Custom_Cursor` (see Shared Utilities).
5. **Graceful degrade (Req 9.7):** every library init is wrapped in `try/catch`; on failure the affected elements are already in their final visible state and native scrolling remains functional.
6. **Reduced motion (Req 9.8):** a `prefersReducedMotion()` check gates all non-essential motion — parallax, split-text stagger, magnetic movement, custom cursor, marquee auto-scroll, and count-up are skipped, leaving final visible state.

### Rendering & SSR Strategy

- Server components by default; components that animate or use browser APIs are marked `'use client'`.
- GSAP/ScrollTrigger, Lenis, and anime.js side effects run in `useEffect` and never execute during SSR. `ScrollTrigger.registerPlugin` and any `window`/`matchMedia` access are guarded to client only.
- If any effect throws or a module is unavailable, sections fall back to their static, fully-visible state (Req 3.6, 9.7; reveal targets default to visible — see Error Handling).

### File Structure

```
app/
  layout.tsx                # root layout, fonts, global metadata, providers
  page.tsx                  # composes the 6 sections in order (Req 8.5)
  globals.css               # Tailwind v4 @theme tokens, base resets
components/
  SmoothScrollProvider.tsx  # 'use client' — Lenis + ScrollTrigger integration (Req 9.2, 8.4)
  CustomCursor.tsx          # 'use client' — custom pointer (Req 9.4, 9.6)
  Hero.tsx                  # 'use client' — split-text headline + parallax bg (Req 2)
  Marquee.tsx               # 'use client' — clients seamless loop (Req 3) [renders Clients_Section]
  WorkGrid.tsx              # grid container (Req 4)
  WorkCard.tsx              # 'use client' — reveal + hover + detail overlay + img fallback
  Numbers.tsx               # container for Results stat blocks (Req 5) [renders Results_Section]
  StatBlock.tsx             # 'use client' — count-up run-once (Req 5)
  Team.tsx                  # container for team cards (Req 6)
  TeamCard.tsx              # 'use client' — role card, reveal + img fallback (Req 6)
  Contact.tsx               # closing line + mailto/wa.me magnetic buttons (Req 7)
  MagneticButton.tsx        # 'use client' — magnetic hover wrapper (Req 9.4, 9.5)
  SafeImage.tsx             # 'use client' — image with graceful fallback
lib/
  data.ts                   # ALL static content (projects, clients, results, team, contact)
  reveal.ts                 # useReveal — shared GSAP+ScrollTrigger reveal (Req 4.9, 9.1)
  motion.ts                 # motion helpers: splitText, parallax, magnetic, cursor, prefersReducedMotion (Req 9.4)
  format.ts                 # pure helpers: image path, count value, links, splits
```

> `Marquee.tsx` and `Numbers.tsx` keep their existing filenames but now render the Clients_Section and Results_Section respectively; the section labels are updated in copy and data.

### Component Composition

```
RootLayout
└─ SmoothScrollProvider (Lenis drives ScrollTrigger)
   ├─ CustomCursor (Req 9.6)
   └─ page.tsx
      ├─ Hero            (split-text headline + parallax bg)
      ├─ Marquee         (Clients_Section — seamless loop, anime.js)
      ├─ WorkGrid → WorkCard ×13 (useReveal + SafeImage + detail overlay)
      ├─ Numbers → StatBlock ×N  (useReveal trigger + anime.js count-up)
      ├─ Team → TeamCard ×N      (useReveal + SafeImage)
      └─ Contact         (MagneticButton ×2)
```

## Style System (Tokens)

Defined once in `app/globals.css` via Tailwind v4 CSS-first `@theme` (no `tailwind.config.js`), so utility classes and raw CSS agree (Req 8.1–8.3).

```css
@theme {
  --color-base: #0A0E1A;      /* dark navy/black base */
  --color-surface: #0F1424;   /* subtle raised panel, still dark */
  --color-text: #F2F2F0;      /* near-white body/heading text */
  --color-muted: #8A8F9C;     /* secondary text */
  --color-accent: #6E1423;    /* single maroon accent (used sparingly) */
  --space-block: 24px;        /* min spacing between content blocks (Req 8.2) */
}
```

Global rules enforced by the token system and utility usage:

- Base background `--color-base` across all sections; maroon used only for small accents (button, thin rule, single word, cursor) to stay under 10% surface area (Req 8.1).
- Body text ≥ 16px, headings ≥ 32px, sans-serif `next/font` sans stack (Req 8.2).
- Content containers: **no** `box-shadow`, `border-radius: 0` (Req 8.3), enforced by not applying shadow/rounded utilities plus a defensive base rule.
- Vertical rhythm: sections and blocks use spacing ≥ `--space-block` (Req 8.2).

## Components and Interfaces

### SmoothScrollProvider (Req 8.4, 9.2, 9.7)

`'use client'` wrapper mounted in the layout. Registers ScrollTrigger, instantiates Lenis, and wires the two together so Lenis is the scroll source and the GSAP ticker is the single animation clock.

```ts
useEffect(() => {
  try {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  } catch {
    /* native scroll + final visible state remain intact (Req 9.7) */
  }
}, []);
```

If Lenis or GSAP throws, the try/catch leaves native scrolling intact and every element stays in its final visible state.

### CustomCursor (Req 9.4, 9.6, 9.8)

`'use client'` element mounted once. Tracks pointer position (`pointermove`) and translates a small maroon cursor node with a GSAP `quickTo` for smoothing. Skipped entirely when `prefersReducedMotion()` is true or on touch/coarse pointers; the native cursor then remains. Hidden during SSR (renders nothing until mounted).

### Hero (Req 2)

- Full-bleed background using `SafeImage` for `/work/img-000.png` with `object-fit: cover` (Req 2.1). On failure or >3s timeout, a solid `--color-base` fallback shows while foreground stays visible (Req 2.2).
- Headline uses `splitText()` (from `lib/motion.ts`) to wrap each word/char in a span. Unless `prefersReducedMotion()`, a GSAP timeline animates each unit opacity 0→1 and `y` 20→0 with per-unit `duration ~0.6s` and `stagger 0.08–0.12s` (Req 2.3). Default state is the final visible headline.
- Subheadline: single string ≤120 chars with `whitespace-nowrap` (Req 2.4).
- Scroll cue: absolutely positioned at section bottom within the first viewport (Req 2.5).
- Parallax: `parallax()` binds the background to a ScrollTrigger tween that translates it slower than scroll; foreground text is excluded so it stays readable at every scroll position (Req 2.6). Skipped under reduced motion.

```
interface HeroContent { headline: string; subheadline: string; /* ≤120 chars */ }
```

### Marquee — Clients_Section (Req 3)

- Renders the client/venue/partner wordmarks as styled text (no images) in exact order, separated by a fixed gap (Req 3.1–3.3).
- Seamlessness via a **duplicated track**: `buildMarqueeTrack(clients)` returns `[...clients, ...clients]`. anime.js (secondary, Req 9.3) animates the track `translateX` `0 → -50%`, `loop: true`, `ease: 'linear'`, constant duration → continuous scroll; the seam is invisible because the two halves are identical (Req 3.4, 3.5).
- If anime.js fails to init, the track renders static and readable (Req 3.6). Under `prefersReducedMotion()`, the marquee never starts and displays static wordmarks (Req 3.7).

### WorkGrid + WorkCard (Req 4)

- `WorkGrid` renders 13 `WorkCard`s from `projects` (Req 4.1–4.3). Layout is a CSS grid where `spanForIndex(i)` marks some cells as 2-unit spans, producing the asymmetric look while keeping 13 cells (Req 4.1).
- Each `WorkCard` resolves its image via `resolveImagePath(project, i)` — the project's explicit `image` if present, else the sequential `imagePathForIndex(i)` (Req 4.2) — rendered through `SafeImage`.
- Card content shows title, venue, year, and a `services` highlights list, plus any defined Public_Metric counts (`visitors`, `winners`, `staff`, `days`) (Req 4.3, 4.4). **No Prohibited_Financial_Figure is ever rendered** — the data model has no revenue/cost/profit fields (Req 4.5, 8.6).
- **Reveal:** every `WorkCard` uses the shared `useReveal` (GSAP+ScrollTrigger). When the card's top scrolls within the bottom 90% of the viewport (`start: 'top 90%'`), it animates `clip-path` inset from `inset(100% 0 0 0)` to `inset(0 0 0 0)` over ~0.6s (in 0.4–0.8s range) (Req 4.6). Per-card stagger delay = `staggerDelay(index, base)` with base ∈ [80,150]ms (Req 4.7). Skipped under reduced motion (final visible state).
- **Hover:** CSS transition scales the image to 1.05 and slides the detail overlay hidden→visible over ~300ms (200–400 range) (Req 4.8).
- **Single reveal function:** every card uses the same `useReveal` (Req 4.9).
- **Image failure:** `SafeImage` renders a `--color-surface` placeholder; the card retains title/venue/year/services/counts and grid cell size (Req 4.10, 1.6).

### Numbers — Results_Section + StatBlock (Req 5)

- `Numbers` renders one `StatBlock` per `results` entry (Req 5.1, 5.5 — labels contain only Public_Metric language).
- **Count-up (secondary anime.js, Req 9.3):** each `StatBlock` uses `useReveal` with `threshold ~0.5` as the trigger. On first ≥50% visibility (and not reduced motion), an anime.js tween drives progress `0→1` over 1–3s; displayed value = `countValue(target, progress)` (rounds toward target, clamps to `[0, target]`). At completion it shows the exact target with its suffix/label (Req 5.2, 5.3).
- **Run once:** a `started` flag becomes an absorbing state via `useReveal`'s `once: true` mode; re-entering the viewport never restarts (Req 5.4).
- Under `prefersReducedMotion()`, the block shows its exact target immediately (Req 5.6).

```
interface StatItem { target: number; suffix: string; label: string; }
// e.g. { target: 3.75, suffix: 'M',  label: 'Peak visitors' }
//      { target: 13,   suffix: '+',  label: 'Activations' }
//      { target: 3,    suffix: '',   label: 'FIFA World Cup 2022 activations' }
//      { target: 7000, suffix: '+',  label: 'Prize winners' }
//      { target: 12000,suffix: '',   label: 'Balloons across 8 Qatar landmarks' }
```

### Team + TeamCard (Req 6)

- `Team` renders one `TeamCard` per `team` entry (Req 6.1).
- Each `TeamCard` shows the `role` title always; the optional `name` is shown only when present, with no invented placeholder when absent (Req 6.2, 6.3).
- Each card shows a `SafeImage` from `public/work` (Req 6.4); on failure a `--color-surface` placeholder shows while role/name remain (Req 6.5).
- **Reveal:** cards use the shared `useReveal` with per-card stagger (Req 6.6); skipped under reduced motion (Req 6.7).

```
interface TeamMember { role: string; name?: string; image: string; }
// name is optional so real names can be filled into lib/data.ts later (Req 6.2, 6.3)
```

### Contact + MagneticButton (Req 7, 9.4, 9.5)

- Closing headline sized in the 32–72px range (Req 7.1).
- Email and WhatsApp buttons side by side in one flex row (Req 7.2), each wrapped in `MagneticButton`.
- Email href = `buildMailto(email)`, `email` defaults to `hello@qasim-events.qa` (Req 7.3, 7.4).
- WhatsApp href = `buildWaLink(phone)` → `https://wa.me/<digits>`, phone editable and beginning with `974` (Req 7.5, 7.6).
- If email or phone is empty/whitespace, `isContactDisabled()` disables the corresponding button (Req 7.7).
- No `<form>` or `<input>` anywhere (Req 7.8).
- `MagneticButton`: while the pointer is within a radius, a GSAP tween translates the button toward the pointer; on leave it returns to rest (Req 9.5). Disabled under `prefersReducedMotion()` — the button stays put and remains fully clickable.

### SafeImage (shared, Req 1.5/1.6, 2.2, 4.10, 6.5)

`'use client'` component using a plain `<img>` with `onError`/`onLoad`. Tracks `failed`; on error (or hero load timeout) it renders a placeholder background (`--color-surface`, or `--color-base` for hero) without throwing. Present images display with no code change (Req 1.5); missing/misnamed images are omitted with a placeholder (Req 1.6).

## Data Models

All static content lives in `lib/data.ts`. No field stores any Prohibited_Financial_Figure (Req 4.5, 5.5, 8.6).

```ts
export const contact = {
  email: 'hello@qasim-events.qa',   // editable (Req 7.3)
  phone: '974XXXXXXXX',             // editable, Qatar intl format (Req 7.5)
  whatsapp: '974XXXXXXXX',          // placeholder to be filled (Req 7.5)
};

// Trusted-by clients/venues/partners, rendered as text in EXACT order (Req 3.1, 3.3)
export const clients = [
  'Qatari Diar', 'Lusail', 'Qatar Foundation', 'LULU',
  'Lagoona Mall', 'Doha Festival City', 'Qatar Racing Club', 'FIFA World Cup 2022',
] as const;

export interface Project {
  title: string;
  venue: string;
  year: string;
  services: string[];        // service / highlight list (Req 4.3)
  visitors?: string;         // optional Public_Metric (Req 4.4)
  winners?: string;          // optional Public_Metric (Req 4.4)
  staff?: string;            // optional Public_Metric (Req 4.4)
  days?: string;             // optional Public_Metric (Req 4.4)
  image?: string;            // optional explicit path; else sequential (Req 4.2)
  // NO revenue / cost / profit fields (Req 4.5)
}

export const projects: Project[] = [ /* exactly 13 enriched entries (see below) */ ];

export interface StatItem { target: number; suffix: string; label: string; }
export const results: StatItem[] = [
  { target: 3.75,  suffix: 'M',  label: 'Peak visitors' },
  { target: 13,    suffix: '+',  label: 'Activations' },
  { target: 3,     suffix: '',   label: 'FIFA World Cup 2022 activations' },
  { target: 7000,  suffix: '+',  label: 'Prize winners' },
  { target: 12000, suffix: '',   label: 'Balloons across 8 Qatar landmarks' },
]; // Public_Metric only (Req 5.1, 5.5)

export interface TeamMember { role: string; name?: string; image: string; }
export const team: TeamMember[] = [
  { role: 'Creative Director',       image: '/work/img-020.png' },
  { role: 'Activation Lead',         image: '/work/img-021.png' },
  { role: 'Operations Manager',      image: '/work/img-022.png' },
  { role: 'Production Lead',         image: '/work/img-023.png' },
  { role: 'Talent & Staffing Manager', image: '/work/img-024.png' },
  { role: 'Hospitality Lead',        image: '/work/img-025.png' },
]; // role-based, NO invented names; name optional for later fill-in (Req 6.1–6.3)
```

### Enriched projects (13 entries, definition order → sequential images)

1. **Formula 1 & MotoGP Fan Zone** — Lusail Circuit & Boulevard — 2023–24 — services: Carnival Games, Slot Car Racing, Henna Artists, Face Painters, Hospitality, Branding — days: 10.
2. **Hello Asia** — Lusail Boulevard — 2024 — services: 25 VIP Hostesses, 90 Staff, 16 Carnival Games, Train, Soft Play — visitors: 3.75M (Asian Cup) — staff: 90 — days: 30.
3. **Flower Festival** — Lusail Boulevard — 2023 — services: 12 Carnival Games, 15 Arcade Games, 4 Giant Inflatables — visitors: 40,000 — staff: 76 — days: 3.
4. **Eid Festival** — Lusail Boulevard — 2023 — services: 16 Carnival Games, 20 Arcade Games, 2 Giant Inflatables, full F&B — visitors: 100,000 — days: 8.
5. **Darb al Lusail Parade** — Lusail Boulevard — 2023 — services: 80 entertainment artists, 30 management staff — visitors: 40,000 — staff: 110 — days: 3.
6. **Eid ul Adha Festival** — Abu Sidra Mall (LULU) — 2023 — services: 9 Shows, 15 Roaming Parade Characters, Arts & Craft, Face Painting, Henna — visitors: 30,000 — days: 3.
7. **ALJAM'A Celebration Week** — Education City, Qatar Foundation — 2022–23 — services: 8 Universities, multi-day celebration — visitors: 1,500–2,000 — winners: 190–230 — days: 3–5.
8. **Qatar Custom Show** — Qatar Racing Club — 2022–23 — services: 6 Carnival Games, Building Block City, Bouncy Castle Inflatables — visitors: 2,000–3,000 — winners: 420 — days: 3.
9. **Building Block City** — Lagoona Mall — 2022 — services: Building Block City — days: 90 (3-month run).
10. **FIFA World Cup Fan Zone** — Lagoona Mall — 2022 — services: 4 Carnival Games, Soft Building Block City — visitors: 5,000 — winners: 450 — days: 30.
11. **FIFA World Cup Fan Zone** — Doha Festival City Arena — 2022 — services: 4 Carnival Games — visitors: 3,000 — winners: 250 — days: 30.
12. **Eid in Qatar** — Corniche — 2022 — services: 7 Carnival Games, Soft Building Block City, Inflatable Jumping Castles — visitors: 3,000 — winners: 200 — days: 3.
13. **Qatar International Food Festival** — Al Bidda Park & Corniche — 2021 — services: 9 Carnival Games — visitors: 40,000 — winners: 5,500 — days: 19.

> The FIFA Balloon Distribution activation (12,000 balloons across 8 Qatar landmarks, 4 days) is surfaced as a Results highlight (see `results`), not a 14th project card.

Image paths are derived when no explicit path is set (Req 4.2):

```ts
resolveImagePath(project, i) // project.image ?? imagePathForIndex(i)
imagePathForIndex(i)         // -> `/work/img-${zeroPad3(i)}.png`
```

## Shared Utilities

### `useReveal` — the single shared scroll-reveal pattern (Req 4.9, 9.1)

Now built on GSAP + ScrollTrigger (Lenis-driven). Same call shape as before so existing call sites need only minor changes.

```ts
interface RevealOptions {
  start?: string;            // ScrollTrigger start, e.g. 'top 90%' (cards) or 'top 50%' (stats)
  once?: boolean;            // true → runs at most once, absorbing state (Req 5.4)
  disabled?: boolean;        // true when prefersReducedMotion() → skip, stay visible (Req 9.8)
  onReveal?: (el: Element) => void; // caller supplies the GSAP/anime effect
}
function useReveal(options: RevealOptions): (node: Element | null) => void;
```

Behavior: in `useEffect`, if `disabled` is true it does nothing (element already visible). Otherwise it creates a `ScrollTrigger` for the element; when the element crosses `start`, it invokes `onReveal(el)` (clip-path reveal, staggered animation, or count-up). With `once: true`, the trigger fires a single time and an internal `hasRevealed` flag prevents any restart. The same hook powers Work cards, Results, and Team.

### `lib/motion.ts` — shared motion utilities (Req 9.4)

```ts
prefersReducedMotion()      // window.matchMedia('(prefers-reduced-motion: reduce)').matches, SSR-safe → false
splitText(el, by)           // wrap words/chars of el in spans; returns the unit nodes for staggering (Req 2.3, 9.4)
parallax(el, opts)          // ScrollTrigger tween translating el at a different rate than scroll (Req 2.6, 9.4)
magnetic(el, opts)          // pointer-follow translate within a radius; returns cleanup (Req 9.4, 9.5)
initCursor()                // custom cursor pointer-follow; returns cleanup (Req 9.4, 9.6)
```

All of these no-op (returning the element in final visible state) when `prefersReducedMotion()` is true or when run during SSR.

### Pure helpers (`lib/format.ts`)

```ts
zeroPad3(n)                 // 0 -> '000', 12 -> '012'
imagePathForIndex(i)        // `/work/img-${zeroPad3(i)}.png`
resolveImagePath(project,i) // project.image ?? imagePathForIndex(i)  (Req 4.2)
buildMarqueeTrack(items)    // [...items, ...items]  (seamless loop)
staggerDelay(i, base)       // base * i  (base in [80,150])
countValue(target, p)       // clamp(round-toward-target(target * clamp(p,0,1)), 0, target)
splitWords(s)               // s.trim().split(/\s+/)  (headline words)
buildMailto(email)          // `mailto:${email}`
buildWaLink(phone)          // `https://wa.me/${digitsOnly(phone)}`
isContactDisabled(v)        // v.trim().length === 0
```

## Error Handling

| Failure | Handling | Requirement |
|---------|----------|-------------|
| Hero image missing / slow (>3s) | Solid `--color-base` background; foreground stays visible | 2.2 |
| Work / Team image missing/misnamed/error | `SafeImage` placeholder background; text + layout intact | 1.6, 4.10, 6.5 |
| GSAP fails to load/register plugin | try/catch; reveal/parallax targets default to visible; native scroll works | 9.7 |
| ScrollTrigger fails to init | try/catch; `useReveal` skips, elements stay in final visible state | 9.7 |
| Lenis fails to init | try/catch; native scrolling remains functional; GSAP ticker unaffected | 8.4, 9.7 |
| anime.js fails to load/init | Marquee renders static; count-up shows target values | 3.6, 5.6 (safe defaults) |
| `prefers-reduced-motion: reduce` set | Parallax, split-text, magnetic, cursor, marquee, count-up disabled; final visible state | 9.8, 3.7, 5.6, 6.7 |
| Scaffold create/install fails (incl. gsap) | CLI halts on failing step, not reported complete | 1.3 |

Design principle for animations: every animated element's **default (unanimated) state is its final visible state**. GSAP/ScrollTrigger/Lenis/anime.js only enhance; if none run, content is fully readable and correctly laid out.

## Testing Strategy

**Dual approach:** property-based tests for the pure helpers and state logic (high input coverage), plus a small number of example/integration tests for component wiring and fallbacks. Property tests run a minimum of 100 iterations and are tagged with their design property.

- **Property tests** (`lib/format.ts`, `useReveal` run-once logic): image mapping incl. explicit-path override, seamless track, count-up bounds/monotonicity, run-once absorbing state, stagger delays, link builders, disabled predicate, word split.
- **Example tests:** WorkCard image-error fallback and no-financials render; TeamCard shows role and omits name when absent; Hero image-failure fallback; Contact has no form/input; page renders 6 sections in order; clients list the exact 8 entries; results list only Public_Metric values with no financial terms; reduced-motion path renders final visible state.
- **Smoke tests:** style tokens applied (no shadow, radius 0, sans-serif, size floors); Lenis+ScrollTrigger integration mounts; anime.js configs present for count-up and marquee only.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — a formal statement about what the system should do. Properties bridge human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sequential image path mapping with explicit override

*For any* Project_Record `p` at zero-based index `i`, `resolveImagePath(p, i)` equals `p.image` when `p.image` is defined, and otherwise equals `/work/img-` + `zeroPad3(i)` + `.png`; and the `projects` array has exactly 13 entries mapped in definition order.

**Validates: Requirements 1.4, 4.2**

### Property 2: Seamless marquee track duplication

*For any* list of client entries `items`, `buildMarqueeTrack(items)` has length `2 × items.length`, and its first half and second half each equal `items` in order — guaranteeing no visible seam larger than the fixed inter-entry gap when looped.

**Validates: Requirements 3.3, 3.5**

### Property 3: Count-up value stays bounded and monotonic

*For any* non-negative `target` and progress `p` in `[0, 1]`, `countValue(target, p)` lies within `[0, target]`, with `countValue(target, 0) = 0` and `countValue(target, 1) = target`; and for any `p1 ≤ p2`, `countValue(target, p1) ≤ countValue(target, p2)`.

**Validates: Requirements 5.2, 5.3**

### Property 4: Count-up runs at most once (absorbing state)

*For any* finite sequence of visibility toggles applied to a stat block, once the count-up has started it never returns to the not-started state; the number of starts is at most one and the block continues displaying its target value after completion.

**Validates: Requirements 5.4**

### Property 5: Stagger delay is proportional to card index

*For any* zero-based index `i` and base delay `base` in `[80, 150]`, `staggerDelay(i, base) = base × i`; therefore `staggerDelay(0, base) = 0` and `staggerDelay` is non-decreasing in `i`. Applies to Work and Team reveals.

**Validates: Requirements 4.7, 6.6**

### Property 6: WhatsApp link builder preserves digits only

*For any* phone string `p`, `buildWaLink(p)` equals `https://wa.me/` followed by `p` with all non-digit characters removed, and the path segment after the domain contains digits only.

**Validates: Requirements 7.5, 7.6**

### Property 7: Mailto link builder

*For any* non-empty email string `e`, `buildMailto(e)` equals `mailto:` + `e`.

**Validates: Requirements 7.3, 7.4**

### Property 8: Contact-disabled predicate on empty input

*For any* string that is empty or contains only whitespace, `isContactDisabled(s)` is `true`; for any string containing at least one non-whitespace character, `isContactDisabled(s)` is `false`.

**Validates: Requirements 7.7**

### Property 9: Headline word-split round trip

*For any* headline string `s`, `splitWords(s)` produces no empty entries, and joining the result with a single space equals `s` with surrounding and collapsed internal whitespace normalized.

**Validates: Requirements 2.3**

### Property 10: Reduced-motion yields final visible state

*For any* reveal target, when `prefersReducedMotion()` is true (`useReveal` called with `disabled: true`), no reveal effect runs and the target's rendered state equals its final visible state; motion utilities `splitText`, `parallax`, `magnetic`, and `initCursor` perform no transform.

**Validates: Requirements 9.8, 2.6, 3.7, 5.6, 6.7**

### Property 11: Public metrics only (no financial figures)

*For any* Project_Record and any `results` entry, the rendered card and stat contain only Public_Metric fields (visitor, winner, staff, day, activation counts) and contain no revenue, cost, or net-profit figure.

**Validates: Requirements 4.5, 5.5, 8.6**
