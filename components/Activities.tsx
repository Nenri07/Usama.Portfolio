'use client';

import RevealHeading from './RevealHeading';
import SafeImage from './SafeImage';
import { activities } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';
import { useCardReveal } from '@/lib/reveal';

/**
 * Activities — operational scope-of-work items (Part C).
 *
 * Deliberately a DIFFERENT layout from the Services grid: alternating full-
 * width rows pairing a media panel with a text list, so it reads as a
 * complementary, clearly separate section. Content traces to the profile's
 * documented quality, environmental and safety practices; no Services copy is
 * repeated verbatim. Transform-only, visible-by-default reveal (Part E).
 */

function ActivityRow({
  activity,
  index,
}: {
  activity: (typeof activities)[number];
  index: number;
}) {
  const reduced = prefersReducedMotion();
  const revealRef = useCardReveal({ index, disabled: reduced });
  const mediaFirst = index % 2 === 0;

  const media = (
    <div className="card-lift relative aspect-[16/10] w-full overflow-hidden border border-subtle md:aspect-[4/3]">
      {activity.image ? (
        <SafeImage
          src={activity.image}
          alt={activity.alt}
          variant="full"
          sizes="(max-width: 768px) 100vw, 50vw"
          fallbackColor="var(--qe-surface, #0F1424)"
          loading="lazy"
        />
      ) : (
        <div className="surface flex h-full w-full items-center justify-center" aria-hidden="true">
          <span className="text-secondary px-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em]">
            Photograph to be added
          </span>
        </div>
      )}
    </div>
  );

  const copy = (
    <div className="flex min-w-0 flex-col justify-center">
      <p className="text-accent font-mono text-sm">
        {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="text-primary mt-3 break-words font-display text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[0.98] tracking-tight">
        {activity.title}
      </h3>
      <p className="text-secondary mt-4 max-w-xl text-base leading-relaxed">
        {activity.description}
      </p>
      <ul className="mt-6 grid gap-2">
        {activity.tasks.map((task) => (
          <li key={task} className="text-primary flex items-baseline gap-3 text-sm sm:text-base">
            <span aria-hidden="true" className="text-accent shrink-0">—</span>
            <span className="min-w-0 [overflow-wrap:anywhere]">{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <article
      ref={revealRef}
      className="grid min-w-0 items-stretch gap-6 border-t border-subtle py-12 md:grid-cols-2 md:gap-12 lg:py-16"
    >
      {/* Alternate the media/text order per row for editorial rhythm. Order is
          visual only (via CSS order) so the DOM stays readable in sequence. */}
      <div className={mediaFirst ? 'md:order-1' : 'md:order-2'}>{media}</div>
      <div className={mediaFirst ? 'md:order-2' : 'md:order-1'}>{copy}</div>
    </article>
  );
}

export default function Activities() {
  return (
    <section id="activities" className="min-w-0 bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-4 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)] md:items-end">
          <div>
            <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
              Activities
            </RevealHeading>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
            />
          </div>
          <p className="text-secondary text-base leading-relaxed md:text-right">
            How the work is delivered — the operational methods, controls and
            checks documented in the Puro profile.
          </p>
        </header>

        <div className="min-w-0">
          {activities.map((activity, index) => (
            <ActivityRow key={activity.slug} activity={activity} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
