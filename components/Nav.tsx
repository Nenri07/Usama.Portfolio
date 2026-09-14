'use client';

import { useCallback } from 'react';

/**
 * Nav — a minimal fixed top navigation overlay (Step 3).
 *
 * Brand on the left; uppercase, tracking-wide links on the right that
 * smooth-scroll to the #work / #team / #contact sections below the hero.
 *
 * Smooth scroll: if a Lenis instance has been exposed on `window.__lenis`
 * we use it (so the nav respects the site's Heavy_Inertia scroll); otherwise
 * we fall back to native `scrollIntoView({ behavior: 'smooth' })`. Both paths
 * `preventDefault` on the anchor so the URL hash doesn't hard-jump.
 *
 * Visual system: small uppercase text on the dark base, maroon hover, no
 * box-shadow, radius 0. Fixed and z-40 — above page content but below the
 * project modal (z-[100]).
 */

interface NavLink {
  label: string;
  target: string; // element id (without '#')
}

const LINKS: NavLink[] = [
  { label: 'Work', target: 'work' },
  { label: 'Team', target: 'team' },
  { label: 'Contact', target: 'contact' },
];

// Lenis exposes a `scrollTo` method; type just the slice we use.
interface LenisLike {
  scrollTo: (target: string | HTMLElement | number, opts?: { offset?: number }) => void;
}

function smoothScrollTo(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis && typeof lenis.scrollTo === 'function') {
    try {
      lenis.scrollTo(el, { offset: 0 });
      return;
    } catch {
      /* fall through to native */
    }
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Nav() {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      smoothScrollTo(id);
    },
    [],
  );

  return (
    <nav
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 sm:px-8 lg:px-12"
      aria-label="Primary"
    >
      {/* Brand — links back to the top of the hero. */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        data-cursor
        className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
      >
        Qasim Events
      </a>

      {/* Section links. */}
      <ul className="flex items-center gap-6 sm:gap-8">
        {LINKS.map((link) => (
          <li key={link.target}>
            <a
              href={`#${link.target}`}
              onClick={(e) => handleClick(e, link.target)}
              data-cursor
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] sm:text-sm"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
