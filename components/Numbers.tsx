import StatBlock from './StatBlock';
import RevealHeading from './RevealHeading';
import { results } from '@/lib/data';

/**
 * Numbers — the Results section: one StatBlock per `results` entry (5 total,
 * Req 5.1). The stats read "3.75M peak visitors", "13+ activations", "3 FIFA
 * World Cup 2022 activations", "7,000+ prize winners", and "12,000 balloons
 * across 8 Qatar landmarks".
 *
 * Only Public_Metric counts from `lib/data.ts` are rendered — there are no
 * revenue, cost, or profit figures anywhere in this section (Req 5.5, 8.6).
 *
 * Server component: it maps the static `results` data to StatBlock (a
 * `'use client'` component) children, so the count-up/animation work lives in
 * StatBlock while this wrapper — and page.tsx — stay server components.
 *
 * Visual system: dark base; a responsive grid that reads well with 5 items
 * (`md:grid-cols-3 lg:grid-cols-5`) with generous gaps (≥24px via `gap-12`),
 * stacked on mobile. No box-shadow, border-radius 0, headings ≥32px (StatBlock
 * renders the big numbers) (Req 8.1–8.3).
 */
export default function Numbers() {
  return (
    <section id="numbers" className="bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Small section label — heading ≥32px, sans-serif, square, no shadow. */}
        <header className="mb-12">
          <RevealHeading className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            By the Numbers
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--color-accent)]"
          />
        </header>

        {/*
          One StatBlock per result (5 total, Req 5.1): stacked on mobile, 3
          columns on tablet, 5 columns on wide desktop
          (grid-cols-1 md:grid-cols-3 lg:grid-cols-5) with generous ≥24px gaps
          (gap-12 = 48px) (Req 8.2).
        */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:grid-cols-5">
          {results.map((stat, i) => (
            <StatBlock key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
