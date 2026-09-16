'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import type { CertificateItem } from '@/lib/data';
import SafeImage from './SafeImage';

interface CertificateLightboxProps {
  items: CertificateItem[];
  initialIndex: number;
  onClose: () => void;
}

function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * CertificateLightbox — an accessible, full-screen document viewer.
 *
 * Opened from the Certificates coverflow at a chosen index, it shows the
 * selected certificate large and legible (uncropped, objectFit: contain — a
 * document is never cropped), with LEFT/RIGHT controls (plus ←/→ keys) to move
 * through ALL certificates within the big view, its title/caption, a dot
 * index, Esc + scrim-click to close, and touch swipe.
 *
 * Accessibility / robustness:
 *   • Reuses `useAccessibleDialog` for focus trap, Esc, opener restore and body
 *     scroll lock (no page scroll behind it).
 *   • Reduced motion → transitions off; the document simply swaps in place.
 *   • Placeholder cards (no image) render the same elegant marked frame rather
 *     than a fabricated certificate.
 */
export default function CertificateLightbox({
  items,
  initialIndex,
  onClose,
}: CertificateLightboxProps) {
  const count = items.length;
  const [active, setActive] = useState(() => wrapIndex(initialIndex, count));
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; id: number } | null>(null);

  useAccessibleDialog({
    open: true,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
  });

  const advance = useCallback(
    (direction: -1 | 1) => setActive((current) => wrapIndex(current + direction, count)),
    [count],
  );
  const goTo = useCallback(
    (index: number) => setActive(wrapIndex(index, count)),
    [count],
  );

  // Arrow-key navigation within the big view (Esc is handled by the dialog hook).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        advance(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        advance(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    touchStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }, []);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy)) return;
      advance(dx < 0 ? 1 : -1);
    },
    [advance],
  );

  if (count === 0) return null;
  const item = items[active];
  const reduced = prefersReducedMotion();

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Certificate viewer"
      tabIndex={-1}
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      className="fixed inset-0 z-[220] isolate overflow-hidden bg-[color-mix(in_srgb,var(--qe-base)_96%,transparent)] text-[var(--qe-text)] outline-none"
    >
      {/* Scrim — click to close (the media/controls sit above this). */}
      <div
        aria-hidden="true"
        onMouseDown={onClose}
        className="absolute inset-0 z-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--qe-base)_82%,transparent),var(--qe-base))]"
      />

      <header className="absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-6 px-5 py-5 sm:px-8 sm:py-7">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--qe-accent)]">
            Certificate {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
          <h2 className="mt-2 truncate pr-4 text-2xl font-semibold text-[var(--qe-text)] sm:text-3xl">
            {item.title}
          </h2>
          <p className="text-secondary mt-1 truncate pr-4 font-mono text-[0.7rem] uppercase tracking-[0.16em]">
            {item.caption}
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close certificate viewer"
          className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)] text-2xl text-[var(--qe-text)] transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      {/* Large, uncropped document stage. */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          touchStartRef.current = null;
        }}
        onClick={(event) => {
          // Click on empty stage (not the framed document) closes.
          const target = event.target as HTMLElement;
          if (!target.closest('[data-cert-frame]')) onClose();
        }}
        className="absolute inset-x-0 bottom-24 top-28 z-10 flex items-center justify-center px-4 sm:bottom-28 sm:px-10 [touch-action:pan-y]"
      >
        <figure
          data-cert-frame
          className={`cert-lightbox-doc relative flex h-full max-h-full w-full max-w-4xl flex-col border border-[var(--qe-muted)]/30 bg-[var(--qe-surface)] ${
            reduced ? '' : 'cert-lightbox-doc-animated'
          }`}
        >
          <div className="relative w-full flex-1 overflow-hidden p-3 sm:p-4">
            {item.image ? (
              <SafeImage
                src={item.image}
                alt={`${item.title} — ${item.caption}`}
                variant="full"
                objectFit="contain"
                sizes="(max-width: 768px) 92vw, 56rem"
                quality={88}
                fallbackColor="var(--qe-surface, #0F1424)"
                loading="eager"
                draggable={false}
                className="pointer-events-none"
              />
            ) : (
              <span className="surface flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <span
                  aria-hidden="true"
                  className="flex h-16 w-16 items-center justify-center border border-[var(--qe-accent)]/60"
                >
                  <span
                    className="block h-5 w-5"
                    style={{ backgroundColor: 'var(--qe-accent, #6E1423)' }}
                  />
                </span>
                <span className="text-secondary font-mono text-xs uppercase tracking-[0.18em]">
                  Certificate image to be added
                </span>
              </span>
            )}
          </div>
          <figcaption className="border-t border-subtle px-4 py-3">
            <span className="text-primary block text-base font-semibold leading-tight">
              {item.title}
            </span>
            <span className="text-secondary mt-1 block font-mono text-[0.7rem] uppercase tracking-[0.16em]">
              {item.caption}
            </span>
          </figcaption>
        </figure>
      </div>

      {/* Prev / next — cycle through ALL certificates in the big view. */}
      <button
        type="button"
        onClick={() => advance(-1)}
        aria-label="Previous certificate"
        className="absolute left-4 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)]/90 text-2xl text-[var(--qe-text)] backdrop-blur transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:left-8"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        onClick={() => advance(1)}
        aria-label="Next certificate"
        className="absolute right-4 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)]/90 text-2xl text-[var(--qe-text)] backdrop-blur transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:right-8"
      >
        <span aria-hidden="true">→</span>
      </button>

      <footer className="absolute inset-x-0 bottom-0 z-40 flex min-h-24 flex-col items-center justify-center gap-3 px-5 pb-5 sm:min-h-28 sm:pb-7">
        <p
          className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--qe-muted)]"
          aria-live="polite"
        >
          {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </p>
        <div className="flex max-w-full flex-wrap justify-center gap-1" aria-label="Choose certificate">
          {items.map((cert, index) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`View ${cert.title}`}
              aria-current={index === active ? 'true' : undefined}
              className="flex h-4 w-4 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)]"
            >
              <span
                aria-hidden="true"
                className={
                  index === active
                    ? 'h-1.5 w-3 bg-[var(--qe-accent)]'
                    : 'h-1 w-1 bg-[var(--qe-muted)]/55'
                }
              />
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
