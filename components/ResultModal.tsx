'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import type { StatItem } from '@/lib/data';

interface ResultModalProps {
  stat: StatItem;
  index: number;
  onClose: () => void;
}

/** Accessible detail presentation for a source-backed Puro service standard. */
export default function ResultModal({ stat, index, onClose }: ResultModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = `standard-dialog-${index}`;

  useAccessibleDialog({
    open: true,
    onClose,
    containerRef: panelRef,
    initialFocusRef: closeRef,
  });

  useLayoutEffect(() => {
    const scrim = scrimRef.current;
    const panel = panelRef.current;
    if (!scrim || !panel || prefersReducedMotion()) return;

    try {
      const timeline = gsap.timeline();
      timeline.fromTo(
        scrim,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: 'power2.out' },
      );
      timeline.fromTo(
        panel,
        { y: 42, rotationY: -5, autoAlpha: 0, transformPerspective: 1400 },
        {
          y: 0,
          rotationY: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: 'power4.out',
        },
        '-=0.12',
      );
      return () => {
        timeline.kill();
      };
    } catch {
      try {
        gsap.set([scrim, panel], { autoAlpha: 1, y: 0, rotationY: 0 });
      } catch {
        // The final visible state remains available.
      }
    }
  }, []);

  return (
    <div
      ref={scrimRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--qe-base)_94%,transparent)] p-3 sm:p-6"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className="modal-scroll-surface relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl min-w-0 overflow-x-hidden overflow-y-auto border border-[var(--qe-muted)]/20 bg-[var(--qe-base)] p-5 [perspective:1400px] sm:max-h-[calc(100dvh-3rem)] sm:p-9 lg:p-12"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={`Close ${stat.label} details`}
          className="text-primary-interactive absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border border-[var(--qe-muted)]/30 bg-[var(--qe-base)] text-2xl transition-colors hover:border-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:right-6 sm:top-6"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div
          aria-hidden="true"
          className="text-primary pointer-events-none absolute -right-4 top-12 font-display text-[clamp(7rem,24vw,18rem)] leading-none opacity-[0.025]"
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        <header className="relative z-10 min-w-0 pr-14">
          <p className="text-accent font-mono text-xs uppercase tracking-[0.22em]">
            Service standard · {String(index + 1).padStart(2, '0')}
          </p>
          <p className="text-accent mt-8 font-mono text-sm uppercase tracking-[0.18em]">
            {stat.kicker}
          </p>
          <h2
            id={titleId}
            className="text-primary mt-4 max-w-3xl break-words font-display text-[clamp(3.25rem,10vw,7.5rem)] font-semibold leading-[0.88] tracking-tight"
          >
            {stat.label}
          </h2>
        </header>

        <div className="relative z-10 mt-10 grid min-w-0 gap-8 border-t border-[var(--qe-muted)]/20 pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:gap-12">
          <p className="text-secondary text-lg leading-relaxed sm:text-xl">
            {stat.summary}
          </p>

          <ol className="grid min-w-0 gap-3">
            {stat.details.map((detail, detailIndex) => (
              <li
                key={detail}
                className="border border-[var(--qe-muted)]/20 bg-[var(--qe-surface)]/35 px-4 py-4"
              >
                <span className="text-accent font-mono text-xs">
                  {String(detailIndex + 1).padStart(2, '0')}
                </span>
                <p className="text-primary mt-1 break-words text-base leading-relaxed">
                  {detail}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-secondary relative z-10 mt-10 border-l border-[var(--qe-accent)] pl-4 text-sm leading-relaxed">
          Presented from the public Puro company profile without unsupported performance figures.
        </p>
      </div>
    </div>
  );
}
