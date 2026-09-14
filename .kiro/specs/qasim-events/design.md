# Design Document

## Overview

Qasim Events is a single-route marketing site built with Next.js (App Router), TypeScript, and Tailwind CSS. It renders exactly five sections in a fixed order (Hero → Trusted By marquee → Work grid → Numbers bar → Contact) with a dark navy/black base and a single maroon accent used sparingly. Animation is powered by anime.js v4 (ESM), and page scrolling is smoothed by Lenis. All content is static and hardcoded in one data module; there is no backend, CMS, or additional routes.

The central architectural decision is a **single shared scroll-reveal utility** (`useReveal`) built on `IntersectionObserver` + anime.js, reused by the Work grid, Numbers bar, and any other reveal section. This keeps animation behavior consistent and correct across the page and avoids per-section bespoke logic. Browser-only APIs (IntersectionObserver, Lenis, anime.js effects) run exclusively inside `useEffect` in `'use client'` components, so SSR stays safe.

Design is scoped to a pragmatic 4-hour build: working code, graceful fallbacks, no over-engineering.

### Requirements Mapping (high level)

| Area | Requirements |
|------|--------------|
| Scaffold, deps, image set | 1.1–1.6 |
| Hero | 2.1–2.5 |
| Marquee | 3.1–3.6 |
| Work grid | 4.1–4.8 |
| Numbers | 5.1–5.5 |
| Contact | 6.1–6.8 |
| Visual system, smooth scroll, section order | 7.1–7.6 |

## Architecture

### Technology & Setup

- **Framework:** Next.js App Router + TypeScript + Tailwind CSS (Req 1.1).
- **Dependencies:** `animejs` (v4), `lenis`, `clsx` (Req 1.2). Scaffold halts with an identified failing step if creation or install fails (Req 1.3) — this is a build-time/CLI concern, verified by the setup command exit status, not runtime code.
- **anime.js v4 ESM import:** `import { animate, createTimeline, stagger } from 'animejs'`.
- **Single route:** `app/page.tsx` composes all five sections in order (Req 7.6).

### Rendering & SSR Strategy

- Server components by default; components that animate or use browser APIs are marked `'use client'`.
- All Lenis and anime.js side effects run in `useEffect` and are guarded so they never execute during SSR.
- anime.js is imported statically at module top (ESM). If the effect throws or the module is unavailable, sections fall back to their static, fully-visible state (Req 3.6, and reveal targets default to visible — see Error Handling).

### File Structure

```
app/
  layout.tsx              # root layout, fonts, global metadata
  page.tsx                # composes the 5 sections in order (Req 7.6)
  globals.css             # Tailwind + CSS variables (tokens), base resets
components/
  SmoothScrollProvider.tsx  # 'use client' — Lenis lifecycle (Req 7.4)
  Hero.tsx                  # 'use client' — headline word animation (Req 2)
  Marquee.tsx               # 'use client' — seamless loop (Req 3)
  WorkGrid.tsx              # server or client wrapper for the grid (Req 4)
  WorkCard.tsx              # 'use client' — reveal + hover + img fallback
  Numbers.tsx               # container for stat blocks (Req 5)
  StatBlock.tsx             # 'use client' — count-up run-once (Req 5)
  Contact.tsx               # closing line + mailto/wa.me buttons (Req 6)
  SafeImage.tsx             # 'use client' — image with graceful fallback
lib/
  data.ts                 # ALL static content (projects, wordmarks, numbers, contact)
  reveal.ts               # useReveal hook — the shared scroll-reveal utility (Req 4.7, 7.5)
  format.ts               # pure helpers: image path, count value, links, splits
```

### Component Composition

```
RootLayout
└─ SmoothScrollProvider (Lenis)
   └─ page.tsx
      ├─ Hero
      ├─ Marquee
      ├─ WorkGrid → WorkCard ×13 (uses useReveal + SafeImage)
      ├─ Numbers → StatBlock ×3 (uses useReveal + count-up)
      └─ Contact
```

## Style System (Tokens)

Defined once in `globals.css` and mirrored in the Tailwind theme so both utility classes and raw CSS agree (Req 7.1–7.3).

```css
:root {
  --color-base: #0A0E1A;      /* dark navy/black base */
  --color-surface: #0F1424;   /* subtle raised panel, still dark */
  --color-text: #F2F2F0;      /* near-white body/heading text */
  --color-muted: #8A8F9C;     /* secondary text */
  --color-accent: #6E1423;    /* single maroon accent (used sparingly) */
  --space-block: 24px;        /* min spacing between content blocks (Req 7.2) */
}
```

Tailwind theme extension (conceptual):

