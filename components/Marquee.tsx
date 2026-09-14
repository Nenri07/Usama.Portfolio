'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { clients } from '@/lib/data';
import { buildMarqueeTrack } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Marquee — the "Trusted By" (Clients) section (Req 3).
 *
 * - Renders all 8 clients/venues/partners as styled TEXT (no images/logos) in
 *   EXACT order, separated by a fixed inter-entry gap and a maroon dot
 *   separator (Req 3.1, 3.2, 3.3).
 * - Seamless infinite loop via a DUPLICATED track: `buildMarqueeTrack` returns
 *   `[...clients, ...clients]`. anime.js (SECONDARY effect, Req 9.3) animates
 *   the track `translateX` from 0 to -50% with `loop: true`, `ease: 'linear'`,
 *   constant duration, so the scroll is continuous with no pause between
 *   iterations. Because the two halves are identical, the seam at -50% is
 *   invisible (Req 3.4, 3.5).
 * - Graceful default (Req 3.6): the track's default DOM state is translateX 0,
 *   which already shows all 8 clients fully readable. `animate()` is wrapped in
 *   try/catch; if anime.js fails to init, the animation simply never starts and
 *   the wordmarks stay static and legible.
 * - Reduced motion (Req 3.7): when `prefersReducedMotion()` is true the anime.js
 *   loop never starts — all 8 clients render static and fully readable.
 */

// One rendered copy of the client sequence, used for both halves of the track.
const HALF = clients;
// Duplicated track for the seamless loop (Req 3.5).
const TRACK = buildMarqueeTrack(HALF);

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Reduced motion: do NOT start the auto-scroll; render static wordmarks
    // (all 8 visible and readable) at the default translateX 0 (Req 3.7).
    if (prefersReducedMotion()) return;

    try {
      // Continuous horizontal auto-scroll: translate one full half-width and
      // loop. Constant linear speed, no pause between iterations (Req 3.4).
      // The second half is identical to the first, so at -50% the visible
      // content matches translateX 0 — the loop is seamless (Req 3.5).
      animate(el, {
        translateX: ['0%', '-50%'],
        duration: 24000, // constant speed across the whole sequence
        ease: 'linear',
        loop: true,
      });
    } catch {
      // anime.js failed to init: leave the track at its default translateX 0
      // so all 8 clients render static and fully readable (Req 3.6).
    }
  }, []);

  return (
    <section
      id="trusted-by"
      className="flex flex-col items-center gap-10 px-6 py-24"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
        Trusted By
      </p>

      {/* Viewport clips the overflowing track (Req 3.4). */}
      <div className="w-full overflow-hidden">
        {/* Duplicated track — width is content-driven; translateX -50% moves it
            by exactly one half (one full client sequence). */}
        <div
          ref={trackRef}
          className="flex w-max items-center will-change-transform"
        >
          {TRACK.map((mark, i) => (
            <div
              key={`${mark}-${i}`}
              // Fixed visual gap between adjacent wordmarks (Req 3.3).
              className="flex shrink-0 items-center gap-16 pr-16"
              // The second half is aria-hidden so screen readers announce the
              // 8 clients exactly once.
              aria-hidden={i >= HALF.length ? true : undefined}
            >
              <span
                className="text-2xl font-semibold tracking-tight whitespace-nowrap text-[var(--color-text)] sm:text-3xl"
              >
                {mark}
              </span>
              {/* Maroon dot separator — the only accent, kept sparing (Req 8.1). */}
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
