'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { clients } from '@/lib/data';
import { buildMarqueeTrack } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';

const HALF = clients;
const TRACK = buildMarqueeTrack(HALF);

/**
 * Marquee — a proper animated client wordmark ribbon (Trusted By).
 *
 * Motion (anime.js): the doubled track scrolls continuously and seamlessly
 * (0% → -50%, because the two halves are identical). Hovering the section
 * eases the scroll to a pause and resumes on leave. A faint heading shimmer and
 * a subtle 3D perspective on the ribbon add depth without hurting legibility.
 *
 * Edge depth: CSS mask gradients fade the ribbon into the background at both
 * ends so it reads as an infinite ribbon, never as static centered text. The
 * track is clipped inside an overflow-hidden wrapper so the page never gains a
 * horizontal scrollbar.
 *
 * Degradation: under reduced motion (or if anime.js fails) the untransformed
 * track is already fully visible and readable; no animation is bound.
 */
export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    const section = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    let scroll: ReturnType<typeof animate> | null = null;

    try {
      scroll = animate(el, {
        translateX: ['0%', '-50%'],
        duration: 32000,
        ease: 'linear',
        loop: true,
      });
    } catch {
      // Untransformed track is already visible/readable.
      return;
    }

    // Hover-pause: ease the playback speed toward 0 on enter, back to 1 on
    // leave, so the pause/resume feels weighty rather than an abrupt stop.
    const speed = { value: 1 };

    const setSpeed = (target: number) => {
      try {
        animate(speed, {
          value: target,
          duration: 600,
          ease: 'out(2)',
          onUpdate: () => {
            if (scroll) scroll.speed = speed.value;
          },
        });
      } catch {
        if (scroll) scroll.speed = target;
      }
    };

    const onEnter = () => setSpeed(0);
    const onLeave = () => setSpeed(1);

    section?.addEventListener('pointerenter', onEnter);
    section?.addEventListener('pointerleave', onLeave);

    return () => {
      section?.removeEventListener('pointerenter', onEnter);
      section?.removeEventListener('pointerleave', onLeave);
      try {
        scroll?.pause();
        scroll?.revert?.();
      } catch {
        /* nothing to clean up */
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="trusted-by"
      className="flex flex-col items-center gap-10 overflow-hidden px-6 py-24"
    >
      <h2 className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
        Trusted By
      </h2>

      {/* Edge-faded, perspective ribbon. The mask fades both ends into the
          background so the scroll reads as infinite. */}
      <div
        className="marquee-mask w-full overflow-hidden"
        style={{ perspective: '900px' }}
      >
        <div
          ref={trackRef}
          className="flex w-max items-center will-change-transform"
          style={{ transform: 'rotateX(4deg)' }}
        >
          {TRACK.map((mark, i) => (
            <div
              key={`${mark}-${i}`}
              className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16"
              aria-hidden={i >= HALF.length ? true : undefined}
            >
              <span className="text-primary whitespace-nowrap text-2xl font-semibold tracking-tight transition-colors duration-300 hover:text-[var(--qe-accent)] sm:text-3xl">
                {mark}
              </span>
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rotate-45"
                style={{ backgroundColor: 'var(--qe-accent, #6E1423)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
