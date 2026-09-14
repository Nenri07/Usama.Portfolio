'use client';

import { useCallback } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';

/** Full-viewport presentation ending with lightweight GSAP depth choreography. */
export default function ThankYou() {
  const reduced = prefersReducedMotion();

  const onReveal = useCallback((element: Element) => {
    try {
      const layers = element.querySelectorAll<HTMLElement>('[data-thank-layer]');
      const copy = element.querySelectorAll<HTMLElement>('[data-thank-copy]');
      const timeline = gsap.timeline();

      timeline.fromTo(
        layers,
        { rotationX: 14, rotationY: -8, z: -140, y: 36 },
        {
          rotationX: 0,
          rotationY: 0,
          z: 0,
          y: 0,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.1,
        },
      );
      timeline.fromTo(
        copy,
        { y: 42, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.12,
        },
        '-=0.75',
      );
    } catch {
      try {
        gsap.set(element.querySelectorAll('[data-thank-layer], [data-thank-copy]'), {
          clearProps: 'all',
        });
      } catch {
        /* default DOM state is final and visible */
      }
    }
  }, []);

  const revealRef = useReveal({
    start: 'top 72%',
    once: true,
    disabled: reduced,
    onReveal,
  });

  return (
    <section
      id="thank-you"
      ref={revealRef}
      className="relative isolate flex min-h-[100dvh] w-full min-w-0 max-w-full items-center justify-center overflow-hidden bg-[var(--color-base)] px-6 py-24 [perspective:1400px] sm:px-8 lg:px-12"
    >
      <div
        data-thank-layer
        aria-hidden="true"
        className="absolute left-[8%] top-[12%] h-[42%] w-[44%] border-l border-t border-[var(--color-muted)]/15 [transform:translateZ(-80px)_rotateZ(-5deg)]"
      />
      <div
        data-thank-layer
        aria-hidden="true"
        className="absolute bottom-[10%] right-[6%] h-[38%] w-[48%] border-b border-r border-[var(--color-accent)]/25 [transform:translateZ(-30px)_rotateZ(4deg)]"
      />
      <div
        data-thank-layer
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 aspect-square w-[min(68vw,46rem)] border border-[var(--color-muted)]/10 [transform:translate(-50%,-50%)_translateZ(-160px)_rotate(45deg)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent_58%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-col items-center text-center [transform-style:preserve-3d]">
        <p
          data-thank-copy
          className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]"
        >
          End of presentation · Doha, Qatar
        </p>

        <h2
          data-thank-copy
          className="mt-8 max-w-5xl break-words font-display text-[clamp(4.5rem,16vw,12rem)] font-semibold leading-[0.76] tracking-[-0.045em] text-[var(--color-text)]"
        >
          Thank you.
        </h2>

        <p
          data-thank-copy
          className="mt-10 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] sm:text-xl"
        >
          Built for the moments people gather around—and remember together.
        </p>

        <a
          data-thank-copy
          href="#top"
          className="mt-12 inline-flex min-h-12 items-center gap-3 border-b border-[var(--color-accent)] pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
        >
          Return to the beginning <span aria-hidden="true">↑</span>
        </a>
      </div>
    </section>
  );
}
