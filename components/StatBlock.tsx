'use client';

import { useCallback, useRef, useState } from 'react';
import { animate } from 'animejs';
import { useReveal } from '@/lib/reveal';
import { countValue } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import type { StatItem } from '@/lib/data';

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
 * - Reduced motion (Req 5.6): `useReveal` is `disabled`, so the count-up never
 *   runs and the block shows its exact target immediately. Because the initial
 *   state IS the target, there is no zero flash.
 *
 * Graceful default (Req 5.3/5.4/9.7): the initial displayed value is the exact
 * target, and the tween is wrapped in try/catch. If anime.js never runs (or
 * throws), the block simply shows the final target value.
 *
 * NO financial figures anywhere — only Public_Metric values (Req 5.5, 8.6).
 */

/** Count-up duration in ms (Req 5.2 range [1000, 3000]). */
const COUNT_DURATION = 1800;

export interface StatBlockProps {
  /** Statistic data — target/suffix/label (Req 5.1). */
  stat: StatItem;
}

export default function StatBlock({ stat }: StatBlockProps) {
  const { target, suffix, label } = stat;

  // Compute reduced-motion in the component (client); passed to useReveal as
  // `disabled` so under reduced motion the count-up never runs (Req 5.6, 9.8).
  const reduced = prefersReducedMotion();

  // Default (unanimated) displayed value is the EXACT target, so if anime.js
  // never runs (or reduced motion is set) the final number is shown with no
  // zero flash (Req 5.3/5.4/5.6 graceful default).
  const [value, setValue] = useState<number>(target);

  // Absorbing guard: once the count-up has started it never runs again, even
  // if `onReveal` were somehow invoked more than once (Req 5.4).
  const hasStartedRef = useRef(false);

  const onReveal = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

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
  }, [target]);

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
      {/* Large confident number; maroon accent reserved for the suffix only
          (used sparingly, Req 8.1). Square, flat, no shadow (Req 8.3). */}
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
