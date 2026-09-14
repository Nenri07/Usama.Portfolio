'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger, registerScrollTrigger } from '@/lib/gsapSetup';

/**
 * Options for the shared scroll-reveal hook (Req 4.9, 9.1).
 *
 * The single reveal utility reused by Work cards, Results stat blocks, and Team
 * cards. The caller supplies the actual visual effect via `onReveal`; this hook
 * only owns the ScrollTrigger lifecycle and the run-once absorbing state.
 */
export interface RevealOptions {
  /** ScrollTrigger `start`, e.g. 'top 90%' (cards) or 'top 50%' (stats). Default 'top 90%'. */
  start?: string;
  /** When true, fires at most once and never re-triggers (absorbing state, Req 5.4). */
  once?: boolean;
  /** When true (reduced motion), skip entirely and leave the element visible (Req 9.8). */
  disabled?: boolean;
  /** Caller-supplied effect run when the element crosses `start`. */
  onReveal?: (el: Element) => void;

  // --- Legacy IntersectionObserver options (deprecated) ---
  // Accepted for backwards compatibility with existing call sites (WorkCard,
  // StatBlock) so the project keeps compiling until the section tasks (14.x)
  // migrate them to `start`. `threshold` is mapped to a sensible `start`; both
  // are otherwise ignored.
  /** @deprecated use `start`. A threshold ≥ 0.5 maps to 'top 50%', else 'top 90%'. */
  threshold?: number;
  /** @deprecated no-op; superseded by `start`. */
  rootMargin?: string;
}

/**
 * Shared scroll-reveal hook built on GSAP + ScrollTrigger (Lenis-driven).
 *
 * Returns a ref callback to attach to the element you want to observe. When the
 * element crosses `start`, `onReveal(el)` is invoked — that is where the caller
 * runs its clip-path reveal, staggered animation, or count-up tween.
 *
 * With `once: true`, the trigger fires a single time and an internal
 * `hasRevealed` flag becomes an absorbing state, so re-entering the viewport
 * never restarts the effect (start count is at most 1, Req 5.4).
 *
 * When `disabled` is true (reduced motion) the hook does nothing and the
 * element remains in its final visible state (Req 9.8).
 *
 * SSR-safe: no `window`/ScrollTrigger access occurs during render; all browser
 * access is guarded and happens inside `useEffect`. The trigger is killed on
 * unmount or when the observed node changes.
 */
export function useReveal(
  options: RevealOptions,
): (node: Element | null) => void {
  const {
    once = false,
    disabled = false,
    onReveal,
    threshold,
    start: startOption,
  } = options;

  // Resolve the ScrollTrigger `start`. Prefer the explicit option; otherwise
  // derive from the legacy threshold (≥0.5 → 'top 50%'), defaulting to 'top 90%'.
  const start =
    startOption ??
    (typeof threshold === 'number' && threshold >= 0.5 ? 'top 50%' : 'top 90%');

  // The node currently attached via the returned ref callback.
  const [node, setNode] = useState<Element | null>(null);

  // Absorbing state: once revealed in `once` mode, it never fires again.
  const hasRevealedRef = useRef(false);

  // Keep the latest handler/flags in refs so inline callbacks don't force the
  // trigger to tear down and rebuild on every render.
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
    // SSR / unsupported environment guard, and reduced-motion skip (Req 9.8).
    if (node == null || disabled || typeof window === 'undefined') {
      return;
    }

    // Already revealed in once-mode: nothing to observe.
    if (onceRef.current && hasRevealedRef.current) {
      return;
    }

    let trigger: ScrollTrigger | undefined;

    try {
      registerScrollTrigger();

      trigger = ScrollTrigger.create({
        trigger: node,
        start,
        onEnter: (self) => {
          if (onceRef.current) {
            if (hasRevealedRef.current) {
              return;
            }
            hasRevealedRef.current = true;
            self.kill();
          }
          onRevealRef.current?.(node);
        },
      });
    } catch {
      // ScrollTrigger failed to init — the element stays in its final visible
      // state and native scrolling remains functional (Req 9.7).
    }

    return () => {
      trigger?.kill();
    };
  }, [node, disabled, start]);

  return refCallback;
}
