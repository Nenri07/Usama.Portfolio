# Design Document

## Overview

Qasim Events is a single-route, motion-driven marketing site built with Next.js (App Router), TypeScript, and Tailwind CSS v4 (CSS-first `@theme` in `app/globals.css`, no `tailwind.config.js`). It renders six sections in a fixed order (Hero → Trusted By clients → Work/Projects list → Results numbers → Team → Contact) with a dark navy/black base and a single maroon accent used sparingly. The experience targets the feel of an agency portfolio (e.g. jesperlandberg.com): heavy smooth-scroll inertia, parallax, split-text and line-mask heading reveals, scroll-choreographed reveals, magnetic hover buttons, a reactive custom cursor, and — the signature move — a big-type project list whose rows summon a cursor-following, warped preview image drawn on a single shared WebGL canvas. All content is static and hardcoded in one data module; there is no backend, CMS, or additional routes.

The high-fidelity increment (Req 10–11) adds a WebGL layer built on `ogl` (a small WebGL library with bundled TS types): a single full-viewport fixed `Hover_Image_Canvas` renders exactly one floating preview at a time, following a smoothed pointer with a displacement + RGB-shift shader keyed off pointer velocity and hover progress. The Work section is rebuilt from a card grid into a big-type `Project_List` of text rows (`WorkList` + `ProjectRow`). Scroll is retuned to heavier Lenis inertia, headings mask in line-by-line (`splitLines` + `Line_Mask_Reveal`), and the custom cursor gains a hover state. Every one of these is gated and try/catch-wrapped so that on touch / coarse pointers, under reduced motion, when WebGL is unavailable, or on any init failure, the page collapses to a fully readable, correctly laid-out final state — the Project_List still reads as plain text, headings show immediately, and scrolling is native.

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
| Work / Projects big-type list (enriched, no financials) | 4.1–4.10 |
| Results numbers | 5.1–5.6 |
| Team | 6.1–6.7 |
| Contact | 7.1–7.8 |
| Visual system, heavy smooth scroll, section order, no financials | 8.1–8.6 |
| Motion system & scroll choreography | 9.1–9.8 |
| WebGL hover-image project list (canvas, shader, degrade) | 10.1–10.10 |
| Heavy inertia, line-mask headings, cursor hover-state | 11.1–11.9 |

## Architecture

### Technology & Setup

- **Framework:** Next.js App Router + TypeScript + Tailwind CSS v4 (Req 1.1). Tokens live in a CSS-first `@theme` block in `app/globals.css`; there is no `tailwind.config.js`.
- **Dependencies:** `gsap` (primary, with `gsap/ScrollTrigger`), `lenis` (smooth scroll + ScrollTrigger driver), `animejs` v4 (secondary effects), `clsx`, and `ogl` ^1.0.11 (WebGL library with bundled TS types, for the hover-image canvas) (Req 1.2). `gsap` and `ogl` are already installed. Scaffold halts with an identified failing step if creation or any install fails (Req 1.3) — a build-time/CLI concern verified by command exit status.
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
4. **Shared motion utilities (Req 9.4):** `Split_Text_Reveal`, `Line_Mask_Reveal`, `Parallax_Effect`, `Magnetic_Button`, `Custom_Cursor` (with hover-state) (see Shared Utilities).
5. **Heavy inertia (Req 8.4, 11.1):** Lenis is constructed with `heavyLenisConfig()` (higher duration / lower lerp) for weighty momentum while still driving ScrollTrigger; skipped entirely under reduced motion so scrolling is native (Req 11.2).
6. **WebGL layer (Req 10):** a single shared `Hover_Image_Canvas` (`ogl`) renders the cursor-following warped preview for the Project_List; feature-gated on WebGL support, non-coarse pointer, and non-reduced motion, and disposed on unmount.
7. **Graceful degrade (Req 9.7, 10.7, 11.9):** every library init (GSAP, Lenis, anime.js, ogl) is wrapped in `try/catch`; on failure the affected elements are already in their final visible state, the Project_List reads as text, and native scrolling remains functional.
8. **Reduced motion (Req 9.8):** a `prefersReducedMotion()` check gates all non-essential motion — parallax, split-text stagger, line-mask reveal, magnetic movement, custom cursor + hover-state, heavy inertia, WebGL preview, marquee auto-scroll, and count-up are skipped, leaving final visible state.

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
  Hero.tsx                  # 'use client' — split-text/line-mask headline + parallax bg (Req 2, 11)
  Marquee.tsx               # 'use client' — clients seamless loop (Req 3) [renders Clients_Section]
  WorkList.tsx              # 'use client' — big-type Project_List container + hover wiring (Req 4, 10)
  ProjectRow.tsx            # 'use client' — one big-type text row; hover target driving the canvas (Req 4, 10)
  HoverImageCanvas.tsx      # 'use client' — single full-viewport ogl canvas, cursor-following warped preview (Req 10)
  WorkGrid.tsx              # LEGACY grid container — retained as non-WebGL fallback reference (Req 4 fallback)
  WorkCard.tsx              # LEGACY 'use client' card — retained as fallback reference
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
  motion.ts                 # motion helpers: splitText, splitLines, parallax, magnetic, cursor+hover-state, heavy Lenis config, prefersReducedMotion (Req 9.4, 11)
  webgl.ts                  # ogl setup: Renderer, displacement+RGB-shift Program/GLSL, Texture, per-frame pointer follow, resize, dispose (Req 10)
  format.ts                 # pure helpers: image path, count value, links, splits, lerp/clamp + pointer-velocity mapping (Req 10)
