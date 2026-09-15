'use client';

import { useCallback, useState } from 'react';
import StatBlock from './StatBlock';
import ResultModal from './ResultModal';
import RevealHeading from './RevealHeading';
import { results } from '@/lib/data';

/** Interactive presentation of source-backed Puro service standards. */
export default function Numbers() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeResult = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const selectedResult =
    selectedIndex == null ? null : results[selectedIndex] ?? null;

  return (
    <section id="numbers" className="min-w-0 bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-12 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)] md:items-end">
          <div>
            <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
              Service Standards
            </RevealHeading>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
            />
          </div>
          <p className="text-secondary text-base leading-relaxed md:text-right">
            Principles documented in Puro&apos;s company profile, presented without
            unsupported performance metrics.
          </p>
        </header>

        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
          {results.map((standard, index) => (
            <StatBlock
              key={standard.label}
              stat={standard}
              index={index}
              onSelect={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </div>

      {selectedResult && selectedIndex != null ? (
        <ResultModal
          stat={selectedResult}
          index={selectedIndex}
          onClose={closeResult}
        />
      ) : null}
    </section>
  );
}
