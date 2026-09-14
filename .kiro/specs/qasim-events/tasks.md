# Implementation Plan: Qasim Events

## Overview

Phase 1 (tasks 1–10) built the original five-section site with anime.js + Lenis and is complete. Phase 2 (tasks 11–17) reworked the site into a heavily motion-driven agency experience — **GSAP + ScrollTrigger primary, Lenis driving ScrollTrigger, anime.js secondary (count-up, marquee)** — with shared motion utilities, motion applied to every section, an enriched Work grid, expanded Clients/Results, and a new Team section, and is complete.

Phase 3 (section 18, NOT started) pushes the site to closely match the feel of jesperlandberg.com. It adds the signature WebGL hover-image project list: the Work section is rebuilt from a card grid into a big-type `Project_List` (`WorkList` + `ProjectRow`) whose rows summon a cursor-following, displacement/RGB-shift-warped preview drawn on a single shared `ogl` canvas (`HoverImageCanvas`, `lib/webgl.ts`). It also retunes Lenis to heavier inertia, adds a `splitLines` line-mask heading reveal applied to the hero and section titles, and gives the custom cursor a hover state. Every new behavior is feature-gated and try/catch-wrapped so touch / coarse pointers, reduced motion, missing WebGL, or any init failure leave a fully readable, correctly laid-out page (the list reads as plain text, headings show immediately, scrolling is native). `ogl` ^1.0.11 is already installed. New tasks are appended as section 18; tasks 1–16 (except optional `*` tests and task 17) are complete.

## Tasks

- [x] 1. Scaffold project and shared foundation
  - [x] 1.1 Scaffold the Next.js app and install dependencies
    - Run `npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir` into this workspace
    - Run `npm install animejs lenis clsx`
    - Confirm the app builds/runs and halt with the failing step identified if creation or install fails
    - Create `public/work/` directory (empty; user adds images later)
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Define style tokens, globals, and Tailwind theme
    - Add CSS variables in `app/globals.css`: `--color-base #0A0E1A`, `--color-surface #0F1424`, `--color-text #F2F2F0`, `--color-muted #8A8F9C`, `--color-accent #6E1423`, `--space-block 24px`
    - Set base background/text, sans-serif stack, body ≥16px / headings ≥32px, and defensive no box-shadow / border-radius 0 on content containers
    - Configure `next/font` sans stack in `app/layout.tsx`
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 1.3 Implement pure helpers in `lib/format.ts`
    - Implement `zeroPad3`, `imagePathForIndex`, `buildMarqueeTrack`, `staggerDelay`, `countValue`, `splitWords`, `buildMailto`, `buildWaLink` (digits-only), `isContactDisabled`
    - _Requirements: 1.4, 4.2, 3.5, 4.7, 5.2, 5.3, 7.3, 7.4, 7.5, 7.6, 7.7, 2.3_

  - [ ]* 1.4 Write property-based tests for pure helpers
    - Set up test framework (Vitest + fast-check); run each property ≥100 iterations, tagged with its property number
    - **Property 2: Seamless marquee track duplication** — Validates: Requirements 3.3, 3.5
    - **Property 3: Count-up value stays bounded and monotonic** — Validates: Requirements 5.2, 5.3
    - **Property 6: WhatsApp link builder preserves digits only** — Validates: Requirements 7.5, 7.6
    - **Property 7: Mailto link builder** — Validates: Requirements 7.3, 7.4
    - **Property 8: Contact-disabled predicate on empty input** — Validates: Requirements 7.7
    - **Property 9: Headline word-split round trip** — Validates: Requirements 2.3

  - [x] 1.5 Create static content module `lib/data.ts`
    - Define `contact`, `wordmarks`, `numbers`, and `projects` (13 entries: title, venue, year, stat)
    - _Requirements: 3.1, 3.3, 5.1, 5.5, 7.3, 7.5, 4.1, 4.3, 1.4_

  - [x] 1.6 Implement the shared `useReveal` hook in `lib/reveal.ts`
    - `IntersectionObserver` in `useEffect` with `threshold`, `rootMargin`, `once`, `onReveal` options; absorbing `hasRevealed` flag; SSR-safe
    - _Requirements: 4.9, 5.4_

  - [ ]* 1.7 Write property test for `useReveal` run-once logic
    - **Property 4: Count-up runs at most once (absorbing state)** — Validates: Requirements 5.4

  - [x] 1.8 Implement `SmoothScrollProvider` and mount in layout
    - `'use client'` — instantiate Lenis in `useEffect`, drive with `requestAnimationFrame`, destroy on unmount, try/catch so native scroll survives init failure
    - _Requirements: 8.4_

  - [x] 1.9 Implement `SafeImage` and create initial `app/page.tsx` shell
    - `'use client'` plain `<img>` with `onError`/`onLoad` and placeholder fallback; compose the ordered section shells so the route renders and scrolls
    - _Requirements: 1.5, 1.6, 4.10, 2.2, 8.5_

