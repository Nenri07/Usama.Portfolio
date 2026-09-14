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
 * The whole row is an interactive cursor hover target (`data-cursor` +
 * `data-cursor-label="View"`, auto-detected by `initCursor`). On pointer
 * enter/leave it reports the resolved preview `src` up via `onHover`/`onLeave`
 * so `WorkList` can drive the shared WebGL canvas (Req 4.8, 10.3) — while a CSS
 * hover emphasis (~300ms) keeps the row tactile even without WebGL (Req 4.8).
 *
 * Reveal: the title reveals line-by-line via the shared `useLineMask`
 * (Line_Mask_Reveal), which no-ops under reduced motion / SSR, leaving the row
 * fully visible and readable (Req 4.6, 4.9, 4.10). It is not a link — there are
 * no project detail pages — so it stays a `<div>`.
 */
export interface ProjectRowProps {
  project: Project;
  index: number;
  /** Called on pointer enter with the row index and resolved preview src. */
  onHover?: (index: number, src: string) => void;
  /** Called on pointer leave. */
  onLeave?: () => void;
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
    <div
      // Interactive cursor hover target (Req 11.6). initCursor detects
      // [data-cursor] and shows the data-cursor-label.
      data-cursor
      data-cursor-label="View"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={clsx(
        'group relative w-full',
        // Big-index look: top border, no radius/shadow, generous padding (≥24px).
        'border-t border-[var(--color-muted)]/25',
        'py-8 sm:py-10',
        'cursor-none select-none',
      )}
    >
      <div className="flex items-baseline gap-4 sm:gap-6">
        {/* Small maroon index number (sparse accent, Req 8.1). */}
        <span
          aria-hidden="true"
          className="shrink-0 pt-2 font-mono text-sm text-[var(--color-accent)] sm:text-base"
        >
          {label}
        </span>

        <div className="min-w-0 flex-1">
          {/* Big-type title — heading scale, tracks tight; line-mask reveal. */}
          <h3
            ref={titleRef}
            className={clsx(
              'font-semibold leading-[0.95] tracking-tight',
              'text-[clamp(32px,7vw,96px)]',
              // Hover emphasis (~300ms, within 200–400ms): brighten + nudge x.
              'text-[var(--color-muted)] transition-[color,transform] duration-300 ease-out',
              'group-hover:translate-x-2 group-hover:text-[var(--color-text)]',
            )}
          >
            {project.title}
          </h3>

          {/* Secondary line: year · venue. */}
          <p className="mt-3 text-base text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-text)] sm:text-lg">
            {project.year} · {project.venue}
          </p>

          {/* Services + any Public_Metric counts (NO financial figures). */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)] sm:text-base">
            <span>{project.services.join(' · ')}</span>
            {metrics && (
              <span className="text-[var(--color-accent)]">{metrics}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
