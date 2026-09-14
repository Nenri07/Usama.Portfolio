'use client';

import { useCallback, useMemo } from 'react';
import ProjectRow from './ProjectRow';
import RevealHeading from './RevealHeading';
import { useHoverImage } from './HoverImageContext';
import { projects } from '@/lib/data';
import { hasWebGL, prefersReducedMotion, isCoarsePointer } from '@/lib/motion';

/**
 * WorkList — the big-type Project_List (Req 4.1, 10.1, 10.2, 10.6, 10.7, 10.8).
 *
 * Replaces the legacy `WorkGrid` as the primary Work_Section presentation. It
 * renders exactly 13 `ProjectRow`s from `projects` as a vertical list read top
 * to bottom, and owns the hover wiring to the single shared WebGL canvas.
 *
 * WebGL gate (Req 10.7, 10.8): the shared controller comes from
 * `useHoverImage()` — which is already `null` when WebGL is unavailable / init
 * failed — and canvas calls are additionally gated on reduced motion + coarse
 * pointer. When not enabled the rows still render as fully readable text with
 * CSS hover emphasis; no canvas calls are made (Req 10.1, 10.7).
 *
 * The pointer position is driven globally by `HoverImageCanvas`, so WorkList
 * only calls `show(src)` on row enter and `hide()` on list leave (Req 10.5,
 * 10.6). It never creates a canvas per row — the single shared canvas lives in
 * the layout (Req 10.2).
 */
export default function WorkList() {
  const hoverImage = useHoverImage();

  // Enable canvas wiring only when a controller exists (WebGL ok) and motion /
  // pointer conditions allow it (Req 10.7, 10.8).
  const enabled = useMemo(
    () => !!hoverImage && hasWebGL() && !prefersReducedMotion() && !isCoarsePointer(),
    [hoverImage],
  );

  const handleHover = useCallback(
    (_index: number, src: string) => {
      if (enabled) hoverImage?.show(src);
    },
    [enabled, hoverImage],
  );

  const handleLeave = useCallback(() => {
    if (enabled) hoverImage?.hide();
  }, [enabled, hoverImage]);

  return (
    <section id="work" className="bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Section heading + shared thin maroon rule (heading ≥32px). */}
        <header className="mb-12">
          <RevealHeading className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Selected Work
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--color-accent)]"
          />
        </header>

        {/*
          Vertical big-type index of 13 ProjectRows. Hiding the preview when the
          pointer leaves the whole list guarantees it fades out even if a row's
          own leave is missed (Req 10.6).
        */}
        <div onPointerLeave={handleLeave}>
          {projects.map((project, i) => (
            <ProjectRow
              key={i}
              project={project}
              index={i}
              onHover={handleHover}
              onLeave={handleLeave}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
