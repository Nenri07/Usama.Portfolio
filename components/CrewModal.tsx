'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import type { TeamDivision } from '@/lib/data';
import SafeImage from './SafeImage';

interface CrewModalProps {
  division: TeamDivision;
  onClose: () => void;
}

/** Full division gallery, mounted only while that division is selected. */
export default function CrewModal({ division, onClose }: CrewModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = `crew-dialog-${division.slug}`;

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
        { y: 36, rotationX: 6, autoAlpha: 0, transformPerspective: 1200 },
        {
          y: 0,
          rotationX: 0,
          autoAlpha: 1,
          duration: 0.55,
          ease: 'power4.out',
        },
        '-=0.12',
      );
      return () => {
        timeline.kill();
      };
    } catch {
      try {
        gsap.set([scrim, panel], { autoAlpha: 1, y: 0, rotationX: 0 });
      } catch {
        /* final visible DOM state is already usable */
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
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--color-base)_94%,transparent)] p-3 sm:p-6"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl min-w-0 overflow-y-auto overscroll-contain border border-[var(--color-muted)]/20 bg-[var(--color-base)] [transform-style:preserve-3d] sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="sticky top-0 z-20 flex min-w-0 items-start justify-between gap-6 border-b border-[var(--color-muted)]/20 bg-[var(--color-base)]/95 px-5 py-5 backdrop-blur sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Crew division · {division.images.length} photographs
            </p>
            <h2
              id={titleId}
              className="mt-2 break-words text-3xl font-semibold leading-tight text-[var(--color-text)] sm:text-5xl"
            >
              {division.name}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={`Close ${division.name} crew gallery`}
            className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--color-muted)]/30 bg-[var(--color-base)] text-2xl text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="px-5 pb-10 pt-8 sm:px-8 sm:pb-14">
          <div className="grid min-w-0 gap-8 border-b border-[var(--color-muted)]/20 pb-8 md:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-muted)] sm:text-xl">
              {division.blurb}
            </p>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text)]">
                On-site contribution
              </p>
              <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">
                {division.management}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {division.capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="border border-[var(--color-muted)]/25 px-3 py-1.5 text-sm text-[var(--color-muted)]"
                  >
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 grid min-w-0 grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {division.images.map((src, index) => (
              <figure
                key={src}
                className="min-w-0 border border-[var(--color-muted)]/15 bg-[var(--color-surface)]"
              >
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <SafeImage
                    src={src}
                    alt={`${division.name} crew photograph ${index + 1}`}
                    variant="full"
                    fallbackColor="var(--color-surface)"
                    loading="lazy"
                  />
                </div>
                <figcaption className="px-3 py-2 font-mono text-xs text-[var(--color-muted)]">
                  {String(index + 1).padStart(2, '0')} / {String(division.images.length).padStart(2, '0')}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
