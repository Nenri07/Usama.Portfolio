'use client';

import { useEffect, useRef } from 'react';
import SafeImage from './SafeImage';
import { heroCollage } from '@/lib/data';
import { prefersReducedMotion, isCoarsePointer } from '@/lib/motion';

/**
 * HeroAmbient — a decorative, GPU-friendly depth layer that sits BEHIND the
 * hero's perspective slider to add visual density and motion.
 *
 * Two cooperating pieces, both purely decorative (aria-hidden, pointer-events
 * none) so they never gate readability or block the slider drag:
 *
 *   1. Ambient glows — two soft maroon/light radial blooms that drift slowly
 *      via a single CSS animation (transform/opacity only).
 *   2. Curated collage tiles — a sparse scatter of existing optimized
 *      photographs (from `heroCollage`) placed at the edges, faded low and
 *      given a gentle pointer-parallax on fine pointers. On touch / reduced
 *      motion they simply sit still at their resting opacity.
 *
 * Everything degrades: under reduced motion the drift animation is disabled
 * (see globals.css) and no pointer parallax is bound; on coarse pointers the
 * parallax is skipped. Images are lazy and never the LCP (the slider owns that).
 */

interface CollageTile {
  slotIndex: number;
  className: string;
  depth: number;
  sizes: string;
}

// Edge-anchored tiles; kept away from the centre where the slider + type live.
const TILE_LAYOUT: CollageTile[] = [
  { slotIndex: 0, className: 'left-[3%] top-[16%] h-28 w-20 sm:h-40 sm:w-28', depth: 22, sizes: '112px' },
  { slotIndex: 1, className: 'right-[4%] top-[12%] h-32 w-24 sm:h-44 sm:w-32', depth: -28, sizes: '128px' },
  { slotIndex: 2, className: 'left-[7%] bottom-[14%] h-24 w-20 sm:h-36 sm:w-28', depth: 34, sizes: '112px' },
  { slotIndex: 3, className: 'right-[6%] bottom-[16%] h-28 w-24 sm:h-40 sm:w-32', depth: -18, sizes: '128px' },
];

export default function HeroAmbient() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion() || isCoarsePointer()) return;

    const tiles = Array.from(
      root.querySelectorAll<HTMLElement>('[data-parallax-depth]'),
    );
    if (tiles.length === 0) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    const current = tiles.map(() => ({ x: 0, y: 0 }));

    const onMove = (event: PointerEvent) => {
      // Normalized pointer offset from centre in [-0.5, 0.5].
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const tick = () => {
      frame = 0;
      let moving = false;
      tiles.forEach((tile, i) => {
        const depth = Number(tile.dataset.parallaxDepth) || 0;
        const destX = targetX * depth;
        const destY = targetY * depth;
        current[i].x += (destX - current[i].x) * 0.08;
        current[i].y += (destY - current[i].y) * 0.08;
        if (Math.abs(destX - current[i].x) > 0.1 || Math.abs(destY - current[i].y) > 0.1) {
          moving = true;
        }
        tile.style.transform = `translate3d(${current[i].x.toFixed(2)}px, ${current[i].y.toFixed(2)}px, 0)`;
      });
      if (moving) frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Drifting ambient glows (transform/opacity only). */}
      <span className="hero-glow hero-glow-a absolute -left-[10%] top-[8%] h-[46vmax] w-[46vmax] rounded-full" />
      <span className="hero-glow hero-glow-b absolute -right-[12%] bottom-[4%] h-[42vmax] w-[42vmax] rounded-full" />

      {/* Sparse curated collage tiles at the edges. */}
      {TILE_LAYOUT.map((tile) => {
        const slot = heroCollage[tile.slotIndex];
        if (!slot) return null;
        return (
          <span
            key={tile.slotIndex}
            data-parallax-depth={tile.depth}
            className={`hero-tile absolute overflow-hidden border border-[var(--qe-muted)]/15 ${tile.className}`}
          >
            <SafeImage
              src={slot.src}
              alt=""
              variant="full"
              sizes={tile.sizes}
              quality={60}
              loading="lazy"
              draggable={false}
              className="pointer-events-none"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'color-mix(in srgb, var(--qe-base, #0A0E1A) 42%, transparent)',
              }}
            />
          </span>
        );
      })}

      {/* Bottom fade so the collage never competes with the hero labels. */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 45%, transparent 40%, color-mix(in srgb, var(--qe-base, #0A0E1A) 70%, transparent) 100%)',
        }}
      />
    </div>
  );
}
