'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { brand } from '@/lib/data';
import BrandLogo3D from './BrandLogo3D';

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
  { label: 'Services', target: 'services' },
  { label: 'Activities', target: 'activities' },
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
      className="fixed inset-x-0 top-0 z-40 flex min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-12"
      aria-label="Primary"
    >
      {/* Optimized local brand mark; the adjacent name remains real text. */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        data-cursor
        aria-label={`${brand.name} — return to top`}
        className="text-primary-interactive flex min-w-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:gap-3"
      >
        <BrandLogo3D
          className="h-14 w-14 sm:h-16 sm:w-16"
          sizes="(max-width: 640px) 56px, 64px"
          preload
        />
        <span className="text-primary hidden max-w-52 text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.15em] md:block">
          {brand.name}
        </span>
      </a>

      {/* Section links + the dedicated /film route. */}
      <ul className="flex shrink-0 items-center gap-3 sm:gap-6 lg:gap-8">
        {LINKS.map((link) => (
          <li key={link.target} className="hidden sm:block">
            <a
              href={`#${link.target}`}
              onClick={(e) => handleClick(e, link.target)}
              data-cursor
              className="text-secondary text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:text-[var(--qe-accent)] focus-visible:text-[var(--qe-accent)] sm:text-sm"
            >
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <Link
            href="/film"
            data-cursor
            className="text-primary-interactive text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-sm"
          >
            Film
          </Link>
        </li>
      </ul>
    </nav>
  );
}
