'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import type { Project } from '@/lib/data';
import { resolveImagePath } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import { useCardReveal } from '@/lib/reveal';
import SafeImage from './SafeImage';

/** A source-backed work/service row that stays fully readable without motion. */
export interface ProjectRowProps {
  project: Project;
  index: number;
  onHover?: (index: number, src: string) => void;
  onLeave?: () => void;
  onSelect?: (index: number) => void;
}

export default function ProjectRow({
  project,
  index,
  onHover,
  onLeave,
  onSelect,
}: ProjectRowProps) {
  const src = resolveImagePath(project, index);
  const label = String(index + 1).padStart(2, '0');
  const revealRef = useCardReveal({ index, disabled: prefersReducedMotion() });

  const handleEnter = useCallback(() => {
    onHover?.(index, src);
  }, [onHover, index, src]);

  const handleLeave = useCallback(() => {
    onLeave?.();
  }, [onLeave]);

  return (
    <article
      ref={revealRef}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={clsx(
        'group relative w-full min-w-0',
        'border-t border-[var(--qe-muted)]/25',
        'py-8 sm:py-10',
        'select-none',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect?.(index)}
        aria-label={`Open service presentation: ${project.title}`}
        aria-haspopup="dialog"
        data-cursor
        data-cursor-label="View"
        className="absolute inset-0 z-10 w-full bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
      >
        <span className="sr-only">Open {project.title}</span>
      </button>

      {/* Hero media with the project title overlaid on top, sitting closely
          above the big-type row. Decorative-but-informative: the same title is
          repeated as a real <h3> below so screen readers and no-image states
          stay fully readable. */}
      <div
        aria-hidden="true"
        data-project-media
        className="relative mb-6 aspect-[21/9] w-full overflow-hidden border border-[var(--qe-muted)]/20 sm:aspect-[21/8]"
      >
        <SafeImage
          src={src}
          alt=""
          variant="full"
          sizes="(max-width: 1024px) 100vw, 80vw"
          quality={70}
          loading={index === 0 ? 'eager' : 'lazy'}
          preload={index === 0}
          className={clsx(
            'transition-transform duration-[900ms] ease-out',
            'group-hover:scale-[1.05] group-focus-within:scale-[1.05]',
          )}
        />
        {/* Legibility scrim under the overlaid title. */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--qe-base, #0A0E1A) 12%, transparent) 0%, color-mix(in srgb, var(--qe-base, #0A0E1A) 78%, transparent) 100%)',
          }}
        />
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
          <span
            className={clsx(
              'text-primary break-words font-semibold leading-[0.95] tracking-tight',
              'text-[clamp(28px,6vw,84px)]',
              'transition-transform duration-500 ease-out',
              'group-hover:translate-y-[-4px] group-focus-within:translate-y-[-4px]',
            )}
          >
            {project.title}
          </span>
          <span className="text-accent shrink-0 pb-3 font-mono text-sm sm:text-base">
            {label}
          </span>
        </span>
      </div>

      <div className="flex min-w-0 items-baseline gap-4 sm:gap-6">
        <span
          aria-hidden="true"
          className="text-accent shrink-0 pt-2 font-mono text-sm sm:text-base"
        >
          {label}
        </span>

        <div className="min-w-0 flex-1">
          <h3
            className={clsx(
              'text-primary break-words font-semibold leading-[0.95] tracking-tight',
              'text-[clamp(28px,5vw,64px)]',
              'transition-transform duration-300 ease-out',
              'group-hover:translate-x-2 group-focus-within:translate-x-2',
            )}
          >
            {project.title}
          </h3>

          <p className="text-secondary mt-3 break-words text-base sm:text-lg">
            {project.category} · {project.client ? `${project.client} · ` : ''}
            {project.location}
          </p>

          <div className="text-secondary mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base">
            <span className="[overflow-wrap:anywhere]">
              {project.services.join(' · ')}
            </span>
          </div>

          <span className="text-primary mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
            View details <span aria-hidden="true" className="text-accent">↗</span>
          </span>
        </div>
      </div>
    </article>
  );
}
