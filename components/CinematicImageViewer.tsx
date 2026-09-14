'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import SafeImage from './SafeImage';

export interface CinematicViewerImage {
  src: string;
  alt: string;
}

interface CinematicImageViewerProps {
  images: CinematicViewerImage[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}

type ViewerMode = 'cinematic' | 'manual';

const WHEEL_THRESHOLD = 45;
const INPUT_LOCK_MS = 720;
const FAST_PACE_MS = 780;

function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

function cinematicPace(count: number): number {
  if (count <= 1) return 0;
  return Math.round(Math.max(900, Math.min(1600, 14000 / (count - 1))));
}

/** Accessible, square-edged coverflow viewer adapted to this site's design. */
export default function CinematicImageViewer({
  images,
  initialIndex,
  title,
  onClose,
}: CinematicImageViewerProps) {
  const count = images.length;
  const [activeIndex, setActiveIndex] = useState(() =>
    wrapIndex(initialIndex, count),
  );
  const [mode, setMode] = useState<ViewerMode>('manual');
  const [paceMs, setPaceMs] = useState(() => cinematicPace(count));
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const autoplayTimerRef = useRef(0);
  const remainingRef = useRef(0);
  const firstHoldRef = useRef(true);
  const automaticRunStartedRef = useRef(false);
  const wheelTotalRef = useRef(0);
  const wheelLockUntilRef = useRef(0);
  const wheelResetRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClickRef = useRef(false);

  useAccessibleDialog({
    open: true,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
  });

  const cancelCinematic = useCallback(() => {
    if (autoplayTimerRef.current) {
      window.clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = 0;
    }
    remainingRef.current = 0;
    setMode('manual');
  }, []);

  const goTo = useCallback(
    (index: number, userInitiated = true) => {
      if (count === 0) return;
      if (userInitiated) cancelCinematic();
      setActiveIndex(wrapIndex(index, count));
    },
    [cancelCinematic, count],
  );

  const advance = useCallback(
    (direction: -1 | 1, userInitiated = true) => {
      if (userInitiated) cancelCinematic();
      setActiveIndex((current) => wrapIndex(current + direction, count));
    },
    [cancelCinematic, count],
  );

  const beginCinematicPass = useCallback(() => {
    if (count <= 1 || prefersReducedMotion()) return;
    if (autoplayTimerRef.current) window.clearTimeout(autoplayTimerRef.current);
    remainingRef.current = count - 1;
    firstHoldRef.current = true;
    setPaceMs(cinematicPace(count));
    setMode('cinematic');
  }, [count]);

  // One automatic pass per opening. Reduced motion starts and stays manual.
  useEffect(() => {
    if (automaticRunStartedRef.current) return;
    automaticRunStartedRef.current = true;
    const startTimer = window.setTimeout(() => {
      if (!prefersReducedMotion()) beginCinematicPass();
    }, 0);
    return () => window.clearTimeout(startTimer);
  }, [beginCinematicPass]);

  useEffect(() => {
    if (mode !== 'cinematic' || remainingRef.current <= 0) return;

    const delay = firstHoldRef.current ? 900 : paceMs;
    autoplayTimerRef.current = window.setTimeout(() => {
      firstHoldRef.current = false;
      remainingRef.current -= 1;
      setActiveIndex((current) => wrapIndex(current + 1, count));
      if (remainingRef.current <= 0) setMode('manual');
    }, delay);

    return () => {
      if (autoplayTimerRef.current) {
        window.clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = 0;
      }
    };
  }, [activeIndex, count, mode, paceMs]);

  // Trackpads and wheels navigate one image per intentional gesture.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = performance.now();
      if (now < wheelLockUntilRef.current) return;

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      wheelTotalRef.current += delta;

      if (wheelResetRef.current) window.clearTimeout(wheelResetRef.current);
      wheelResetRef.current = window.setTimeout(() => {
        wheelTotalRef.current = 0;
      }, 140);

      if (Math.abs(wheelTotalRef.current) < WHEEL_THRESHOLD) return;
      const direction: -1 | 1 = wheelTotalRef.current > 0 ? 1 : -1;
      wheelTotalRef.current = 0;
      wheelLockUntilRef.current = now + INPUT_LOCK_MS;
      advance(direction);
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', onWheel);
      if (wheelResetRef.current) window.clearTimeout(wheelResetRef.current);
    };
  }, [advance]);

  const visibleCards = useMemo(() => {
    if (count === 0) return [];
    const offsets = count === 1 ? [0] : [-1, 0, 1];
    const seen = new Set<number>();
    return offsets.flatMap((offset) => {
      const index = wrapIndex(activeIndex + offset, count);
      if (seen.has(index)) return [];
      seen.add(index);
      return [{ index, offset }];
    });
  }, [activeIndex, count]);

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    touchStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleStagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 42) return;
    suppressClickRef.current = true;
    advance(Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 1 : -1) : dy < 0 ? 1 : -1);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  if (count === 0) return null;
  const active = images[activeIndex];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image viewer`}
      tabIndex={-1}
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          advance(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          advance(1);
        }
      }}
      className="fixed inset-0 z-[220] isolate overflow-hidden bg-[color-mix(in_srgb,var(--qe-base)_96%,transparent)] text-[var(--qe-text)] outline-none"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 scale-110 opacity-25 blur-3xl">
        <SafeImage
          src={active.src}
          alt=""
          variant="full"
          sizes="100vw"
          quality={75}
          loading="eager"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--qe-base)_78%,transparent),var(--qe-base))]" />
      <div
        aria-hidden="true"
        onMouseDown={onClose}
        className="absolute inset-0 z-0"
      />

      <header className="absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-6 px-5 py-5 sm:px-8 sm:py-7">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--qe-accent)]">
            {mode === 'cinematic' ? `Cinematic · ${paceMs}ms` : 'Manual viewing'}
          </p>
          <h2 className="mt-2 truncate pr-4 text-2xl font-semibold text-[var(--qe-text)] sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (mode === 'cinematic') cancelCinematic();
              else beginCinematicPass();
            }}
            disabled={count <= 1 || prefersReducedMotion()}
            aria-label={mode === 'cinematic' ? 'Pause cinematic sequence' : 'Play cinematic sequence'}
            aria-pressed={mode === 'cinematic'}
            className="flex h-12 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)] px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--qe-text)] transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {mode === 'cinematic' ? 'Pause' : 'Play'}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="flex h-12 w-12 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)] text-2xl text-[var(--qe-text)] transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </header>

      <div
        ref={stageRef}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        onPointerEnter={() => {
          if (mode === 'cinematic') cancelCinematic();
        }}
        onFocusCapture={() => {
          if (mode === 'cinematic') cancelCinematic();
        }}
        onClick={(event) => {
          if (suppressClickRef.current) return;
          const target = event.target as HTMLElement;
          if (!target.closest('button')) onClose();
        }}
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={() => {
          touchStartRef.current = null;
        }}
        className="cinematic-stage absolute inset-x-0 bottom-24 top-24 z-10 overflow-hidden [perspective:1400px] [touch-action:none] sm:bottom-28 sm:top-28"
        aria-roledescription="carousel"
        aria-label={`${title} gallery`}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {visibleCards.map(({ index, offset }) => {
            const item = images[index];
            const isActive = offset === 0;
            const x = offset * 72;
            const z = isActive ? 0 : -220;
            const rotateY = offset * -42;
            const scale = isActive ? 1 : 0.76;

            return (
              <button
                key={item.src}
                type="button"
                aria-label={
                  isActive
                    ? mode === 'cinematic'
                      ? `Accelerate cinematic sequence for ${item.alt}`
                      : `Play one cinematic sequence from ${item.alt}`
                    : `View ${item.alt}`
                }
                aria-current={isActive ? 'true' : undefined}
                aria-hidden={isActive ? undefined : true}
                tabIndex={isActive ? 0 : -1}
                onPointerDown={(event) => {
                  if (!isActive) event.preventDefault();
                }}
                onClick={() => {
                  if (suppressClickRef.current) return;
                  if (!isActive) {
                    goTo(index);
                  } else if (mode === 'cinematic') {
                    firstHoldRef.current = false;
                    setPaceMs(FAST_PACE_MS);
                  } else {
                    beginCinematicPass();
                  }
                }}
                className="cinematic-card absolute left-1/2 top-1/2 h-[min(68dvh,44rem)] w-[min(76vw,54rem)] overflow-hidden border border-[var(--qe-muted)]/30 bg-[var(--qe-surface)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:w-[min(62vw,54rem)]"
                style={{
                  zIndex: isActive ? 20 : 10,
                  opacity: isActive ? 1 : 0.52,
                  transform: `translate3d(calc(-50% + ${x}%), -50%, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                }}
              >
                <SafeImage
                  src={item.src}
                  alt={item.alt}
                  variant="full"
                  objectFit="contain"
                  sizes={isActive ? '(max-width: 768px) 76vw, 62vw' : '(max-width: 768px) 28vw, 22vw'}
                  quality={75}
                  preload={isActive}
                  loading={isActive ? 'eager' : 'eager'}
                  draggable={false}
                  className="pointer-events-none"
                />
                {isActive ? (
                  <span className="absolute bottom-3 left-3 border border-[var(--qe-muted)]/25 bg-[var(--qe-base)]/88 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--qe-text)] backdrop-blur">
                    {mode === 'cinematic' ? 'Click to accelerate' : 'Click to play once'}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => advance(-1)}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)]/90 text-2xl text-[var(--qe-text)] backdrop-blur transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:left-8"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        onClick={() => advance(1)}
        aria-label="Next image"
        className="absolute right-4 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)]/90 text-2xl text-[var(--qe-text)] backdrop-blur transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:right-8"
      >
        <span aria-hidden="true">→</span>
      </button>

      <footer className="absolute inset-x-0 bottom-0 z-40 flex min-h-24 flex-col items-center justify-center gap-3 px-5 pb-5 sm:min-h-28 sm:pb-7">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--qe-muted)]" aria-live="polite">
          {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')} · {mode}
        </p>
        <div className="flex max-w-full flex-wrap justify-center gap-1" aria-label="Choose image">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`View image ${index + 1}: ${image.alt}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className="flex h-4 w-4 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)]"
            >
              <span
                aria-hidden="true"
                className={index === activeIndex ? 'h-1.5 w-3 bg-[var(--qe-accent)]' : 'h-1 w-1 bg-[var(--qe-muted)]/55'}
              />
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