```ts
theme: {
  extend: {
    colors: {
      base: 'var(--color-base)',
      surface: 'var(--color-surface)',
      accent: 'var(--color-accent)',
      muted: 'var(--color-muted)',
    },
    borderRadius: { none: '0px' },   // content containers stay square (Req 7.3)
  }
}
```

Global rules enforced by the token system and utility usage:

- Base background `--color-base` across all sections; maroon used only for small accents (button, thin rule, single word) to stay under 10% surface area (Req 7.1).
- Body text ≥ 16px, headings ≥ 32px, sans-serif system/`next/font` sans stack (Req 7.2).
- Content containers: **no** `box-shadow`, `border-radius: 0` (Req 7.3). Enforced by not applying shadow/rounded utilities and a defensive base rule.
- Vertical rhythm: sections and blocks use spacing ≥ `--space-block` (Req 7.2).

## Components and Interfaces

### SmoothScrollProvider (Req 7.4)

`'use client'` wrapper mounted in the layout. Instantiates Lenis in `useEffect`, drives it with `requestAnimationFrame`, and destroys it on unmount.

```ts
useEffect(() => {
  const lenis = new Lenis({ smoothWheel: true });
  let raf = 0;
  const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); lenis.destroy(); };
}, []);
```

If Lenis throws, the try/catch leaves native scrolling intact (still usable).

### Hero (Req 2)

- Full-bleed background using `SafeImage` for `/work/img-000.png` with `object-fit: cover` (Req 2.1). If it fails to load (or does not load within ~3s), a solid `--color-base` fallback shows while headline, subheadline, and scroll cue remain visible (Req 2.2). A timeout marks the image as failed if `onLoad` hasn't fired.
- Headline is split into words via `splitWords()` and each word wrapped in a span. On mount, a timeline animates each word: opacity 0→1 and `translateY` 20px→0, `duration: 600` per word, `delay: stagger(100)` (Req 2.3).
- Subheadline: single hardcoded string ≤120 chars with `whitespace-nowrap` (Req 2.4).
- Scroll cue: absolutely positioned at the section bottom, within the first viewport (Req 2.5).

```
interface HeroContent { headline: string; subheadline: string; /* ≤120 chars */ }
```

### Marquee (Req 3)

- Renders the 7 wordmarks as styled text (no images) in exact order, separated by a fixed gap (Req 3.1–3.3).
- Seamlessness via a **duplicated track**: `buildMarqueeTrack(wordmarks)` returns `[...wordmarks, ...wordmarks]`. anime.js animates the track `translateX` from `0` to `-50%` with `loop: true`, `ease: 'linear'`, constant duration → continuous scroll with no pause, and the seam is invisible because the second half is identical to the first (Req 3.4, 3.5).
- If anime.js fails to init, the track renders static and readable (all 7 visible), and the animation simply never starts (Req 3.6).

### WorkGrid + WorkCard (Req 4)

- `WorkGrid` renders 13 `WorkCard`s from `projects` (Req 4.1–4.3). Layout is a CSS grid where `spanForIndex(i)` marks some cells as 2-unit spans (`col-span-2` / `row-span-2`), producing the asymmetric look while keeping 13 cells (Req 4.1).
- Each `WorkCard` maps to its image via `imagePathForIndex(i)` (sequential `img-000`→`img-012`, Req 4.2) using `SafeImage`.
- **Reveal:** `WorkCard` uses the shared `useReveal` hook. When the card's top scrolls within the bottom 90% of the viewport (IntersectionObserver `rootMargin: '0px 0px -10% 0px'`, threshold 0), it animates `clip-path` inset from fully covered (`inset(100% 0 0 0)`) to fully visible (`inset(0 0 0 0)`), duration ~600ms (in 400–800 range) (Req 4.4). Stagger delay per card = `staggerDelay(index, base)` where base ∈ [80,150] (Req 4.5).
- **Hover:** CSS transition scales the image to 1.05 and slides the venue+stat overlay from hidden to visible over ~300ms (200–400 range) (Req 4.6).
- **Single reveal function:** every card uses the same `useReveal` (Req 4.7, 7.5).
- **Image failure:** `SafeImage` renders a placeholder `--color-surface` background; the card retains title/venue/year/stat and grid cell size, so layout doesn't break (Req 4.8, 1.6).

```
interface Project { title: string; venue: string; year: string; stat: string; }
```

### Numbers + StatBlock (Req 5)

