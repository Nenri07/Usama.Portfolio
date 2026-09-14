'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { prefersReducedMotion } from '@/lib/motion';

const CHAPTERS = [
  { id: 'top', label: 'Intro' },
  { id: 'trusted-by', label: 'Clients' },
  { id: 'work', label: 'Events' },
  { id: 'numbers', label: 'Results' },
  { id: 'team', label: 'Crew' },
  { id: 'contact', label: 'Contact' },
  { id: 'thank-you', label: 'End' },
] as const;

interface LenisLike {
  scrollTo: (
    target: number | string | HTMLElement,
    options?: {
      duration?: number;
      force?: boolean;
      immediate?: boolean;
      offset?: number;
    },
  ) => void;
}

interface ScrollState {
  activeIndex: number;
  progress: number;
}

function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function documentScrollLimit(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function scrollPageTo(target: HTMLElement | number): void {
  const reduced = prefersReducedMotion();
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;

  if (lenis?.scrollTo) {
    try {
      lenis.scrollTo(target, {
        duration: reduced ? 0 : 0.9,
        force: true,
        immediate: reduced,
        offset: 0,
      });
      return;
    } catch {
      /* Fall through to native scrolling. */
    }
  }

  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
  } else {
    target.scrollIntoView({ behavior, block: 'start' });
  }
}

/** Compact document-progress control and semantic navigation for page chapters. */
export default function ChapterRail() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragPointerRef = useRef<number | null>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    activeIndex: 0,
    progress: 0,
  });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const limit = documentScrollLimit();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const progress = limit > 0 ? clampProgress(scrollTop / limit) : 0;
      const marker = scrollTop + window.innerHeight * 0.35;
      let activeIndex = 0;

      CHAPTERS.forEach((chapter, index) => {
        const section = document.getElementById(chapter.id);
        if (section && section.offsetTop <= marker) activeIndex = index;
      });

      if (limit > 0 && scrollTop >= limit - 2) {
        activeIndex = CHAPTERS.length - 1;
      }

      setScrollState((current) =>
        current.activeIndex === activeIndex &&
        Math.abs(current.progress - progress) < 0.001
          ? current
          : { activeIndex, progress },
      );
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleUpdate);

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    resizeObserver?.observe(document.documentElement);
    scheduleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const jumpToProgress = useCallback((progress: number) => {
    scrollPageTo(clampProgress(progress) * documentScrollLimit());
  }, []);

  const progressFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      const bounds = track.getBoundingClientRect();
      if (bounds.height <= 0) return;
      jumpToProgress((event.clientY - bounds.top) / bounds.height);
    },
    [jumpToProgress],
  );

  const handleTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      dragPointerRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      progressFromPointer(event);
    },
    [progressFromPointer],
  );

  const handleTrackPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (dragPointerRef.current !== event.pointerId) return;
      progressFromPointer(event);
    },
    [progressFromPointer],
  );

  const finishTrackDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (dragPointerRef.current !== event.pointerId) return;
      progressFromPointer(event);
      dragPointerRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [progressFromPointer],
  );

  const handleTrackKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const limit = documentScrollLimit();
      const pageStep = limit > 0 ? Math.min(1, window.innerHeight / limit) : 1;
      let next = scrollState.progress;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          next += 0.05;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          next -= 0.05;
          break;
        case 'PageDown':
          next += pageStep;
          break;
        case 'PageUp':
          next -= pageStep;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      jumpToProgress(next);
    },
    [jumpToProgress, scrollState.progress],
  );

  const handleChapterClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      const section = document.getElementById(id);
      if (!section) return;

      scrollPageTo(section);
      const hash = `#${id}`;
      if (window.location.hash === hash) {
        window.history.replaceState(null, '', hash);
      } else {
        window.history.pushState(null, '', hash);
      }
    },
    [],
  );

  const activeChapter = CHAPTERS[scrollState.activeIndex];
  const percentage = Math.round(scrollState.progress * 100);

  return (
    <nav
      aria-label="Page chapters"
      className="pointer-events-none fixed left-0 top-1/2 z-30 h-[min(68dvh,32rem)] w-8 -translate-y-1/2 sm:w-9"
    >
      <div
        ref={trackRef}
        role="scrollbar"
        tabIndex={0}
        aria-label="Page scroll progress"
        aria-controls={CHAPTERS.map((chapter) => chapter.id).join(' ')}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${activeChapter.label}, ${percentage}%`}
        onKeyDown={handleTrackKeyDown}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={finishTrackDrag}
        onPointerCancel={(event) => {
          if (dragPointerRef.current === event.pointerId) {
            dragPointerRef.current = null;
          }
        }}
        onLostPointerCapture={() => {
          dragPointerRef.current = null;
        }}
        className="pointer-events-auto absolute inset-y-0 left-0 w-7 touch-none outline-none focus-visible:bg-[color-mix(in_srgb,var(--qe-text)_5%,transparent)] sm:left-1"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--qe-muted)]/30"
        />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-[var(--qe-accent)]"
          style={{ height: `${percentage}%` }}
        />
      </div>

      <ol className="pointer-events-none absolute inset-y-0 left-0 w-7 sm:left-1">
        {CHAPTERS.map((chapter, index) => {
          const active = index === scrollState.activeIndex;
          const position = (index / (CHAPTERS.length - 1)) * 100;

          return (
            <li
              key={chapter.id}
              className="absolute left-0 w-full -translate-y-1/2"
              style={{ top: `${position}%` }}
            >
              <a
                href={`#${chapter.id}`}
                aria-label={`Go to ${chapter.label}`}
                aria-current={active ? 'location' : undefined}
                data-cursor
                onClick={(event) => handleChapterClick(event, chapter.id)}
                onPointerDown={(event) => event.stopPropagation()}
                className="group pointer-events-auto relative flex h-10 w-7 items-center justify-center outline-none"
              >
                <span
                  aria-hidden="true"
                  className={`block border transition-[width,height,background-color,border-color] duration-200 motion-reduce:transition-none ${
                    active
                      ? 'h-2.5 w-2.5 border-[var(--qe-accent)] bg-[var(--qe-accent)]'
                      : 'h-1.5 w-1.5 border-[var(--qe-muted)] bg-[var(--qe-base)] group-hover:h-2.5 group-hover:w-2.5 group-hover:border-[var(--qe-accent)] group-focus-visible:h-2.5 group-focus-visible:w-2.5 group-focus-visible:border-[var(--qe-text)]'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`chapter-rail-label pointer-events-none absolute left-6 hidden bg-[color-mix(in_srgb,var(--qe-base)_92%,transparent)] px-1 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none lg:block ${
                    active
                      ? 'text-primary opacity-100'
                      : 'text-secondary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  {chapter.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
