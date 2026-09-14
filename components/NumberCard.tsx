'use client';

import { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * NumberCard — a small presentational 3D "number card" shared by the Results
 * section (StatBlock) and the ProjectModal metrics block.
 *
 * The card sits inside a `perspective` container and uses
 * `transform-style: preserve-3d`. On a FINE pointer it tilts toward the cursor
 * (GSAP quickTo on rotateX/rotateY, clamped to ~±MAX_TILT degrees) and settles
 * back to rest on leave. There is NO box-shadow — depth comes purely from the
 * transform, borders, and tokens (visual-system rule).
 *
 * Graceful degrade (Req 9.7/9.8): under `prefers-reduced-motion` or a coarse
 * pointer the tilt is disabled and the card renders flat and static. All GSAP
 * is wrapped in try/catch; on failure the card simply stays flat.
 */

const MAX_TILT = 10; // degrees

export interface NumberCardProps {
  /** Card body (the number, suffix, label, etc.). */
  children: React.ReactNode;
  /** Extra classes for the inner card surface. */
  className?: string;
  /** Extra classes for the outer perspective wrapper. */
  wrapperClassName?: string;
}

export default function NumberCard({
  children,
  className,
  wrapperClassName,
}: NumberCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rotXTo = useRef<((v: number) => void) | null>(null);
  const rotYTo = useRef<((v: number) => void) | null>(null);

  // Set up the pointer-tilt quickTo tweens once (fine pointer only).
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (
      prefersReducedMotion() ||
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches)
    ) {
      return;
    }

    try {
      rotXTo.current = gsap.quickTo(card, 'rotationX', {
        duration: 0.5,
        ease: 'power3.out',
      });
      rotYTo.current = gsap.quickTo(card, 'rotationY', {
        duration: 0.5,
        ease: 'power3.out',
      });
    } catch {
      rotXTo.current = null;
      rotYTo.current = null;
    }

    return () => {
      try {
        gsap.killTweensOf(card);
        gsap.set(card, { rotationX: 0, rotationY: 0 });
      } catch {
        /* nothing to clean up */
      }
      rotXTo.current = null;
      rotYTo.current = null;
    };
  }, []);

  const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || !rotXTo.current || !rotYTo.current) return;
    const rect = card.getBoundingClientRect();
    // Normalized pointer position within the card, -0.5..0.5.
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    // Tilt toward the pointer: moving right tilts around Y, down around X.
    rotYTo.current(px * MAX_TILT * 2);
    rotXTo.current(-py * MAX_TILT * 2);
  }, []);

  const handleLeave = useCallback(() => {
    rotXTo.current?.(0);
    rotYTo.current?.(0);
  }, []);

  return (
    <div
      className={clsx('[perspective:900px]', wrapperClassName)}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <div
        ref={cardRef}
        className={clsx('[transform-style:preserve-3d] will-change-transform', className)}
      >
        {children}
      </div>
    </div>
  );
}