```

> `Marquee.tsx` and `Numbers.tsx` keep their existing filenames but now render the Clients_Section and Results_Section respectively; the section labels are updated in copy and data.

### Component Composition

```
RootLayout
└─ SmoothScrollProvider (Lenis w/ Heavy_Inertia drives ScrollTrigger)
   ├─ CustomCursor (Req 9.6, 11.6–11.8 — hover state)
   ├─ HoverImageCanvas (single fixed full-viewport ogl canvas; Req 10)
   └─ page.tsx
      ├─ Hero            (split-text / line-mask headline + parallax bg)
      ├─ Marquee         (Clients_Section — seamless loop, anime.js)
      ├─ WorkList → ProjectRow ×13 (big-type text rows; hover → HoverImageCanvas; line-mask reveal)
      ├─ Numbers → StatBlock ×N  (useReveal trigger + anime.js count-up)
      ├─ Team → TeamCard ×N      (useReveal + SafeImage)
      └─ Contact         (MagneticButton ×2)
```

`HoverImageCanvas` mounts once (near the layout root, fixed and pointer-events:none) so a single WebGL context is shared by all rows. `WorkList` owns the hovered-row state and reports the active image + pointer to the canvas; when WebGL is unavailable the canvas renders nothing and the list stands alone as readable text.

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
    // Reduced motion → skip Lenis entirely; native/near-instant scroll (Req 11.2).
    if (prefersReducedMotion()) return;
    // Heavy_Inertia: higher duration / lower lerp for weighty momentum (Req 8.4, 11.1).
    const lenis = new Lenis(heavyLenisConfig()); // { duration ~1.4, lerp ~0.06, smoothWheel: true }
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
    /* native scroll + final visible state remain intact (Req 9.7, 11.9) */
  }
}, []);
```

If Lenis or GSAP throws, the try/catch leaves native scrolling intact and every element stays in its final visible state. Under reduced motion Lenis is never constructed, so scrolling is native (Req 11.2).

### CustomCursor (Req 9.4, 9.6, 9.8)

`'use client'` element mounted once inside `SmoothScrollProvider`. Calls `initCursor()` which tracks pointer position (`pointermove`) and translates a small maroon cursor node with a GSAP `quickTo` for smoothing, and returns a `CursorController` with `setHover(active, label?)`. Over interactive elements and `ProjectRow`s the cursor enters the `Cursor_Hover_State` — it grows / changes appearance and may show a short label such as "View" (Req 11.6) — and returns to default on leave (Req 11.7). Hover targets are detected via pointer enter/leave on interactive elements (links, buttons, `[data-cursor]`, project rows). Skipped entirely when `prefersReducedMotion()` is true or on touch/coarse pointers; the native cursor then remains (Req 11.8). Hidden during SSR (renders nothing until mounted).

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

### WorkList + ProjectRow — the big-type Project_List (Req 4, 10)