- [x] 2. Checkpoint - skeleton renders and scrolls

- [x] 3. Build Hero section
  - [x] 3.1 Implement `Hero` and wire into `app/page.tsx`
    - Full-bleed `SafeImage` for `/work/img-000.png`; solid fallback on failure/timeout; `splitWords()` headline with anime.js stagger; single-line subheadline; scroll cue
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 3.2 Write example test for Hero image-failure fallback — _Requirements: 2.2_

- [x] 4. Build Marquee section
  - [x] 4.1 Implement `Marquee` and wire into `app/page.tsx`
    - 7 wordmarks as styled text, duplicated track, anime.js seamless loop, static fallback
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 4.2 Write example test for Marquee wordmarks — _Requirements: 3.1, 3.3_

- [x] 5. Build Work grid section
  - [x] 5.1 Implement `WorkCard` (reveal + hover + image fallback)
    - _Requirements: 4.3, 4.6, 4.7, 4.8, 4.9, 4.10, 1.6_
  - [x] 5.2 Implement `WorkGrid` and wire into `app/page.tsx`
    - _Requirements: 4.1, 4.2, 4.9_
  - [ ]* 5.3 Write example test for WorkCard image-error fallback — _Requirements: 4.10, 1.6_

- [x] 6. Checkpoint - Hero, Marquee, and Work render and reveal

- [x] 7. Build Numbers section
  - [x] 7.1 Implement `StatBlock` with count-up run-once — _Requirements: 5.2, 5.3, 5.4_
  - [x] 7.2 Implement `Numbers` and wire into `app/page.tsx` — _Requirements: 5.1, 5.5_
  - [ ]* 7.3 Write example test for Numbers values — _Requirements: 5.1, 5.5_

- [x] 8. Build Contact section
  - [x] 8.1 Implement `Contact` and wire into `app/page.tsx` — _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  - [ ]* 8.2 Write example test asserting Contact has no form/input — _Requirements: 7.8_

- [x] 9. Final wiring, visual system, and polish
  - [x] 9.1 Verify full-page composition and visual system — _Requirements: 8.1, 8.2, 8.3, 8.5_
  - [ ]* 9.2 Write example + smoke tests for page and style system — _Requirements: 8.5, 8.1, 8.2, 8.3, 8.4_

- [x] 10. Final checkpoint - Ensure all tests pass

- [x] 11. Motion foundation: GSAP + ScrollTrigger driven by Lenis
  - [x] 11.1 Install gsap and register ScrollTrigger
    - `npm install gsap` (ALREADY DONE — verify `gsap` and `gsap/ScrollTrigger` resolve; halt with the failing step identified if the install is incomplete)
    - Add a client-only registration helper that calls `gsap.registerPlugin(ScrollTrigger)` once, guarded to run only in the browser
    - _Requirements: 1.2, 1.3, 9.1_

  - [x] 11.2 Rewire `SmoothScrollProvider` to drive ScrollTrigger with Lenis
    - Register ScrollTrigger; instantiate Lenis; wire `lenis.on('scroll', ScrollTrigger.update)`; advance Lenis from the GSAP ticker `gsap.ticker.add((t) => lenis.raf(t * 1000))` and call `gsap.ticker.lagSmoothing(0)`; remove the standalone Lenis rAF loop
    - Clean up on unmount (remove ticker fn, `lenis.destroy()`, kill all ScrollTriggers); wrap in try/catch so native scroll + final visible state survive init failure
    - _Requirements: 8.4, 9.1, 9.2, 9.7_

  - [x] 11.3 Add `prefersReducedMotion` and migrate `useReveal` to GSAP + ScrollTrigger
    - Add `prefersReducedMotion()` in `lib/motion.ts` (SSR-safe, returns false on server)
    - Reimplement `useReveal` in `lib/reveal.ts` on `ScrollTrigger` with `start`, `once`, `disabled`, `onReveal`; when `disabled` (reduced motion) it skips and leaves the element in final visible state; keep the absorbing run-once flag for count-up
    - _Requirements: 4.9, 5.4, 9.1, 9.7, 9.8_

