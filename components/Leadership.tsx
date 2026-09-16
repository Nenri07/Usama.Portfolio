'use client';

import { useCallback } from 'react';
import RevealHeading from './RevealHeading';
import DeckShapes from './DeckShapes';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useReveal, useCardReveal } from '@/lib/reveal';
import { useDeckFan } from '@/lib/useDeckFan';
import {
  management,
  workforce,
  workforceTotals,
  fleet,
  fleetTotal,
  machinery,
  machineryTotal,
  hasNonNumericCount,
  orgChart,
  type ManagementMember,
  type CountedItem,
  type OrgNode,
} from '@/lib/data';

/**
 * Leadership — a source-backed credibility section (id `leadership`).
 *
 * Three parts, all transcribed verbatim from Puro's company documents (no
 * invented figures):
 *   1. Management — the 8 NAMED managers as premium fanned "deck" cards. Front
 *      shows name / position / nationality / experience; the 3D flip back shows
 *      the full qualification. Real names are the strongest proof of scale.
 *   2. Capacity — bold big-number stat cards: total workforce (1,005 with the
 *      hospitality/cleaning male-female breakdown), the summed fleet count, and
 *      the summed machinery count. All sums are computed from the data.
 *   3. Org chart — an elegant indented / branching tree rendered from the
 *      transcribed `orgChart`, readable and internally scrollable on small
 *      screens (never overflowing the page).
 *
 * Everything is visible-by-default; motion (fan arc, flip, entrance reveals)
 * only enhances and is disabled under reduced motion / touch.
 */

/* ── Management deck ─────────────────────────────────────────────────── */

function ManagementCard({
  member,
  index,
  count,
}: {
  member: ManagementMember;
  index: number;
  count: number;
}) {
  const { active, cardStyle } = useDeckFan();
  const reduced = prefersReducedMotion();
  const revealRef = useCardReveal({ index, disabled: reduced, stagger: 0.05 });

  return (
    <li
      ref={revealRef}
      className={`deck-fan-card min-w-0 ${active ? '' : 'w-full'}`}
      style={active ? cardStyle(index, count, 4) : undefined}
    >
      <div className="deck-fan-flip deck-fan-flip-mgmt relative w-full">
        {/* Front face — always the readable resting state. */}
        <article className="deck-fan-face surface-alt flex min-w-0 flex-col border border-subtle p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="text-accent font-mono text-[0.7rem] uppercase tracking-[0.2em]">
              {member.position}
            </span>
            <span
              aria-hidden="true"
              className="text-secondary font-mono text-[0.65rem]"
            >
              {String(member.no).padStart(2, '0')}
            </span>
          </div>
          <h4 className="text-primary mt-3 break-words text-xl font-semibold leading-tight">
            {member.name}
          </h4>
          <p className="text-secondary mt-4 text-sm leading-relaxed">
            {member.qualification}
          </p>
          <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-subtle pt-4">
            <div>
              <dt className="text-secondary font-mono text-[0.6rem] uppercase tracking-[0.16em]">
                Nationality
              </dt>
              <dd className="text-primary mt-1 text-sm font-medium">{member.nationality}</dd>
            </div>
            <div>
              <dt className="text-secondary font-mono text-[0.6rem] uppercase tracking-[0.16em]">
                Experience
              </dt>
              <dd className="text-primary mt-1 text-sm font-medium">{member.experience}</dd>
            </div>
          </dl>
        </article>

        {/* Back face — revealed only via the fan flip (lg + fine pointer + motion). */}
        <article
          aria-hidden="true"
          className="deck-fan-face deck-fan-face-back surface flex min-w-0 flex-col justify-between border border-[var(--qe-accent)]/50 p-5"
        >
          <div>
            <p className="text-accent font-mono text-[0.7rem] uppercase tracking-[0.2em]">
              {member.position}
            </p>
            <h4 className="text-primary mt-3 break-words text-lg font-semibold leading-tight">
              {member.name}
            </h4>
          </div>
          <p className="text-secondary text-sm leading-relaxed">{member.qualification}</p>
          <p className="text-primary font-mono text-xs uppercase tracking-[0.16em]">
            {member.nationality} · {member.experience}
          </p>
        </article>
      </div>
    </li>
  );
}

/* ── Capacity stats ──────────────────────────────────────────────────── */

function StatCard({
  value,
  suffix,
  label,
  index,
  children,
}: {
  value: string;
  suffix?: string;
  label: string;
  index: number;
  children?: React.ReactNode;
}) {
  const reduced = prefersReducedMotion();
  const revealRef = useCardReveal({ index, disabled: reduced });

  return (
    <div
      ref={revealRef}
      className="surface-alt flex min-w-0 flex-col border border-subtle p-6"
    >
      <p className="text-primary text-5xl font-semibold leading-none tracking-tight sm:text-6xl">
        {value}
        {suffix ? <span className="text-accent">{suffix}</span> : null}
      </p>
      <p className="text-secondary mt-3 font-mono text-xs uppercase tracking-[0.18em]">
        {label}
      </p>
      {children ? <div className="mt-5 border-t border-subtle pt-4">{children}</div> : null}
    </div>
  );
}