`WorkList` (`'use client'`) replaces `WorkGrid` as the primary Work_Section presentation. It renders 13 `ProjectRow`s from `projects` as a vertical list of large heading-sized text rows read top to bottom (Req 4.1). It owns the interaction state that drives the shared canvas and never depends on WebGL for readability.

```ts
interface HoverState {
  index: number | null;        // hovered project index, or null when none
  imageSrc: string | null;     // resolveImagePath(projects[index], index)
}
```

- `WorkList` holds `hover: HoverState` and a ref to the mounted `HoverImageCanvas` controller (see below). On `ProjectRow` enter it sets `{ index, imageSrc }` and calls `canvas.show(imageSrc)`; on leave (pointer leaves the whole list) it sets `index: null` and calls `canvas.hide()` (Req 10.5, 10.6).
- `WorkList` subscribes to a single global pointer position (passed straight to the canvas controller each `pointermove`); it does NOT create a canvas per row (Req 10.2).
- **WebGL gate:** on mount `WorkList` checks `isWebGLPreviewEnabled()` = `hasWebGL() && !prefersReducedMotion() && !isCoarsePointer()`. When false, it renders the list only (no canvas wiring); rows still hover-emphasize via CSS (Req 10.7, 10.8).

`ProjectRow` (`'use client'`) renders one row:

- Big-type text: `title` as a heading-sized line, with `venue`, `year`, and the `services` highlights + any Public_Metric counts (`visitors`, `winners`, `staff`, `days`) shown inline/secondary (Req 4.3, 4.4). **No Prohibited_Financial_Figure is ever rendered** (Req 4.5, 8.6).
- Resolves its preview image via `resolveImagePath(project, i)` (explicit `image` else sequential `imagePathForIndex(i)`) and passes that src up on hover (Req 4.2).
- **Hover emphasis:** while hovered (and reduced motion off) the row applies a CSS emphasis (e.g. color/opacity shift, slight x-translate) over ~300ms (200–400 range) and signals its index/src to `WorkList` (Req 4.8, 10.3). Marks itself an interactive hover target so the `Cursor_Hover_State` engages (Req 11.6).
- **Reveal:** every row uses the shared `useReveal` (GSAP+ScrollTrigger). When the row's top crosses `start: 'top 90%'` it runs the `Line_Mask_Reveal` (`splitLines` → per-line clip + translate-up) over ~0.6s (0.4–0.8s range) (Req 4.6). Per-row stagger = `staggerDelay(index, base)`, base ∈ [80,150]ms (Req 4.7). Skipped under reduced motion (final visible state).
- **Single reveal function:** every row uses the same `useReveal` (Req 4.9).
- **Degrade:** with no WebGL / touch / reduced motion the row is a fully readable text line with all fields intact and layout unbroken; optionally a `SafeImage` inline preview may be shown as the non-WebGL fallback (Req 4.10, 10.1, 10.7, 1.6).

### HoverImageCanvas — the single shared WebGL preview (Req 10)

`HoverImageCanvas` (`'use client'`) mounts ONCE near the layout root as a `position: fixed`, full-viewport, `pointer-events: none` `<canvas>` behind interactive content. It renders exactly one `WebGL_Preview` at a time following a smoothed pointer, with the displacement + RGB-shift shader.

- On mount (in `useEffect`, deferred with `requestAnimationFrame`/idle so it does not block first paint — Req 10.10) it calls `createHoverImageRenderer(canvas)` from `lib/webgl.ts`. If that throws or returns `null` (no WebGL, ogl import fails), the component renders nothing and the Project_List stands alone (Req 10.7).
- Exposes an imperative controller (via `ref`/context) consumed by `WorkList`:
  ```ts
  interface HoverImageController {
    show(src: string): void;   // load+cap texture, warp/fade to it (Req 10.4, 10.5)
    hide(): void;              // fade preview out to hidden (Req 10.6)
    setPointer(x: number, y: number): void; // feeds the smoothed follow (Req 10.3)
    dispose(): void;           // GL context + GPU resource teardown (Req 10.9)
  }
  ```
