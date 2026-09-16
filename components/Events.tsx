'use client';

import RevealHeading from './RevealHeading';
import SafeImage from './SafeImage';
import DeckShapes from './DeckShapes';
import { eventProjects, hostessVenues, type EventProject } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';
import { useCardReveal } from '@/lib/reveal';
import { useDeckFan } from '@/lib/useDeckFan';

/**
 * Events — the "Events & Hospitality" showcase.
 *
 * This is a DISTINCT Puro capability from the cleaning/facilities side: VIP
 * hostesses, event organizers and activity crews who staffed festivals,
 * fan-zones and prestige venues. It is presented as one of Puro's divisions
 * alongside cleaning (one company), never as janitorial work.
 *
 * Two card tiers, both non-fabricated:
 *   • metricsSource 'record' — verified activations that carry real visitor /
 *     staff / winner / day counts transcribed from the approved events record.
 *   • metricsSource 'venue' — prestige venues (Al Shaqab, Sheraton, St. Regis,
 *     Arab Cup) where the hostess/hospitality team served, described neutrally
 *     with NO invented numbers.
 *
 * Every card is visible-by-default; motion only enhances (transform-only
 * reveal + optional fine-pointer tilt, both disabled under reduced motion).
 * Decorative deck off-shapes sit behind the content (aria-hidden). No
 * horizontal overflow: the grid and every child are min-w-0 and break-words.
 */

/** A single source-backed metric chip (only rendered when the value exists). */
function Metric({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-primary text-lg font-semibold leading-none sm:text-xl">{value}</p>
      <p className="text-secondary mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em]">
        {label}
      </p>
    </div>
  );
}

function hasMetrics(event: EventProject): boolean {
  return Boolean(event.visitors || event.staff || event.days || event.winners);
}

function EventCard({
  event,
  index,
  count,
  fanActive,
  cardStyle,
}: {
  event: EventProject;
  index: number;
  count: number;
  fanActive: boolean;
  cardStyle: (index: number, count: number, columns?: number) => React.CSSProperties;
}) {
  const reduced = prefersReducedMotion();
  const revealRef = useCardReveal({ index, disabled: reduced });
  const named = event.metricsSource === 'venue';
  const metrics = hasMetrics(event);

  return (
    <li
      ref={revealRef}
      className="deck-fan-card min-w-0"
      style={fanActive ? cardStyle(index, count, 3) : undefined}
    >
      <div className="deck-fan-flip deck-fan-flip-event relative w-full">
        {/* Front face — image, title, summary, services. Readable at rest. */}
        <article className="deck-fan-face surface-alt group flex min-w-0 flex-col border border-subtle">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <SafeImage
              src={event.image}
              alt={`${event.title} — ${event.venue}`}
              variant="full"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              fallbackColor="var(--qe-surface, #0F1424)"
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--qe-base, #0A0E1A) 8%, transparent) 0%, color-mix(in srgb, var(--qe-base, #0A0E1A) 84%, transparent) 100%)',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-accent font-mono text-[0.7rem] uppercase tracking-[0.2em]">
                {named ? 'Prestige venue' : 'Activation'}
                {event.year ? ` · ${event.year}` : ''}
              </p>
              <h3 className="text-primary mt-1 break-words text-xl font-semibold leading-tight sm:text-2xl">
                {event.title}
              </h3>
              <p className="text-secondary mt-1 break-words text-sm">{event.venue}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-5">
            <p className="text-secondary text-sm leading-relaxed">{event.summary}</p>

            {metrics ? (
              <div className="grid grid-cols-3 gap-3 border-y border-subtle py-4">
                <Metric label="Visitors" value={event.visitors} />
                <Metric label="Staff" value={event.staff} />
                <Metric label="Winners" value={event.winners} />
                <Metric label="Days" value={event.days} />
              </div>
            ) : null}

            <ul className="mt-auto flex flex-wrap gap-2">
              {event.services.map((service) => (
                <li
                  key={service}
                  className="text-secondary border border-subtle px-3 py-1.5 text-xs"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Back face — full services + metrics, revealed only via the fan flip. */}
        <article
          aria-hidden="true"
          className="deck-fan-face deck-fan-face-back surface flex min-w-0 flex-col gap-4 border border-[var(--qe-accent)]/50 p-5"
        >
          <div>
            <p className="text-accent font-mono text-[0.7rem] uppercase tracking-[0.2em]">
              {named ? 'Prestige venue' : 'Activation'}
              {event.year ? ` · ${event.year}` : ''}
            </p>
            <h3 className="text-primary mt-1 break-words text-xl font-semibold leading-tight">
              {event.title}
            </h3>
            <p className="text-secondary mt-1 break-words text-sm">{event.venue}</p>
          </div>

          {metrics ? (
            <div className="grid grid-cols-2 gap-3 border-y border-subtle py-4">
              <Metric label="Visitors" value={event.visitors} />
              <Metric label="Staff" value={event.staff} />
              <Metric label="Winners" value={event.winners} />
              <Metric label="Days" value={event.days} />
            </div>
          ) : null}

          <ul className="mt-auto flex flex-wrap gap-2">
            {event.services.map((service) => (
              <li
                key={service}
                className="text-secondary border border-subtle px-3 py-1.5 text-xs"
              >
                {service}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </li>
  );
}

export default function Events() {
  const { active, cardStyle } = useDeckFan();
  const count = eventProjects.length;

  return (
    <section
      id="events"
      data-deck-section
      className="relative min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <DeckShapes variant="corner" />

      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-12 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)] md:items-end">
          <div>
            <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
              Events &amp; Hospitality
            </RevealHeading>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
            />
          </div>
          <p className="text-secondary text-base leading-relaxed md:text-right">
            Puro&apos;s guest-facing division — VIP hostesses, event organizers and
            activity crews behind festivals, fan-zones and prestige-venue
            hospitality. Distinct from the cleaning &amp; facilities side.
          </p>
        </header>

        {/* Prestige-venue hospitality callout — hostesses served here, NOT as
            cleaners. Named-only; no invented metrics. */}
        <div className="mb-12 border-y border-subtle py-6">
          <p className="text-accent font-mono text-[0.7rem] uppercase tracking-[0.2em]">
            VIP hostess &amp; hospitality staffing at
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {hostessVenues.map((venue) => (
              <li
                key={venue}
                className="text-primary border border-subtle px-3 py-1.5 text-sm font-medium"
              >
                {venue}
              </li>
            ))}
          </ul>
        </div>

        <ul
          className={`deck-fan grid min-w-0 list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 ${
            active ? 'deck-fan-active' : ''
          }`}
        >
          {eventProjects.map((event, index) => (
            <EventCard
              key={event.slug}
              event={event}
              index={index}
              count={count}
              fanActive={active}
              cardStyle={cardStyle}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
