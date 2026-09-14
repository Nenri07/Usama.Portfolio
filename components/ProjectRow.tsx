'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import type { Project } from '@/lib/data';
import { resolveImagePath } from '@/lib/format';

/** A big-type project row that is fully readable without hover or motion. */
export interface ProjectRowProps {
  project: Project;
  index: number;
  onHover?: (index: number, src: string) => void;
  onLeave?: () => void;
  onSelect?: (index: number) => void;
}

function metricText(project: Project): string | null {
  const parts: string[] = [];
  if (project.visitors) parts.push(`${project.visitors} visitors`);
  if (project.winners) parts.push(`${project.winners} winners`);
  if (project.staff) parts.push(`${project.staff} staff`);
  if (project.days) parts.push(`${project.days} days`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export default function ProjectRow({
  project,
  index,
  onHover,
  onLeave,
  onSelect,
}: ProjectRowProps) {
  const src = resolveImagePath(project, index);
  const metrics = metricText(project);
  const label = String(index + 1).padStart(2, '0');

  const handleEnter = useCallback(() => {
    onHover?.(index, src);
  }, [onHover, index, src]);

  const handleLeave = useCallback(() => {
    onLeave?.();
  }, [onLeave]);

  return (
    <article
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
        aria-label={`Open project presentation: ${project.title}`}
        aria-haspopup="dialog"
        data-cursor
        data-cursor-label="View"
        className="absolute inset-0 z-10 w-full bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
      >
        <span className="sr-only">Open {project.title}</span>
      </button>

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
              'text-[clamp(32px,7vw,96px)]',
              'transition-transform duration-300 ease-out',
              'group-hover:translate-x-2 group-focus-within:translate-x-2',
            )}
          >
            {project.title}
          </h3>

          <p className="text-secondary mt-3 break-words text-base sm:text-lg">
            {project.year} · {project.venue}
          </p>

          <div className="text-secondary mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base">
            <span className="[overflow-wrap:anywhere]">{project.services.join(' · ')}</span>
            {metrics ? (
              <span className="text-accent [overflow-wrap:anywhere]">
                {metrics}
              </span>
            ) : null}
          </div>

          <span className="text-primary mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
            View project <span aria-hidden="true" className="text-accent">↗</span>
          </span>
        </div>
      </div>
    </article>
  );
}