- **Single image at a time:** `show(src)` sets the target texture and animates a `hoverProgress`/`mixProgress` uniform; the renderer cross-warps from the old texture to the new one, never showing two previews (Req 10.5).
- **Pointer follow:** each rendered frame the renderer eases its drawn position toward the latest pointer via `lerp` (see `lib/format.ts`), and derives pointer velocity from the delta to drive displacement strength (Req 10.3, 10.4).
- **Lifecycle:** listens for `webglcontextlost` → treat as fallback (stop rendering, allow list-only); on unmount calls `dispose()` to free textures, program, and context (Req 10.7, 10.9).
- **Reduced motion / touch:** `WorkList` simply never wires the controller in those modes, so no warp/preview runs (Req 10.8).

### lib/webgl.ts — ogl renderer + shader (Req 10)

A thin, framework-agnostic module. All setup is wrapped in try/catch and returns `null` on any failure so callers degrade to text.

```ts
// Returns null when WebGL is unavailable or ogl fails to import/init.
function createHoverImageRenderer(canvas: HTMLCanvasElement): HoverImageController | null;
function hasWebGL(): boolean;   // feature-detect a WebGL context, SSR-safe (false on server)
```

- **Renderer/Program/Mesh:** an `ogl` `Renderer` bound to the shared canvas, a full-screen (or quad) `Mesh` with a `Program` using a simple pass-through **vertex** shader and a **fragment** shader that:
  1. samples the current and previous textures,
  2. applies a **displacement** offset to the UVs proportional to `uVelocity` (smoothed pointer velocity) × `uHover` (0→1 hover progress),
  3. applies an **RGB shift** by sampling R/G/B channels at slightly different offsets scaled by the same displacement magnitude,
  4. mixes previous→current texture by `uMix` and multiplies alpha by `uHover` for fade in/out.
- **Uniforms (high level):** `uTexture`, `uPrevTexture`, `uHover` (fade/warp progress), `uMix` (cross-fade between images), `uVelocity` (vec2 or magnitude), `uResolution`, `uImageSize` (for cover-fit UVs).
- **Texture loading:** load each image into an `ogl` `Texture`; **cap dimensions** to a bounded max (e.g. ≤ 1024px longest edge) before upload to bound GPU memory (Req 10.9). On image load error the controller keeps the previous state / stays hidden.
- **Per-frame update:** a rAF loop eases the drawn image center toward the latest pointer with `lerp`, updates `uVelocity` from the eased delta, advances `uHover`/`uMix`, and calls `renderer.render(...)`.
- **Resize:** on `resize` update `renderer.setSize` and `uResolution`.
- **Dispose:** stop the rAF loop, delete textures/program, and lose/free the GL context (Req 10.9).

The GLSL is intentionally small and does not depend on any project-specific state; the shader approach (velocity-driven displacement + RGB channel offset + progress fade) is the documented contract, not a specific literal source.

### WorkGrid + WorkCard (LEGACY grid — retained fallback reference, Req 4)

The original card grid is superseded by `WorkList`/`ProjectRow`. It is kept in the codebase as a reference for the non-WebGL fallback presentation (same content, same `useReveal`, same `SafeImage` failure handling) and may be removed once the list fallback is proven. Behavior when referenced:

