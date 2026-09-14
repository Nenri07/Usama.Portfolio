'use client';

import { useCallback } from 'react';
import { gsap } from '@/lib/gsapSetup';
import clsx from 'clsx';
import SafeImage from './SafeImage';
import { useReveal } from '@/lib/reveal';
import { resolveImagePath, staggerDelay } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import type { Project } from '@/lib/data';

/**
 * WorkCard — one cell of the Work grid (Req 4.2–4.10, 1.6).
 *
 * - Image: SafeImage at `resolveImagePath(project, index)` — the project's
 *   explicit `image` when set, else the sequential img-000→img-012 mapping
 *   (Req 4.2). On load failure SafeImage renders a placeholder
 *   `--color-surface` background while the title/venue/year/services/counts and
 *   the grid cell size are retained, so the layout never breaks (Req 4.10, 1.6).
 * - Content: title + year always visible (Req 4.3); the hover slide-up overlay
 *   reveals venue, the `services` highlight list, and any present Public_Metric
 *   counts — `visitors`/`winners`/`staff`/`days` (Req 4.3, 4.4). NO revenue,
 *   cost, or profit figures are ever rendered — those fields don't exist in the
 *   model (Req 4.5, 8.6).
 * - Reveal: the SINGLE shared `useReveal` hook (GSAP + ScrollTrigger, Req 4.9)
 *   fires when the card's top scrolls within the bottom 90% of the viewport
 *   (`start: 'top 90%'`, Req 4.6). In `onReveal` GSAP animates the clip-path
 *   inset from fully covered `inset(100% 0 0 0)` to fully visible
 *   `inset(0 0 0 0)` over ~600ms (in [400,800], Req 4.6). Each card's start is
 *   delayed by `staggerDelay(index, BASE_DELAY)`, BASE_DELAY in [80,150]
 *   (Req 4.7). Under reduced motion the reveal is disabled (final visible
 *   state, Req 9.8).
 * - Hover: pure CSS transition (Tailwind group/group-hover) scales the image to
 *   1.05 and slides the detail overlay from fully hidden (below) to fully
 *   visible over ~300ms (in [200,400], Req 4.8).
 *
 * Animation safety: the DEFAULT (unanimated) DOM state is the final visible
 * state — clip-path `inset(0 0 0 0)`, opacity 1 — so if GSAP never runs the card
 * is fully visible and readable. The covered start state is applied via JS only
 * after mount (in onReveal), wrapped in try/catch so any failure leaves the card
 * visible (Req 9.7).
 */

/** Per-card stagger base delay in ms (Req 4.7 range [80,150]). */
const BASE_DELAY = 100;
/** Reveal duration in seconds (Req 4.6 range [0.4,0.8]s). */
const REVEAL_DURATION = 0.6;

export interface WorkCardProps {
  /** Project data — title/venue/year/services/counts rendered exactly (Req 4.3, 4.4). */
  project: Project;
  /** Zero-based card index — drives image mapping (Req 4.2) and stagger (Req 4.7). */
  index: number;
  /** Optional grid span/className hint for the asymmetric grid (set by WorkGrid). */
  className?: string;
}

export default function WorkCard({ project, index, className }: WorkCardProps) {
  // Compute reduced-motion in the component (client) since useReveal can no
  // longer read it at module scope; passed through as `disabled` (Req 9.8).
  const reduced = prefersReducedMotion();

  const onReveal = useCallback(
    (el: Element) => {
      const node = el as HTMLElement;
      try {
        // Apply the COVERED start state via JS only (never in static CSS) so a
        // card left unanimated stays fully visible (Req 4.6 graceful default).
        gsap.set(node, { clipPath: 'inset(100% 0 0 0)' });

        gsap.to(node, {
          clipPath: 'inset(0 0 0 0)',
          duration: REVEAL_DURATION,
          delay: staggerDelay(index, BASE_DELAY) / 1000, // ms → s for GSAP
          ease: 'power3.out',
        });
      } catch {
        // On any failure, restore the final visible state (Req 4.6 / 9.7).
        node.style.clipPath = 'inset(0 0 0 0)';
      }
    },
    [index],
  );

  const revealRef = useReveal({
    start: 'top 90%',
    disabled: reduced,
    onReveal,
  });

  // Collect present Public_Metric counts with short labels (Req 4.4). Absent
  // fields are simply skipped — nothing is invented.
  const metrics: string[] = [];
  if (project.visitors) metrics.push(`${project.visitors} visitors`);
  if (project.winners) metrics.push(`${project.winners} winners`);
  if (project.staff) metrics.push(`${project.staff} staff`);
  if (project.days) metrics.push(`${project.days} days`);

  return (
    <article
      ref={revealRef}
      className={clsx(
        // group enables the CSS hover transitions on children (Req 4.8).
        'group relative isolate overflow-hidden bg-[var(--color-surface)]',
        // No border-radius / no box-shadow (Req 8.3) — square, flat cell.
        'rounded-none',
        className,
      )}
      // Default (unanimated) state = final visible state (Req 4.6).
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      {/* Image layer — scales to 1.05 on hover over ~300ms (Req 4.8). */}
      <div className="absolute inset-0 -z-10 transition-transform duration-300 ease-out group-hover:scale-105">
        <SafeImage
          src={resolveImagePath(project, index)}
          alt={project.title}
          variant="full"
          fallbackColor="var(--color-surface)"
        />
        {/* Scrim so title/overlay text stays legible over any image. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,26,0.15) 0%, rgba(10,14,26,0.9) 100%)',
          }}
        />
      </div>

      {/* Content: title + year always visible; venue/services/counts live in
          the slide-up overlay revealed on hover (Req 4.3, 4.4). */}
      <div className="flex h-full w-full flex-col justify-end p-4 sm:p-5">
        {/* Title — always visible (Req 4.3). */}
        <h3 className="text-lg font-semibold leading-tight text-[var(--color-text)] sm:text-xl">
          {project.title}
        </h3>

        {/* Year — small, always visible, sits under the title (Req 4.3). */}
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {project.year}
        </span>

        {/* Detail overlay: slides from fully hidden (below, opacity 0) to fully
            visible over ~300ms on hover (Req 4.8). Uses group-hover +
            transition; max-height keeps it collapsed until hover. */}
        <div
          className={clsx(
            'mt-2 flex flex-col gap-2 overflow-hidden',
            'max-h-0 translate-y-2 opacity-0',
            'transition-all duration-300 ease-out',
            'group-hover:max-h-72 group-hover:translate-y-0 group-hover:opacity-100',
          )}
        >
          {/* Venue (Req 4.3). */}
          <span className="text-sm text-[var(--color-text)]">
            {project.venue}
          </span>

          {/* Services highlight chips (Req 4.3). */}
          {project.services.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {project.services.map((service, i) => (
                <li
                  key={`${service}-${i}`}
                  className="border border-[var(--color-muted)]/40 px-2 py-0.5 text-xs text-[var(--color-muted)]"
                >
                  {service}
                </li>
              ))}
            </ul>
          ) : null}

          {/* Public_Metric counts — only those present (Req 4.4). NO financial
              figures (Req 4.5, 8.6). */}
          {metrics.length > 0 ? (
            <span className="text-sm font-medium text-[var(--color-accent)]">
              {metrics.join(' · ')}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
