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
  /** Opens the supporting public-metric presentation. */
  onSelect?: () => void;
}

export default function StatBlock({ stat, index = 0, onSelect }: StatBlockProps) {
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
    <div ref={revealRef} className="flex h-full min-w-0 flex-col">
      <NumberCard
        wrapperClassName="h-full"
        className="h-full min-h-72 border border-[var(--color-muted)]/20 bg-[var(--color-surface)]/30 p-5 transition-colors duration-300 hover:border-[var(--color-accent)]/55 sm:p-6"
      >
        <div ref={cardRef} className="flex h-full min-w-0 flex-col">
          <p className="break-words text-[var(--color-text)]">
            <span
              className="font-display font-semibold leading-none tracking-tight"
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

          <span
            aria-hidden="true"
            className="mt-4 block h-px w-12"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />

          <span className="mt-4 max-w-[16rem] break-words text-base text-[var(--color-muted)] sm:text-lg">
            {label}
          </span>

          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              aria-haspopup="dialog"
              aria-label={`View supporting details for ${label}`}
              className="relative z-10 mt-auto inline-flex min-h-12 items-center gap-3 self-start pt-7 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
            >
              Explore result <span aria-hidden="true" className="text-[var(--color-accent)]">↗</span>
            </button>
          ) : null}
        </div>
      </NumberCard>
    </div>
  );
}

function formatValue(v: number): string {
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
