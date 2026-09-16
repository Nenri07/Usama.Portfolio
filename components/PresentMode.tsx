'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * PresentMode — an auto-running, PowerPoint-style presentation controller.
 *
 * Started by the Nav "Present" button (a `puro:present-start` window event),
 * it walks the deck section-by-section in the confirmed order, scrolling each
 * into a near-fullscreen "slide" state and auto-advancing every `dwellMs`
 * (default ~7s), STOPPING at Thank You — it never loops.
 *
 * Scroll: uses Lenis (`window.__lenis`) when available for the site's weighty
 * smooth scroll, falling back to native `scrollIntoView`. A short slide-in
 * class is applied to the active section as it becomes current, and the rest
 * of the deck is gently dimmed (via a class on <main>) for slide focus.
 *
 * Controls overlay: Play/Pause, Prev, Next, a "N / 6" indicator and Exit.
 * Keyboard: Space = play/pause, ←/→ = prev/next, Esc = exit. ANY manual
 * interaction (prev/next/click/keys other than exit) pauses auto-advance.
 *
 * Accessibility / robustness:
 *   • SSR-safe: no window access during render; everything guarded in effects.
 *   • Reduced motion: auto-advance is DISABLED and the deck requires manual
 *     Next/Prev (or keyboard), so motion-sensitive users are never moved
 *     automatically. Scrolling itself is instant (no smooth animation).
 *   • Cleanup: on exit/unmount every timer and listener is removed, the global
 *     `__presenting` flag is cleared, and all present-mode classes are stripped
 *     from <main>, so normal scrolling is fully restored and the overlay hidden.
 *   • Never traps the user: Exit is always available and restores everything.
 */

/** The ordered slide list, defined from the real section ids. */
const SLIDES: { id: string; label: string }[] = [
  { id: 'top', label: 'Hero' },
  { id: 'work', label: 'Projects' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'services', label: 'Services' },
  { id: 'events', label: 'Events' },
  { id: 'team', label: 'Team' },
  { id: 'thank-you', label: 'Thank You' },
];

const DEFAULT_DWELL_MS = 7000;

interface LenisLike {
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { duration?: number; force?: boolean; immediate?: boolean; offset?: number },
  ) => void;
}

