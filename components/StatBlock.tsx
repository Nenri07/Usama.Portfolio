'use client';

import { useCallback, useRef, useState } from 'react';
import { animate } from 'animejs';
import { useReveal } from '@/lib/reveal';
import { countValue } from '@/lib/format';
import type { StatItem } from '@/lib/data';

/**
 * StatBlock — one statistic in the Numbers bar (Req 5.2–5.4).
 *
 * - Reveal: uses the SINGLE shared `useReveal` hook with `threshold: 0.5` and
 *   `once: true`, so the count-up starts the first time the block is at least
 *   50% visible (Req 5.2) and NEVER restarts if the block scrolls out of and
 *   back into view — the `once` mode is an absorbing state (Req 5.4). A local
 *   `hasStartedRef` guard is a second line of defense against re-triggering.
 * - Count-up: on reveal, an anime.js tween drives a progress object 0→1 over a
 *   duration in [1000, 3000]ms. On each update the displayed value is
 *   `countValue(target, progress)` — bounded to [0, target] and monotonic. At
 *   completion (progress 1) it shows the EXACT target
 *   (`countValue(target, 1) === target`) with its suffix (Req 5.2, 5.3).
 * - Graceful default (Req 5.3/5.4): the initial displayed value is the exact
 *   target, and the tween is wrapped in try/catch. If anime.js never runs (or
 *   throws), the block simply shows the final target value — no zero flash on a
 *   non-animating environment, and always the correct final number.
 *
 * Formatting: integer targets render as integers (e.g. "13+", "3"); the 3.75
 * target renders with decimals during the count and exactly "3.75M+" at the end
 * — `countValue` handles the rounding per the target's decimal places.
 */

/** Count-up duration in ms (Req 5.2 range [1000, 3000]). */
const COUNT_DURATION = 1800;

export interface StatBlockProps {
  /** Statistic data — target/suffix/label (Req 5.1). */
  stat: StatItem;
}

export default function StatBlock({ stat }: StatBlockProps) {
  const { target, suffix, label } = stat;

  // Default (unanimated) displayed value is the EXACT target, so if anime.js
  // never runs the final number is shown (Req 5.3/5.4 graceful default).
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

  // Shared reveal hook: fire once at ≥50% visibility and never re-trigger.
  const revealRef = useReveal({
    threshold: 0.5,
    once: true,
    onReveal,
  });

  return (
    <div ref={revealRef} className="flex flex-col">
      {/* Large confident number; maroon accent reserved for the suffix only
          (used sparingly, Req 7.1). Square, flat, no shadow (Req 7.3). */}
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