- [x] 12. Shared motion utilities in `lib/motion.ts`
  - [x] 12.1 Implement `splitText` and `parallax`
    - `splitText(el, by)` wraps words/chars in spans and returns unit nodes; no-op returning final visible state under reduced motion / SSR
    - `parallax(el, opts)` binds a ScrollTrigger tween translating `el` at a different rate than scroll; skipped under reduced motion
    - _Requirements: 2.3, 2.6, 9.4, 9.8_

  - [x] 12.2 Implement `magnetic` and `MagneticButton`
    - `magnetic(el, opts)` translates `el` toward the pointer within a radius using a GSAP tween and returns to rest on leave; returns a cleanup fn; no-op under reduced motion
    - `MagneticButton` `'use client'` wrapper applying `magnetic` to its child; child stays fully clickable
    - _Requirements: 9.4, 9.5, 9.8_

  - [x] 12.3 Implement `initCursor` and `CustomCursor`, mount in layout
    - `initCursor()` follows the pointer with a smoothed GSAP `quickTo`; returns cleanup; disabled under reduced motion and on coarse pointers
    - `CustomCursor` `'use client'` component mounting `initCursor` in `useEffect`; renders nothing during SSR; mount inside `SmoothScrollProvider` in `app/layout.tsx`
    - _Requirements: 9.4, 9.6, 9.8_

  - [ ]* 12.4 Write property/example tests for reduced-motion motion utilities
    - **Property 10: Reduced-motion yields final visible state** — Validates: Requirements 9.8, 2.6, 3.7, 5.6, 6.7
    - Assert `splitText`, `parallax`, `magnetic`, `initCursor`, and `useReveal({disabled:true})` apply no transform and leave final visible state

- [x] 13. Extend data models and pure helpers for new content
  - [x] 13.1 Extend `Project`, add `clients`/`results`/`team`, add `resolveImagePath`
    - In `lib/data.ts`: extend `Project` with `services: string[]` and optional `visitors`/`winners`/`staff`/`days`/`image` (NO revenue/cost/profit fields); replace the 13 projects with the enriched entries from the design
    - Add `clients` (exact 8: Qatari Diar, Lusail, Qatar Foundation, LULU, Lagoona Mall, Doha Festival City, Qatar Racing Club, FIFA World Cup 2022); update `results` to the 5 design stats; add `team` (role-based, `name` optional, `image`)
    - Add editable `contact.whatsapp` placeholder starting `974`
    - In `lib/format.ts`: add `resolveImagePath(project, i)` returning `project.image ?? imagePathForIndex(i)`
    - _Requirements: 3.1, 3.3, 4.2, 4.3, 4.4, 4.5, 5.1, 5.5, 6.1, 6.2, 6.3, 7.5, 8.6_

  - [ ]* 13.2 Write property tests for image resolution and no-financials
    - **Property 1: Sequential image path mapping with explicit override** — Validates: Requirements 1.4, 4.2
    - **Property 11: Public metrics only (no financial figures)** — Validates: Requirements 4.5, 5.5, 8.6

- [x] 14. Apply motion to existing sections
  - [x] 14.1 Add split-text headline animation and background parallax to `Hero`
    - Replace the anime.js word stagger with `splitText` + a GSAP timeline (opacity 0→1, `y` 20→0, stagger 80–120ms); apply `parallax` to the background image only, keeping headline/subheadline/scroll cue readable at every position; default state stays final-visible
    - _Requirements: 2.3, 2.6, 9.1, 9.4, 9.8_

  - [x] 14.2 Update `Marquee` to render the Clients_Section with reduced-motion handling
    - Source from `clients`; render all 8 entries as styled text in order with a fixed gap; keep the anime.js seamless loop as a secondary effect; when `prefersReducedMotion()` render static wordmarks (no auto-scroll)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.3, 9.8_

  - [x] 14.3 Enrich `WorkCard` content and confirm shared GSAP reveal
    - Render `services` highlights and any `visitors`/`winners`/`staff`/`days` counts in the detail overlay; resolve image via `resolveImagePath`; ensure NO financial figures render; keep clip-path reveal + stagger via the migrated `useReveal`; retain hover scale + overlay slide and `SafeImage` fallback
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 8.6_

  - [x] 14.4 Update `StatBlock`/`Numbers` for the Results_Section
    - Render the 5 `results` stats; count-up (anime.js secondary) triggered through the migrated `useReveal`; under reduced motion show exact targets immediately; exclude all financial figures
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.3, 9.8_

