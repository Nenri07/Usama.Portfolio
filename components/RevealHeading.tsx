'use client';

import type { ReactNode } from 'react';
import { useLineMask } from '@/lib/useLineMask';

/**
 * RevealHeading — a client `<h2>` that reveals its text line-by-line via the
 * shared `Line_Mask_Reveal` (Req 11.3, 11.5).
 *
 * Used in place of a raw `<h2>` for the section titles (Clients, Results, Team,
 * Contact). It applies `useLineMask` internally, keeping the surrounding
 * container components (Numbers, Team) as plain server components — only the
 * heading itself becomes a client boundary.
 *
 * The default (unanimated) DOM state is the fully visible heading; the masked
 * start state is applied only by JS after mount, and `lineMaskReveal` no-ops
 * under reduced motion / SSR and is try/catch-wrapped. So if GSAP never runs
 * the heading still renders fully readable (Req 11.4, 11.9).
 */
export interface RevealHeadingProps {
  children: ReactNode;
  className?: string;
  /** Per-line stagger in seconds (default 0.08). */
  stagger?: number;
  /** Per-line duration in seconds (default 0.8). */
  duration?: number;
  /** ScrollTrigger `start` (default 'top 85%'). */
  start?: string;
}

export default function RevealHeading({
  children,
  className,
  stagger,
  duration,
  start,
}: RevealHeadingProps) {
  const ref = useLineMask({ stagger, duration, start });

  return (
    <h2 ref={ref} className={className}>
      {children}
    </h2>
  );
}
