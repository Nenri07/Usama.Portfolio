import clsx from 'clsx';
import { contact } from '@/lib/data';
import { buildMailto, buildWaLink, isContactDisabled } from '@/lib/format';
import MagneticButton from './MagneticButton';
import RevealHeading from './RevealHeading';

/** Final contact section with visible-by-default copy and controls. */
export default function Contact() {
  const emailDisabled = isContactDisabled(contact.email);
  const phoneDisabled = isContactDisabled(contact.phone);

  const baseButton =
    'inline-flex min-h-14 items-center justify-center rounded-none px-8 py-4 text-base font-semibold tracking-tight transition-[color,background-color,border-color,opacity] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:text-lg';

  return (
    <section
      id="contact"
      className="flex min-h-screen flex-col items-center justify-center bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <RevealHeading className="text-primary text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Let&apos;s build the moment Qatar remembers.
        </RevealHeading>

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
                className={clsx(baseButton, 'text-secondary cursor-not-allowed opacity-50')}
                style={{ backgroundColor: 'var(--qe-surface, #0F1424)' }}
              >
                Email us
              </button>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <a
                href={buildMailto(contact.email)}
                className={clsx(baseButton, 'button-on-accent')}
                style={{
                  backgroundColor: 'var(--qe-accent, #6E1423)',
                  color: 'var(--qe-text, #F2F2F0)',
                }}
              >
                Email us
              </a>
            </MagneticButton>
          )}

          {phoneDisabled ? (
            <MagneticButton>
              <button
                type="button"
                disabled
                aria-disabled="true"
                className={clsx(baseButton, 'text-secondary cursor-not-allowed opacity-50')}
                style={{ backgroundColor: 'var(--qe-surface, #0F1424)' }}
              >
                WhatsApp
              </button>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <a
                href={buildWaLink(contact.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(baseButton, 'button-outline border')}
                style={{ color: 'var(--qe-text, #F2F2F0)' }}
              >
                WhatsApp
              </a>
            </MagneticButton>
          )}
        </div>
      </div>
    </section>
  );
}
