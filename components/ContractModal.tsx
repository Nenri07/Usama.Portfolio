'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import type { ContractCard } from '@/lib/data';
import SafeImage from './SafeImage';

/**
 * ContractModal — a lightweight detail overlay for a single client contract.
 *
 * Shows the source-backed client, scope, duration and user-approved start→end
 * dates plus the contract's deterministically-mapped work photograph. No
 * invented data. Focus handling, body lock, Escape/Tab trapping and
 * reduced-motion degradation reuse the shared accessible-dialog hook and the
 * same visual language as ProjectModal.
 */
interface ContractModalProps {
  contract: ContractCard | null;
  onClose: () => void;
}

export default function ContractModal({ contract, onClose }: ContractModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const open = contract != null;

  useAccessibleDialog({
    open,
    onClose,
    containerRef: panelRef,
    initialFocusRef: closeBtnRef,
  });

  useLayoutEffect(() => {
    if (!open) return;
    const scrim = scrimRef.current;
    const panel = panelRef.current;
    if (!scrim || !panel) return;

    if (prefersReducedMotion()) {
      gsap.set([scrim, panel], { autoAlpha: 1, y: 0, rotationX: 0 });
      return;
    }

    try {
      const timeline = gsap.timeline();
      timeline.fromTo(
        scrim,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
      );
      timeline.fromTo(
        panel,
        {
          autoAlpha: 0,
          y: 40,
          rotationX: 8,
          transformPerspective: 1200,
          transformOrigin: 'center top',
        },
        { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.6, ease: 'power4.out' },
        '-=0.15',
      );
      return () => {
        timeline.kill();
      };
    } catch {
      try {
        gsap.set([scrim, panel], { autoAlpha: 1, y: 0, rotationX: 0 });
      } catch {
        /* visible state already usable */
      }
    }
  }, [open]);

  if (!open || !contract) return null;

  return (
    <div
      ref={scrimRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${contract.client} — contract details`}
      onMouseDown={(event) => {
        if (event.target === scrimRef.current) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-stretch justify-center p-3 sm:p-6"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--qe-base, #0A0E1A) 95%, transparent)',
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-full w-full min-w-0 max-w-4xl flex-col overflow-hidden border border-[var(--qe-muted)]/20 bg-[var(--qe-base)] will-change-transform"
        style={{ perspective: '1200px' }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          data-cursor
          data-cursor-label="Close"
          aria-label="Close contract details"
          className="text-secondary absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border border-[var(--qe-muted)]/25 bg-[var(--qe-base)]/80 text-2xl backdrop-blur transition-colors hover:border-[var(--qe-accent)] hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div
          data-lenis-prevent
          className="modal-scroll-surface grid min-w-0 flex-1 grid-cols-1 gap-y-10 overflow-x-hidden overflow-y-auto px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-14 lg:py-20"
        >
          <div className="lg:sticky lg:top-20 lg:self-start">
            <span
              aria-hidden="true"
              className="text-accent mb-6 flex h-10 w-10 items-center justify-center border border-[var(--qe-accent)]"
            >
              <span
                className="block h-3 w-3"
                style={{ backgroundColor: 'var(--qe-accent, #6E1423)' }}
              />
            </span>

            <p className="text-accent mb-4 font-mono text-xs uppercase tracking-[0.2em]">
              Engagement {String(contract.no).padStart(2, '0')}
            </p>

            <h2 className="text-primary break-words text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              {contract.client}
            </h2>

            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border-t border-[var(--qe-muted)]/25 bg-[var(--qe-surface)]/40 px-4 pb-5 pt-4">
                <dt className="text-accent text-xs font-semibold uppercase tracking-[0.16em]">
                  Scope
                </dt>
                <dd className="text-primary mt-2 text-lg font-semibold leading-tight">
                  {contract.scope}
                </dd>
              </div>
              <div className="border-t border-[var(--qe-muted)]/25 bg-[var(--qe-surface)]/40 px-4 pb-5 pt-4">
                <dt className="text-accent text-xs font-semibold uppercase tracking-[0.16em]">
                  Duration
                </dt>
                <dd className="text-primary mt-2 text-lg font-semibold leading-tight">
                  {contract.duration}
                </dd>
              </div>
              <div className="border-t border-[var(--qe-muted)]/25 bg-[var(--qe-surface)]/40 px-4 pb-5 pt-4 sm:col-span-2">
                <dt className="text-accent text-xs font-semibold uppercase tracking-[0.16em]">
                  Term
                </dt>
                <dd className="text-primary mt-2 font-mono text-sm uppercase tracking-[0.14em]">
                  {contract.start} → {contract.end}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-6">
            <div
              className="relative w-full overflow-hidden bg-[var(--qe-surface)]"
              style={{ aspectRatio: '4 / 3' }}
            >
              <SafeImage
                src={contract.image.src}
                alt={contract.image.alt}
                variant="full"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="eager"
                className="pointer-events-none"
              />
              <span className="pointer-events-none absolute bottom-3 left-3 bg-[var(--qe-base)]/88 px-3 py-1.5 font-mono text-xs text-[var(--qe-text)] backdrop-blur">
                {contract.scope}
              </span>
            </div>
            <p className="text-secondary text-sm leading-relaxed">
              Source-backed engagement from Puro&apos;s official cleaning,
              hospitality &amp; support services contracts list. Dates, duration
              and scope are transcribed from the client-approved record; no
              financial figures are shown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
