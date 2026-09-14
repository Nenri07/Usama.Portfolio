'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { lineMaskReveal } from '@/lib/motion';

/**
 * Shared line-mask heading reveal hook (Req 11.3, 11.5).
 *
 * Returns a ref callback to attach to the heading element you want to reveal
 * line-by-line. On mount (once the node is attached) it runs `lineMaskReveal`,
 * which splits the heading into clipped lines and slides each up into view on
 * a ScrollTrigger. The cleanup returned by `lineMaskReveal` is invoked on
 * unmount or when the observed node changes.
 *
 * Graceful degrade (Req 11.4, 11.9): `lineMaskReveal` no-ops under reduced
 * motion / SSR, leaving the heading in its final visible state, and is
 * try/catch-wrapped so any failure still leaves the heading readable. This
 * hook itself only touches the DOM inside `useEffect`, so it is SSR-safe.
 */
export function useLineMask(
  opts: { stagger?: number; duration?: number; start?: string } = {},
): (node: HTMLElement | null) => void {
  const [node, setNode] = useState<HTMLElement | null>(null);

  // Keep the latest options in a ref so changing an inline options object does
  // not tear down and rebuild the reveal on every render.
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  const refCallback = useCallback((el: HTMLElement | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (node == null) {
      return;
    }
    const cleanup = lineMaskReveal(node, optsRef.current);
    return cleanup;
  }, [node]);

  return refCallback;
}
