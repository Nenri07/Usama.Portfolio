'use client';

import { useCallback, useMemo } from 'react';
import ProjectRow from './ProjectRow';
import RevealHeading from './RevealHeading';
import DeckShapes from './DeckShapes';
import { useHoverImage } from './HoverImageContext';
import { useProjectSelection } from './ProjectSelectionContext';
import { projects, contractCards, type ContractCard } from '@/lib/data';
import { hasWebGL, prefersReducedMotion, isCoarsePointer } from '@/lib/motion';

/**
 * Projects — the flagship work section.
 *
 * Two layers, both navigable:
 *   1. The 4 source-backed service projects as big-type rows (title overlaid on
 *      the hero image), each opening the ProjectModal. Optional, non-essential
 *      WebGL hover previews on fine pointers with WebGL.
 *   2. A compact, elegant client-engagement index of ALL 32 contracts, grouped
 *      by scope, where each entry opens that contract's ContractModal. This
 *      surfaces every real engagement with a direct link to its detail.
 *
 * Everything is visible-by-default; motion only enhances. Decorative deck
 * off-shapes sit behind the content (aria-hidden, pointer-events-none).
 */

/** Group the 32 contracts by their `scope` string, preserving first-seen order. */
function groupByScope(cards: ContractCard[]): { scope: string; cards: ContractCard[] }[] {
  const order: string[] = [];
  const map = new Map<string, ContractCard[]>();
  for (const card of cards) {
    if (!map.has(card.scope)) {
      map.set(card.scope, []);
      order.push(card.scope);
    }
    map.get(card.scope)!.push(card);
  }
  return order.map((scope) => ({ scope, cards: map.get(scope)! }));
}

export default function WorkList() {
  const hoverImage = useHoverImage();
  const projectSelection = useProjectSelection();

  const enabled = useMemo(
    () => !!hoverImage && hasWebGL() && !prefersReducedMotion() && !isCoarsePointer(),
    [hoverImage],
  );

  const grouped = useMemo(() => groupByScope(contractCards), []);

  const handleHover = useCallback(
    (_index: number, src: string) => {
      if (enabled) hoverImage?.show(src);
    },
    [enabled, hoverImage],
  );

  const handleLeave = useCallback(() => {
    if (enabled) hoverImage?.hide();
  }, [enabled, hoverImage]);

  const handleSelectProject = useCallback(
    (index: number) => {
      projectSelection?.openProject(index);
    },
    [projectSelection],
  );

  const handleSelectContract = useCallback(
    (no: number) => {
      const index = contractCards.findIndex((card) => card.no === no);
      if (index >= 0) projectSelection?.openContract(index);
    },
    [projectSelection],
  );

  return (
    <section
      id="work"
      data-deck-section
      className="relative min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <DeckShapes variant="corner" />

      <div className="relative z-[1] mx-auto w-full max-w-7xl">
        <header className="mb-12">
          <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
            Projects &amp; Engagements
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
          />
          <p className="text-secondary mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">
            Four core service projects, and direct links into every one of the{' '}
            {contractCards.length} real client engagements Puro delivers across
            Qatar.
          </p>
        </header>

        {/* Layer 1 — the flagship service projects. */}
        <div onPointerLeave={handleLeave}>
          {projects.map((project, i) => (
            <ProjectRow
              key={project.title}
              project={project}
              index={i}
              onHover={handleHover}
              onLeave={handleLeave}
              onSelect={handleSelectProject}
            />
          ))}
        </div>

        {/* Layer 2 — the full client-engagement index, grouped by scope. */}
        <div className="mt-20 border-t border-subtle pt-12">
          <header className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h3 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
              Client Engagements
            </h3>
            <p className="text-secondary font-mono text-xs uppercase tracking-[0.16em]">
              {contractCards.length} contracts · tap any client for details
            </p>
          </header>

          <div className="grid min-w-0 gap-x-10 gap-y-12 md:grid-cols-2">
            {grouped.map((group) => (
              <div key={group.scope} className="min-w-0">
                <p className="text-accent mb-4 font-mono text-[0.7rem] uppercase tracking-[0.2em]">
                  {group.scope}
                </p>
                <ul className="min-w-0">
                  {group.cards.map((card) => (
                    <li key={card.no} className="border-t border-[var(--qe-muted)]/15">
                      <button
                        type="button"
                        onClick={() => handleSelectContract(card.no)}
                        aria-haspopup="dialog"
                        aria-label={`Open engagement details: ${card.client}`}
                        data-cursor
                        data-cursor-label="View"
                        className="group flex w-full min-w-0 items-center justify-between gap-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="text-primary block break-words text-base font-medium leading-snug transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1">
                            {card.client}
                          </span>
                          <span className="text-secondary mt-0.5 block font-mono text-[0.7rem] uppercase tracking-[0.12em]">
                            {card.start} → {card.end} · {card.duration}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-accent shrink-0 text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                        >
                          ↗
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
