import clsx from 'clsx';
import TeamCard from './TeamCard';
import RevealHeading from './RevealHeading';
import { team } from '@/lib/data';

/**
 * Team — the Team section: one TeamCard per `team` entry (Req 6.1), placed
 * between Results (Numbers) and Contact in the six-section order (Req 8.5).
 *
 * Server component: it only maps the static `team` data to TeamCard (a
 * `'use client'` component) children, so the reveal/animation work lives in
 * TeamCard while this wrapper — and page.tsx — stay server components,
 * mirroring WorkGrid and Numbers.
 *
 * Layout: a responsive grid — 2 cols (base) → 3 (md) — with ≥24px gaps
 * (`gap-6` = 24px, Req 8.2). Each cell maps one role-based card.
 *
 * Visual system: dark base, square cards, no box-shadow, border-radius 0,
 * heading ≥32px with the shared thin maroon rule accent used across the other
 * sections (Req 8.1–8.3).
 */
export default function Team() {
  return (
    <section id="team" className="bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Section heading — heading ≥32px, sans-serif, square, no shadow. */}
        <header className="mb-12">
          <RevealHeading className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            The Team
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--color-accent)]"
          />
        </header>

        {/*
          One TeamCard per team member (Req 6.1): 2 columns on mobile, 3 on
          tablet and up, with ≥24px gaps (gap-6 = 24px) (Req 8.2).
        */}
        <div className={clsx('grid gap-6', 'grid-cols-2 md:grid-cols-3')}>
          {team.map((member, i) => (
            <TeamCard key={i} member={member} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
