'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import { projects, type StatItem } from '@/lib/data';

interface ResultModalProps {
  stat: StatItem;
  index: number;
  onClose: () => void;
}

interface ResultEvidence {
  summary: string;
  facts: string[];
  related: string[];
  note?: string;
}

function numericCount(value: string): number {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatValue(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Build only evidence that can be reproduced from the public project records. */
function buildEvidence(index: number, stat: StatItem): ResultEvidence {
  if (index === 0) {
    const project = projects.find((item) => item.visitors === '3.75M');
    if (!project) {
      return {
        summary: `The public results record identifies ${formatValue(stat.target)}${stat.suffix} as the peak visitor figure.`,
        facts: ['Headline public metric'],
        related: [],
      };
    }

    return {
      summary: `${project.title} at ${project.venue} carries the ${project.visitors} peak visitor figure in the public project record.`,
      facts: [
        `${project.year} activation`,
        ...(project.staff ? [`${project.staff} staff`] : []),
        ...(project.days ? [`${project.days} days`] : []),
      ],
      related: [`${project.title} — ${project.venue}`],
    };
  }

  if (index === 1) {
    const distinctVenues = new Set(projects.map((project) => project.venue)).size;
    return {
      summary: `The portfolio contains ${projects.length} documented project records, supporting the published ${formatValue(stat.target)}${stat.suffix} activation headline.`,
      facts: [
        `${projects.length} documented activations`,
        `${distinctVenues} distinct venue listings`,
        `${projects.length} project presentations available`,
      ],
      related: projects.map((project) => `${project.title} — ${project.venue}`),
    };
  }

  if (index === 2) {
    const fifaProjects = projects.filter((project) =>
      project.title.includes('FIFA World Cup Fan Zone'),
    );
    return {
      summary: `The headline results record states ${formatValue(stat.target)} FIFA World Cup 2022 activations. The detailed portfolio names ${fifaProjects.length} venue-level fan-zone records.`,
      facts: [
        `${formatValue(stat.target)} activations in the headline record`,
        `${fifaProjects.length} venue-level project records`,
        'Recorded in 2022',
      ],
      related: fifaProjects.map((project) => `${project.title} — ${project.venue}`),
      note: 'The available project fields do not identify a third venue-level breakdown, so no additional location is claimed here.',
    };
  }

  if (index === 3) {
    const winnerProjects = projects.filter((project) => project.winners);
    const totalWinners = winnerProjects.reduce(
      (sum, project) => sum + numericCount(project.winners ?? '0'),
      0,
    );
    return {
      summary: `${winnerProjects.length} public project records include winner counts. Together they total ${formatValue(totalWinners)}, supporting the ${formatValue(stat.target)}${stat.suffix} headline.`,
      facts: [
        `${formatValue(totalWinners)} recorded winners`,
        `${winnerProjects.length} contributing projects`,
        `${formatValue(stat.target)}${stat.suffix} published headline`,
      ],
      related: winnerProjects.map(
        (project) => `${project.title} — ${project.winners} winners`,
      ),
    };
  }

  return {
    summary: `The public results record presents ${formatValue(stat.target)} balloons across 8 Qatar landmarks.`,
    facts: [
      `${formatValue(stat.target)} balloons`,
      '8 Qatar landmarks',
      'Public headline metric',
    ],
    related: [],
    note: 'The available project fields do not include a per-landmark breakdown, so this presentation makes no further attribution.',
  };
}

export default function ResultModal({ stat, index, onClose }: ResultModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = `result-dialog-${index}`;
  const evidence = useMemo(() => buildEvidence(index, stat), [index, stat]);

  useAccessibleDialog({
    open: true,
    onClose,
    containerRef: panelRef,
    initialFocusRef: closeRef,
  });

  useLayoutEffect(() => {
    const scrim = scrimRef.current;
    const panel = panelRef.current;
    if (!scrim || !panel || prefersReducedMotion()) return;

    try {
      const timeline = gsap.timeline();
      timeline.fromTo(
        scrim,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: 'power2.out' },
      );
      timeline.fromTo(
        panel,
        { y: 42, rotationY: -5, autoAlpha: 0, transformPerspective: 1400 },
        {
          y: 0,
          rotationY: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: 'power4.out',
        },
        '-=0.12',
      );
      return () => {
        timeline.kill();
      };
    } catch {
      try {
        gsap.set([scrim, panel], { autoAlpha: 1, y: 0, rotationY: 0 });
      } catch {
        /* final visible state remains */
      }
    }
  }, []);

  return (
    <div
      ref={scrimRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--color-base)_94%,transparent)] p-3 sm:p-6"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain border border-[var(--color-muted)]/20 bg-[var(--color-base)] p-5 [perspective:1400px] sm:max-h-[calc(100dvh-3rem)] sm:p-9 lg:p-12"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={`Close ${stat.label} details`}
          className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border border-[var(--color-muted)]/30 bg-[var(--color-base)] text-2xl text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)] sm:right-6 sm:top-6"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div aria-hidden="true" className="pointer-events-none absolute -right-4 top-12 font-display text-[clamp(7rem,24vw,18rem)] leading-none text-[var(--color-text)] opacity-[0.025]">
          {String(index + 1).padStart(2, '0')}
        </div>

        <header className="relative z-10 min-w-0 pr-14">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Result detail · {String(index + 1).padStart(2, '0')}
          </p>
          <p className="mt-8 break-words text-[var(--color-text)]">
            <span className="font-display text-[clamp(4rem,14vw,9rem)] font-semibold leading-[0.8] tracking-tight">
              {formatValue(stat.target)}
            </span>
            {stat.suffix ? (
              <span className="ml-2 text-[clamp(2rem,7vw,5rem)] font-semibold leading-none text-[var(--color-accent)]">
                {stat.suffix}
              </span>
            ) : null}
          </p>
          <h2 id={titleId} className="mt-6 max-w-3xl break-words text-3xl font-semibold leading-tight text-[var(--color-text)] sm:text-5xl">
            {stat.label}
          </h2>
        </header>

        <div className="relative z-10 mt-10 grid min-w-0 gap-8 border-t border-[var(--color-muted)]/20 pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:gap-12">
          <div className="min-w-0">
            <p className="text-lg leading-relaxed text-[var(--color-muted)] sm:text-xl">
              {evidence.summary}
            </p>
            {evidence.note ? (
              <p className="mt-5 border-l border-[var(--color-accent)] pl-4 text-base leading-relaxed text-[var(--color-muted)]">
                {evidence.note}
              </p>
            ) : null}
          </div>

          <dl className="grid min-w-0 gap-3">
            {evidence.facts.map((fact, factIndex) => (
              <div
                key={fact}
                className="border border-[var(--color-muted)]/20 bg-[var(--color-surface)]/35 px-4 py-4"
              >
                <dt className="font-mono text-xs text-[var(--color-accent)]">
                  {String(factIndex + 1).padStart(2, '0')}
                </dt>
                <dd className="mt-1 break-words text-base text-[var(--color-text)]">
                  {fact}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {evidence.related.length > 0 ? (
          <div className="relative z-10 mt-10 border-t border-[var(--color-muted)]/20 pt-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Supporting project records
            </h3>
            <ul className="mt-5 grid min-w-0 gap-x-8 gap-y-3 md:grid-cols-2">
              {evidence.related.map((item, relatedIndex) => (
                <li
                  key={`${item}-${relatedIndex}`}
                  className="min-w-0 break-words border-b border-[var(--color-muted)]/15 pb-3 text-base text-[var(--color-muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
