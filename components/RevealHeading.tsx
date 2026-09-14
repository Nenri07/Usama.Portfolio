import type { ReactNode } from 'react';

/**
 * A section heading whose DOM is permanently in its final readable state.
 *
 * The previous implementation split and clipped lines after hydration, then
 * depended on ScrollTrigger to return them to y=0. Layout refreshes could leave
 * those generated line wrappers translated below their masks. Keeping the
 * original heading DOM intact makes first paint, reverse scrolling, resize,
 * chapter jumps, bfcache restoration, and reduced motion share one safe state.
 * Motion elsewhere may enhance the section, but never gates this text.
 */
export interface RevealHeadingProps {
  children: ReactNode;
  className?: string;
  /** Retained for call-site compatibility; headings no longer hide for motion. */
  stagger?: number;
  /** Retained for call-site compatibility; headings no longer hide for motion. */
  duration?: number;
  /** Retained for call-site compatibility; headings no longer hide for motion. */
  start?: string;
}

export default function RevealHeading({
  children,
  className,
}: RevealHeadingProps) {
  return <h2 className={`reveal-heading ${className ?? ''}`}>{children}</h2>;
}
