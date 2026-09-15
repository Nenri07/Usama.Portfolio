import clsx from 'clsx';
import WorkCard from './WorkCard';
import { projects } from '@/lib/data';

/**
 * WorkGrid — an optional asymmetric grid for the current source-backed work
 * records. The active page uses WorkList; this remains a compatible fallback.
 *
 * Server component: it maps static `projects` data to WorkCard client children
 * while keeping all visible content available without interaction.
 *
 * Layout uses a responsive dense grid and promotes a few early records to
 * larger spans when enough columns are available.
 */

/**
 * Featured-cell span map. Early source-backed records receive the larger
 * editorial treatments; remaining records use the standard cell.
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
