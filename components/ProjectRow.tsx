'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import type { Project } from '@/lib/data';
import { resolveImagePath } from '@/lib/format';
import { useLineMask } from '@/lib/useLineMask';

/**
 * ProjectRow — one big-type text row of the Work_Section Project_List
 * (Req 4.1–4.10, 10.1, 11.6).
 *
 * Renders a single project as a large heading-scale line (the `title`) with a
 * secondary line of `year` · `venue`, the `services` highlights, and any
 * Public_Metric counts (`visitors`/`winners`/`staff`/`days`). It renders NO
 * Prohibited_Financial_Figure (Req 4.5, 8.6).
 *
 * The row keeps heading/content semantics while an overlaid native button makes
 * the complete surface keyboard-operable and opens the shared project dialog.
 * Pointer enter/leave still reports the resolved preview source to WorkList;
 * when Batch 1 leaves WebGL unmounted those calls safely no-op and CSS emphasis
 * keeps the row tactile.
 */
export interface ProjectRowProps {
  project: Project;
  index: number;
  /** Called on pointer enter with the row index and resolved preview src. */
  onHover?: (index: number, src: string) => void;
  /** Called on pointer leave. */
  onLeave?: () => void;
  /** Opens this project in the shared presentation dialog. */
  onSelect?: (index: number) => void;
}

/** A Public_Metric count + its unit label, or null when the field is absent. */
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
  // Line-mask reveal on the title (Req 4.6). Starts when the row top crosses
  // 'top 90%'; no-ops under reduced motion so the title stays fully visible.
  const titleRef = useLineMask({ start: 'top 90%' });

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
        'border-t border-[var(--color-muted)]/25',
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
        className="absolute inset-0 z-10 w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
      >
        <span className="sr-only">Open {project.title}</span>
      </button>

      <div className="flex min-w-0 items-baseline gap-4 sm:gap-6">
        <span
          aria-hidden="true"
          className="shrink-0 pt-2 font-mono text-sm text-[var(--color-accent)] sm:text-base"
        >
          {label}
        </span>

        <div className="min-w-0 flex-1">
          <h3
            ref={titleRef}
            className={clsx(
              'break-words font-semibold leading-[0.95] tracking-tight',
              'text-[clamp(32px,7vw,96px)]',
              'text-[var(--color-muted)] transition-[color,transform] duration-300 ease-out',
              'group-hover:translate-x-2 group-hover:text-[var(--color-text)]',
              'group-focus-within:translate-x-2 group-focus-within:text-[var(--color-text)]',
            )}
          >
            {project.title}
          </h3>

          <p className="mt-3 break-words text-base text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-text)] group-focus-within:text-[var(--color-text)] sm:text-lg">
            {project.year} · {project.venue}
          </p>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)] sm:text-base">
            <span className="[overflow-wrap:anywhere]">{project.services.join(' · ')}</span>
            {metrics ? (
              <span className="[overflow-wrap:anywhere] text-[var(--color-accent)]">
                {metrics}
              </span>
            ) : null}
          </div>

          <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            View project <span aria-hidden="true" className="text-[var(--color-accent)]">↗</span>
          </span>
        </div>
      </div>
    </article>
  );
}
