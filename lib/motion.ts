'use client';

import { gsap, registerScrollTrigger } from '@/lib/gsapSetup';

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
 * Create a small fixed-position maroon cursor node that follows the pointer
 * with GSAP `quickTo` smoothing (Req 9.4, 9.6).
 *
 * Returns a cleanup that removes the node and its listeners. Disabled (no-op
 * cleanup, native cursor untouched) under reduced motion, on coarse/touch
 * pointers, or during SSR. Wrapped in try/catch (Req 9.7).
 */
export function initCursor(): Cleanup {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return noop;
  }

  try {
    // Skip on touch / coarse pointers — the native cursor stays.
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return noop;
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
    } as Partial<CSSStyleDeclaration>);
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

    window.addEventListener('pointermove', handleMove);

    return () => {
      try {
        window.removeEventListener('pointermove', handleMove);
        gsap.killTweensOf(cursor);
        cursor.remove();
      } catch {
        /* nothing left to clean up */
      }
    };
  } catch {
    // No custom cursor on failure; native cursor remains (Req 9.7).
    return noop;
  }
}
