'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import SafeImage from './SafeImage';
import { splitWords } from '@/lib/format';

/**
 * Hero — the first section (Req 2).
 *
 * - Full-bleed background via SafeImage for `/work/img-000.png` with
 *   object-cover, covering 100% of the section (Req 2.1). On load failure or a
 *   >3s timeout SafeImage swaps to a solid `--color-base` fallback while the
 *   foreground (headline, subheadline, scroll cue) stays visible (Req 2.2).
 * - The headline is split into words; each word is wrapped in a <span>. On
 *   mount an anime.js animation fades each word 0→1 and translates it from 20px
 *   below to its final position, 600ms per word with a 100ms stagger (Req 2.3).
 * - The subheadline is a single line ≤120 chars with whitespace-nowrap (Req 2.4).
 * - A scroll cue is anchored to the section bottom, visible in the first
 *   viewport (Req 2.5).
 *
 * Animation safety: the DEFAULT (unanimated) DOM state is the final visible
 * state (opacity 1, translateY 0). The hidden start state is only applied by JS
 * after mount, immediately before the animation runs, and the whole effect is
 * wrapped so any anime.js failure leaves the headline fully readable.
 */

const HEADLINE = 'We turn Qatar into the moment.';
// Single-line positioning statement, ≤120 chars, no wrapping (Req 2.4).
const SUBHEADLINE =
  'Event activations that fill boulevards, malls, and stadiums across Qatar.';

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const words = splitWords(HEADLINE);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;

    const spans = el.querySelectorAll<HTMLElement>('[data-word]');
    if (spans.length === 0) return;

    try {
      // Apply the hidden START state via JS (not static CSS) so that if
      // anime.js never runs the words remain at their visible default state.
      spans.forEach((span) => {
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
      });

      animate(spans, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600, // ≤600ms per word (Req 2.3)
        delay: stagger(100), // 100ms between consecutive words (Req 2.3)
        ease: 'out(3)',
      });
    } catch {
      // If anime.js fails, restore the final visible state so the headline
      // stays readable (Req 2.3 graceful default).
      spans.forEach((span) => {
        span.style.opacity = '1';
        span.style.transform = 'none';
      });
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
    >
      {/* Full-bleed background image (Req 2.1) with solid --color-base fallback
          on failure / >3s timeout (Req 2.2). Sits behind all foreground. */}
      <div className="absolute inset-0 -z-10">
        <SafeImage
          src="/work/img-000.png"
          alt=""
          variant="full"
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

      {/* Foreground content — always visible (Req 2.2). */}
      <h1
        ref={headlineRef}
        className="max-w-5xl text-[var(--color-text)]"
        style={{ fontSize: 'clamp(40px, 9vw, 88px)', lineHeight: 1.05 }}
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            data-word
            className="inline-block"
            style={{ willChange: 'opacity, transform' }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        ))}
      </h1>

      {/* Subheadline: single line, ≤120 chars, no wrapping (Req 2.4). */}
      <p className="mt-6 max-w-full overflow-hidden text-base text-[var(--color-muted)] whitespace-nowrap sm:text-lg">
        {SUBHEADLINE}
      </p>

      {/* Scroll cue anchored to the section bottom, within the first viewport
          (Req 2.5). */}
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
