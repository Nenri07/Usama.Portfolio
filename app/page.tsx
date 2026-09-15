/**
 * Single route — the above-the-fold hero is now the curved 3D perspective
 * slider (HeroSlider, jesperlandberg-style) with a fixed nav overlay; the rest
 * of the page continues below as the user scrolls.
 *
 * Order:
 *   HeroSlider (full-screen, nav overlay + project-detail modal)
 *     → Marquee   (Clients / Trusted By)
 *     → WorkList  (Work_Section — big-type Project_List, id="work")
 *     → Numbers   (Results_Section)
 *     → Team      (Team_Section, id="team")
 *     → Contact   (Contact_Section, id="contact")
 *
 * page.tsx stays a Server Component: HomeClient is a thin `'use client'`
 * wrapper that owns the selected-project modal state and renders HeroSlider +
 * ProjectModal, while the static sections below are passed through as children
 * (Server Components rendered into a Client Component slot).
 */
import HomeClient from '@/components/HomeClient';
import Marquee from '@/components/Marquee';
import WorkList from '@/components/WorkList';
import WorkGallery from '@/components/WorkGallery';
import Certificates from '@/components/Certificates';
import Services from '@/components/Services';
import Activities from '@/components/Activities';
import Numbers from '@/components/Numbers';
import Team from '@/components/Team';
import Contact from '@/components/Contact';
import ThankYou from '@/components/ThankYou';

export default function Home() {
  return (
    <main className="text-primary flex w-full min-w-0 max-w-full flex-1 flex-col bg-base">
      <HomeClient>
        {/* ── Clients / Trusted By (Req 3) ────────────────────────────── */}
        <Marquee />

        {/* ── Work / Projects — big-type Project_List (Req 4, 10) ──────── */}
        <WorkList />

        {/* ── Work gallery — animated masonry wall of every on-site photo ── */}
        <WorkGallery />

        {/* ── Certificates & Contracts — auto-advancing coverflow ──────── */}
        <Certificates />

        {/* ── Services — verified Puro service lines (Part B) ──────────── */}
        <Services />

        {/* ── Activities — operational scope of work (Part C) ──────────── */}
        <Activities />

        {/* ── Results / Numbers (Req 5) ───────────────────────────────── */}
        <Numbers />

        {/* ── Team (Req 6) ────────────────────────────────────────────── */}
        <Team />

        {/* ── Contact (Req 7) ─────────────────────────────────────────── */}
        <Contact />

        {/* ── Presentation ending ──────────────────────────────────────── */}
        <ThankYou />
      </HomeClient>
    </main>
  );
}
