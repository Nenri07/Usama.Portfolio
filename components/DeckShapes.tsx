'use client';

/**
 * DeckShapes — decorative "off shapes" that give sections a confident,
 * presentation-deck feel: thin geometric rules, an offset frame, floating
 * accent squares and a faint gradient bloom.
 *
 * Every element is aria-hidden, pointer-events-none and animated with
 * transform/opacity only (GPU-cheap). Motion is CSS-driven via the
 * `deck-shape-*` classes in globals.css and fully disabled under reduced
 * motion, so these never affect readability, contrast or layout width.
 *
 * `variant` lets a section pick a restrained subset so the deck never clutters:
 *   - 'corner'  → offset frame + a couple of floating squares (default)
 *   - 'lines'   → a pair of thin drifting rules
 *   - 'bloom'   → a single soft gradient bloom
 */
export type DeckShapeVariant = 'corner' | 'lines' | 'bloom';

export default function DeckShapes({
  variant = 'corner',
  className,
}: {
  variant?: DeckShapeVariant;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className ?? ''}`}
    >
      {variant === 'corner' ? (
        <>
          {/* Offset hairline frame, inset from the top-right corner. */}
          <span className="deck-shape deck-shape-frame absolute right-6 top-10 hidden h-40 w-40 border border-[var(--qe-muted)]/20 lg:block" />
          {/* Floating accent squares. */}
          <span className="deck-shape deck-shape-float-a absolute left-[6%] top-[22%] h-3 w-3 rotate-45 bg-[var(--qe-accent)]/70" />
          <span className="deck-shape deck-shape-float-b absolute right-[10%] bottom-[18%] h-2 w-2 rotate-45 border border-[var(--qe-accent)]/60" />
        </>
      ) : null}

      {variant === 'lines' ? (
        <>
          <span className="deck-shape deck-shape-line-a absolute left-0 top-[30%] h-px w-[38%] bg-gradient-to-r from-transparent via-[var(--qe-muted)]/25 to-transparent" />
          <span className="deck-shape deck-shape-line-b absolute right-0 bottom-[26%] h-px w-[44%] bg-gradient-to-r from-transparent via-[var(--qe-accent)]/25 to-transparent" />
        </>
      ) : null}

      {variant === 'bloom' ? (
        <span className="deck-shape deck-shape-bloom absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full" />
      ) : null}
    </div>
  );
}