- `Numbers` renders exactly 3 `StatBlock`s from `numbers` (Req 5.1, 5.5 — labels contain only activation/visitor language, no revenue/profit).
- **Count-up:** each `StatBlock` uses `useReveal` with `threshold: 0.5`. On first reaching ≥50% visibility, it runs a count-up: an anime.js tween drives progress `0→1` over 1–3s, and the displayed value = `countValue(target, progress)` (rounds toward target, clamps to `[0, target]`). At completion it shows the exact target with its suffix/label (Req 5.2, 5.3).
- **Run once:** a `started` ref/flag becomes an absorbing state — once set it never resets, so re-entering the viewport does not restart the animation; the target value persists (Req 5.4). This is handled inside `useReveal`'s `once: true` mode.

```
interface StatItem { target: number; suffix: string; label: string; }
// e.g. { target: 13,   suffix: '+',  label: 'Activations' }
//      { target: 3.75, suffix: 'M+', label: 'Visitors at peak event' }
//      { target: 3,    suffix: '',   label: 'FIFA World Cup 2022 activations' }
```

### Contact (Req 6)

- Closing headline sized in the 32–72px range (Req 6.1).
- Email and WhatsApp buttons side by side in one flex row (Req 6.2).
- Email href = `buildMailto(email)` where `email` defaults to `hello@qasim-events.qa` (editable in `data.ts`) (Req 6.3, 6.4).
- WhatsApp href = `buildWaLink(phone)` producing `https://wa.me/<digits>`, phone editable and beginning with `974` (Req 6.5, 6.6).
- If email or phone is empty/whitespace, `isContactDisabled()` is true and the corresponding button is rendered disabled with no active link (Req 6.7).
- No `<form>` or `<input>` anywhere in the section (Req 6.8).

### SafeImage (shared, Req 1.5/1.6, 2.2, 4.8)

`'use client'` component wrapping `next/image` (or plain `<img>` for missing-file tolerance). Tracks `failed` state; on `onError` (or hero load timeout) it renders a placeholder background of `--color-surface` (or `--color-base` for hero) instead of the image, without throwing. Present images display with no code change (Req 1.5); missing/misnamed images are simply omitted with a placeholder (Req 1.6).

> Note: `next/image` requires known files at build in some configs; because images arrive later and some may be missing, `SafeImage` uses a plain `<img>` with `onError`/`onLoad` fallback to guarantee graceful degradation. This trades Next image optimization for robustness, which suits the demo scope.

## Data Models

All static content lives in `lib/data.ts`.

```ts
export const contact = {
  email: 'hello@qasim-events.qa',   // editable (Req 6.3)
  phone: '974XXXXXXXX',             // editable, Qatar intl format (Req 6.5)
};

export const wordmarks = [
  'Qatari Diar', 'Lusail', 'Qatar Tourism', 'Qatar Foundation',
  'LULU', 'Lagoona Mall', 'Doha Festival City',
] as const; // exact order (Req 3.1, 3.3)

export const numbers: StatItem[] = [
  { target: 13,   suffix: '+',  label: 'Activations' },
  { target: 3.75, suffix: 'M+', label: 'Visitors at peak event' },
  { target: 3,    suffix: '',   label: 'FIFA World Cup 2022 activations' },
]; // (Req 5.1, 5.5)

export const projects: Project[] = [ /* exactly 13 entries: title, venue, year, stat */ ];
```

Image paths are derived, not stored, keeping data and file mapping in sync (Req 4.2):

```ts
imagePathForIndex(i) // -> `/work/img-${zeroPad3(i)}.png`
```

## Shared Utilities (`lib/reveal.ts`, `lib/format.ts`)

### `useReveal` — the single shared scroll-reveal utility (Req 4.7, 7.5)

```ts
interface RevealOptions {
  threshold?: number;        // IO threshold (0 for cards, 0.5 for stat blocks)
  rootMargin?: string;       // e.g. '0px 0px -10% 0px' for the bottom-90% trigger
  once?: boolean;            // true → absorbing state, never re-triggers (Req 5.4)
  onReveal?: (el: Element) => void; // caller supplies the anime.js effect
}

function useReveal(options: RevealOptions): (node: Element | null) => void;
```

Behavior: attaches an `IntersectionObserver` in `useEffect`; when an observed element crosses the threshold, it invokes `onReveal(el)` (which runs the clip-path reveal, staggered animation, or count-up). With `once: true`, the element is unobserved after firing and an internal `hasRevealed` flag prevents any restart. The same hook powers Work cards (clip-path reveal + stagger), Numbers (count-up), and any future reveal section.

### Pure helpers (`lib/format.ts`)

