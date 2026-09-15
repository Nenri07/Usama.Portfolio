'use client';

import { gsap, ScrollTrigger, registerScrollTrigger } from '@/lib/gsapSetup';

/**
 * Shared motion utilities (Req 9.4).
 *
 * Provides `prefersReducedMotion`, `splitText`, `parallax`, `magnetic`, and
 * `initCursor`. Every utility no-ops and leaves the element in its final
 * visible state when `prefersReducedMotion()` is true or during SSR, and is
 * wrapped so a GSAP failure never breaks rendering (Req 9.7, 9.8).
 */

/** A cleanup function returned by the motion utilities. */
type Cleanup = () => void;

/** A no-op cleanup used when a utility degrades gracefully. */
const noop: Cleanup = () => {};

/**
 * Whether the user has requested reduced motion (Req 9.8).
 *
 * SSR-safe: returns `false` when there is no `window` (server render), so no
 * non-essential motion is assumed off purely because of SSR. In the browser it
 * reflects the `prefers-reduced-motion: reduce` media query.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Whether a usable WebGL rendering context can be created (Req 10.3, 10.7).
 *
 * SSR-safe: returns `false` when there is no `window`/`document` (server
 * render). In the browser it creates a throwaway `<canvas>` and tries, in
 * order, `webgl2`, `webgl`, then the legacy `experimental-webgl`. Returns
 * `true` only when a context is actually obtained. Any thrown error (some
 * environments throw when WebGL is blocked) is swallowed and reported as
 * `false`, so callers safely degrade to the text-only Project_List.
 */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return gl != null;
  } catch {
    return false;
  }
}

/**
 * Whether the primary pointer is coarse (touch) rather than fine (Req 10.8,
 * 11.8).
 *
 * SSR-safe: returns `false` when there is no `window` or `matchMedia`, so the
 * server never assumes touch. In the browser it reflects the
 * `(pointer: coarse)` media query — used to skip the WebGL preview and the
 * custom-cursor hover state on touch devices.
 */
export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Heavy-inertia Lenis options for a weighty momentum feel (Req 8.4, 11.1).
 *
 * Consumed by `SmoothScrollProvider`. A higher `duration` and lower `lerp`
 * make scrolling glide/settle slowly (heavy feel) while Lenis keeps driving
 * ScrollTrigger. Only used when reduced motion is off — the provider skips
 * Lenis entirely under reduced motion so scrolling is native (Req 11.2).
 */
export function heavyLenisConfig(): {
  duration: number;
  lerp: number;
  smoothWheel: boolean;
  wheelMultiplier: number;
  touchMultiplier: number;
} {
  return {
    duration: 1.4,
    lerp: 0.06,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  };
}

/**
 * Split the text content of `el` into per-word (or per-char) inline-block
 * spans and return the unit span nodes so the caller can stagger them
 * (Req 2.3, 9.4).
 *
 * Graceful degrade: under reduced motion or SSR this returns `[]` WITHOUT
 * touching the DOM, so the text stays fully readable in its final visible
 * state. Spaces between words are preserved (rendered as their own text nodes
 * with normal whitespace) so the sentence still reads normally. Never throws.
 */
export function splitText(
  el: HTMLElement,
  by: 'words' | 'chars' = 'words',
): HTMLElement[] {
  if (typeof window === 'undefined' || prefersReducedMotion() || !el) {
    return [];
  }

  try {
    const text = el.textContent ?? '';
    if (text.trim().length === 0) {
      return [];
    }

    const units: HTMLElement[] = [];
    const fragment = document.createDocumentFragment();

    if (by === 'chars') {
      // Each visible character becomes a span; spaces stay as text nodes so
      // words remain separated and readable.
      for (const ch of Array.from(text)) {
        if (ch === ' ') {
          fragment.appendChild(document.createTextNode('\u00A0'));
          continue;
        }
        const span = document.createElement('span');
        span.textContent = ch;
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity';
        fragment.appendChild(span);
        units.push(span);
      }
    } else {
      // Split on whitespace; each word becomes an inline-block span, and a
      // real space text node is inserted between consecutive words so the
      // sentence reads normally.
      const words = text.split(/(\s+)/);
      for (const chunk of words) {
        if (chunk.length === 0) {
          continue;
        }
        if (/^\s+$/.test(chunk)) {
          fragment.appendChild(document.createTextNode(chunk));
          continue;
        }
        const span = document.createElement('span');
        span.textContent = chunk;
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity';
        fragment.appendChild(span);
        units.push(span);
      }
    }

    // Only mutate the DOM once we've successfully built the replacement, so a
    // failure mid-build never leaves the element in a broken/empty state.
    el.textContent = '';
    el.appendChild(fragment);
    return units;
  } catch {
    // Leave the element untouched / readable on any failure (Req 9.7).
    return [];
  }
}

