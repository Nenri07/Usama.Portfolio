'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import RevealHeading from './RevealHeading';
import SafeImage from './SafeImage';
import DeckShapes from './DeckShapes';
import CertificateLightbox from './CertificateLightbox';
import { certificates, contracts, clients, type CertificateItem } from '@/lib/data';
import { buildMarqueeTrack } from '@/lib/format';

/**
 * Certificates — an auto-advancing 3D coverflow of certificate / contract
 * "document" cards.
 *
 * Interaction (reference behaviour):
 *   • The CENTER card is enlarged and foregrounded; the neighbours on BOTH
 *     sides peek in, scaled down and dimmed.
 *   • It auto-advances so the next card becomes the centre; auto-advance
 *     PAUSES on hover/focus within the section and resumes on leave/blur.
 *   • Manual prev/next buttons, clicking a side card to centre it, full
 *     keyboard support (arrows/Home/End), touch swipe, and a dot index.
 *
 * Content is placeholder-driven: when a certificate's `image` is null, or a
 * real scan has not been dropped into `public/puro/certificates/` yet,
 * SafeImage falls back and the card renders an elegant, clearly-marked
 * document frame — never a fabricated certificate.
 *
 * Readability & degradation:
 *   • All text uses the centralized semantic classes (readable at rest).
 *   • The whole track scrolls INTERNALLY (overflow-hidden stage); the page
 *     never gains a horizontal scrollbar.
 *   • Reduced motion → no auto-advance, transitions off; cards remain visible
 *     and navigable.
 */

const AUTO_ADVANCE_MS = 3600;

/** Seamless doubled client ribbon track (0% → -50% loop). */
const CLIENT_TRACK = buildMarqueeTrack(clients);

function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

function CertificateCard({ item }: { item: CertificateItem }) {
  return (
    <span className="surface-alt relative flex h-full w-full flex-col border border-subtle">
      {/* Document media area (real scan when present, placeholder otherwise).
          A soft matte inset frames the document so the contained scan reads as
          a premium, uncropped framed print rather than a raw edge-to-edge fill. */}
      <span className="relative block w-full flex-1 overflow-hidden p-3 sm:p-4">
        {item.image ? (
          <span className="relative block h-full w-full overflow-hidden bg-white/[0.02]">
            <SafeImage
              src={item.image}
              alt={`${item.title} — ${item.caption}`}
              variant="full"
              objectFit="contain"
              sizes="(max-width: 768px) 72vw, 38vw"
              quality={82}
              fallbackColor="var(--qe-surface, #0F1424)"
              loading="lazy"
              draggable={false}
              className="pointer-events-none"
            />
          </span>
        ) : null}

        {/* Elegant placeholder frame. Rendered beneath the image so that if a
            real scan loads it simply covers this; if the file is missing,
            SafeImage collapses to transparent and this stays visible. */}
        <span
          aria-hidden={item.image ? 'true' : undefined}
          className="surface absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
          style={{ zIndex: item.image ? -1 : 1 }}
        >
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center border border-[var(--qe-accent)]/60"
          >
            <span
              className="block h-4 w-4"
              style={{ backgroundColor: 'var(--qe-accent, #6E1423)' }}
            />
          </span>
          <span className="text-secondary font-mono text-[0.7rem] uppercase tracking-[0.18em]">
            Certificate image to be added
          </span>
        </span>
      </span>

      {/* Caption bar — always-readable semantic text. */}
      <span className="block border-t border-subtle p-4">
        <span className="text-primary block text-base font-semibold leading-tight">
          {item.title}
        </span>
        <span className="text-secondary mt-1 block font-mono text-[0.7rem] uppercase tracking-[0.16em]">
          {item.caption}
        </span>
      </span>
    </span>
  );
}

