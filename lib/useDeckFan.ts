'use client';

import { useEffect, useState, type CSSProperties } from 'react';

/**
 * useDeckFan — shared logic for the fanned "deck of cards" layout.
 *
 * Returns:
 *   • `active`  — whether the arc/flip enhancement should apply. True only on
 *     wide (lg+) viewports with motion allowed and a fine pointer; false
 *     otherwise, so small screens, touch, and reduced-motion users get a plain,
 *     fully-readable static grid (no arc, no flip, no horizontal overflow).
 *   • `cardStyle(index, count)` — per-card CSS custom properties describing its
 *     place in the arc (centre highest/upright, edges spread and lowered).
 *
 * SSR-safe: `active` starts false and is resolved in an effect, so the server
 * render and first client paint show the flat grid, then the arc is applied.
 */

const LG_QUERY = '(min-width: 1024px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const COARSE_QUERY = '(pointer: coarse)';

export interface DeckFanCardStyle extends CSSProperties {
  '--fan-rotate': string;
  '--fan-y': string;
  '--fan-x': string;
}

export function useDeckFan(): {
  active: boolean;
  cardStyle: (index: number, count: number, columns?: number) => DeckFanCardStyle;
} {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const wide = window.matchMedia(LG_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const coarse = window.matchMedia(COARSE_QUERY);

    const sync = () => {
      setActive(wide.matches && !reduced.matches && !coarse.matches);
    };
    sync();

    wide.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    return () => {
      wide.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
    };
  }, []);

  /**
   * Per-card arc transform. When `columns` is supplied the arc repeats PER ROW
   * (position is taken within the row), so multi-row grids read as several
   * fanned hands rather than one lopsided sweep. Without `columns` the arc
   * spans the whole set.
   */
  const cardStyle = (
    index: number,
    count: number,
    columns?: number,
  ): DeckFanCardStyle => {
    const flat: DeckFanCardStyle = {
      '--fan-rotate': '0deg',
      '--fan-y': '0px',
      '--fan-x': '0px',
    };
    if (count <= 1) return flat;

    // Resolve how many cards share this card's arc, and this card's slot in it.
    const groupSize = columns && columns > 1 ? Math.min(columns, count) : count;
    if (groupSize <= 1) return flat;
    const slot = columns && columns > 1 ? index % columns : index;
    if (slot >= groupSize) return flat;

    // Position from -1 (far left) through 0 (centre) to +1 (far right).
    const mid = (groupSize - 1) / 2;
    const t = mid === 0 ? 0 : (slot - mid) / mid; // -1..1
    // Gentle spread: tilt outward, drop toward the edges, small horizontal pull.
    const rotate = t * 7; // degrees
    const drop = Math.pow(Math.abs(t), 1.6) * 42; // px lower toward edges
    const shift = t * 10; // px horizontal fan-out
    return {
      '--fan-rotate': `${rotate.toFixed(2)}deg`,
      '--fan-y': `${drop.toFixed(1)}px`,
      '--fan-x': `${shift.toFixed(1)}px`,
    };
  };

  return { active, cardStyle };
}