/**
 * Split the visible text of `el` into per-LINE nodes, each wrapped in a
 * two-level mask structure so the line can be translated up from behind a clip
 * (Req 11.3, 11.5). Returns the INNER line nodes (the ones to animate).
 *
 * Line breaks are detected without a heavy typography library: every word is
 * temporarily wrapped in an inline span, each span's `offsetTop` is measured,
 * and consecutive words sharing the same `offsetTop` are grouped into one
 * visual line. The element is then rebuilt as a stack of
 * `mask (overflow:hidden) > line (translatable)` structures, each line joining
 * its words with normal spaces so the text reads normally.
 *
 * Graceful degrade: under reduced motion, SSR, when there is no measurable
 * layout, or on any failure, this returns `[]` and leaves the element's text
 * untouched and fully visible (Req 11.4, 11.9). Never throws.
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  if (typeof window === 'undefined' || prefersReducedMotion() || !el) {
    return [];
  }

  const originalHTML = el.innerHTML;

  try {
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text.length === 0) {
      return [];
    }

    const words = text.split(' ');

    // Phase 1 — measure: wrap each word in an inline span and record offsetTop.
    const measureFragment = document.createDocumentFragment();
    const wordSpans: HTMLSpanElement[] = [];
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      measureFragment.appendChild(span);
      wordSpans.push(span);
      // Keep a real space between words so wrapping matches natural layout.
      if (i < words.length - 1) {
        measureFragment.appendChild(document.createTextNode(' '));
      }
    });

    el.textContent = '';
    el.appendChild(measureFragment);

    // Group consecutive words that share the same vertical offset into a line.
    const lines: string[][] = [];
    let currentTop: number | null = null;
    for (let i = 0; i < wordSpans.length; i += 1) {
      const top = wordSpans[i].offsetTop;
      if (currentTop === null || top !== currentTop) {
        lines.push([]);
        currentTop = top;
      }
      lines[lines.length - 1].push(words[i]);
    }

    // No usable layout (e.g. element not rendered) — restore and bail.
    if (lines.length === 0) {
      el.innerHTML = originalHTML;
      return [];
    }

    // Phase 2 — rebuild: mask (overflow:hidden) > line (translatable) per line.
    const lineNodes: HTMLElement[] = [];
    const buildFragment = document.createDocumentFragment();
    for (const lineWords of lines) {
      const mask = document.createElement('span');
      Object.assign(mask.style, {
        display: 'block',
        overflow: 'hidden',
      } as Partial<CSSStyleDeclaration>);

      const line = document.createElement('span');
      Object.assign(line.style, {
        display: 'block',
        willChange: 'transform',
      } as Partial<CSSStyleDeclaration>);
      line.textContent = lineWords.join(' ');

      mask.appendChild(line);
      buildFragment.appendChild(mask);
      lineNodes.push(line);
    }

    el.textContent = '';
    el.appendChild(buildFragment);
    return lineNodes;
  } catch {
    // Restore the original markup so the heading stays fully readable (Req 11.9).
    try {
      el.innerHTML = originalHTML;
    } catch {
      /* leave as-is */
    }
    return [];
  }
}

/**
 * Apply an optional, non-hiding settle after `el` enters the viewport.
 *
 * This compatibility utility deliberately keeps the original heading DOM
 * intact. It never creates overflow masks or applies opacity/visibility, and
 * the small transform begins only from `onEnter`, so ScrollTrigger refresh or
 * initialization failure cannot strand text offscreen. Cleanup clears every
 * property that an older line-mask implementation may have left behind.
 */
export function lineMaskReveal(
  el: HTMLElement,
  opts: { stagger?: number; duration?: number; start?: string } = {},
): Cleanup {
  if (typeof window === 'undefined' || prefersReducedMotion() || !el) {
    return noop;
  }

  let trigger: ScrollTrigger | undefined;
  let tween: gsap.core.Tween | undefined;

  try {
    registerScrollTrigger();

    const { duration = 0.55, start = 'top 85%' } = opts;
    const enhanceAfterEntry = () => {
      try {
        tween?.kill();
        // Transform-only and deliberately small: the original DOM is never
        // split, clipped, transparent, or translated outside its own bounds.
        tween = gsap.fromTo(
          el,
          { y: 10 },
          { y: 0, duration, ease: 'power3.out', overwrite: true },
        );
      } catch {
        el.style.removeProperty('transform');
      }
    };

    trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: enhanceAfterEntry,
    });

    return () => {
      try {
        trigger?.kill();
        tween?.kill();
        gsap.set(el, { clearProps: 'transform,opacity,visibility,clipPath' });
      } catch {
        el.style.removeProperty('transform');
        el.style.removeProperty('opacity');
        el.style.removeProperty('visibility');
        el.style.removeProperty('clip-path');
      }
    };
  } catch {
    // Initialization must never change the readable default state.
    try {
      gsap.set(el, { clearProps: 'transform,opacity,visibility,clipPath' });
    } catch {
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
      el.style.removeProperty('visibility');
      el.style.removeProperty('clip-path');
    }
    return noop;
  }
}

