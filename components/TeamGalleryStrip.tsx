'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import { gsap } from '@/lib/gsapSetup';
import { useReveal } from '@/lib/reveal';
import { prefersReducedMotion } from '@/lib/motion';
import SafeImage from './SafeImage';
import { brand } from '@/lib/data';

/**
 * TeamGalleryStrip — the "Our Team" showcase for general team & event photos
 * (Req 6.1, 6.4). A dense, 3D-consistent grid of the `teamGallery` images.
 *
 * Reveal: uses the SHARED `useReveal` hook (GSAP + ScrollTrigger). On reveal
 * tiles rise + rotateX from a sunken tilted state to flat, staggered — the same
 * transform-only, no-opacity approach as DivisionGrid, so a GSAP failure leaves
 * every tile flat and fully visible (Req 9.7). Disabled under reduced motion
 * (Req 9.8).
 *
 * Visual system: square tiles, border-radius 0, no box-shadow (Req 8.3).
 * Broken images fall back to a surface fill via SafeImage.
 */

const REVEAL_STAGGER = 0.03;

export interface TeamGalleryStripProps {
  /** General team/event photo paths. */
  images: string[];
  className?: string;
}

export default function TeamGalleryStrip({ images, className }: TeamGalleryStripProps) {
  const reduced = prefersReducedMotion();

  const onReveal = useCallback((el: Element) => {
    const tiles = Array.from(
      el.querySelectorAll<HTMLElement>('[data-gallery-tile]'),
    );
    if (tiles.length === 0) return;
    try {
      gsap.fromTo(
        tiles,
        { y: 32, rotationX: -14, transformPerspective: 900 },
        {
          y: 0,
          rotationX: 0,
          duration: 0.7,
          ease: 'power4.out',
          stagger: { each: REVEAL_STAGGER, from: 'start' },
        },
      );
    } catch {
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

  return (
    <div
      ref={revealRef}
      className={clsx(
        'grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 sm:gap-4',
        className,
      )}
    >
      {images.map((src, i) => (
        <div key={src} className="[perspective:900px]">
          <div
            data-gallery-tile
            className="relative aspect-square overflow-hidden rounded-none bg-[var(--color-surface)] [transform-style:preserve-3d] will-change-transform"
            data-cursor
            data-cursor-label="View"
          >
            <SafeImage
              src={src}
              alt={`${brand.name} team photo ${i + 1}`}
              variant="full"
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 17vw, 11vw"
              fallbackColor="var(--color-surface)"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