- [x] 15. Build the Team section
  - [x] 15.1 Implement `TeamCard`
    - `'use client'` — show `role` always, `name` only when present (no invented placeholder when absent); `SafeImage` from `public/work` with placeholder fallback; reveal via shared `useReveal` with per-card stagger; skip under reduced motion
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 15.2 Implement `Team` container and wire into `app/page.tsx`
    - Render one `TeamCard` per `team` entry between Results and Contact
    - _Requirements: 6.1, 8.5_

  - [ ]* 15.3 Write example test for TeamCard role/name rendering
    - Assert role always renders and no name/placeholder appears when `name` is undefined
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 16. Wire magnetic buttons and finalize composition
  - [x] 16.1 Wrap Contact buttons in `MagneticButton`
    - Wrap the Email and WhatsApp buttons; preserve `buildMailto`/`buildWaLink` hrefs and `isContactDisabled` behavior; buttons remain fully clickable and static under reduced motion
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 9.4, 9.5, 9.8_

  - [x] 16.2 Verify six-section composition, motion layering, and visual system
    - Confirm `app/page.tsx` renders Hero → Clients → Work → Results → Team → Contact in order; confirm GSAP is the only scroll-choreography engine, Lenis drives ScrollTrigger, anime.js only powers count-up + marquee; verify maroon <10% surface, spacing ≥24px, no shadows, radius 0, size floors, and NO financial figures anywhere
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 9.1, 9.2, 9.3_

  - [ ]* 16.3 Write example + smoke tests for the reworked page
    - Page renders 6 sections in order; clients list the exact 8 entries; results show only Public_Metric values; Lenis+ScrollTrigger integration mounts; custom cursor mounts and no-ops under reduced motion
    - _Requirements: 8.5, 8.6, 9.2, 9.6, 9.8_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass and the page renders, scrolls, choreographs motion, and degrades gracefully (native scroll + final visible state) without real images and under reduced motion. Ask the user if questions arise.