export default function Certificates() {
  const items = certificates;
  const count = items.length;
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  // When set, the full-screen document lightbox is open at this index.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClickRef = useRef(false);

  // Subscribe to the reduced-motion preference (SSR-safe). The state is
  // updated from the media-query change event, and seeded once from the same
  // subscription callback, so it always reflects the live preference.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const goTo = useCallback(
    (index: number) => setActive(wrapIndex(index, count)),
    [count],
  );
  const advance = useCallback(
    (direction: -1 | 1) => setActive((current) => wrapIndex(current + direction, count)),
    [count],
  );

  // Auto-advance loop: off under reduced motion, and while paused
  // (hover/focus within the section) or when there is nothing to cycle.
  useEffect(() => {
    if (reduced || paused || count <= 1 || lightboxIndex != null) return;
    const timer = window.setInterval(() => {
      setActive((current) => wrapIndex(current + 1, count));
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [reduced, paused, count, lightboxIndex]);

  // Pause when the tab is hidden; resume on return (handled via `paused`).
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          advance(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          advance(1);
          break;
        case 'Home':
          event.preventDefault();
          setActive(0);
          break;
        case 'End':
          event.preventDefault();
          setActive(count - 1);
          break;
        default:
          break;
      }
    },
    [advance, count],
  );

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    touchStartRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    suppressClickRef.current = false;
  }, []);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      suppressClickRef.current = true;
      advance(dx < 0 ? 1 : -1);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    },
    [advance],
  );

  // Only the centre card and its two immediate neighbours (each side) are
  // rendered in the 3D stack; the rest stay out of view.
  const visible = useMemo(() => {
    if (count === 0) return [] as { index: number; offset: number }[];
    const range = Math.min(2, Math.floor(count / 2));
    const cards: { index: number; offset: number }[] = [];
    for (let offset = -range; offset <= range; offset += 1) {
      cards.push({ index: wrapIndex(active + offset, count), offset });
    }
    return cards;
  }, [active, count]);

  if (count === 0) return null;

  return (
    <section
      id="certificates"
      data-deck-section
      className="relative min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <DeckShapes variant="bloom" />
      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-7xl">
        {/* Slim, always-readable client ribbon — the "trusted by" value folded
            in here (the full list lives in the contracts table below), so it is
            no longer a separate full section. Pure CSS marquee, reduced-motion
            safe (animation disabled via media query). */}
        <div
          className="marquee-mask mb-14 w-full overflow-hidden border-y border-subtle py-4"
          aria-label="Selected clients"
        >
          <div className="cert-client-ribbon flex w-max items-center">
            {CLIENT_TRACK.map((client, i) => (
              <span
                key={`${client}-${i}`}
                aria-hidden={i >= clients.length ? true : undefined}
                className="text-secondary flex shrink-0 items-center gap-6 whitespace-nowrap pr-6 font-mono text-sm uppercase tracking-[0.14em] sm:gap-8 sm:pr-8"
              >
                {client}
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rotate-45"
                  style={{ backgroundColor: 'var(--qe-accent, #6E1423)' }}
                />
              </span>
            ))}
          </div>
        </div>

        <header className="mb-12 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)] md:items-end">
          <div>
            <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
              Certificates &amp; Contracts
            </RevealHeading>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
            />
          </div>
          <p className="text-secondary text-base leading-relaxed md:text-right">
            Company documents and signed service contracts. Certificate images
            are placeholders until the real scans are added.
          </p>
        </header>

        {/* Coverflow stage. overflow-hidden keeps the depth/peek inside the
            section so the page never scrolls horizontally. */}
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Certificates and contracts"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setPaused(false);
            }
          }}
          className="relative outline-none focus-visible:ring-1 focus-visible:ring-[var(--qe-text)]/40"
        >
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              touchStartRef.current = null;
            }}
            className="relative mx-auto h-[clamp(20rem,52vh,32rem)] w-full [perspective:1600px] [touch-action:pan-y]"
          >
            <div className="absolute inset-0 [transform-style:preserve-3d]">
              {visible.map(({ index, offset }) => {
                const item = items[index];
                const isCenter = offset === 0;
                const abs = Math.abs(offset);
                const translate = offset * 44;
                const depth = isCenter ? 60 : -abs * 260;
                const rotate = offset * -34;
                const scale = isCenter ? 1.04 : abs === 1 ? 0.8 : 0.62;
                const opacity = isCenter ? 1 : abs === 1 ? 0.66 : 0.34;

                const transform = reduced
                  ? `translate3d(calc(-50% + ${translate}%), -50%, 0) scale(${scale})`
                  : `translate3d(calc(-50% + ${translate}%), -50%, ${depth}px) rotateY(${rotate}deg) scale(${scale})`;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={
                      isCenter
                        ? `Open ${item.title} full screen`
                        : `Bring ${item.title} to centre`
                    }
                    aria-current={isCenter ? 'true' : undefined}
                    aria-hidden={isCenter ? undefined : true}
                    tabIndex={isCenter ? 0 : -1}
                    data-cursor
                    onClick={() => {
                      if (suppressClickRef.current) return;
                      // Side card → bring to centre; centre card → open the
                      // full-screen document lightbox at this index.
                      if (isCenter) setLightboxIndex(index);
                      else goTo(index);
                    }}
                    className="cert-coverflow-card absolute left-1/2 top-1/2 h-[min(48vh,30rem)] w-[min(76vw,24rem)] overflow-hidden border border-[var(--qe-muted)]/25 bg-[var(--qe-surface)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
                    style={{
                      zIndex: 20 - abs,
                      opacity,
                      transform,
                    }}
                  >
                    <CertificateCard item={item} />
                    {isCenter ? (
                      <span className="pointer-events-none absolute bottom-3 right-3 z-10 border border-[var(--qe-muted)]/25 bg-[var(--qe-base)]/85 px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--qe-text)] backdrop-blur">
                        Click to enlarge
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prev / next controls. */}
          <button
            type="button"
            onClick={() => advance(-1)}
            aria-label="Previous document"
            className="text-primary absolute left-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)]/85 text-2xl backdrop-blur transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => advance(1)}
            aria-label="Next document"
            className="text-primary absolute right-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--qe-muted)]/35 bg-[var(--qe-base)]/85 text-2xl backdrop-blur transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Index + dots. */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <p
            className="text-secondary font-mono text-xs uppercase tracking-[0.18em]"
            aria-live="polite"
          >
            {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
          <div className="flex flex-wrap justify-center gap-2" aria-label="Choose document">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Show ${item.title}`}
                aria-current={index === active ? 'true' : undefined}
                className="flex h-4 w-6 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--qe-text)]"
              >
                <span
                  aria-hidden="true"
                  className={
                    index === active
                      ? 'h-1.5 w-5 bg-[var(--qe-accent)]'
                      : 'h-1 w-2 bg-[var(--qe-muted)]/55'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Full public contracts list — the real client base, with the
            user-approved dates. Scrolls INTERNALLY on small screens so the
            page never gains a horizontal scrollbar. */}
        <div className="mt-20 min-w-0">
          <header className="mb-6">
            <h3 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
              Contracts List
            </h3>
            <p className="text-secondary mt-2 text-sm leading-relaxed">
              Cleaning, hospitality &amp; support services contracts —{' '}
              {contracts.length} engagements.
            </p>
          </header>

          <div className="min-w-0 overflow-x-auto border border-subtle">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">
                Puro cleaning, hospitality and support services contracts list
              </caption>
              <thead>
                <tr className="border-b border-subtle">
                  <th scope="col" className="text-accent px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]">#</th>
                  <th scope="col" className="text-accent px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]">Client</th>
                  <th scope="col" className="text-accent px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]">Start</th>
                  <th scope="col" className="text-accent px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]">End</th>
                  <th scope="col" className="text-accent px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]">Duration</th>
                  <th scope="col" className="text-accent px-4 py-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em]">Scope</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr
                    key={contract.no}
                    className="border-b border-[var(--qe-muted)]/12 align-top last:border-b-0"
                  >
                    <td className="text-secondary px-4 py-3 font-mono text-xs">
                      {String(contract.no).padStart(2, '0')}
                    </td>
                    <td className="text-primary px-4 py-3 text-sm font-medium">
                      {contract.client}
                    </td>
                    <td className="text-secondary px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {contract.start}
                    </td>
                    <td className="text-secondary px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {contract.end}
                    </td>
                    <td className="text-secondary px-4 py-3 text-sm whitespace-nowrap">
                      {contract.duration}
                    </td>
                    <td className="text-secondary px-4 py-3 text-sm">
                      {contract.scope}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {lightboxIndex != null ? (
        <CertificateLightbox
          items={items}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </section>
  );
}
