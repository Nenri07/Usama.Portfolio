# Implementation Plan: Qasim Events

## Overview

Top-down, section-by-section build tuned for a 4-hour same-day pitch demo. First scaffold the Next.js app and install dependencies, then lay down the shared foundation (style tokens, pure helpers, the single `useReveal` hook, and the Lenis smooth-scroll provider). After that, build the five sections in page order — Hero → Marquee → Work grid → Numbers → Contact — wiring each into `app/page.tsx` as it is built so the page renders and scrolls correctly early. Property-based tests cover the pure helpers and the count-up run-once logic; a handful of example/smoke tests cover component wiring and fallbacks. All image references degrade gracefully so nothing blocks on the user-supplied `img-000.png`–`img-012.png`.

## Tasks

- [x] 1. Scaffold project and shared foundation
  - [x] 1.1 Scaffold the Next.js app and install dependencies
    - Run `npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir` into this workspace
    - Run `npm install animejs lenis clsx`
    - Confirm the app builds/runs and halt with the failing step identified if creation or install fails
    - Create `public/work/` directory (empty; user adds `img-000.png`–`img-012.png` later)
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Define style tokens, globals, and Tailwind theme
    - Add CSS variables in `app/globals.css`: `--color-base #0A0E1A`, `--color-surface #0F1424`, `--color-text #F2F2F0`, `--color-muted #8A8F9C`, `--color-accent #6E1423`, `--space-block 24px`
    - Set base background/text, sans-serif stack, body ≥16px / headings ≥32px, and a defensive rule for no box-shadow and border-radius 0 on content containers
    - Mirror colors and `borderRadius.none` in the Tailwind theme extension
    - Configure `next/font` sans stack in `app/layout.tsx`
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 1.3 Implement pure helpers in `lib/format.ts`
    - Implement `zeroPad3`, `imagePathForIndex`, `buildMarqueeTrack`, `staggerDelay`, `countValue`, `splitWords`, `buildMailto`, `buildWaLink` (digits-only), `isContactDisabled`
    - _Requirements: 1.4, 4.2, 3.5, 4.5, 5.2, 5.3, 6.3, 6.4, 6.5, 6.6, 6.7, 2.3_

  - [ ]* 1.4 Write property-based tests for pure helpers
    - Set up test framework (Vitest + fast-check); run each property ≥100 iterations, tagged with its property number
    - **Property 1: Sequential image path mapping** — Validates: Requirements 1.4, 4.2
    - **Property 2: Seamless marquee track duplication** — Validates: Requirements 3.3, 3.5
    - **Property 3: Count-up value stays bounded and monotonic** — Validates: Requirements 5.2, 5.3
    - **Property 5: Stagger delay is proportional to card index** — Validates: Requirements 4.5
    - **Property 6: WhatsApp link builder preserves digits only** — Validates: Requirements 6.5, 6.6
    - **Property 7: Mailto link builder** — Validates: Requirements 6.3, 6.4
    - **Property 8: Contact-disabled predicate on empty input** — Validates: Requirements 6.7
    - **Property 9: Headline word-split round trip** — Validates: Requirements 2.3

  - [x] 1.5 Create static content module `lib/data.ts`
    - Define `contact` (email default `hello@qasim-events.qa`, editable Qatar `phone` starting `974`), `wordmarks` (exact 7 in order), `numbers` (exact 3 stat items, activation/visitor only), and `projects` (exactly 13 entries: title, venue, year, stat)
    - Declare `Project` and `StatItem` interfaces
    - _Requirements: 3.1, 3.3, 5.1, 5.5, 6.3, 6.5, 4.1, 4.3, 1.4_

  - [x] 1.6 Implement the shared `useReveal` hook in `lib/reveal.ts`
    - `IntersectionObserver` in `useEffect` with `threshold`, `rootMargin`, `once`, `onReveal` options
    - With `once: true`, unobserve after firing and use an internal `hasRevealed` flag as an absorbing state so it never re-triggers
    - Return a ref callback; SSR-safe (no browser API access during render)
    - _Requirements: 4.7, 7.5, 5.4_

  - [ ]* 1.7 Write property test for `useReveal` run-once logic
    - **Property 4: Count-up runs at most once (absorbing state)** — Validates: Requirements 5.4
    - Model visibility toggle sequences; assert start count ≤ 1 and no reset to not-started

  - [x] 1.8 Implement `SmoothScrollProvider` and mount in layout
    - `'use client'` — instantiate Lenis in `useEffect`, drive with `requestAnimationFrame`, destroy on unmount, wrap in try/catch so native scroll survives init failure
    - Mount around children in `app/layout.tsx`
    - _Requirements: 7.4_

  - [x] 1.9 Implement `SafeImage` and create initial `app/page.tsx` shell
    - `'use client'` — plain `<img>` with `onError`/`onLoad`; on error (or hero timeout) render a placeholder background (`--color-surface`, or `--color-base` for hero) without throwing; present images display with no code change
    - Create `app/page.tsx` composing the five sections in order (empty/placeholder section shells for now) so the route renders and scrolls
    - _Requirements: 1.5, 1.6, 4.8, 2.2, 7.6_

