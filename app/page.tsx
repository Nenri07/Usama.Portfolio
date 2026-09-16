/**
 * Single route — an investor-grade presentation deck.
 *
 * Final top-to-bottom order (confirmed):
 *   1) Hero        — all 32 client contracts as cards (HomeClient → HeroSlider)
 *   2) Projects    — 4 service projects + links into every engagement (WorkList)
 *   3) Certificates— 10 real documents coverflow + contracts context
 *   4) Services    — verified service lines + folded-in Standards/Activities
 *   5) Events      — Events & Hospitality division showcase
 *   6) Leadership  — named management, workforce/capacity, org chart
 *   7) Team        — Operations
 *   8) Thank You   — closing screen
 *
 * De-duplication: the standalone "Trusted By" marquee, "Activities" and
 * "Standards/Numbers" sections were removed as separate full sections. Their
 * content is represented once — clients as a slim ribbon inside Certificates
 * (full list in the contracts table), Standards + Activities as compact
 * supporting blocks inside Services. The Contact section is retained just
 * before the closing screen so the WhatsApp + email controls stay available.
 *
 * page.tsx stays a Server Component: HomeClient is a thin `'use client'`
 * wrapper that owns the modal + present-mode state and renders HeroSlider,
 * ProjectModal, ContractModal and PresentMode, while the static sections below
 * are passed through as children.
 */
import HomeClient from '@/components/HomeClient';
import WorkList from '@/components/WorkList';
import Certificates from '@/components/Certificates';
import Services from '@/components/Services';
import Events from '@/components/Events';
import Leadership from '@/components/Leadership';
import Team from '@/components/Team';
import Contact from '@/components/Contact';
import ThankYou from '@/components/ThankYou';

export default function Home() {
  return (
    <main className="text-primary flex w-full min-w-0 max-w-full flex-1 flex-col bg-base">
      <HomeClient>
        {/* ── Projects — flagship work + links to all 32 engagements ────── */}
        <WorkList />

        {/* ── Certificates & Contracts — coverflow + client ribbon/table ── */}
        <Certificates />

        {/* ── Services — verified lines + folded-in Standards & Activities ─ */}
        <Services />

        {/* ── Events & Hospitality — the guest-facing division showcase ──── */}
        <Events />

        {/* ── Leadership & Capacity — named managers, workforce, org chart ─ */}
        <Leadership />

        {/* ── Team / Operations ─────────────────────────────────────────── */}
        <Team />

        {/* ── Contact — retained for WhatsApp + email controls ──────────── */}
        <Contact />

        {/* ── Presentation ending ───────────────────────────────────────── */}
        <ThankYou />
      </HomeClient>
    </main>
  );
}