/**
 * Bind a ScrollTrigger parallax tween to `el` so it translates at a different
 * rate than the page scroll (Req 2.6, 9.4).
 *
 * Returns a cleanup that kills the tween and its ScrollTrigger. Under reduced
 * motion or SSR it applies no transform and returns a no-op cleanup, leaving
 * `el` in its final visible state. Wrapped in try/catch (Req 9.7).
 */
export function parallax(
  el: HTMLElement,
  opts: { yPercent?: number; scrub?: boolean | number } = {},
): Cleanup {
  if (typeof window === 'undefined' || prefersReducedMotion() || !el) {
    return noop;
  }

  try {
    registerScrollTrigger();

    const { yPercent = 15, scrub = true } = opts;

    const tween = gsap.to(el, {
      yPercent,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: scrub ?? true,
      },
    });

    return () => {
      try {
        tween.scrollTrigger?.kill();
        tween.kill();
      } catch {
        /* nothing left to clean up */
      }
    };
  } catch {
    // No parallax on failure; element stays in final visible state (Req 9.7).
    return noop;
  }
}

/**
 * Make `el` follow the pointer while the pointer is within `radius` of the
 * element center, translating toward it by `strength` of the offset, and
 * settle back to rest on leave (Req 9.4, 9.5).
 *
 * Returns a cleanup that removes listeners and kills the tweens. Under reduced
 * motion or SSR it applies no transform and returns a no-op cleanup. The
 * element stays fully clickable throughout. Wrapped in try/catch (Req 9.7).
 */
export function magnetic(
  el: HTMLElement,
  opts: { strength?: number; radius?: number } = {},
): Cleanup {
  if (typeof window === 'undefined' || prefersReducedMotion() || !el) {
    return noop;
  }

  try {
    const { strength = 0.3, radius = 100 } = opts;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;

      if (Math.hypot(dx, dy) <= radius) {
        xTo(dx * strength);
        yTo(dy * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
    };

    // Listen on window so the pull begins as the pointer approaches, and reset
    // when the pointer leaves the element itself.
    window.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerleave', handleLeave);

    return () => {
      try {
        window.removeEventListener('pointermove', handleMove);
        el.removeEventListener('pointerleave', handleLeave);
        gsap.killTweensOf(el);
        gsap.set(el, { x: 0, y: 0 });
      } catch {
        /* nothing left to clean up */
      }
    };
  } catch {
    // No magnetic effect on failure; element stays static + clickable.
    return noop;
  }
}

/**
 * Bind a subtle 3D pointer-tilt to `el` (fine pointers only). As the pointer
 * moves across the element, it tilts toward the cursor and lifts slightly in Z;
 * on leave it settles back to flat. Enhancement only — the element is fully
 * usable/visible without it.
 *
 * Returns a cleanup that removes listeners and resets the transform. No-ops
 * (returns a no-op cleanup, element stays flat) under reduced motion, on
 * coarse/touch pointers, or during SSR. Wrapped in try/catch so a GSAP failure
 * never breaks rendering.
 */
export function tilt3d(
  el: HTMLElement,
  opts: { max?: number; lift?: number; perspective?: number } = {},
): Cleanup {
  if (
    typeof window === 'undefined' ||
    prefersReducedMotion() ||
    isCoarsePointer() ||
    !el
  ) {
    return noop;
  }

  try {
    const { max = 6, lift = 10, perspective = 900 } = opts;

    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2.out' });
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2.out' });
    const zTo = gsap.quickTo(el, 'z', { duration: 0.5, ease: 'power2.out' });

    gsap.set(el, { transformPerspective: perspective, transformStyle: 'preserve-3d' });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotY(px * max * 2);
      rotX(-py * max * 2);
      zTo(lift);
    };

    const onLeave = () => {
      rotX(0);
      rotY(0);
      zTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      try {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf(el);
        gsap.set(el, { rotationX: 0, rotationY: 0, z: 0 });
      } catch {
        /* nothing left to clean up */
      }
    };
  } catch {
    return noop;
  }
}

