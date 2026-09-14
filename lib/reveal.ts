'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Options for the shared scroll-reveal hook.
 *
 * The single reveal utility reused by Work cards, Numbers stat blocks, and any
 * other reveal section (Req 4.7, 7.5). The caller supplies the actual visual
 * effect via `onReveal`; this hook only owns the IntersectionObserver lifecycle
 * and the run-once absorbing state.
 */
export interface RevealOptions {
  /** IntersectionObserver threshold (0 for cards, 0.5 for stat blocks). */
  threshold?: number;
  /** IntersectionObserver rootMargin, e.g. '0px 0px -10% 0px' for a bottom-90% trigger. */
  rootMargin?: string;
  /** When true, unobserve after first reveal and never re-trigger (absorbing state, Req 5.4). */
  once?: boolean;
  /** Caller-supplied effect run when an observed element crosses the threshold. */
  onReveal?: (el: Element) => void;
}

/**
 * Shared scroll-reveal hook built on IntersectionObserver.
 *
 * Returns a ref callback to attach to the element you want to observe. When the
 * element crosses `threshold` (accounting for `rootMargin`), `onReveal(el)` is
 * invoked — that is where the caller runs its anime.js clip-path reveal,
 * staggered animation, or count-up tween.
 *
 * With `once: true`, the element is unobserved after firing and an internal
 * `hasRevealed` flag becomes an absorbing state, so re-entering the viewport
 * never restarts the effect (start count is at most 1, Req 5.4).
 *
 * SSR-safe: no `window`/`IntersectionObserver` access occurs during render; all
 * browser access is guarded and happens inside `useEffect`. The observer is
 * cleaned up on unmount or when the observed node changes.
 */
export function useReveal(
  options: RevealOptions,
): (node: Element | null) => void {
  const { threshold = 0, rootMargin, once = false, onReveal } = options;

  // The node currently attached via the returned ref callback.
  const [node, setNode] = useState<Element | null>(null);

  // Absorbing state: once revealed in `once` mode, it never fires again.
  const hasRevealedRef = useRef(false);

  // Keep the latest handler/flag in refs so passing inline callbacks doesn't
  // force the observer to tear down and rebuild on every render.
  const onRevealRef = useRef(onReveal);
  const onceRef = useRef(once);
  useEffect(() => {
    onRevealRef.current = onReveal;
    onceRef.current = once;
  }, [onReveal, once]);

  // Stable ref callback handed back to the caller.
  const refCallback = useCallback((el: Element | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    // SSR / unsupported environment guard: no browser access here.
    if (
      node == null ||
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    // Already revealed in once-mode: nothing to observe.
    if (onceRef.current && hasRevealedRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          if (onceRef.current) {
            if (hasRevealedRef.current) {
              continue;
            }
            hasRevealedRef.current = true;
            observer.unobserve(entry.target);
          }
          onRevealRef.current?.(entry.target);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, threshold, rootMargin]);

  return refCallback;
}
