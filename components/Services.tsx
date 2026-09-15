'use client';

import Link from 'next/link';
import RevealHeading from './RevealHeading';
import SafeImage from './SafeImage';
import DeckShapes from './DeckShapes';
import { services, results, activities, film } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';
import { useCardReveal, useTilt } from '@/lib/reveal';

/**
 * Services — the verified Puro service lines (Part B).
 *
 * Each card shows the mapped photograph with the service name + context
 * overlaid on top, then the source-backed key points beneath. Cards are
 * square-edged, use SafeImage for optimized delivery, and reveal with the
 * transform-only, visible-by-default pattern (Part E): the text is readable at
 * rest and the entrance only enhances it.
 *
 * A service line without a dedicated verified photograph renders a clearly
 * marked, non-fabricated placeholder slot instead of an invented image.
 */

function ServiceCard({ service, index }: { service: (typeof services)[number]; index: number }) {
  const reduced = prefersReducedMotion();
  const revealRef = useCardReveal({ index, disabled: reduced });
  const tiltRef = useTilt({ disabled: reduced, max: 5, lift: 12 });

  return (
    <article
      ref={revealRef}
      className="card-lift surface-alt group relative flex min-w-0 flex-col border border-subtle"
    >
      {/* Image with the service name + context overlaid on top. */}
      <div
        ref={tiltRef}
        className="relative aspect-[4/3] w-full overflow-hidden will-change-transform"
      >
        {service.image ? (
          <SafeImage
            src={service.image}
            alt={service.alt}
            variant="full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            fallbackColor="var(--qe-surface, #0F1424)"
            loading="lazy"
            className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          // Clearly-marked, non-fabricated placeholder slot (no invented image).
          <div
            className="surface flex h-full w-full items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-secondary px-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em]">
              Photograph to be added
            </span>
          </div>
        )}

        {/* Legibility scrim + name/context overlay sitting on top of the image. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--qe-base, #0A0E1A) 8%, transparent) 0%, color-mix(in srgb, var(--qe-base, #0A0E1A) 82%, transparent) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-accent font-mono text-[0.7rem] uppercase tracking-[0.2em]">
            {service.context}
          </p>
          <h3 className="text-primary mt-1 break-words text-xl font-semibold leading-tight sm:text-2xl">
            {service.name}
          </h3>
        </div>
      </div>

      {/* Summary + source-backed key points. */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-secondary text-sm leading-relaxed">{service.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-2">
          {service.points.map((point) => (
            <li
              key={point}
              className="text-secondary border border-subtle px-3 py-1.5 text-xs"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      data-deck-section
      className="relative min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <DeckShapes variant="lines" />
      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-12 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)] md:items-end">
          <div>
            <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
              Services
            </RevealHeading>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
            />
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <p className="text-secondary text-base leading-relaxed md:text-right">
              The service lines documented in Puro&apos;s company profile, presented
              without unsupported claims.
            </p>
            <Link
              href="/film"
              data-cursor
              data-cursor-label="Watch"
              className="button-outline inline-flex min-h-12 items-center gap-3 border px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
            >
              Watch the film
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>

        {/* Standards — source-backed operating principles, folded in as a
            compact supporting block (no longer a separate full section). */}
        <div className="mt-20 border-t border-subtle pt-12">
          <header className="mb-8">
            <h3 className="text-primary text-2xl font-semibold tracking-tight sm:text-3xl">
              How We Work
            </h3>
            <p className="text-secondary mt-2 max-w-2xl text-sm leading-relaxed">
              The quality, environmental, safety and service standards documented
              in Puro&apos;s profile — the operational backbone behind every
              engagement.
            </p>
          </header>

          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {results.map((standard) => (
              <div
                key={standard.label}
                className="surface-alt flex min-w-0 flex-col border border-subtle p-5"
              >
                <p className="text-accent font-mono text-[0.7rem] uppercase tracking-[0.2em]">
                  {standard.kicker}
                </p>
                <h4 className="text-primary mt-2 text-lg font-semibold leading-tight">
                  {standard.label}
                </h4>
                <p className="text-secondary mt-3 text-sm leading-relaxed">
                  {standard.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Activities — HOW work is delivered, as concise supporting chips so
              the detail is represented without a near-duplicate full section. */}
          <div className="mt-10 grid min-w-0 grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            {activities.map((activity) => (
              <div key={activity.slug} className="min-w-0 border-t border-[var(--qe-muted)]/15 pt-4">
                <p className="text-primary text-base font-semibold leading-tight">
                  {activity.title}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {activity.tasks.map((task) => (
                    <li
                      key={task}
                      className="text-secondary border border-subtle px-3 py-1.5 text-xs"
                    >
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {film.isPlaceholder ? (
          <p className="text-secondary mt-8 font-mono text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
            Film link is a placeholder until the real video is published.
          </p>
        ) : null}
      </div>
    </section>
  );
}
