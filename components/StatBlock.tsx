'use client';

import { useCallback, useRef, useState } from 'react';
import { animate } from 'animejs';
import { useReveal } from '@/lib/reveal';
import { countValue } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import { gsap } from '@/lib/gsapSetup';
import type { StatItem } from '@/lib/data';
import NumberCard from './NumberCard';

/**
 * StatBlock — one statistic in the Results section (Req 5.2–5.4, 5.6).
 *
 * - Reveal: uses the SINGLE shared `useReveal` hook (GSAP + ScrollTrigger) with
 *   `start: 'top 50%'` and `once: true`, so the count-up starts the first time
 *   the block's top crosses the viewport midpoint (~50% visible, Req 5.2) and
 *   NEVER restarts if the block scrolls out of and back into view — `once` is an
 *   absorbing state (Req 5.4). A local `hasStartedRef` guard is a second line of
 *   defense against re-triggering.
 * - Count-up (SECONDARY anime.js effect, Req 9.3): on reveal, an anime.js tween
 *   drives a progress object 0→1 over a duration in [1000, 3000]ms. On each
 *   update the displayed value is `countValue(target, progress)` — bounded to
 *   [0, target] and monotonic. At completion (progress 1) it shows the EXACT
 *   target (`countValue(target, 1) === target`) with its suffix (Req 5.2, 5.3).
 * - 3D reveal: on reveal, the number card rises and rotates from a slightly
 *   tilted state (rotateX) to flat, staggered by `index`, via GSAP (no
 *   box-shadow — transform only). On a fine pointer the card also tilts toward
 *   the cursor (see NumberCard).
 * - Reduced motion (Req 5.6, 9.8): `useReveal` is `disabled`, so the count-up
 *   and 3D reveal never run and the block shows its exact target immediately,
 *   flat and static. Because the initial state IS the target, there is no zero
 *   flash.
 *
 * Graceful default (Req 5.3/5.4/9.7): the initial displayed value is the exact
 * target, and the tween is wrapped in try/catch. If anime.js/GSAP never run (or
 * throw), the block simply shows the final target value, flat and visible.
 *
 * NO financial figures anywhere — only Public_Metric values (Req 5.5, 8.6).
 */

/** Count-up duration in ms (Req 5.2 range [1000, 3000]). */
const COUNT_DURATION = 1800;

export interface StatBlockProps {
  /** Statistic data — target/suffix/label (Req 5.1). */
  stat: StatItem;
  /** Position in the Results grid, used to stagger the 3D reveal. */
  index?: number;
}

export default function StatBlock({ stat, index = 0 }: StatBlockProps) {
  const { target, suffix, label } = stat;

  // Compute reduced-motion in the component (client); passed to useReveal as
  // `disabled` so under reduced motion neither the count-up nor the 3D reveal
  // runs (Req 5.6, 9.8).
  const reduced = prefersReducedMotion();

  // Default (unanimated) displayed value is the EXACT target, so if anime.js
  // never runs (or reduced motion is set) the final number is shown with no
  // zero flash (Req 5.3/5.4/5.6 graceful default).
  const [value, setValue] = useState<number>(target);

  // The card surface node, animated by the 3D reveal.
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Absorbing guard: once the count-up has started it never runs again, even
  // if `onReveal` were somehow invoked more than once (Req 5.4).
  const hasStartedRef = useRef(false);

  const onReveal = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // 3D reveal: rise + rotateX from a tilted state to flat, staggered by
    // index. Transform-only (no box-shadow). Wrapped so failure leaves the
    // card flat/visible (Req 9.7).
    try {
      const card = cardRef.current;
      if (card) {
        // Transform-only reveal (no opacity): the card is already visible in
        // the default DOM, so a ScrollTrigger/GSAP failure never hides it.
        gsap.fromTo(
          card,
          { rotationX: -24, y: 32, transformPerspective: 900 },
          {
            rotationX: 0,
            y: 0,
            duration: 0.9,
            ease: 'power4.out',
            delay: index * 0.08,
          },
        );
      }
    } catch {
      /* leave the card flat/visible */
    }

    try {
      // Start from 0 only when we're actually animating, so a non-animating
      // environment never flashes zero (Req 5.3 graceful default).
      setValue(countValue(target, 0));

      const progress = { p: 0 };
      animate(progress, {
        p: [0, 1],
        duration: COUNT_DURATION, // 1–3s (Req 5.2)
        ease: 'out(3)',
        onUpdate: () => {
          setValue(countValue(target, progress.p));
        },
        onComplete: () => {
          // Snap to the exact target with no further changes (Req 5.3).
          setValue(countValue(target, 1));
        },
      });
    } catch {
      // On any anime.js failure, show the exact target (Req 5.3).
      setValue(target);
    }
  }, [target, index]);

  // Shared reveal hook: fire once at ~50% visibility and never re-trigger;
  // disabled under reduced motion (Req 5.6, 9.8).
  const revealRef = useReveal({
    start: 'top 50%',
    once: true,
    disabled: reduced,
    onReveal,
  });

  return (
    <div ref={revealRef} className="flex flex-col">
      {/* 3D number card: perspective wrapper + preserve-3d surface, tilts
          toward the pointer on a fine pointer. No box-shadow (Req 8.3). */}
      <NumberCard>
        <div ref={cardRef} className="flex flex-col">
          {/* Large confident number; maroon accent reserved for the suffix
              only (used sparingly, Req 8.1). Square, flat, no shadow (Req 8.3). */}
          <p className="text-[var(--color-text)]">
            <span
              className="font-semibold leading-none tracking-tight"
              style={{ fontSize: 'clamp(44px, 8vw, 88px)' }}
            >
              {formatValue(value)}
            </span>
            {suffix ? (
              <span
                className="ml-1 font-semibold leading-none"
                style={{
                  fontSize: 'clamp(28px, 5vw, 52px)',
                  color: 'var(--color-accent)',
                }}
              >
                {suffix}
              </span>
            ) : null}
          </p>

          {/* Thin maroon rule as a sparing accent under the number. */}
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-12"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />

          {/* Muted label below (Req 5.1). */}
          <span className="mt-4 max-w-[16rem] text-base text-[var(--color-muted)] sm:text-lg">
            {label}
          </span>
        </div>
      </NumberCard>
    </div>
  );
}

/**
 * Render a count value as a string. Integers show with no decimals; non-integer
 * values (mid-count of the 3.75 target) show their natural decimals. `String`
 * already produces "3.75", "3", "13", etc. without trailing-zero noise.
 */
function formatValue(v: number): string {
  return String(v);
}
