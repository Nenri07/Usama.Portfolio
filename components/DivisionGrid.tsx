'use client';

import { useCallback, useRef } from 'react';
import clsx from 'clsx';
import { gsap } from '@/lib/gsapSetup';
import { useReveal } from '@/lib/reveal';
import { prefersReducedMotion, isCoarsePointer } from '@/lib/motion';
import SafeImage from './SafeImage';

/**
 * DivisionGrid — a responsive 3D photo grid for one team division (Req 6.1, 6.4).
 *
 * Each tile is a 3D card: a `perspective` wrapper over a `preserve-3d` surface.
 * On a FINE pointer the tile tilts toward the cursor (GSAP quickTo on
 * rotationX/rotationY, clamped to ±MAX_TILT — the same pattern as NumberCard),
 * settling back to rest on leave (Req 9.4, 9.5).
 *
 * Scroll reveal: the whole grid uses the SHARED `useReveal` hook (GSAP +
 * ScrollTrigger). On reveal the tiles animate from a slightly sunken, tilted
 * state (y + rotateX) to flat, staggered by index (transform-only, no
 * box-shadow / no opacity so a GSAP failure never hides them).
 *
 * Graceful degrade (Req 9.7, 9.8): the DEFAULT DOM state is the final visible
 * state — every tile is flat and fully visible. The reveal is `disabled` under
 * reduced motion, and the pointer tilt is skipped under reduced motion or on a
 * coarse pointer. All GSAP is wrapped in try/catch; on failure tiles stay flat
 * and visible. Broken images fall back to a surface fill via SafeImage.
 *
 * Visual system: square tiles, border-radius 0, no box-shadow (Req 8.3).
 */

/** Max pointer-tilt in degrees. */
const MAX_TILT = 10;
/** Per-tile reveal stagger in seconds. */
const REVEAL_STAGGER = 0.05;

export interface DivisionGridProps {
  /** Division display label — used only for image alt text (no invented names). */
  name: string;
  /** Real staff photo paths for this division. */
  images: string[];
  /** Optional className for the grid wrapper. */
  className?: string;
}

export default function DivisionGrid({ name, images, className }: DivisionGridProps) {
  const reduced = prefersReducedMotion();
  // The surface nodes for each tile (used by the pointer tilt).
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Reveal the grid's tiles with a staggered 3D rise. Transform-only so a
  // failure leaves everything visible (Req 9.7).
  const onReveal = useCallback((el: Element) => {
    const tiles = Array.from(
      el.querySelectorAll<HTMLElement>('[data-tile-surface]'),
    );
    if (tiles.length === 0) return;
    try {
      gsap.fromTo(
        tiles,
        { y: 40, rotationX: -18, transformPerspective: 900 },
        {
          y: 0,
          rotationX: 0,
          duration: 0.8,
          ease: 'power4.out',
          stagger: REVEAL_STAGGER,
        },
      );
    } catch {
      // Leave tiles flat/visible on any failure.
      tiles.forEach((t) => {
        t.style.transform = 'none';
      });
    }
  }, []);

  const revealRef = useReveal({
    start: 'top 85%',
    once: true,
    disabled: reduced,
    onReveal,
  });

  // Pointer tilt toward the cursor on a fine pointer only (Req 9.4, 9.5).
  const canTilt = !reduced && !isCoarsePointer();

  const handleMove = useCallback(
    (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canTilt) return;
      const surface = tileRefs.current[index];
      if (!surface) return;
      const rect = surface.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      try {
        gsap.to(surface, {
          rotationY: px * MAX_TILT * 2,
          rotationX: -py * MAX_TILT * 2,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } catch {
        /* tilt is non-essential */
      }
    },
    [canTilt],
  );

  const handleLeave = useCallback(
    (index: number) => () => {
      if (!canTilt) return;
      const surface = tileRefs.current[index];
      if (!surface) return;
      try {
        gsap.to(surface, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } catch {
        /* tilt is non-essential */
      }
    },
    [canTilt],
  );

  return (
    <div
      ref={revealRef}
      className={clsx(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6',
        className,
      )}
    >
      {images.map((src, i) => (
        <div
          key={src}
          className="[perspective:900px]"
          onPointerMove={handleMove(i)}
          onPointerLeave={handleLeave(i)}
          data-cursor
          data-cursor-label="View"
        >
          <div
            ref={(node) => {
              tileRefs.current[i] = node;
            }}
            data-tile-surface
            className="relative aspect-square overflow-hidden rounded-none bg-[var(--color-surface)] [transform-style:preserve-3d] will-change-transform"
          >
            <SafeImage
              src={src}
              alt={`${name} team member`}
              variant="full"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              fallbackColor="var(--color-surface)"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