```ts
zeroPad3(n)             // 0 -> '000', 12 -> '012'
imagePathForIndex(i)    // `/work/img-${zeroPad3(i)}.png`
buildMarqueeTrack(ws)   // [...ws, ...ws]  (seamless loop)
staggerDelay(i, base)   // base * i  (base in [80,150])
countValue(target, p)   // clamp(round-toward-target(target * clamp(p,0,1)), 0, target)
splitWords(s)           // s.trim().split(/\s+/)  (headline words)
buildMailto(email)      // `mailto:${email}`
buildWaLink(phone)      // `https://wa.me/${digitsOnly(phone)}`
isContactDisabled(v)    // v.trim().length === 0
```

## Error Handling

| Failure | Handling | Requirement |
|---------|----------|-------------|
| Hero image missing / slow (>3s) | Solid `--color-base` background; foreground stays visible | 2.2 |
| Work image missing/misnamed/error | `SafeImage` placeholder background; text + grid intact | 1.6, 4.8 |
| anime.js fails to load/init | Reveal targets default to visible; marquee renders static; count-up shows target values | 3.6, and safe defaults for 4/5 |
| Lenis fails to init | try/catch; native scrolling remains functional | 7.4 (graceful) |
| Scaffold create/install fails | CLI halts on failing step, not reported complete | 1.3 |

Design principle for animations: every animated element's **default (unanimated) state is its final visible state**. anime.js only enhances; if it never runs, content is still fully readable and correctly laid out.

## Testing Strategy

**Dual approach:** property-based tests for the pure helpers and state logic (high input coverage), plus a small number of example/integration tests for component wiring and fallbacks. Property tests run a minimum of 100 iterations and are tagged with their design property.

- **Property tests** (`lib/format.ts`, `useReveal` run-once logic): mapping, seamless track, count-up bounds/monotonicity, run-once absorbing state, stagger delays, link builders, disabled predicate, word split.
- **Example tests:** WorkCard image-error fallback; Hero image-failure fallback; Contact has no form/input; page renders 5 sections in order; marquee lists the exact 7 wordmarks; numbers list the exact 3 values with no revenue/profit terms.
- **Smoke tests:** style tokens applied (no shadow, radius 0, sans-serif, size floors); Lenis mounts; anime.js configs present.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — a formal statement about what the system should do. Properties bridge human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sequential image path mapping

*For any* zero-based index `i` in `0..12`, `imagePathForIndex(i)` equals `/work/img-` + `zeroPad3(i)` + `.png`, and the `projects` array has exactly 13 entries mapped in definition order.

**Validates: Requirements 1.4, 4.2**

### Property 2: Seamless marquee track duplication

*For any* list of wordmarks `ws`, `buildMarqueeTrack(ws)` has length `2 × ws.length`, and its first half and second half each equal `ws` in order — guaranteeing no visible seam larger than the fixed inter-wordmark gap when looped.

**Validates: Requirements 3.3, 3.5**

### Property 3: Count-up value stays bounded and monotonic

*For any* non-negative `target` and progress `p` in `[0, 1]`, `countValue(target, p)` lies within `[0, target]`, with `countValue(target, 0) = 0` and `countValue(target, 1) = target`; and for any `p1 ≤ p2`, `countValue(target, p1) ≤ countValue(target, p2)`.

**Validates: Requirements 5.2, 5.3**

### Property 4: Count-up runs at most once (absorbing state)

*For any* finite sequence of visibility toggles applied to a stat block, once the count-up has started it never returns to the not-started state; the number of starts is at most one and the block continues displaying its target value after completion.

**Validates: Requirements 5.4**

### Property 5: Stagger delay is proportional to card index

*For any* zero-based index `i` and base delay `base` in `[80, 150]`, `staggerDelay(i, base) = base × i`; therefore `staggerDelay(0, base) = 0` and `staggerDelay` is non-decreasing in `i`.

**Validates: Requirements 4.5**

### Property 6: WhatsApp link builder preserves digits only

*For any* phone string `p`, `buildWaLink(p)` equals `https://wa.me/` followed by `p` with all non-digit characters removed, and the path segment after the domain contains digits only.

**Validates: Requirements 6.5, 6.6**

### Property 7: Mailto link builder

*For any* non-empty email string `e`, `buildMailto(e)` equals `mailto:` + `e`.

**Validates: Requirements 6.3, 6.4**

### Property 8: Contact-disabled predicate on empty input

*For any* string that is empty or contains only whitespace, `isContactDisabled(s)` is `true`; for any string containing at least one non-whitespace character, `isContactDisabled(s)` is `false`.

**Validates: Requirements 6.7**

### Property 9: Headline word-split round trip

*For any* headline string `s`, `splitWords(s)` produces no empty entries, and joining the result with a single space equals `s` with surrounding and collapsed internal whitespace normalized.

**Validates: Requirements 2.3**
