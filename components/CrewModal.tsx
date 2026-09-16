'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import type { TeamDivision } from '@/lib/data';
import SafeImage from './SafeImage';
import CinematicImageViewer from './CinematicImageViewer';

interface CrewModalProps {
  division: TeamDivision;
  onClose: () => void;
}

/** Full division gallery, mounted only while that division is selected. */
export default function CrewModal({ division, onClose }: CrewModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerOpen = viewerIndex != null;
  const titleId = `crew-dialog-${division.slug}`;

  // Honest, neutral capability label for INDIVIDUAL photos — we never caption a
  // single ambiguous photo with a specific job title (e.g. "Hostess"/"Cleaner").
  // Photos only carry their correct capability group.
  const groupLabel =
    division.group === 'events' ? 'Events & Hospitality' : 'Cleaning & Facilities';
  const photoCaption = `On-site — ${groupLabel}`;

  useAccessibleDialog({
    open: true,
    onClose,
    containerRef: panelRef,
    initialFocusRef: closeRef,
    suspended: viewerOpen,
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
    <>
      <div
        ref={scrimRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={viewerOpen || undefined}
        inert={viewerOpen || undefined}
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
        className="modal-scroll-surface relative max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl min-w-0 overflow-y-auto border border-[var(--qe-muted)]/20 bg-[var(--qe-base)] [transform-style:preserve-3d] sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="sticky top-0 z-20 flex min-w-0 items-start justify-between gap-6 border-b border-[var(--qe-muted)]/20 bg-[var(--qe-base)]/95 px-5 py-5 backdrop-blur sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em]">
              {division.group === 'events' ? 'Events & Hospitality' : 'Cleaning & Facilities'} ·{' '}
              {division.images.length} photographs
            </p>
            <h2
              id={titleId}
              className="text-primary mt-2 break-words text-3xl font-semibold leading-tight sm:text-5xl"
            >
              {division.name}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={`Close ${division.name} gallery`}
            className="text-primary-interactive flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--qe-muted)]/30 bg-[var(--qe-base)] text-2xl transition-colors hover:border-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="px-5 pb-10 pt-8 sm:px-8 sm:pb-14">
          <div className="grid min-w-0 gap-8 border-b border-[var(--qe-muted)]/20 pb-8 md:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
            <p className="text-secondary max-w-2xl text-lg leading-relaxed sm:text-xl">
              {division.blurb}
            </p>
            <div className="min-w-0">
              <p className="text-primary text-sm font-semibold uppercase tracking-[0.18em]">
                On-site contribution
              </p>
              <p className="text-secondary mt-3 text-base leading-relaxed">
                {division.management}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {division.capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="text-secondary border border-[var(--qe-muted)]/25 px-3 py-1.5 text-sm"
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
                className="crew-gallery-item min-w-0 border border-[var(--qe-muted)]/15 bg-[var(--qe-surface)]"
              >
                <button
                  type="button"
                  onClick={() => setViewerIndex(index)}
                  aria-label={`Open ${photoCaption} photograph ${index + 1} in cinematic viewer`}
                  className="block aspect-[4/5] w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
                >
                  <SafeImage
                    src={src}
                    alt={`${photoCaption} photograph ${index + 1}`}
                    variant="full"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    fallbackColor="var(--qe-surface)"
                    loading="lazy"
                    className="pointer-events-none"
                  />
                </button>
                <figcaption className="px-3 py-2 font-mono text-xs text-[var(--qe-muted)]">
                  {String(index + 1).padStart(2, '0')} / {String(division.images.length).padStart(2, '0')}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>

      {viewerIndex != null ? (
        <CinematicImageViewer
          images={division.images.map((src, index) => ({
            src,
            alt: `${photoCaption} photograph ${index + 1}`,
          }))}
          initialIndex={viewerIndex}
          title={division.name}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </>
  );
}
