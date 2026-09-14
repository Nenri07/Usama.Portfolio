'use client';

import { useCallback, useMemo } from 'react';
import ProjectRow from './ProjectRow';
import RevealHeading from './RevealHeading';
import { useHoverImage } from './HoverImageContext';
import { useProjectSelection } from './ProjectSelectionContext';
import { projects } from '@/lib/data';
import { hasWebGL, prefersReducedMotion, isCoarsePointer } from '@/lib/motion';

/** Big-type project list with optional, non-essential WebGL hover previews. */
export default function WorkList() {
  const hoverImage = useHoverImage();
  const projectSelection = useProjectSelection();

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

  const handleSelect = useCallback(
    (index: number) => {
      projectSelection?.openProject(index);
    },
    [projectSelection],
  );

  return (
    <section id="work" className="bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-12">
          <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
            Selected Work
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
          />
        </header>

        <div onPointerLeave={handleLeave}>
          {projects.map((project, i) => (
            <ProjectRow
              key={project.title}
              project={project}
              index={i}
              onHover={handleHover}
              onLeave={handleLeave}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
