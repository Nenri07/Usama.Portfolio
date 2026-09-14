/**
 * Single route — composes the SIX sections in fixed order (Req 8.5):
 * Hero → Marquee (Clients / Trusted By) → WorkGrid (Work / Projects) →
 * Numbers (Results) → Team → Contact.
 *
 * Each section is one real component:
 *   - Hero     → <Hero />     (split-text headline + parallax background)
 *   - Marquee  → <Marquee />  (Clients_Section — seamless wordmark loop)
 *   - WorkGrid → <WorkGrid />  (Work_Section — 13 project cards)
 *   - Numbers  → <Numbers />   (Results_Section — count-up stat blocks)
 *   - Team     → <Team />      (Team_Section — role-based cards)
 *   - Contact  → <Contact />   (Contact_Section — magnetic contact buttons)
 *
 * Server component (static composition, no client APIs). The animated sections
 * are each `'use client'` at their own boundary, so page.tsx stays a server
 * component.
 */
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import WorkGrid from '@/components/WorkGrid';
import Numbers from '@/components/Numbers';
import Team from '@/components/Team';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="flex flex-col flex-1 bg-base text-[var(--color-text)]">
      {/* ── Hero (Req 2) ──────────────────────────────────────────────── */}
      <Hero />

      {/* ── Clients / Trusted By (Req 3) ──────────────────────────────── */}
      <Marquee />

      {/* ── Work / Projects (Req 4) ───────────────────────────────────── */}
      <WorkGrid />

      {/* ── Results / Numbers (Req 5) ─────────────────────────────────── */}
      <Numbers />

      {/* ── Team (Req 6) ──────────────────────────────────────────────── */}
      <Team />

      {/* ── Contact (Req 7) ───────────────────────────────────────────── */}
      <Contact />
    </main>
  );
}