function CountedList({ items }: { items: readonly CountedItem[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-baseline justify-between gap-3">
          <span className="text-secondary min-w-0 break-words text-sm">{item.label}</span>
          <span className="text-primary shrink-0 font-mono text-sm font-medium">
            {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Org chart ───────────────────────────────────────────────────────── */

function OrgBranch({ node, depth }: { node: OrgNode; depth: number }) {
  const isRoot = depth === 0;
  return (
    <li className="org-node relative min-w-0">
      <span
        className={
          isRoot
            ? 'text-primary inline-block border border-[var(--qe-accent)] bg-[var(--qe-surface)] px-3 py-1.5 text-sm font-semibold'
            : depth === 1
              ? 'text-primary inline-block border border-subtle bg-[var(--qe-surface)] px-3 py-1.5 text-sm font-medium'
              : 'text-secondary inline-block border border-subtle px-3 py-1 text-xs'
        }
      >
        {node.label}
      </span>
      {node.children && node.children.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-2 border-l border-[var(--qe-muted)]/25 pl-4">
          {node.children.map((child) => (
            <OrgBranch key={child.label} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/* ── Section ─────────────────────────────────────────────────────────── */

export default function Leadership() {
  const reduced = prefersReducedMotion();

  const onOrgReveal = useCallback((element: Element) => {
    try {
      const nodes = element.querySelectorAll('.org-node');
      gsap.fromTo(
        nodes,
        { opacity: 0.001, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.03,
          overwrite: true,
          onComplete: () => {
            try {
              gsap.set(nodes, { clearProps: 'opacity,transform' });
            } catch {
              /* final visible state already applied */
            }
          },
        },
      );
    } catch {
      /* the tree is fully visible without the entrance */
    }
  }, []);

  const orgRef = useReveal({ start: 'top 82%', once: true, disabled: reduced, onReveal: onOrgReveal });

  return (
    <section
      id="leadership"
      data-deck-section
      className="relative min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <DeckShapes variant="corner" />

      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-12 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)] md:items-end">
          <div>
            <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
              Leadership &amp; Capacity
            </RevealHeading>
            <span aria-hidden="true" className="mt-4 block h-px w-16 bg-[var(--qe-accent)]" />
          </div>
          <p className="text-secondary text-base leading-relaxed md:text-right">
            The named management team, workforce and operating capacity behind
            Puro&apos;s contracts — transcribed from the company profile.
          </p>
        </header>

        {/* 1 — Management deck. */}
        <div className="min-w-0">
          <h3 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
            Management Team
          </h3>
          <p className="text-secondary mt-2 max-w-2xl text-sm leading-relaxed">
            Eight senior managers leading operations, facilities, HSE, projects
            and HR. On wide screens the cards fan like a deck — hover to flip a
            card and read the full qualification.
          </p>

          <ManagementDeck members={management} />
        </div>

        {/* 2 — Capacity stats. */}
        <div className="mt-20 min-w-0 border-t border-subtle pt-12">
          <h3 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
            Operating Capacity
          </h3>
          <p className="text-secondary mt-2 max-w-2xl text-sm leading-relaxed">
            Workforce, transport fleet and machinery totals — every number is
            summed directly from the company profile.
          </p>

          <div className="mt-8 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            <StatCard value={workforce.total.toLocaleString('en-US')} label="Total Workforce" index={0}>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-secondary font-mono text-[0.6rem] uppercase tracking-[0.16em]">
                    Hospitality
                  </dt>
                  <dd className="text-primary mt-1 text-sm font-medium">
                    {workforceTotals.hospitality.toLocaleString('en-US')}
                    <span className="text-secondary ml-2 font-mono text-[0.65rem]">
                      M {workforce.hospitality.male} · F {workforce.hospitality.female}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-secondary font-mono text-[0.6rem] uppercase tracking-[0.16em]">
                    Cleaning
                  </dt>
                  <dd className="text-primary mt-1 text-sm font-medium">
                    {workforceTotals.cleaning.toLocaleString('en-US')}
                    <span className="text-secondary ml-2 font-mono text-[0.65rem]">
                      M {workforce.cleaning.male} · F {workforce.cleaning.female}
                    </span>
                  </dd>
                </div>
              </dl>
            </StatCard>

            <StatCard value={String(fleetTotal)} label="Transport Fleet Vehicles" index={1}>
              <CountedList items={fleet} />
            </StatCard>

            <StatCard
              value={String(machineryTotal)}
              suffix={hasNonNumericCount(machinery) ? '+' : undefined}
              label="Cleaning Machines & Equipment"
              index={2}
            >
              <CountedList items={machinery} />
            </StatCard>
          </div>
        </div>

        {/* 3 — Org chart. */}
        <div className="mt-20 min-w-0 border-t border-subtle pt-12">
          <h3 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
            Organizational Chart
          </h3>
          <p className="text-secondary mt-2 max-w-2xl text-sm leading-relaxed">
            The reporting structure from Managing Director through operations to
            each department.
          </p>

          <div className="mt-8 min-w-0 overflow-x-auto border border-subtle p-5 sm:p-6">
            <ul ref={orgRef} className="flex min-w-[20rem] flex-col gap-2">
              <OrgBranch node={orgChart} depth={0} />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The management cards wrapper. The fan-active state must live on the shared
 * container (so every card reads the same `.deck-fan-active` flag), while each
 * card computes its own arc transform. We resolve `active` once here and pass
 * the flag down via the container class; individual cards recompute their arc
 * style with the same hook (cheap, and keeps SSR-safe defaults).
 */
function ManagementDeck({ members }: { members: ManagementMember[] }) {
  const { active } = useDeckFan();
  const count = members.length;

  return (
    <ul
      className={`deck-fan mt-8 grid min-w-0 list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 ${
        active ? 'deck-fan-active' : ''
      }`}
    >
      {members.map((member, index) => (
        <ManagementCard key={member.no} member={member} index={index} count={count} />
      ))}
    </ul>
  );
}