/**
 * A controller returned by `initCursor` (Req 11.6, 11.7). `cleanup` removes the
 * cursor node and its listeners; `setHover` toggles the `Cursor_Hover_State`
 * (grow + optional label) programmatically.
 */
export interface CursorController {
  /** Remove the cursor node and detach all listeners. */
  cleanup: Cleanup;
  /** Enter (`active=true`) or leave the hover state, optionally with a label. */
  setHover: (active: boolean, label?: string) => void;
}

/** A disabled controller used when the custom cursor degrades gracefully. */
const noopCursor: CursorController = { cleanup: noop, setHover: () => {} };

/**
 * Create a small fixed-position maroon cursor node that follows the pointer
 * with GSAP `quickTo` smoothing and reacts to interactive targets (Req 9.4,
 * 9.6, 11.6–11.8).
 *
 * Returns a `CursorController` (`{ cleanup, setHover }`). `setHover(active,
 * label?)` grows the cursor and shows an optional short label (e.g. "View")
 * when active, and shrinks/hides it when inactive. It also auto-detects hover
 * targets by delegating `pointerover`/`pointerout` on the document: any target
 * matching `a, button, [data-cursor]` (or a descendant of one) enters the
 * hover state, using its `data-cursor-label` when present.
 *
 * Disabled (returns `{ cleanup: noop, setHover: noop }`, native cursor
 * untouched) under reduced motion, on coarse/touch pointers, or during SSR.
 * Wrapped in try/catch (Req 9.7, 11.8).
 */
export function initCursor(): CursorController {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return noopCursor;
  }

  try {
    // Skip on touch / coarse pointers — the native cursor stays (Req 11.8).
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return noopCursor;
    }

    const size = 12;
    const cursor = document.createElement('div');
    cursor.setAttribute('aria-hidden', 'true');
    Object.assign(cursor.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${size}px`,
      height: `${size}px`,
      marginTop: `${-size / 2}px`,
      marginLeft: `${-size / 2}px`,
      borderRadius: '9999px',
      backgroundColor: 'var(--color-accent)',
      pointerEvents: 'none',
      zIndex: '9999',
      opacity: '0',
      transform: 'translate3d(0, 0, 0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as Partial<CSSStyleDeclaration>);

    // Label element inside the cursor, hidden by default (Req 11.6).
    const label = document.createElement('span');
    label.setAttribute('aria-hidden', 'true');
    Object.assign(label.style, {
      color: 'var(--color-text)',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      opacity: '0',
      pointerEvents: 'none',
    } as Partial<CSSStyleDeclaration>);
    cursor.appendChild(label);
    document.body.appendChild(cursor);

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3.out' });

    let shown = false;
    const handleMove = (event: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to(cursor, { opacity: 1, duration: 0.2 });
      }
      xTo(event.clientX);
      yTo(event.clientY);
    };

    // Grow the cursor + show an optional label when active; shrink + hide when
    // inactive (Req 11.6, 11.7).
    const setHover = (active: boolean, hoverLabel?: string) => {
      try {
        if (active) {
          const text = hoverLabel ?? '';
          label.textContent = text;
          gsap.to(cursor, {
            scale: text.length > 0 ? 4.5 : 3,
            duration: 0.3,
            ease: 'power3.out',
          });
          gsap.to(label, { opacity: text.length > 0 ? 1 : 0, duration: 0.2 });
        } else {
          gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power3.out' });
          gsap.to(label, { opacity: 0, duration: 0.15 });
        }
      } catch {
        /* hover state is non-essential — ignore failures */
      }
    };

    // Auto-detect interactive targets via delegated pointerover/pointerout.
    const HOVER_SELECTOR = 'a, button, [data-cursor]';
    const handleOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.(HOVER_SELECTOR);
      if (target) {
        const attr = target.getAttribute('data-cursor-label');
        setHover(true, attr ?? undefined);
      }
    };
    const handleOut = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.(HOVER_SELECTOR);
      if (target) {
        // Ignore moves that stay within the same interactive element.
        const related = (event.relatedTarget as Element | null)?.closest?.(
          HOVER_SELECTOR,
        );
        if (related === target) {
          return;
        }
        setHover(false);
      }
    };

    window.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerover', handleOver);
    document.addEventListener('pointerout', handleOut);

    const cleanup: Cleanup = () => {
      try {
        window.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerover', handleOver);
        document.removeEventListener('pointerout', handleOut);
        gsap.killTweensOf(cursor);
        gsap.killTweensOf(label);
        cursor.remove();
      } catch {
        /* nothing left to clean up */
      }
    };

    return { cleanup, setHover };
  } catch {
    // No custom cursor on failure; native cursor remains (Req 9.7).
    return noopCursor;
  }
}
