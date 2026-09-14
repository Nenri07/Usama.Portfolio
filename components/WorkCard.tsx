'use client';

import { useCallback } from 'react';
import { animate } from 'animejs';
import clsx from 'clsx';
import SafeImage from './SafeImage';
import { useReveal } from '@/lib/reveal';
import { imagePathForIndex, staggerDelay } from '@/lib/format';
import type { Project } from '@/lib/data';

/**
 * WorkCard — one cell of the Work grid (Req 4.3–4.8, 1.6).
 *
 * - Image: SafeImage at `imagePathForIndex(index)` (sequential img-000→img-012
 *   mapping, Req 4.2). On load failure SafeImage renders a placeholder
 *   `--color-surface` background while the title/venue/year/stat and the grid
 *   cell size are retained, so the layout never breaks (Req 4.8, 1.6).
 * - Reveal: the SINGLE shared `useReveal` hook (Req 4.7) fires when the card's
 *   top scrolls within the bottom 90% of the viewport (rootMargin
 *   '0px 0px -10% 0px', threshold 0, Req 4.4). In `onReveal` anime.js animates
 *   the clip-path inset from fully covered `inset(100% 0 0 0)` to fully visible
 *   `inset(0 0 0 0)` over ~600ms (Req 4.4). Each card's start is delayed by
 *   `staggerDelay(index, BASE_DELAY)` with BASE_DELAY in [80,150] (Req 4.5).
 * - Hover: pure CSS transition (Tailwind group/group-hover) scales the image to
 *   1.05 and slides the venue+stat overlay from fully hidden (below) to fully
 *   visible over ~300ms (Req 4.6).
 *
 * Animation safety: the DEFAULT (unanimated) DOM state is the final visible
 * state — clip-path `inset(0 0 0 0)`, opacity 1 — so if anime.js never runs the
 * card is fully visible and readable. The covered start state is applied via JS
 * only after mount (in onReveal), wrapped in try/catch so any failure leaves the
 * card visible.
 */

/** Per-card stagger base delay in ms (Req 4.5 range [80,150]). */
const BASE_DELAY = 100;
/** Reveal duration in ms (Req 4.4 range [400,800]). */
const REVEAL_DURATION = 600;

export interface WorkCardProps {
  /** Project data — title/venue/year/stat rendered exactly (Req 4.3). */
  project: Project;
  /** Zero-based card index — drives image mapping (Req 4.2) and stagger (Req 4.5). */
  index: number;
  /** Optional grid span/className hint for the asymmetric grid (set by WorkGrid). */
  className?: string;
}

export default function WorkCard({ project, index, className }: WorkCardProps) {
  const onReveal = useCallback(
    (el: Element) => {
      const node = el as HTMLElement;
      try {
        // Apply the COVERED start state via JS only (never in static CSS) so a
        // card left unanimated stays fully visible (Req 4.4 graceful default).
        node.style.clipPath = 'inset(100% 0 0 0)';

        animate(node, {
          clipPath: ['inset(100% 0 0 0)', 'inset(0 0 0 0)'],
          duration: REVEAL_DURATION,
          delay: staggerDelay(index, BASE_DELAY),
          ease: 'out(3)',
        });
      } catch {
        // On any anime.js failure, restore the final visible state (Req 4.4).
        node.style.clipPath = 'inset(0 0 0 0)';
      }
    },
    [index],
  );

  const revealRef = useReveal({
    threshold: 0,
    rootMargin: '0px 0px -10% 0px',
    onReveal,
  });

  return (
    <article
      ref={revealRef}
      className={clsx(
        // group enables the CSS hover transitions on children (Req 4.6).
        'group relative isolate overflow-hidden bg-[var(--color-surface)]',
        // No border-radius / no box-shadow (Req 7.3) — square, flat cell.
        'rounded-none',
        className,
      )}
      // Default (unanimated) state = final visible state (Req 4.4).
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      {/* Image layer — scales to 1.05 on hover over ~300ms (Req 4.6). */}
      <div className="absolute inset-0 -z-10 transition-transform duration-300 ease-out group-hover:scale-105">
        <SafeImage
          src={imagePathForIndex(index)}
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
              'linear-gradient(180deg, rgba(10,14,26,0.15) 0%, rgba(10,14,26,0.85) 100%)',
          }}
        />
      </div>

      {/* Content: title always visible; venue+stat live in the slide-up overlay. */}
      <div className="flex h-full w-full flex-col justify-end p-4 sm:p-5">
        {/* Title — always visible (Req 4.3). */}
        <h3 className="text-lg font-semibold leading-tight text-[var(--color-text)] sm:text-xl">
          {project.title}
        </h3>

        {/* Year — small, always visible, sits under the title. */}
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {project.year}
        </span>

        {/* Venue + stat overlay: slides from fully hidden (below, opacity 0) to
            fully visible over ~300ms on hover (Req 4.6). Uses group-hover +
            transition; max-height keeps it collapsed until hover. */}
        <div
          className={clsx(
            'mt-2 flex flex-col gap-0.5 overflow-hidden',
            'max-h-0 translate-y-2 opacity-0',
            'transition-all duration-300 ease-out',
            'group-hover:max-h-24 group-hover:translate-y-0 group-hover:opacity-100',
          )}
        >
          <span className="text-sm text-[var(--color-text)]">
            {project.venue}
          </span>
          <span className="text-sm font-medium text-[var(--color-accent)]">
            {project.stat}
          </span>
        </div>
      </div>
    </article>
  );
}
