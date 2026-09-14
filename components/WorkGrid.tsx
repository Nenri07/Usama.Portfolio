import clsx from 'clsx';
import WorkCard from './WorkCard';
import { projects } from '@/lib/data';

/**
 * WorkGrid — the Work section: an asymmetric grid of exactly 13 WorkCards
 * (Req 4.1, 4.2).
 *
 * Server component: it only maps static `projects` data to WorkCard (a
 * `'use client'` component) children, which keeps page.tsx a server component
 * while the interactive/animated work lives in WorkCard.
 *
 * Layout (Req 4.1 — "asymmetric grid in which some cells span two grid units"):
 * a responsive CSS grid — 2 cols (base) → 3 (md) → 4 (lg) — with fixed-height
 * auto-rows so cells tile predictably. `spanForIndex(i)` promotes a few featured
 * cards to 2-unit spans (2 cols and/or 2 rows) while the total stays 13 cells.
 * `grid-flow-dense` backfills the gaps the larger cells leave, so the 13 cards
 * tile without giant holes.
 *
 * Visual system: dark base, ≥24px gaps (`gap-6`), no box-shadow, border-radius 0
 * (Req 7.1–7.3).
 */

/**
 * Featured-cell span map (Req 4.1). Returns Tailwind span utilities for a
 * subset of indices; all other cards occupy a single 1×1 cell.
 *
 * Chosen so the featured cards are the marquee projects:
 *   - 0  Formula 1 & MotoGP Fan Zone  → 2×2 hero cell (biggest)
 *   - 1  Hello Asia (3.75M visitors)  → 2 cols wide
 *   - 6  ALJAM'A Celebration Week     → 2 rows tall
 *   - 9  FIFA World Cup Fan Zone      → 2 cols wide
 *
 * Spans only apply at md/lg where the grid has enough columns; on the 2-col base
 * the col-span-2 cells simply fill the row, which still reads cleanly. With
 * `grid-flow-dense` the remaining 1×1 cards backfill around them.
 */
export function spanForIndex(i: number): string {
  switch (i) {
    case 0:
      // Large hero feature: 2 columns × 2 rows.
      return 'md:col-span-2 md:row-span-2';
    case 1:
      // Wide feature: 2 columns.
      return 'md:col-span-2';
    case 6:
      // Tall feature: 2 rows.
      return 'md:row-span-2';
    case 9:
      // Wide feature: 2 columns.
      return 'md:col-span-2';
    default:
      return '';
  }
}

export default function WorkGrid() {
  return (
    <section
      id="work"
      className="bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section heading — heading ≥32px, sans-serif, square, no shadow. */}
        <header className="mb-12">
          <h2 className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Selected Work
          </h2>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--color-accent)]"
          />
        </header>

        {/*
          Asymmetric grid (Req 4.1): responsive columns, fixed auto-row height so
          the featured 2×2 / 2×1 / 1×2 cells span cleanly. ≥24px gaps (Req 7.2).
          grid-flow-dense backfills holes the larger cells create.
        */}
        <div
          className={clsx(
            'grid grid-flow-dense gap-6',
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
            'auto-rows-[220px] sm:auto-rows-[240px] lg:auto-rows-[260px]',
          )}
        >
          {projects.map((project, i) => (
            <WorkCard
              key={i}
              project={project}
              index={i}
              className={spanForIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
