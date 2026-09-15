'use client';

import { useEffect, useMemo, useRef } from 'react';
import { animate, stagger } from 'animejs';
import InfinitePerspectiveSlider, {
  type InfinitePerspectiveSliderItem,
} from './ui/infinite-perspective-slider';
import Nav from './Nav';
import HeroAmbient from './HeroAmbient';
import { projects } from '@/lib/data';
import { resolveImagePath } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * HeroSlider — the full-screen hero built on the perspective slider (Step 2).
 *
 * Feeds our real `projects` into `InfinitePerspectiveSlider` and overlays the
 * jesperlandberg-style corner labels plus the fixed <Nav>. Clicking a card
 * calls `onCardClick(index)` so the parent (HomeClient) can open the project
 * modal for `projects[index]`.
 *
 * The slider itself handles drag/wheel scroll, the velocity tilt, per-card
 * SplitText reveal, and reduced-motion degradation.
 */

interface HeroSliderProps {
  onCardClick: (index: number) => void;
}

export default function HeroSlider({ onCardClick }: HeroSliderProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo<InfinitePerspectiveSliderItem[]>(
    () =>
      projects.map((project, i) => ({
        src: resolveImagePath(project, i),
        number: String(i + 1).padStart(2, '0'),
        title: project.title,
        desc: `${project.client ? `${project.client} · ` : ''}${project.category} · ${project.location}`,
      })),
    [],
  );

  // Staggered entrance for the decorative corner labels. Enhancement only:
  // the text is fully readable at rest; if animejs fails or reduced motion is
  // on, the labels simply stay in place, visible.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) return;
    const targets = overlay.querySelectorAll('[data-hero-reveal]');
    if (targets.length === 0) return;
    try {
      animate(targets, {
        opacity: [0, 1],
        translateY: [22, 0],
        filter: ['blur(6px)', 'blur(0px)'],
        duration: 1100,
        delay: stagger(140, { start: 350 }),
        ease: 'out(3)',
      });
    } catch {
      // Leave labels in their readable resting state.
    }
  }, []);

  return (
    <section id="top" className="relative h-screen w-full overflow-hidden bg-base">
      {/* Fixed top navigation overlay. */}
      <Nav />

      {/* Decorative ambient depth + curated collage behind the slider. */}
      <HeroAmbient />

      {/* The curved 3D perspective slider fills the hero. */}
      <div className="absolute inset-0 z-10">
        <InfinitePerspectiveSlider images={items} onCardClick={onCardClick} />
      </div>

      {/* ── Corner labels (reference layout) ─────────────────────────────
          Kept minimal; maroon used sparingly. pointer-events-none so they
          never block the slider drag; the nav sits above them. */}
      <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-30">
        {/* Top-left editorial kicker. */}
        <div className="absolute left-6 top-24 max-w-xs sm:left-8 sm:top-28 lg:left-12">
          <p
            data-hero-reveal
            className="text-secondary font-mono text-[0.7rem] uppercase tracking-[0.24em]"
          >
            Cleaning · Hospitality · Façade
          </p>
          <p
            data-hero-reveal
            className="text-primary mt-3 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
          >
            Quality, hygiene &amp; safety across Qatar.
          </p>
        </div>

        {/* Bottom-left: featured / full index cue. */}
        <div className="absolute bottom-6 left-6 sm:left-8 lg:left-12">
          <p
            data-hero-reveal
            className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]"
          >
            Featured <span className="text-accent">/ Full</span>
          </p>
        </div>

        {/* Bottom-right: contact cue (nav has the real link). */}
        <div className="absolute bottom-6 right-6 sm:right-8 lg:right-12">
          <p
            data-hero-reveal
            className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]"
          >
            Contact
          </p>
        </div>
      </div>
    </section>
  );
}
