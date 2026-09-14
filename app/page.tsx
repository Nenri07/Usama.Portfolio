/**
 * Single route — composes the five sections in fixed order so the page renders
 * and scrolls (Req 7.6): Hero → Marquee (Trusted By) → Work → Numbers → Contact.
 *
 * These are temporary placeholder shells. Each section is isolated as one
 * <section> with a comment marker so later tasks swap in the real component
 * with a clean edit:
 *   - Hero    → task 3.1  (<Hero />)
 *   - Marquee → task 4.1  (<Marquee />)
 *   - Work    → task 5.2  (<WorkGrid />)
 *   - Numbers → task 7.2  (<Numbers />)
 *   - Contact → task 8.1  (<Contact />)
 *
 * Server component (static shells, no client APIs). Hero is a `'use client'`
 * component, so page.tsx stays a server component.
 */
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import WorkGrid from '@/components/WorkGrid';
import Numbers from '@/components/Numbers';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="flex flex-col flex-1 bg-base text-[var(--color-text)]">
      {/* ── Hero (Req 2) ──────────────────────────────────────────────── */}
      <Hero />

      {/* ── Marquee (Trusted By) (Req 3) ──────────────────────────────── */}
      <Marquee />

      {/* ── Work (Req 4) ──────────────────────────────────────────────── */}
      <WorkGrid />

      {/* ── Numbers (Req 5) ───────────────────────────────────────────── */}
      <Numbers />

      {/* ── Contact (Req 6) ───────────────────────────────────────────── */}
      <Contact />
    </main>
  );
}
