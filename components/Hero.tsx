'use client';

import { useEffect, useRef } from 'react';
import SafeImage from './SafeImage';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion, splitText, parallax } from '@/lib/motion';

/**
 * Hero — the first section (Req 2).
 *
 * - Full-bleed background via SafeImage for `/work/img-000.png` with
 *   object-cover, covering 100% of the section (Req 2.1). On load failure or a
 *   >3s timeout SafeImage swaps to a solid `--color-base` fallback while the
 *   foreground (headline, subheadline, scroll cue) stays visible (Req 2.2).
 * - The headline is split into word spans via `splitText(el, 'words')` and a
 *   GSAP timeline fades each unit opacity 0→1 and translates it from 20px below
 *   to its final position — 600ms per unit with a 100ms stagger (Req 2.3).
 *   This is the PRIMARY engine (GSAP), replacing the former anime.js stagger.
 * - Background PARALLAX via `parallax(bgEl, { yPercent: 15 })` is applied ONLY
 *   to the background image container, never the text, so the headline,
 *   subheadline, and scroll cue stay fully readable at every scroll position
 *   (Req 2.6).
 * - The subheadline is a single line ≤120 chars with whitespace-nowrap (Req 2.4).
 * - A scroll cue is anchored to the section bottom, visible in the first
 *   viewport (Req 2.5).
 *
 * Animation safety (Req 9.7, 9.8): the DEFAULT (unanimated) DOM state is the
 * final visible state (opacity 1, translateY 0, no parallax offset). The hidden
 * start state is only applied by JS after mount, and the whole effect is wrapped
 * in try/catch so any GSAP failure leaves the headline fully readable. Under
 * `prefersReducedMotion()` neither the split animation nor the parallax runs —
 * everything renders in its final visible state.
 */

const HEADLINE = 'We turn Qatar into the moment.';
// Single-line positioning statement, ≤120 chars, no wrapping (Req 2.4).
const SUBHEADLINE =
  'Event activations that fill boulevards, malls, and stadiums across Qatar.';

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Split-text headline animation (Req 2.3) — GSAP primary engine.
  useEffect(() => {
    const el = headlineRef.current;
    if (!el || prefersReducedMotion()) return;

    let spans: HTMLElement[] = [];
    try {
      // Wrap each word in an inline-block span (returns [] under reduced motion
      // / SSR, leaving the text untouched and readable).
      spans = splitText(el, 'words');
      if (spans.length === 0) return;

      // Apply the hidden START state via JS (not static CSS) so that if GSAP
      // never runs the words remain at their visible default state.
      gsap.set(spans, { opacity: 0, y: 20 });

      const tl = gsap.timeline();
      tl.to(spans, {
        opacity: 1,
        y: 0,
        duration: 0.6, // ≤600ms per unit (Req 2.3)
        stagger: 0.1, // 100ms between consecutive words, in [0.08, 0.12] (Req 2.3)
        ease: 'power3.out',
      });

      return () => {
        tl.kill();
      };
    } catch {
      // If GSAP fails, restore the final visible state so the headline stays
      // readable (Req 2.3 / 9.7 graceful default).
      try {
        if (spans.length > 0) {
          gsap.set(spans, { clearProps: 'all' });
        }
      } catch {
        spans.forEach((span) => {
          span.style.opacity = '1';
          span.style.transform = 'none';
        });
      }
    }
  }, []);

  // Background parallax (Req 2.6) — applied ONLY to the background container so
  // the foreground text stays readable at every scroll position.
  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    // `parallax` no-ops under reduced motion / SSR and returns a no-op cleanup.
    const cleanup = parallax(bg, { yPercent: 15 });
    return cleanup;
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
    >
      {/* Full-bleed background image (Req 2.1) with solid --color-base fallback
          on failure / >3s timeout (Req 2.2). Sits behind all foreground. This
          container is the ONLY element the parallax translates (Req 2.6). */}
      <div ref={bgRef} className="absolute inset-0 -z-10 will-change-transform">
        <SafeImage
          src="/work/img-000.png"
          alt=""
          variant="full"
          sizes="100vw"
          preload
          loading="eager"
          fallbackColor="var(--color-base)"
          timeoutMs={3000}
        />
        {/* Dark scrim so foreground text stays legible over any image. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,26,0.55) 0%, rgba(10,14,26,0.75) 100%)',
          }}
        />
      </div>

      {/* Foreground content — always visible (Req 2.2, 2.6). Not parallaxed. */}
      <h1
        ref={headlineRef}
        className="max-w-5xl text-[var(--color-text)]"
        style={{ fontSize: 'clamp(40px, 9vw, 88px)', lineHeight: 1.05 }}
      >
        {HEADLINE}
      </h1>

      {/* Subheadline: single line, ≤120 chars, no wrapping (Req 2.4). */}
      <p className="mt-6 max-w-full overflow-hidden text-base text-[var(--color-muted)] whitespace-nowrap sm:text-lg">
        {SUBHEADLINE}
      </p>

      {/* Scroll cue anchored to the section bottom, within the first viewport
          (Req 2.5). Stays fully readable at every scroll position (Req 2.6). */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-[var(--color-muted)]">
        <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
        <span
          aria-hidden="true"
          className="h-8 w-px"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      </div>
    </section>
  );
}
