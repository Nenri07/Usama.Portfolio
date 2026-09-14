'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * GSAP + ScrollTrigger setup (Req 9.1).
 *
 * GSAP is the PRIMARY scroll-choreography engine. This helper registers the
 * ScrollTrigger plugin exactly once and only in the browser, so it is safe to
 * call from any client component's effect. Registering more than once is a
 * no-op in GSAP, but the guards below also make it idempotent and SSR-safe.
 */
let registered = false;

/** Register the ScrollTrigger plugin once, in the browser only. */
export function registerScrollTrigger(): void {
  if (registered || typeof window === 'undefined') {
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

// Re-export so callers can import gsap/ScrollTrigger from a single module.
export { gsap, ScrollTrigger };