- `WorkGrid` renders 13 `WorkCard`s from `projects` (Req 4.1–4.3); each resolves its image via `resolveImagePath(project, i)` through `SafeImage`.
- Card content shows title, venue, year, `services`, and any Public_Metric counts; **no Prohibited_Financial_Figure** (Req 4.5, 8.6).
- Reveal via the shared `useReveal`; hover scales the image to 1.05 and slides the detail overlay (Req 4.6–4.9); image failure → `--color-surface` placeholder with text intact (Req 4.10, 1.6).

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
isCoarsePointer()           // window.matchMedia('(pointer: coarse)').matches, SSR-safe → false (Req 10.8, 11.8)
splitText(el, by)           // wrap words/chars of el in spans; returns the unit nodes for staggering (Req 2.3, 9.4)
splitLines(el)              // wrap el text into per-line elements, each in a clip/overflow-hidden mask wrapper; returns line nodes (Req 11.3, 11.5)
lineMaskReveal(el, opts)    // splitLines(el) → GSAP timeline translating each line up from below its clip, staggered; bound to ScrollTrigger; skipped/final-visible under reduced motion (Req 11.3–11.5)
parallax(el, opts)          // ScrollTrigger tween translating el at a different rate than scroll (Req 2.6, 9.4)
magnetic(el, opts)          // pointer-follow translate within a radius; returns cleanup (Req 9.4, 9.5)
heavyLenisConfig()          // returns the Heavy_Inertia Lenis options (higher duration, lower lerp, e.g. { duration ~1.4, lerp ~0.06, smoothWheel:true }); consumed by SmoothScrollProvider (Req 8.4, 11.1)
initCursor()                // custom cursor pointer-follow + hover-state; returns { cleanup, setHover } (Req 9.4, 9.6, 11.6–11.8)
```

`initCursor` now returns a small controller so interactive elements / project rows can toggle the `Cursor_Hover_State`:

```ts
interface CursorController {
  cleanup(): void;
  setHover(active: boolean, label?: string): void; // grow/shrink + optional label e.g. "View" (Req 11.6, 11.7)
}
```

The cursor also auto-detects hover targets by listening for pointer enter/leave on elements marked interactive (e.g. `[data-cursor="view"]`, links, buttons, `ProjectRow`s), entering the hover state on enter and returning to default on leave. Disabled entirely under reduced motion / coarse pointers (native cursor used — Req 11.8).

`splitLines`/`lineMaskReveal`, `parallax`, `magnetic`, `splitText`, and `initCursor` all no-op (returning the element in final visible state, native cursor untouched) when `prefersReducedMotion()` is true or when run during SSR, and are try/catch-wrapped so a GSAP/DOM failure leaves headings fully visible (Req 11.9).

`heavyLenisConfig()` is used only when reduced motion is off; under reduced motion `SmoothScrollProvider` skips Lenis construction so scrolling is native/near-instant (Req 11.2).

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
clamp(v, lo, hi)            // Math.min(hi, Math.max(lo, v))  (guards lo<=hi)
lerp(a, b, t)               // a + (b - a) * clamp(t, 0, 1)  (smoothed pointer follow; result stays within [min(a,b), max(a,b)]) (Req 10.3)
pointerVelocity(prev, cur, dt) // magnitude of (cur - prev)/dt, clamped to a bounded max → non-negative displacement strength (Req 10.4)
```

`lerp`, `clamp`, and `pointerVelocity` are pure and drive the WebGL follow/warp math; keeping them pure makes the smoothing/velocity behavior testable independent of any GL context.

## Error Handling

| Failure | Handling | Requirement |
|---------|----------|-------------|
| Hero image missing / slow (>3s) | Solid `--color-base` background; foreground stays visible | 2.2 |
| Work / Team image missing/misnamed/error | `SafeImage` placeholder background; Project_List text + layout intact | 1.6, 4.10, 6.5 |
| WebGL context creation fails / not supported | `hasWebGL()` false → `HoverImageCanvas` renders nothing; Project_List shown as readable text (optional `SafeImage` preview) | 10.7, 4.10 |
| WebGL context lost at runtime (`webglcontextlost`) | Renderer stops; controller no-ops; fall back to text list / `SafeImage`; no error surfaced | 10.7 |
| `ogl` import/init throws | `createHoverImageRenderer` returns `null`; canvas omitted; text list only | 10.7 |
| Texture load error / oversized image | Cap texture size before upload; on load error keep previous state / stay hidden; list text intact | 10.9, 4.10 |
| Coarse / touch pointer | Canvas + cursor hover-state not initialized; Project_List readable; native cursor | 10.8, 11.8 |
| `splitLines`/`lineMaskReveal` fails | try/catch; heading left fully visible (final state) | 11.3, 11.9 |
| Heavy_Inertia (Lenis) fails / reduced motion | Native scrolling; ScrollTrigger unaffected; final visible state | 11.1, 11.2, 11.9, 9.7 |
| GSAP fails to load/register plugin | try/catch; reveal/parallax targets default to visible; native scroll works | 9.7 |
| ScrollTrigger fails to init | try/catch; `useReveal` skips, elements stay in final visible state | 9.7 |
| Lenis fails to init | try/catch; native scrolling remains functional; GSAP ticker unaffected | 8.4, 9.7 |
| anime.js fails to load/init | Marquee renders static; count-up shows target values | 3.6, 5.6 (safe defaults) |
| `prefers-reduced-motion: reduce` set | Parallax, split-text, line-mask, magnetic, cursor + hover-state, heavy inertia, WebGL preview, marquee, count-up disabled; final visible state, native scroll | 9.8, 3.7, 5.6, 6.7, 10.8, 11.2, 11.4, 11.8 |
| Scaffold create/install fails (incl. gsap) | CLI halts on failing step, not reported complete | 1.3 |

