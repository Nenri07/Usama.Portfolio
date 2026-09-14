'use client';

import { useCallback } from 'react';
import { gsap } from '@/lib/gsapSetup';
import clsx from 'clsx';
import SafeImage from './SafeImage';
import { useReveal } from '@/lib/reveal';
import { staggerDelay } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import type { TeamMember } from '@/lib/data';

/**
 * TeamCard — one role-based card in the Team section (Req 6.1–6.7).
 *
 * - Image: SafeImage from `member.image` (variant full, fallbackColor surface).
 *   On load failure SafeImage renders a placeholder `--color-surface`
 *   background while the role/name and the card size are retained, so the
 *   layout never breaks (Req 6.4, 6.5).
 * - Content: the `role` title is ALWAYS shown (Req 6.1). The `name` is shown
 *   ONLY when `member.name` is present — no placeholder or invented name when
 *   absent (Req 6.2, 6.3).
 * - Reveal: the SINGLE shared `useReveal` hook (GSAP + ScrollTrigger, Req 6.6)
 *   fires when the card's top scrolls within the bottom 90% of the viewport
 *   (`start: 'top 90%'`). In `onReveal` GSAP animates the clip-path inset from
 *   fully covered `inset(100% 0 0 0)` to fully visible `inset(0 0 0 0)` over
 *   ~600ms, matching the WorkCard reveal pattern, with a per-card stagger of
 *   `staggerDelay(index, BASE_DELAY)` (BASE_DELAY in [80,150]). Under reduced
 *   motion the reveal is disabled and the card stays in its final visible state
 *   (Req 6.7, 9.8).
 *
 * Animation safety: the DEFAULT (unanimated) DOM state is the final visible
 * state — clip-path `inset(0 0 0 0)` — so if GSAP never runs the card is fully
 * visible. The covered start state is applied via JS only after mount (in
 * onReveal), wrapped in try/catch so any failure leaves the card visible
 * (Req 9.7).
 *
 * Visual system: square (aspect-square), no shadow, border-radius 0 (Req 8.3).
 */

/** Per-card stagger base delay in ms (range [80,150]). */
const BASE_DELAY = 100;
/** Reveal duration in seconds. */
const REVEAL_DURATION = 0.6;

export interface TeamCardProps {
  /** Team member data — role always shown, name only when present (Req 6.1–6.3). */
  member: TeamMember;
  /** Zero-based card index — drives the per-card stagger (Req 6.6). */
  index: number;
  /** Optional className hint (set by the Team container). */
  className?: string;
}

export default function TeamCard({ member, index, className }: TeamCardProps) {
  // Compute reduced-motion in the component (client) and pass to useReveal as
  // `disabled` so the reveal is skipped under reduced motion (Req 6.7, 9.8).
  const reduced = prefersReducedMotion();

  const onReveal = useCallback(
    (el: Element) => {
      const node = el as HTMLElement;
      try {
        // Apply the COVERED start state via JS only (never in static CSS) so a
        // card left unanimated stays fully visible (graceful default, Req 6.7).
        gsap.set(node, { clipPath: 'inset(100% 0 0 0)' });

        gsap.to(node, {
          clipPath: 'inset(0 0 0 0)',
          duration: REVEAL_DURATION,
          delay: staggerDelay(index, BASE_DELAY) / 1000, // ms → s for GSAP
          ease: 'power3.out',
        });
      } catch {
        // On any failure, restore the final visible state (Req 6.7 / 9.7).
        node.style.clipPath = 'inset(0 0 0 0)';
      }
    },
    [index],
  );

  const revealRef = useReveal({
    start: 'top 90%',
    disabled: reduced,
    onReveal,
  });

  return (
    <article
      ref={revealRef}
      className={clsx(
        'group relative isolate aspect-square overflow-hidden bg-[var(--color-surface)]',
        // No border-radius / no box-shadow (Req 8.3) — square, flat card.
        'rounded-none',
        className,
      )}
      // Default (unanimated) state = final visible state (Req 6.7).
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      {/* Image layer (Req 6.4). Placeholder on failure, layout retained (Req 6.5). */}
      <div className="absolute inset-0 -z-10">
        <SafeImage
          src={member.image}
          alt={member.name ?? member.role}
          variant="full"
          sizes="(max-width: 768px) 100vw, 33vw"
          fallbackColor="var(--color-surface)"
        />
        {/* Scrim so the role/name text stays legible over any image. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,26,0.15) 0%, rgba(10,14,26,0.9) 100%)',
          }}
        />
      </div>

      {/* Content anchored to the bottom. */}
      <div className="flex h-full w-full flex-col justify-end p-4 sm:p-5">
        {/* Name — ONLY when present; no invented placeholder when absent
            (Req 6.2, 6.3). */}
        {member.name ? (
          <span className="text-lg font-semibold leading-tight text-[var(--color-text)] sm:text-xl">
            {member.name}
          </span>
        ) : null}

        {/* Role — ALWAYS shown (Req 6.1). */}
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {member.role}
        </span>
      </div>
    </article>
  );
}
