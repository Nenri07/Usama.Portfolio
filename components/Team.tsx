import RevealHeading from './RevealHeading';
import TeamShowcase from './TeamShowcase';

/** Editorial operations index; full retained galleries mount only on selection. */
export default function Team() {
  return (
    <section
      id="team"
      data-deck-section
      className="min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-8">
          <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
            Our Operations
          </RevealHeading>
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
          />
        </header>

        <div className="mb-10 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)] md:items-end">
          <p className="text-secondary max-w-2xl text-base leading-relaxed sm:text-lg">
            An editorial view of the two distinct crews behind Puro — the
            guest-facing Events &amp; Hospitality team and the Cleaning &amp;
            Facilities crew.
          </p>
          <p className="text-secondary text-sm leading-relaxed md:text-right">
            Each capability is grouped and labelled separately; no individual
            names or unsupported project assignments are claimed.
          </p>
        </div>

        <TeamShowcase />
      </div>
    </section>
  );
}
