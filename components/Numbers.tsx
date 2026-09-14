import StatBlock from './StatBlock';
import { numbers } from '@/lib/data';

/**
 * Numbers — the Numbers bar: exactly three StatBlocks rendered from the static
 * `numbers` data (Req 5.1). The three read "13+ Activations",
 * "3.75M+ Visitors at peak event", and "3 FIFA World Cup 2022 activations".
 *
 * Only the visitor/activation counts in `lib/data.ts` are rendered — there are
 * no revenue or profit figures anywhere in this section (Req 5.5).
 *
 * Server component: it maps static `numbers` data to StatBlock (a `'use client'`
 * component) children, so the count-up/animation work lives in StatBlock while
 * this wrapper — and page.tsx — stay server components.
 *
 * Visual system: dark base, 3-column layout on desktop (`grid-cols-1
 * md:grid-cols-3`) with generous gaps (≥24px via `gap-12`), stacked on mobile.
 * No box-shadow, border-radius 0, headings ≥32px (StatBlock renders the big
 * numbers) (Req 7.1–7.3).
 */
export default function Numbers() {
  return (
    <section id="numbers" className="bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Small section label — heading ≥32px, sans-serif, square, no shadow. */}
        <header className="mb-12">
          <h2 className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            By the Numbers
          </h2>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--color-accent)]"
          />
        </header>

        {/*
          Exactly 3 StatBlocks (Req 5.1): stacked on mobile, 3 columns on desktop
          (grid-cols-1 md:grid-cols-3) with generous ≥24px gaps (gap-12 = 48px)
          (Req 7.2).
        */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {numbers.map((stat, i) => (
            <StatBlock key={i} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