Design principle for animations: every animated element's **default (unanimated) state is its final visible state**. GSAP/ScrollTrigger/Lenis/anime.js only enhance; if none run, content is fully readable and correctly laid out.

## Testing Strategy

**Dual approach:** property-based tests for the pure helpers and state logic (high input coverage), plus a small number of example/integration tests for component wiring and fallbacks. Property tests run a minimum of 100 iterations and are tagged with their design property.

- **Property tests** (`lib/format.ts`, `useReveal` run-once logic): image mapping incl. explicit-path override, seamless track, count-up bounds/monotonicity, run-once absorbing state, stagger delays, link builders, disabled predicate, word split, `lerp` smoothing bounds/endpoints/monotonicity, `pointerVelocity`/`clamp` non-negative + bounded.
- **Example tests:** ProjectRow image-error fallback and no-financials render; WorkList renders 13 big-type text rows and stays readable with WebGL disabled; a single `HoverImageCanvas` mounts (not one per row); `createHoverImageRenderer` returns `null`/degrades to text when WebGL is unavailable or `ogl` fails; canvas + cursor hover-state not initialized on coarse pointer / reduced motion; `lineMaskReveal` leaves headings fully visible under reduced motion; cursor `setHover` toggles the hover state; TeamCard shows role and omits name when absent; Hero image-failure fallback; Contact has no form/input; page renders 6 sections in order; clients list the exact 8 entries; results list only Public_Metric values with no financial terms; reduced-motion path renders final visible state.
- **Smoke tests:** style tokens applied (no shadow, radius 0, sans-serif, size floors); Lenis+ScrollTrigger integration mounts with Heavy_Inertia config; heavy inertia skipped under reduced motion; WebGL setup deferred so it does not block first paint; anime.js configs present for count-up and marquee only.

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

*For any* reveal target, when `prefersReducedMotion()` is true (`useReveal` called with `disabled: true`), no reveal effect runs and the target's rendered state equals its final visible state; motion utilities `splitText`, `splitLines`, `lineMaskReveal`, `parallax`, `magnetic`, and `initCursor` perform no transform (headings stay fully visible, native cursor is used), and the WebGL preview is never initialized.

**Validates: Requirements 9.8, 2.6, 3.7, 5.6, 6.7, 10.8, 11.2, 11.4, 11.8**

### Property 11: Public metrics only (no financial figures)

*For any* Project_Record and any `results` entry, the rendered Project_Row and stat contain only Public_Metric fields (visitor, winner, staff, day, activation counts) and contain no revenue, cost, or net-profit figure.

**Validates: Requirements 4.5, 5.5, 8.6**

### Property 12: Smoothed pointer follow stays bounded and hits its endpoints

*For any* real numbers `a`, `b` and any interpolation factor `t`, `lerp(a, b, t)` lies within the closed interval `[min(a, b), max(a, b)]`, with `lerp(a, b, 0) = a` and `lerp(a, b, 1) = b`; and for any `t1 ≤ t2` in `[0, 1]`, `lerp(a, b, t1)` is between `a` and `lerp(a, b, t2)` inclusive (monotonic progress toward `b`). Therefore the eased WebGL_Preview position never overshoots the pointer target.

**Validates: Requirements 10.3**

### Property 13: Pointer velocity and texture cap are non-negative and bounded

*For any* previous and current pointer positions and any positive time delta `dt`, `pointerVelocity(prev, cur, dt)` is non-negative and does not exceed the configured maximum (`clamp` upper bound); and *for any* value `v` with bounds `lo ≤ hi`, `clamp(v, lo, hi)` lies within `[lo, hi]` and equals `v` when `v` is already within `[lo, hi]`. This guarantees the displacement strength and capped texture dimensions stay within their bounded ranges.

**Validates: Requirements 10.4, 10.9**
