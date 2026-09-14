import RevealHeading from './RevealHeading';
import DivisionGrid from './DivisionGrid';
import TeamGalleryStrip from './TeamGalleryStrip';
import { divisions, teamGallery } from '@/lib/data';

/**
 * Team — the division-wise Team section (Req 6.1–6.7, 8.5). Placed between
 * Results (Numbers) and Contact in the six-section order.
 *
 * Server component: it maps the static `divisions` / `teamGallery` data to
 * client children (DivisionGrid, TeamGalleryStrip) which own the 3D tilt and
 * scroll-reveal work, mirroring WorkGrid and Numbers.
 *
 * Layout: a section heading "Our Team" (RevealHeading ≥32px) with the shared
 * thin maroon rule, a factual intro line, then one block per division — a
 * smaller (h3-scale) division heading, its blurb, and a 3D photo grid of that
 * division's real staff photos. A general "Our Team" gallery strip closes the
 * section. NO invented individual names, NO financial figures (Req 6.2, 6.3,
 * 8.6).
 *
 * Visual system: dark base, square cards, no box-shadow, border-radius 0,
 * maroon used sparingly (Req 8.1–8.3).
 */
export default function Team() {
  return (
    <section id="team" className="bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Section heading — h2 ≥32px, sans-serif, square, no shadow. */}
        <header className="mb-8">
          <RevealHeading className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Our Team
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--color-accent)]"
          />
        </header>

        {/* Factual intro line — generic/safe counts, no financials. */}
        <p className="mb-16 max-w-2xl text-base text-[var(--color-muted)] sm:text-lg">
          A division-led crew of 100+ across hostesses, organizers, activities,
          hospitality and cleaning.
        </p>

        {/* One block per division: heading + blurb + 3D photo grid. */}
        <div className="flex flex-col gap-20">
          {divisions.map((division) => (
            <div key={division.slug}>
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
                {division.name}
              </h3>
              <p className="mt-2 max-w-2xl text-base text-[var(--color-muted)]">
                {division.blurb}
              </p>
              <DivisionGrid
                name={division.name}
                images={division.images}
                className="mt-8"
              />
            </div>
          ))}
        </div>

        {/* "Our Team" gallery strip — general team & event images. */}
        <div className="mt-24">
          <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
            On the ground
          </h3>
          <p className="mt-2 max-w-2xl text-base text-[var(--color-muted)]">
            Moments from our team across activations.
          </p>
          <TeamGalleryStrip images={teamGallery} className="mt-8" />
        </div>
      </div>
    </section>
  );
}