- [x] 18. High-fidelity motion: WebGL hover-image project list, heavy inertia, line-mask headings, cursor hover-state
  - [x] 18.1 Verify `ogl` dependency and add WebGL feature detection + pure math helpers
    - Confirm `ogl` ^1.0.11 resolves with its bundled TS types (ALREADY INSTALLED — halt with the failing step identified if resolution is incomplete)
    - Add `hasWebGL()` (SSR-safe WebGL context feature-detect, false on server) and `isCoarsePointer()` in `lib/motion.ts`
    - Add pure helpers in `lib/format.ts`: `clamp(v, lo, hi)`, `lerp(a, b, t)` (clamped `t`), and `pointerVelocity(prev, cur, dt)` (non-negative, clamped to a bounded max) used by the WebGL follow/warp math
    - _Requirements: 1.2, 1.3, 10.3, 10.4, 10.9_

  - [ ]* 18.2 Write property tests for the WebGL math helpers
    - **Property 12: Smoothed pointer follow stays bounded and hits its endpoints** — Validates: Requirements 10.3
    - **Property 13: Pointer velocity and texture cap are non-negative and bounded** — Validates: Requirements 10.4, 10.9

  - [x] 18.3 Implement `lib/webgl.ts` (ogl renderer + displacement/RGB-shift shader)
    - `createHoverImageRenderer(canvas)`: set up an `ogl` `Renderer`, quad `Mesh`, and `Program` with a pass-through vertex shader and a fragment shader doing displacement (UV offset ∝ smoothed pointer velocity × hover progress), RGB-channel offset (RGB shift), previous→current texture cross-mix, and alpha fade by hover progress
    - Load images into `ogl` `Texture`s with dimensions capped to a bounded max (e.g. ≤1024px longest edge); per-frame rAF loop eases the drawn center toward the latest pointer via `lerp` and updates `uVelocity`/`uHover`/`uMix`; handle `resize`; expose `show(src)`, `hide()`, `setPointer(x,y)`, `dispose()`
    - Wrap all init in try/catch; return `null` when WebGL is unavailable or `ogl` fails to import/init; listen for `webglcontextlost` and stop rendering
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.9_

  - [x] 18.4 Implement `components/HoverImageCanvas.tsx` and mount once in the layout
    - `'use client'` — render a single `position:fixed`, full-viewport, `pointer-events:none` `<canvas>`; in `useEffect` defer setup with `requestAnimationFrame`/idle so it does not block first paint, then call `createHoverImageRenderer`
    - Expose the `HoverImageController` (`show`/`hide`/`setPointer`/`dispose`) to `WorkList` via ref/context; call `dispose()` on unmount; render nothing (no wiring) when the renderer is `null`
    - Mount once near the layout root inside `SmoothScrollProvider`
    - _Requirements: 10.2, 10.6, 10.7, 10.9, 10.10_

  - [x] 18.5 Implement `components/ProjectRow.tsx` (big-type text row + hover target)
    - `'use client'` — render one project as a large heading-sized text row: `title` heading line with `venue`, `year`, `services` highlights and any `visitors`/`winners`/`staff`/`days` counts; NO financial figures
    - Resolve preview src via `resolveImagePath(project, i)`; on pointer enter report `{ index, src }` upward, on leave clear; apply CSS hover emphasis over 200–400ms; mark the row an interactive cursor hover target
    - Reveal via the shared `useReveal` using the line-mask reveal (see 18.7) with per-row `staggerDelay`; skip under reduced motion (final visible state)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 10.1, 10.3, 11.6, 8.6_

  - [x] 18.6 Implement `components/WorkList.tsx` and wire into `app/page.tsx` (replace WorkGrid)
    - `'use client'` — render 13 `ProjectRow`s from `projects` as the vertical big-type Project_List; own the hovered-row state; on row enter call the canvas controller `show(src)` + forward pointer via `setPointer`, on list leave call `hide()`
    - Gate the canvas wiring on `isWebGLPreviewEnabled()` = `hasWebGL() && !prefersReducedMotion() && !isCoarsePointer()`; when false render the list only (readable text, CSS hover emphasis, optional `SafeImage` preview)
    - Replace `WorkGrid` with `WorkList` in `app/page.tsx`, keeping the Work section between Clients and Results; leave `WorkGrid`/`WorkCard` in place as the documented fallback reference
    - _Requirements: 4.1, 4.2, 4.9, 4.10, 10.1, 10.2, 10.5, 10.6, 10.7, 10.8, 8.5_

  - [ ]* 18.7 Write example tests for the WebGL degrade + Project_List readability
    - Assert `WorkList` renders 13 readable text rows; a single `HoverImageCanvas` mounts (not one per row); with WebGL disabled / coarse pointer / reduced motion the canvas is not wired and the list still reads fully; `createHoverImageRenderer` returns `null` → text-only path; no financial figures render
    - _Requirements: 10.1, 10.2, 10.7, 10.8, 4.5, 4.10_

  - [x] 18.8 Retune Lenis to Heavy_Inertia in `SmoothScrollProvider`
    - Add `heavyLenisConfig()` in `lib/motion.ts` (higher `duration`, lower `lerp`, `smoothWheel: true`); construct Lenis from it so momentum feels weighty while Lenis still drives ScrollTrigger (forward scroll → `ScrollTrigger.update`, advance from GSAP ticker, `lagSmoothing(0)`)
    - Skip Lenis construction entirely under `prefersReducedMotion()` (native/near-instant scroll); keep the try/catch degrade
    - _Requirements: 8.4, 11.1, 11.2, 11.9, 9.2_

  - [x] 18.9 Implement `splitLines` + `lineMaskReveal` and apply line-mask to headings
    - In `lib/motion.ts` add `splitLines(el)` (wrap text into per-line nodes each inside an overflow-hidden mask wrapper) and `lineMaskReveal(el, opts)` (GSAP timeline translating each line up from below its clip, staggered, bound to ScrollTrigger); no-op leaving headings fully visible under reduced motion / SSR; try/catch wrapped
    - Apply the line-mask reveal to the Hero headline and the section titles (Clients, Work, Results, Team, Contact) via the shared reveal pattern
    - _Requirements: 11.3, 11.4, 11.5, 11.9, 9.4, 9.1_

  - [x] 18.10 Add the Cursor_Hover_State to the custom cursor
    - Extend `initCursor()` to return a `CursorController` with `setHover(active, label?)` that grows/changes the cursor and optionally shows a short label (e.g. "View"); detect interactive targets (links, buttons, `[data-cursor]`, project rows) via pointer enter/leave to toggle the hover state and return to default on leave
    - Keep the cursor disabled under reduced motion and on coarse/touch pointers (native cursor); wire `CustomCursor`/`ProjectRow` to trigger the hover state
    - _Requirements: 11.6, 11.7, 11.8, 11.9, 9.6_

  - [x] 18.11 Verify high-fidelity composition and graceful degrade
    - Confirm `app/page.tsx` still renders Hero → Clients → Work(list) → Results → Team → Contact; a single shared `HoverImageCanvas` is mounted; heavy inertia + line-mask headings + cursor hover-state are active with motion on; and with WebGL unavailable / coarse pointer / reduced motion the page is fully readable with native scroll and no console error
    - Confirm maroon <10% surface, spacing ≥24px, no shadows, radius 0, size floors, and NO financial figures anywhere
    - _Requirements: 4.1, 8.1, 8.2, 8.3, 8.5, 8.6, 10.1, 10.7, 10.8, 11.2, 11.8_

  - [ ]* 18.12 Write smoke tests for heavy inertia, line-mask, and cursor hover-state
    - Assert `heavyLenisConfig()` bounds; Lenis skipped under reduced motion; `lineMaskReveal` leaves headings fully visible under reduced motion; cursor `setHover` toggles state and is disabled on coarse pointer; WebGL setup deferred so it does not block first paint
    - _Requirements: 11.1, 11.2, 11.4, 11.8, 10.10_