- [x] 2. Checkpoint - skeleton renders and scrolls
  - Ensure the app builds, the single route renders the five ordered section shells, and Lenis smooth scroll works. Ask the user if questions arise.

- [x] 3. Build Hero section
  - [x] 3.1 Implement `Hero` and wire into `app/page.tsx`
    - Full-bleed `SafeImage` for `/work/img-000.png` with `object-fit: cover`; solid `--color-base` fallback on failure or >3s timeout while foreground stays visible
    - `splitWords()` headline; on-mount anime.js timeline animates each word opacity 0→1 and translateY 20px→0, `duration: 600`, `delay: stagger(100)`; default (unanimated) state is final visible state
    - Subheadline single line ≤120 chars with `whitespace-nowrap`; scroll cue anchored to section bottom within the first viewport
    - Replace the Hero shell in `app/page.tsx`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Write example test for Hero image-failure fallback
    - Assert headline, subheadline, and scroll cue remain visible when the image fails to load
    - _Requirements: 2.2_

- [x] 4. Build Marquee section
  - [x] 4.1 Implement `Marquee` and wire into `app/page.tsx`
    - Render 7 wordmarks as styled text (no images) in exact order with a fixed inter-wordmark gap
    - Duplicated track via `buildMarqueeTrack`; anime.js animates `translateX` 0→-50%, `loop: true`, `ease: 'linear'`, constant speed, seamless
    - If anime.js fails to init, track renders static and fully readable (all 7 visible)
    - Replace the Marquee shell in `app/page.tsx`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 4.2 Write example test for Marquee wordmarks
    - Assert exactly the 7 specified wordmarks render in order
    - _Requirements: 3.1, 3.3_

- [x] 5. Build Work grid section
  - [x] 5.1 Implement `WorkCard` (reveal + hover + image fallback)
    - `'use client'` — map to image via `imagePathForIndex(i)` using `SafeImage`; render title, venue, year, stat
    - Reveal via shared `useReveal` (`rootMargin '0px 0px -10% 0px'`, threshold 0): clip-path inset from `inset(100% 0 0 0)` to `inset(0 0 0 0)`, duration ~600ms; per-card stagger via `staggerDelay(index, base)` with base ∈ [80,150]
    - Hover: CSS transition scales image to 1.05 and slides venue+stat overlay hidden→visible over ~300ms
    - On image failure, `SafeImage` placeholder background; text and grid cell size retained
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 1.6_

  - [x] 5.2 Implement `WorkGrid` and wire into `app/page.tsx`
    - Render 13 `WorkCard`s from `projects`; asymmetric CSS grid where `spanForIndex(i)` marks some cells as 2-unit spans while keeping 13 cells
    - Replace the Work shell in `app/page.tsx`
    - _Requirements: 4.1, 4.2, 4.7_

  - [ ]* 5.3 Write example test for WorkCard image-error fallback
    - Assert placeholder background shows and title/venue/year/stat remain, grid layout intact, when an image errors
    - _Requirements: 4.8, 1.6_

