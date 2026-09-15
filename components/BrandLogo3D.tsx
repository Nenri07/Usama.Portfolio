'use client';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { brand } from '@/lib/data';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import SafeImage from './SafeImage';

interface BrandLogo3DProps {
  className?: string;
  preload?: boolean;
  sizes?: string;
}

/**
 * Optimized local brand mark with progressive, non-blocking depth motion.
 * The unanimated DOM is the final visible state; reduced-motion users receive
 * the same sharp logo without idle motion, shine, or pointer listeners.
 */
export default function BrandLogo3D({
  className,
  preload = false,
  sizes = '72px',
}: BrandLogo3DProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const entryRef = useRef<HTMLSpanElement>(null);
  const floatRef = useRef<HTMLSpanElement>(null);
  const tiltRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const entry = entryRef.current;
    const float = floatRef.current;
    const tilt = tiltRef.current;
    if (!root || !entry || !float || !tilt || prefersReducedMotion()) return;

    let intro: gsap.core.Tween | undefined;
    let idle: gsap.core.Tween | undefined;

    try {
      intro = gsap.fromTo(
        entry,
        { autoAlpha: 0, y: 8, scale: 0.97, rotationX: -5 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 1.1,
          ease: 'power3.out',
        },
      );

      const finePointer = window.matchMedia(
        '(hover: hover) and (pointer: fine)',
      ).matches;
      if (!finePointer) {
        return () => {
          intro?.kill();
          gsap.set(entry, { clearProps: 'all' });
        };
      }

      // Keep the mark alive without competing with the periodic surface shine.
      // Depth-only breathing on a long, low-amplitude cycle: NO fast/continuous
      // spin, just a gentle 9s float + micro-tilt that reads as refined depth.
      idle = gsap.to(float, {
        z: 3,
        rotationX: -0.6,
        rotationY: 0.8,
        y: -1.5,
        scale: 1.006,
        duration: 9,
        delay: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      const handlePointerMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        const bounds = root.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

        gsap.to(tilt, {
          rotationX: -y * 4.5,
          rotationY: x * 6,
          x: x * 1.5,
          y: y * 1,
          z: 8,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const handlePointerLeave = () => {
        gsap.to(tilt, {
          rotationX: 0,
          rotationY: 0,
          x: 0,
          y: 0,
          z: 0,
          duration: 0.9,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      };

      root.addEventListener('pointermove', handlePointerMove);
      root.addEventListener('pointerleave', handlePointerLeave);

      return () => {
        root.removeEventListener('pointermove', handlePointerMove);
        root.removeEventListener('pointerleave', handlePointerLeave);
        intro?.kill();
        idle?.kill();
        gsap.killTweensOf(tilt);
        gsap.set([entry, float, tilt], { clearProps: 'all' });
      };
    } catch {
      try {
        gsap.set([entry, float, tilt], { clearProps: 'all' });
      } catch {
        entry.style.opacity = '1';
        entry.style.transform = 'none';
        float.style.transform = 'none';
        tilt.style.transform = 'none';
      }
    }
  }, []);

  return (
    <span
      ref={rootRef}
      className={clsx(
        'relative block aspect-square shrink-0 [perspective:900px]',
        className,
      )}
    >
      <span
        ref={entryRef}
        className="block h-full w-full [transform-style:preserve-3d]"
      >
        <span
          ref={floatRef}
          className="block h-full w-full [transform-style:preserve-3d] will-change-transform"
        >
          <span
            ref={tiltRef}
            className="relative block h-full w-full [transform-style:preserve-3d] will-change-transform"
          >
            {/* Soft depth glow sitting BEHIND the transparent PNG — adds richness
                and a subtle rim without a hard box or square-edged shadow. */}
            <span aria-hidden="true" className="brand-logo-glow" />
            <SafeImage
              src={brand.logo}
              alt={`${brand.name} logo`}
              variant="full"
              sizes={sizes}
              quality={90}
              preload={preload}
              loading={preload ? 'eager' : 'lazy'}
              objectFit="contain"
              fallbackColor="transparent"
              className="relative z-[2] bg-transparent"
            />
            <span aria-hidden="true" className="brand-logo-shine" />
          </span>
        </span>
      </span>
    </span>
  );
}