- [ ] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass and the page renders, scrolls with heavy inertia, reveals headings line-by-line, drives the WebGL hover-image list, reacts with the cursor hover-state, and degrades gracefully (readable text list, headings visible, native scroll) without real images, without WebGL, on touch, and under reduced motion. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests) and can be skipped for a faster MVP; keep testing proportional.
- Phases 1–2 (tasks 1–16) are complete and marked `[x]`; Phase 3 adds section 18 (+ checkpoint 19) as not-started. Task 17 remains the Phase 2 checkpoint.
- The signature move is a single shared `HoverImageCanvas` (`ogl`) driving a cursor-following displacement/RGB-shift preview for the big-type `Project_List`; it is feature-gated (`hasWebGL() && !prefersReducedMotion() && !isCoarsePointer()`) and disposed on unmount so it never leaks a GL context or blocks first paint.
- Graceful degrade is preserved everywhere: no WebGL, context loss, `ogl` import failure, touch/coarse pointer, or reduced motion leave the Project_List as fully readable text, headings fully visible, and scrolling native. `ogl` ^1.0.11 is already installed (task 18.1 only verifies + adds detection).
- Motion layering is intentional: **GSAP + ScrollTrigger is the single scroll-choreography authority, Lenis drives it, anime.js is secondary (count-up + marquee only)** to avoid competing loops and jank.
- `gsap` is already installed; task 11.1 only verifies resolution and registers the plugin.
- Every animation default state = final visible state, and `prefers-reduced-motion` disables non-essential motion, so content stays readable if GSAP/Lenis/anime.js never run.
- No revenue/cost/net-profit figure appears anywhere; only visitor/winner/staff/day/activation counts.
- Images are supplied by the user later; every image reference uses `SafeImage` with placeholder fallback so no task blocks on real images.
- Each task references specific requirement clauses; property tests are tagged with their design property number.

## Task Dependency Graph

Only incomplete leaf tasks are scheduled. Tasks 1–16 implementation leaves are complete; their optional `*` tests plus all of section 18 remain. Tasks touching the same file are placed in different waves: `18.1`, `18.9`, and `18.10` all edit `lib/motion.ts`; `18.6` and `18.9` both edit `app/page.tsx`.

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.4", "1.7", "3.2", "4.2", "5.3", "7.3", "8.2", "9.2", "12.4", "13.2", "15.3", "16.3", "18.1"] },
    { "id": 1, "tasks": ["18.2", "18.3", "18.8", "18.9"] },
    { "id": 2, "tasks": ["18.4", "18.5", "18.10"] },
    { "id": 3, "tasks": ["18.6"] },
    { "id": 4, "tasks": ["18.7", "18.11"] },
    { "id": 5, "tasks": ["18.12"] }
  ]
}
```