export default function PresentMode({ dwellMs = DEFAULT_DWELL_MS }: { dwellMs?: number }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  const timerRef = useRef<number>(0);
  const total = SLIDES.length;

  // Track the live reduced-motion preference (SSR-safe).
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const scrollToSlide = useCallback(
    (slideIndex: number) => {
      if (typeof document === 'undefined') return;
      const slide = SLIDES[slideIndex];
      const el = document.getElementById(slide.id);
      if (!el) return;

      const useReduced = prefersReducedMotion();
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (lenis?.scrollTo) {
        try {
          lenis.scrollTo(el, {
            duration: useReduced ? 0 : 0.9,
            force: true,
            immediate: useReduced,
            offset: 0,
          });
        } catch {
          el.scrollIntoView({ behavior: useReduced ? 'auto' : 'smooth', block: 'start' });
        }
      } else {
        el.scrollIntoView({ behavior: useReduced ? 'auto' : 'smooth', block: 'start' });
      }

      // Apply the slide-in enhancement + active marker to the target section.
      if (!useReduced) {
        SLIDES.forEach((s, i) => {
          const node = document.getElementById(s.id);
          if (!node) return;
          node.classList.toggle('present-active-slide', i === slideIndex);
          if (i === slideIndex) {
            node.classList.remove('present-slide-enter');
            // Force reflow so re-adding the class restarts the animation.
            void node.offsetWidth;
            node.classList.add('present-slide-enter');
          } else {
            node.classList.remove('present-slide-enter');
          }
        });
      }
    },
    [],
  );

  const clearActiveClasses = useCallback(() => {
    if (typeof document === 'undefined') return;
    SLIDES.forEach((s) => {
      const node = document.getElementById(s.id);
      node?.classList.remove('present-active-slide', 'present-slide-enter');
    });
    document.querySelector('main')?.classList.remove('present-dimmed');
  }, []);

  const start = useCallback(() => {
    if (typeof document === 'undefined') return;
    setActive(true);
    setIndex(0);
    // Under reduced motion, do not auto-advance; require manual navigation.
    setPlaying(!prefersReducedMotion());
    (window as unknown as { __presenting?: boolean }).__presenting = true;
    document.querySelector('main')?.classList.add('present-dimmed');
    scrollToSlide(0);
  }, [scrollToSlide]);

  const exit = useCallback(() => {
    setActive(false);
    setPlaying(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
    if (typeof window !== 'undefined') {
      (window as unknown as { __presenting?: boolean }).__presenting = false;
    }
    clearActiveClasses();
  }, [clearActiveClasses]);

  const goTo = useCallback(
    (next: number, manual: boolean) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex(clamped);
      scrollToSlide(clamped);
      // Any manual navigation pauses auto-advance.
      if (manual) setPlaying(false);
    },
    [scrollToSlide, total],
  );

  const next = useCallback((manual = true) => goTo(index + 1, manual), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, true), [goTo, index]);

  // Listen for the Nav "Present" trigger.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStart = () => start();
    window.addEventListener('puro:present-start', onStart);
    return () => window.removeEventListener('puro:present-start', onStart);
  }, [start]);

  // Auto-advance loop. Disabled under reduced motion and while paused, and it
  // stops (never loops) once the last slide is reached.
  useEffect(() => {
    if (!active || !playing || reduced) return;
    if (index >= total - 1) return; // Stop at Thank You.
    timerRef.current = window.setTimeout(() => {
      goTo(index + 1, false);
    }, dwellMs);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = 0;
      }
    };
  }, [active, playing, reduced, index, total, dwellMs, goTo]);

  // Keyboard controls while presenting.
  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          exit();
          break;
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          // Space toggles play/pause (no-op auto-advance under reduced motion).
          if (!reduced) setPlaying((p) => !p);
          break;
        case 'ArrowRight':
          event.preventDefault();
          next(true);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prev();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, reduced, exit, next, prev]);

  // Safety net: clear everything on unmount.
  useEffect(() => () => exit(), [exit]);

  const atEnd = index >= total - 1;
  const current = SLIDES[index];
  const progressLabel = useMemo(
    () => `${index + 1} / ${total}`,
    [index, total],
  );

  if (!active) return null;

  return (
    <div
      role="region"
      aria-label="Presentation controls"
      className="fixed inset-x-0 bottom-0 z-[120] flex justify-center px-4 pb-5 sm:pb-6"
    >
      <div className="pointer-events-auto flex w-full max-w-2xl min-w-0 flex-wrap items-center justify-center gap-2 border border-[var(--qe-muted)]/30 bg-[color-mix(in_srgb,var(--qe-base,#0A0E1A)_92%,transparent)] px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous slide"
          data-cursor
          className="text-primary flex h-10 w-10 items-center justify-center border border-[var(--qe-muted)]/30 text-lg transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">←</span>
        </button>

        {reduced ? (
          <span className="text-secondary px-2 font-mono text-[0.65rem] uppercase tracking-[0.14em]">
            Manual
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause auto-advance' : 'Play auto-advance'}
            aria-pressed={playing}
            data-cursor
            disabled={atEnd}
            className="button-on-accent flex h-10 w-10 items-center justify-center border border-[var(--qe-accent)] text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => next(true)}
          disabled={atEnd}
          aria-label="Next slide"
          data-cursor
          className="text-primary flex h-10 w-10 items-center justify-center border border-[var(--qe-muted)]/30 text-lg transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">→</span>
        </button>

        <span
          className="text-primary min-w-0 flex-1 truncate px-2 text-center text-sm font-medium"
          aria-live="polite"
        >
          <span className="text-secondary font-mono text-xs uppercase tracking-[0.14em]">
            {progressLabel}
          </span>
          <span className="mx-2 text-[var(--qe-muted)]/50" aria-hidden="true">·</span>
          {current.label}
        </span>

        <button
          type="button"
          onClick={exit}
          aria-label="Exit presentation"
          data-cursor
          data-cursor-label="Exit"
          className="text-secondary flex h-10 items-center justify-center border border-[var(--qe-muted)]/30 px-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)]"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
