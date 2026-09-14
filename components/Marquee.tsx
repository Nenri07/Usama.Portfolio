'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { clients } from '@/lib/data';
import { buildMarqueeTrack } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';

const HALF = clients;
const TRACK = buildMarqueeTrack(HALF);

/** Client wordmark marquee whose heading and entries are always readable. */
export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || prefersReducedMotion()) return;

    try {
      animate(el, {
        translateX: ['0%', '-50%'],
        duration: 24000,
        ease: 'linear',
        loop: true,
      });
    } catch {
      // The untransformed track is already visible and readable.
    }
  }, []);

  return (
    <section
      id="trusted-by"
      className="flex flex-col items-center gap-10 px-6 py-24"
    >
      <h2 className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
        Trusted By
      </h2>

      <div className="w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-max items-center will-change-transform"
        >
          {TRACK.map((mark, i) => (
            <div
              key={`${mark}-${i}`}
              className="flex shrink-0 items-center gap-16 pr-16"
              aria-hidden={i >= HALF.length ? true : undefined}
            >
              <span className="text-primary whitespace-nowrap text-2xl font-semibold tracking-tight sm:text-3xl">
                {mark}
              </span>
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0"
                style={{ backgroundColor: 'var(--qe-accent, #6E1423)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
