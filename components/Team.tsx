import RevealHeading from './RevealHeading';
import TeamShowcase from './TeamShowcase';

/** Lightweight editorial crew index; full galleries mount only on selection. */
export default function Team() {
  return (
    <section id="team" className="min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-8">
          <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
            Our Team
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
          />
        </header>

        <div className="mb-10 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)] md:items-end">
          <p className="text-secondary max-w-2xl text-base leading-relaxed sm:text-lg">
            A division-led crew spanning organizers, hostesses, activity teams,
            hospitality and venue care.
          </p>
          <p className="text-secondary text-sm leading-relaxed md:text-right">
            Preview each division here. Open a crew view only when you want the
            complete photographic gallery.
          </p>
        </div>

        <TeamShowcase />
      </div>
    </section>
  );
}
