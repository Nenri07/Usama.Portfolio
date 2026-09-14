import clsx from 'clsx';
import { contact } from '@/lib/data';
import { buildMailto, buildWaLink, isContactDisabled } from '@/lib/format';
import MagneticButton from './MagneticButton';
import RevealHeading from './RevealHeading';

/**
 * Contact — the final, closing section (Req 6).
 *
 * - Large closing headline sized in the 32–72px range (Req 6.1). Rendered with
 *   Tailwind responsive sizes (`text-4xl` = 36px up to `lg:text-7xl` = 72px),
 *   which stays within the required band.
 * - Email and WhatsApp buttons sit side by side in one flex row (Req 6.2).
 *   `flex-wrap` lets them stack only on very narrow screens; on normal widths
 *   they render on the same horizontal row.
 * - Email button href = buildMailto(contact.email), defaulting to
 *   hello@qasim-events.qa (Req 6.3, 6.4).
 * - WhatsApp button href = buildWaLink(contact.phone) => https://wa.me/<digits>,
 *   phone begins with 974 (Req 6.5, 6.6). Opened in a new tab with
 *   rel="noopener noreferrer" as an external link.
 * - If email or phone is empty/whitespace (isContactDisabled), the corresponding
 *   button is rendered as a non-interactive, disabled <button> with NO href, so
 *   the link cannot activate (Req 6.7). With the current non-empty data both
 *   buttons are enabled, but the guard is implemented.
 * - NO <form> and NO <input> or any text-entry field anywhere (Req 6.8).
 *
 * Each button is wrapped in <MagneticButton> (Req 9.4, 9.5): while the pointer
 * is near, the button translates toward it and returns to rest on leave. Under
 * reduced motion / SSR the `magnetic` utility no-ops, so buttons render static
 * and remain fully clickable. The wrapper is an inline-block <span> that never
 * swallows clicks, so anchor/button semantics, hrefs, and the disabled
 * (no-activation) path are all preserved (Req 7.7, 9.8).
 *
 * This module imports a `'use client'` component (MagneticButton) into a server
 * component, which simply creates a client boundary at that button — Contact
 * itself stays a server component. The disabled state is computed once at
 * render from the static `contact` data (no client state), so page.tsx stays a
 * server component too.
 *
 * Visual system: dark base, a single maroon accent (the Email button and a thin
 * rule), generous whitespace, no box-shadow, border-radius 0 (Req 7.1–7.3).
 */
export default function Contact() {
  const emailDisabled = isContactDisabled(contact.email);
  const phoneDisabled = isContactDisabled(contact.phone);

  // Shared button geometry: square (rounded-none), no shadow, generous padding.
  const baseButton =
    'inline-flex min-h-14 items-center justify-center rounded-none px-8 py-4 text-base font-semibold tracking-tight transition-[color,background-color,border-color,opacity] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:text-lg';

  return (
    <section
      id="contact"
      className="flex min-h-screen flex-col items-center justify-center bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Closing headline — 32–72px band (Req 6.1). */}
        <RevealHeading className="text-4xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-7xl">
          Let&apos;s build the moment Qatar remembers.
        </RevealHeading>

        {/* Thin maroon rule — the only decorative accent, kept sparing (Req 7.1). */}
        <span
          aria-hidden="true"
          className="mt-8 block h-px w-16 bg-[var(--color-accent)]"
        />

        {/*
          Email + WhatsApp side by side in one flex row (Req 6.2). flex-wrap only
          folds them on very narrow screens; ≥24px gap (gap-6 = 24px) (Req 7.2).
        */}
        <div className="mt-12 flex flex-row flex-wrap items-center justify-center gap-6">
          {/* Email button (Req 6.3, 6.4) — maroon accent, magnetic (Req 9.5). */}
          {emailDisabled ? (
            <MagneticButton>
              <button
                type="button"
                disabled
                aria-disabled="true"
                className={clsx(baseButton, 'cursor-not-allowed text-[var(--color-muted)] opacity-50')}
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                Email us
              </button>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <a
                href={buildMailto(contact.email)}
                className={clsx(baseButton, 'hover:bg-[color-mix(in_srgb,var(--qe-accent)_88%,white)]')}
                style={{
                  backgroundColor: 'var(--qe-accent, #6E1423)',
                  color: 'var(--qe-text, #F2F2F0)',
                }}
              >
                Email us
              </a>
            </MagneticButton>
          )}

          {/* WhatsApp button (Req 6.5, 6.6) — external link, subtle surface, magnetic (Req 9.5). */}
          {phoneDisabled ? (
            <MagneticButton>
              <button
                type="button"
                disabled
                aria-disabled="true"
                className={clsx(baseButton, 'cursor-not-allowed text-[var(--color-muted)] opacity-50')}
                style={{ backgroundColor: 'var(--color-surface)' }}
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
                className={clsx(
                  baseButton,
                  'border border-[var(--color-text)]/20 text-[var(--color-text)] hover:border-[var(--color-text)]/50',
                )}
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
