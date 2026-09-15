'use client';

import { useCallback, useRef } from 'react';
import { useReveal } from '@/lib/reveal';
import { prefersReducedMotion } from '@/lib/motion';
import { gsap } from '@/lib/gsapSetup';
import type { StatItem } from '@/lib/data';
import NumberCard from './NumberCard';

export interface StatBlockProps {
  stat: StatItem;
  index?: number;
  onSelect?: () => void;
}

/** One source-backed service-standard card with optional 3D enhancement. */
export default function StatBlock({ stat, index = 0, onSelect }: StatBlockProps) {
  const reduced = prefersReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const onReveal = useCallback(() => {
    try {
      const card = cardRef.current;
      if (!card) return;
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
    } catch {
      // The card's default DOM state is already flat and visible.
    }
  }, [index]);

  const revealRef = useReveal({
    start: 'top 70%',
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
          <p className="font-mono text-sm text-[var(--color-accent)]">
            {String(index + 1).padStart(2, '0')} · {stat.kicker}
          </p>

          <h3 className="mt-6 break-words font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-[var(--color-text)]">
            {stat.label}
          </h3>

          <span
            aria-hidden="true"
            className="mt-5 block h-px w-12"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />

          <p className="mt-5 max-w-[22rem] text-base leading-relaxed text-[var(--color-muted)]">
            {stat.summary}
          </p>

          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              aria-haspopup="dialog"
              aria-label={`View service standard details for ${stat.label}`}
              className="relative z-10 mt-auto inline-flex min-h-12 items-center gap-3 self-start pt-7 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
            >
              Explore standard{' '}
              <span aria-hidden="true" className="text-[var(--color-accent)]">↗</span>
            </button>
          ) : null}
        </div>
      </NumberCard>
    </div>
  );
}