- [x] 6. Checkpoint - Hero, Marquee, and Work render and reveal
  - Ensure all tests pass and the top three sections render, scroll, and reveal correctly. Ask the user if questions arise.

- [x] 7. Build Numbers section
  - [x] 7.1 Implement `StatBlock` with count-up run-once
    - `'use client'` — `useReveal` with `threshold: 0.5`, `once: true`; on first ≥50% visibility run anime.js tween progress 0→1 over 1–3s, display `countValue(target, progress)`
    - At completion show exact target with suffix/label; re-entering viewport never restarts (absorbing state)
    - Default (unanimated) state shows the target value if anime.js never runs
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 7.2 Implement `Numbers` and wire into `app/page.tsx`
    - Render exactly 3 `StatBlock`s from `numbers` ("13+ Activations", "3.75M+ Visitors at peak event", "3 FIFA World Cup 2022 activations"); exclude any revenue/profit figures
    - Replace the Numbers shell in `app/page.tsx`
    - _Requirements: 5.1, 5.5_

  - [ ]* 7.3 Write example test for Numbers values
    - Assert the exact 3 values render and no revenue/profit terms are present
    - _Requirements: 5.1, 5.5_

- [x] 8. Build Contact section
  - [x] 8.1 Implement `Contact` and wire into `app/page.tsx`
    - Closing headline sized 32–72px; Email and WhatsApp buttons side by side in one flex row
    - Email href via `buildMailto(email)`; WhatsApp href via `buildWaLink(phone)` (digits only, `974` prefix)
    - If email or phone is empty/whitespace, `isContactDisabled` disables the corresponding button and prevents activation
    - No `<form>` or `<input>` anywhere in the section
    - Replace the Contact shell in `app/page.tsx`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ]* 8.2 Write example test asserting Contact has no form/input
    - Assert no `<form>` or `<input>` elements render in the section
    - _Requirements: 6.8_

- [x] 9. Final wiring, visual system, and polish
  - [x] 9.1 Verify full-page composition and visual system
    - Confirm `app/page.tsx` renders all five sections in order Hero → Marquee → Work → Numbers → Contact on the single route
    - Verify maroon accent stays sparing (<10% surface), spacing ≥24px between blocks, no shadows, radius 0, size floors — adjust as needed
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

  - [ ]* 9.2 Write example + smoke tests for page and style system
    - Page renders 5 sections in order; style tokens applied (no shadow, radius 0, sans-serif, size floors); Lenis mounts; anime.js configs present
    - _Requirements: 7.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass and the page renders, scrolls, reveals, and degrades gracefully without real images. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests) and can be skipped to hit the demo timeframe faster; keep testing proportional to the 4-hour build.
- Build order is top-down: scaffold and shared foundation first, then each section wired into `app/page.tsx` as it is built so the page renders and scrolls early — working code before animation polish.
- Images (`img-000.png`–`img-012.png`) are supplied by the user later; every image reference uses `SafeImage` with placeholder/fallback so no task blocks on real images.
- Each task references specific requirement clauses for traceability; property tests are tagged with their design property number.
- Animation default state = final visible state everywhere, so content remains readable and correctly laid out if anime.js/Lenis never run.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.5", "1.6"] },
    { "id": 2, "tasks": ["1.4", "1.7", "1.8", "1.9"] },
    { "id": 3, "tasks": ["3.1", "4.1", "5.1", "7.1", "8.1"] },
    { "id": 4, "tasks": ["3.2", "4.2", "5.2", "7.2", "8.2"] },
    { "id": 5, "tasks": ["5.3", "7.3", "9.1"] },
    { "id": 6, "tasks": ["9.2"] }
  ]
}
```
