import clsx from 'clsx';
import { brand, contact } from '@/lib/data';
import { buildMailto, buildWaLink, isContactDisabled } from '@/lib/format';
import MagneticButton from './MagneticButton';
import RevealHeading from './RevealHeading';

/** Final contact section with visible-by-default copy and controls. */
export default function Contact() {
  const emailDisabled = isContactDisabled(contact.email);
  const whatsappNumber = contact.whatsapp ?? contact.phone;
  const whatsappDisabled = isContactDisabled(whatsappNumber);

  const baseButton =
    'inline-flex min-h-16 min-w-64 flex-col items-center justify-center gap-1 rounded-none px-8 py-4 text-base font-semibold tracking-tight transition-[color,background-color,border-color,opacity] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:text-lg';

  return (
    <section
      id="contact"
      className="flex min-h-screen flex-col items-center justify-center bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <p className="text-primary text-sm font-semibold uppercase tracking-[0.18em]">
          {brand.name}
        </p>

        <RevealHeading className="text-primary mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Let&apos;s move your next operation forward.
        </RevealHeading>

        <p className="text-secondary mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
          {brand.description}
        </p>

        <span
          aria-hidden="true"
          className="mt-8 block h-px w-16 bg-[var(--qe-accent)]"
        />

        <div className="mt-12 flex flex-row flex-wrap items-center justify-center gap-6">
          {emailDisabled ? (
            <MagneticButton>
              <button
                type="button"
                disabled
                aria-disabled="true"
                aria-label="Email address unavailable"
                className={clsx(baseButton, 'text-secondary cursor-not-allowed opacity-50')}
                style={{ backgroundColor: 'var(--qe-surface, #0F1424)' }}
              >
                <span className="text-xs uppercase tracking-[0.16em]">Email</span>
                <span>{contact.email}</span>
              </button>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <a
                href={buildMailto(contact.email)}
                aria-label={`Email ${brand.name} at ${contact.email}`}
                className={clsx(baseButton, 'button-on-accent')}
                style={{
                  backgroundColor: 'var(--qe-accent, #6E1423)',
                  color: 'var(--qe-text, #F2F2F0)',
                }}
              >
                <span className="text-xs uppercase tracking-[0.16em]">Email</span>
                <span>{contact.email}</span>
              </a>
            </MagneticButton>
          )}

          {whatsappDisabled ? (
            <MagneticButton>
              <button
                type="button"
                disabled
                aria-disabled="true"
                aria-label="WhatsApp number unavailable"
                className={clsx(baseButton, 'text-secondary cursor-not-allowed opacity-50')}
                style={{ backgroundColor: 'var(--qe-surface, #0F1424)' }}
              >
                <span className="text-xs uppercase tracking-[0.16em]">WhatsApp</span>
                <span>{contact.phone}</span>
              </button>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <a
                href={buildWaLink(contact.whatsapp ?? contact.phone)}
                aria-label={`WhatsApp ${brand.name} at ${contact.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(baseButton, 'button-outline border')}
                style={{ color: 'var(--qe-text, #F2F2F0)' }}
              >
                <span className="text-xs uppercase tracking-[0.16em]">WhatsApp</span>
                <span>{contact.phone}</span>
              </a>
            </MagneticButton>
          )}
        </div>
      </div>
    </section>
  );
}
